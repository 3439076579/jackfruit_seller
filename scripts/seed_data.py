#!/usr/bin/env python3
"""Reproducible synthetic dataset generator for the Jackfruit Seller MySQL database.

Supports three benchmark scales:
  - small  (~10,000 rows)
  - medium (~100,000 rows)
  - large  (~500,000 rows)
And optional schema modes:
  - canonical  (database/schema.sql + database/indexes.sql)
  - no_indexes (database/schema_no_indexes.sql, PK-only baseline)
"""

from __future__ import annotations

import argparse
import os
import random
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Tuple

import pymysql

SCALES: Dict[str, Dict[str, int]] = {
    "small": {
        "users": 500,
        "jackfruits": 100,
        "orders": 7_500,
        "reviews": 2_000,
        "notifies": 10,
    },
    "medium": {
        "users": 5_000,
        "jackfruits": 500,
        "orders": 75_000,
        "reviews": 20_000,
        "notifies": 20,
    },
    "large": {
        "users": 25_000,
        "jackfruits": 2_000,
        "orders": 400_000,
        "reviews": 75_000,
        "notifies": 50,
    },
}

CATEGORIES = [
    "Red Flesh Jackfruit",
    "Honey Gold Dry-Bulb",
    "Thai Sweet Nangka",
    "Malaysian Tekam Yellow",
    "Hainan Green Crisp",
    "Soft Wet-Bulb Classic",
    "Organic Mini Seedless",
    "Gift Box Selection",
]

VARIETY_PREFIXES = [
    "Hainan Sanya",
    "Guangxi Chongzuo",
    "Yunnan Xishuangbanna",
    "Thai Golden",
    "Malaysia J33",
    "Vietnam Red-Heart",
    "Qionghai Sweet",
    "Danzhou Orchard",
    "Chanthaburi Prime",
    "Sabah Honey",
]

VARIETY_SUFFIXES = [
    "Dry-Bulb Jackfruit",
    "Red-Flesh Jackfruit",
    "Honey Crispy Pulp",
    "Wet-Bulb Nangka",
    "Seedless Bite Pack",
    "Single-Fruit Whole",
    "Cold-Chain Fresh Cut",
    "Premium Tree-Ripened",
]

IMAGES = [
    "http://localhost:8082/static/jackfruit1.png",
    "http://localhost:8082/static/jackfruit2.png",
    "http://localhost:8082/static/jackfruit3.png",
    "http://localhost:8082/static/jackfruit4.png",
]

CITIES = [
    "Guangzhou Tianhe District",
    "Shenzhen Nanshan District",
    "Shanghai Pudong New Area",
    "Beijing Haidian District",
    "Hangzhou Xihu District",
    "Chengdu Wuhou District",
    "Haikou Meilan District",
    "Nanning Qingxiu District",
]

REVIEW_POSITIVE = [
    "Super sweet and crunchy bulbs, arrived fresh with cold-chain packaging.",
    "Rich honey aroma and thick golden flesh, great value for the weight.",
    "Perfect ripeness out of the box, zero bruising and very juicy.",
    "Sweetness is well balanced, whole family loved this variety.",
    "Fast delivery and generous pulp yield per fruit.",
]

REVIEW_NEUTRAL = [
    "Decent sweetness, bulbs were slightly firm and needed one day to soften.",
    "Good aroma, portion size matched description.",
    "Packaging was solid, taste is good for daily snacking.",
]

REVIEW_NEGATIVE = [
    "A bit under-ripe on arrival, flavor was milder than expected.",
    "Outer box was slightly dented during transit.",
]


def load_sql_file(cursor: pymysql.cursors.Cursor, path: Path) -> None:
    sql_text = path.read_text(encoding="utf-8")
    statements = []
    buf: List[str] = []
    for line in sql_text.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("--"):
            continue
        buf.append(line)
        if stripped.endswith(";"):
            statements.append("\n".join(buf).rstrip(";"))
            buf = []
    if buf:
        statements.append("\n".join(buf))
    for stmt in statements:
        if stmt.strip():
            cursor.execute(stmt)


def seed_database(
    host: str,
    port: int,
    user: str,
    password: str,
    db_name: str,
    scale: str,
    with_indexes: bool,
    seed: int = 5003,
) -> Dict[str, int]:
    rng = random.Random(seed)
    cfg = SCALES[scale]
    repo_root = Path(__file__).resolve().parent.parent
    schema_path = repo_root / "database" / ("schema.sql" if with_indexes else "schema_no_indexes.sql")
    indexes_path = repo_root / "database" / "indexes.sql"

    conn = pymysql.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        charset="utf8mb4",
        autocommit=False,
    )
    t0 = time.perf_counter()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"CREATE DATABASE IF NOT EXISTS `{db_name}` "
                "DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci;"
            )
            cur.execute(f"USE `{db_name}`;")

            if with_indexes:
                # Replace hardcoded USE sf_project with target db_name if overridden
                sql_txt = schema_path.read_text(encoding="utf-8").replace(
                    "USE `sf_project`;", f"USE `{db_name}`;"
                ).replace(
                    "CREATE DATABASE IF NOT EXISTS `sf_project`",
                    f"CREATE DATABASE IF NOT EXISTS `{db_name}`",
                )
                for stmt in [s.strip() for s in sql_txt.split(";") if s.strip()]:
                    if not all(l.strip().startswith("--") or not l.strip() for l in stmt.splitlines()):
                        cur.execute(stmt)
                load_sql_file(cur, indexes_path)
            else:
                load_sql_file(cur, schema_path)
        conn.commit()

        # Optimize bulk load speed
        with conn.cursor() as cur:
            cur.execute("SET unique_checks = 0;")
            cur.execute("SET foreign_key_checks = 0;")

        base_start = datetime(2025, 12, 1, 8, 0, 0)
        base_end = datetime(2026, 11, 26, 22, 0, 0)
        span_seconds = int((base_end - base_start).total_seconds())

        # 1. Categories (8)
        with conn.cursor() as cur:
            cur.executemany(
                "INSERT INTO `category` (`created_at`, `updated_at`, `category_name`) VALUES (%s, %s, %s)",
                [(base_start, base_start, name) for name in CATEGORIES],
            )
        conn.commit()

        # 2. Users. ids 1-3 are the demo accounts used by jackfruit-frontend-V3
        #    (admin is in its ADMIN_USERNAMES whitelist; same accounts as
        #    software_project_design/seed.sql, password 123456). buyer_00042 (id=42)
        #    anchors the Q4 pagination query.
        demo_accounts = {1: "admin", 2: "omnis", 3: "user01"}
        user_rows: List[Tuple] = []
        n_users = cfg["users"]
        for i in range(1, n_users + 1):
            ts = base_start + timedelta(seconds=rng.randint(0, span_seconds // 2))
            if i in demo_accounts:
                uname, pwd = demo_accounts[i], "123456"
            else:
                uname, pwd = f"buyer_{i:05d}", "pass123456"
            phone = f"138{rng.randint(10000000, 99999999)}"
            email = f"{uname}@jackfruit.test"[:25]
            if uname == "user01":
                phone, email = "", ""  # V3 shows its "not filled in" state for this account
            user_rows.append((ts, ts, uname, pwd, phone, email))

        with conn.cursor() as cur:
            for start in range(0, len(user_rows), 5000):
                cur.executemany(
                    "INSERT INTO `user` (`created_at`, `updated_at`, `username`, `password`, `phone`, `email`) "
                    "VALUES (%s, %s, %s, %s, %s, %s)",
                    user_rows[start : start + 5000],
                )
        conn.commit()

        # 3. Jackfruit products
        n_products = cfg["jackfruits"]
        product_prices: List[float] = [0.0] * (n_products + 1)
        product_rows: List[Tuple] = []
        for i in range(1, n_products + 1):
            ts = base_start + timedelta(seconds=rng.randint(0, span_seconds // 3))
            cat_id = ((i - 1) % len(CATEGORIES)) + 1
            prefix = VARIETY_PREFIXES[i % len(VARIETY_PREFIXES)]
            suffix = VARIETY_SUFFIXES[(i // len(VARIETY_PREFIXES)) % len(VARIETY_SUFFIXES)]
            pname = f"{prefix} {suffix} #{i:04d}"[:100]
            # ~18% low-stock (< 50) for realistic inventory alert testing
            storage = rng.randint(1, 45) if rng.random() < 0.18 else rng.randint(60, 500)
            price = round(rng.uniform(18.0, 168.0), 2)
            product_prices[i] = price
            img = IMAGES[i % len(IMAGES)]
            mgmt = f"Cold-chain 4-8C storage; batch #{i:04d} inspected."
            feat = f"Brix {rng.randint(18, 26)}%, thick golden-yellow flesh."
            intro = f"Sourced directly from tropical orchard lot #{(i % 24) + 1}."
            product_rows.append((ts, ts, cat_id, pname, storage, price, img, mgmt, feat, intro))

        with conn.cursor() as cur:
            for start in range(0, len(product_rows), 5000):
                cur.executemany(
                    "INSERT INTO `jackfruit` (`created_at`, `updated_at`, `category_id`, `product_name`, "
                    "`storage`, `price`, `image`, `management_info`, `jackfruit_feature`, `plant_intro`) "
                    "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                    product_rows[start : start + 5000],
                )
        conn.commit()

        # 4. Orders (ensure user 42 has ~35 orders for consistent Q4 pagination results;
        #    ensure realistic hot-tail popularity skew on products)
        n_orders = cfg["orders"]
        hot_products = list(range(1, min(21, n_products + 1)))
        order_rows: List[Tuple] = []
        for idx in range(n_orders):
            if idx < 35 and n_users >= 42:
                uid = 42
            else:
                uid = rng.randint(1, n_users)
            # 35% of orders go to top 20 popular varieties
            if rng.random() < 0.35:
                jid = rng.choice(hot_products)
            else:
                jid = rng.randint(1, n_products)
            qty = rng.randint(1, 6)
            total = round(product_prices[jid] * qty, 2)
            ts = base_start + timedelta(seconds=rng.randint(0, span_seconds))
            addr = f"{rng.choice(CITIES)} No.{rng.randint(10, 999)} Orchard Rd"
            order_rows.append((ts, ts, uid, addr, total, qty, jid))

        with conn.cursor() as cur:
            for start in range(0, len(order_rows), 10000):
                cur.executemany(
                    "INSERT INTO `orders` (`created_at`, `updated_at`, `order_user_id`, "
                    "`user_address`, `total_cost`, `quantity`, `jackfruit_id`) "
                    "VALUES (%s, %s, %s, %s, %s, %s, %s)",
                    order_rows[start : start + 10000],
                )
        conn.commit()

        # 5. Reviews (unique (user_id, jackfruit_id) pairs)
        n_reviews = min(cfg["reviews"], n_users * n_products)
        seen_pairs = set()
        review_rows: List[Tuple] = []
        # Ensure hot products get >= 10 reviews for Q3/Q7 consistency
        for jid in range(1, min(31, n_products + 1)):
            for uid in range(1, min(16, n_users + 1)):
                if len(review_rows) >= n_reviews:
                    break
                seen_pairs.add((uid, jid))
                rating = rng.choices([5, 4, 3, 2, 1], weights=[48, 30, 13, 6, 3])[0]
                content = (
                    rng.choice(REVIEW_POSITIVE)
                    if rating >= 4
                    else rng.choice(REVIEW_NEUTRAL)
                    if rating == 3
                    else rng.choice(REVIEW_NEGATIVE)
                )
                ts = base_start + timedelta(seconds=rng.randint(0, span_seconds))
                review_rows.append((ts, ts, uid, jid, rating, content))

        while len(review_rows) < n_reviews:
            uid = rng.randint(1, n_users)
            jid = rng.randint(1, n_products)
            if (uid, jid) in seen_pairs:
                continue
            seen_pairs.add((uid, jid))
            rating = rng.choices([5, 4, 3, 2, 1], weights=[45, 30, 15, 6, 4])[0]
            content = (
                rng.choice(REVIEW_POSITIVE)
                if rating >= 4
                else rng.choice(REVIEW_NEUTRAL)
                if rating == 3
                else rng.choice(REVIEW_NEGATIVE)
            )
            ts = base_start + timedelta(seconds=rng.randint(0, span_seconds))
            review_rows.append((ts, ts, uid, jid, rating, content))

        with conn.cursor() as cur:
            for start in range(0, len(review_rows), 10000):
                cur.executemany(
                    "INSERT INTO `review` (`created_at`, `updated_at`, `user_id`, `jackfruit_id`, `rating`, `content`) "
                    "VALUES (%s, %s, %s, %s, %s, %s)",
                    review_rows[start : start + 10000],
                )
        conn.commit()

        # 6. Platform notifications
        n_notifies = cfg["notifies"]
        notify_rows = []
        for i in range(1, n_notifies + 1):
            ts = base_start + timedelta(days=i * 5)
            msg = (
                "Welcome to Jackfruit Direct! Fresh Hainan Red-Flesh & Thai Honey Gold harvest now shipping."
                if i == n_notifies
                else f"Platform harvest dispatch update #{i}: Cold-chain delivery active."
            )
            notify_rows.append((ts, ts, msg))
        with conn.cursor() as cur:
            cur.executemany(
                "INSERT INTO `notify` (`created_at`, `updated_at`, `message`) VALUES (%s, %s, %s)",
                notify_rows,
            )
            cur.execute("SET unique_checks = 1;")
            cur.execute("SET foreign_key_checks = 1;")
        conn.commit()

        # Update InnoDB table statistics so optimizer chooses accurate plans
        counts: Dict[str, int] = {}
        with conn.cursor() as cur:
            for tbl in ("category", "user", "jackfruit", "orders", "review", "notify"):
                cur.execute(f"ANALYZE TABLE `{tbl}`;")
                cur.fetchall()
                cur.execute(f"SELECT COUNT(*) FROM `{tbl}`;")
                counts[tbl] = int(cur.fetchone()[0])

        elapsed = time.perf_counter() - t0
        counts["_elapsed_sec"] = round(elapsed, 2)  # type: ignore[assignment]
        counts["_total_rows"] = sum(v for k, v in counts.items() if not k.startswith("_"))
        return counts
    finally:
        conn.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed Jackfruit Seller MySQL database.")
    parser.add_argument("--host", default=os.getenv("DB_HOST", "127.0.0.1"))
    parser.add_argument("--port", type=int, default=int(os.getenv("DB_PORT", "3306")))
    parser.add_argument("--user", default=os.getenv("DB_USER", "root"))
    parser.add_argument("--password", default=os.getenv("DB_PASSWORD", ""))
    parser.add_argument("--db", default=os.getenv("DB_NAME", "sf_project"))
    parser.add_argument("--scale", choices=list(SCALES.keys()), default="small")
    parser.add_argument("--no-indexes", action="store_true", help="Load PK-only baseline schema without secondary indexes.")
    parser.add_argument("--seed", type=int, default=5003)
    args = parser.parse_args()

    counts = seed_database(
        host=args.host,
        port=args.port,
        user=args.user,
        password=args.password,
        db_name=args.db,
        scale=args.scale,
        with_indexes=not args.no_indexes,
        seed=args.seed,
    )
    print(f"Seeded `{args.db}` ({args.scale}, indexes={not args.no_indexes}): {counts}")


if __name__ == "__main__":
    main()
