#!/usr/bin/env python3
"""Automated SQL evaluation & benchmarking suite for Jackfruit Seller (MySQL 8.x).

Executes:
  1. Sample queries Q1-Q8 against the indexed Medium (~100K rows) database,
     saving SQL, row counts, and result previews to handoff/sample_queries/.
  2. Index vs. No-Index EXPLAIN ANALYZE comparison on core queries at Large (~500K rows),
     saving raw EXPLAIN ANALYZE plans and CSV timings to handoff/benchmarks/.
  3. Scalability benchmarks across Small (~10K), Medium (~100K), and Large (~500K)
     datasets (both indexed and PK-only baseline), exporting scalability_results.csv.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import platform
import re
import statistics
import subprocess
import time
from pathlib import Path
from typing import Any, Dict, List, Tuple

import pymysql

from seed_data import SCALES, seed_database

CORE_BENCHMARK_QUERIES = ["Q1", "Q3", "Q4", "Q5", "Q6"]


def parse_queries(queries_path: Path) -> List[Dict[str, str]]:
    text = queries_path.read_text(encoding="utf-8")
    pattern = re.compile(r"^--\s+(Q\d+):\s*(.+)$", re.MULTILINE)
    matches = list(pattern.finditer(text))
    parsed: List[Dict[str, str]] = []
    for idx, m in enumerate(matches):
        qid = m.group(1)
        title = m.group(2).strip()
        start = m.end()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(text)
        block = text[start:end].strip()
        # Extract business question comments and SQL body
        question_lines = []
        sql_lines = []
        in_sql = False
        for line in block.splitlines():
            s = line.strip()
            if not in_sql and s.startswith("--"):
                cleaned = s.lstrip("-").strip()
                if cleaned.lower().startswith("business question:"):
                    cleaned = cleaned[len("business question:"):].strip()
                question_lines.append(cleaned)
            else:
                in_sql = True
                sql_lines.append(line)
        sql = "\n".join(sql_lines).strip().rstrip(";")
        parsed.append(
            {
                "id": qid,
                "title": title,
                "question": " ".join(question_lines).strip(),
                "sql": sql,
            }
        )
    return parsed


def format_markdown_table(columns: List[str], rows: List[Tuple[Any, ...]], max_rows: int = 15) -> str:
    if not columns:
        return "_No columns returned._"
    header = "| " + " | ".join(columns) + " |"
    sep = "| " + " | ".join(["---"] * len(columns)) + " |"
    body = []
    for r in rows[:max_rows]:
        vals = [str(v) if v is not None else "NULL" for v in r]
        vals = [v.replace("|", "\\|").replace("\n", " ") for v in vals]
        body.append("| " + " | ".join(vals) + " |")
    if not body:
        body.append("| " + " | ".join(["(0 rows)"] + [""] * (len(columns) - 1)) + " |")
    return "\n".join([header, sep] + body)


def run_timed_query(
    conn: pymysql.connections.Connection, sql: str, warmup: int = 1, repeats: int = 5
) -> Tuple[float, List[float], int]:
    warmup_ms = 0.0
    timings: List[float] = []
    row_count = 0
    with conn.cursor() as cur:
        for i in range(warmup + repeats):
            t0 = time.perf_counter()
            cur.execute(sql)
            rows = cur.fetchall()
            dt_ms = (time.perf_counter() - t0) * 1000.0
            row_count = len(rows)
            if i < warmup:
                warmup_ms = dt_ms
            else:
                timings.append(round(dt_ms, 3))
    return round(warmup_ms, 3), timings, row_count


def get_explain_outputs(
    conn: pymysql.connections.Connection, sql: str
) -> Tuple[str, List[Dict[str, Any]], float | None]:
    with conn.cursor() as cur:
        cur.execute(f"EXPLAIN {sql}")
        cols = [d[0] for d in cur.description]
        explain_rows = [dict(zip(cols, r)) for r in cur.fetchall()]

        cur.execute(f"EXPLAIN ANALYZE {sql}")
        analyze_lines = [str(r[0]) for r in cur.fetchall()]
        analyze_text = "\n".join(analyze_lines)

    # Extract top-level actual time from EXPLAIN ANALYZE first line if present:
    # e.g. "-> Limit: 10 row(s)  (actual time=12.345..12.350 rows=10 loops=1)"
    m = re.search(r"actual time=[\d.]+\.\.([\d.]+)", analyze_text)
    actual_ms = float(m.group(1)) if m else None
    return analyze_text, explain_rows, actual_ms


def summarize_access_types(explain_rows: List[Dict[str, Any]]) -> str:
    parts = []
    for r in explain_rows:
        tbl = r.get("table") or "?"
        typ = r.get("type") or "?"
        key = r.get("key") or "NULL"
        extra = r.get("Extra") or ""
        flag = ""
        if "Using index" in extra and "Using index condition" not in extra:
            flag = " [Covering]"
        elif "Using filesort" in extra:
            flag = " [Filesort]"
        elif "Using temporary" in extra:
            flag = " [Temp]"
        parts.append(f"{tbl}:{typ}({key}){flag}")
    return "; ".join(parts)


def collect_environment_info(host: str, port: int, user: str, password: str) -> Dict[str, Any]:
    conn = pymysql.connect(host=host, port=port, user=user, password=password)
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT VERSION()")
            mysql_ver = cur.fetchone()[0]
            cur.execute("SHOW VARIABLES LIKE 'innodb_buffer_pool_size'")
            bp = cur.fetchone()[1]
    finally:
        conn.close()

    cpu = subprocess.check_output(["sysctl", "-n", "machdep.cpu.brand_string"], text=True).strip()
    ncpu = subprocess.check_output(["sysctl", "-n", "hw.ncpu"], text=True).strip()
    mem_bytes = int(subprocess.check_output(["sysctl", "-n", "hw.memsize"], text=True).strip())
    sw_vers = subprocess.check_output(["sw_vers", "-productVersion"], text=True).strip()
    go_ver = subprocess.check_output(["go", "version"], text=True).strip()
    node_ver = subprocess.check_output(["node", "--version"], text=True).strip()

    return {
        "os": f"macOS {sw_vers} ({platform.machine()})",
        "cpu": f"{cpu} ({ncpu} cores)",
        "memory_gb": round(mem_bytes / (1024**3), 1),
        "mysql_version": mysql_ver,
        "innodb_buffer_pool_bytes": int(bp),
        "go_version": go_ver,
        "node_version": node_ver,
        "python_version": platform.python_version(),
        "pymysql_version": pymysql.__version__,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Run Jackfruit Seller DB benchmarks.")
    parser.add_argument("--host", default=os.getenv("DB_HOST", "127.0.0.1"))
    parser.add_argument("--port", type=int, default=int(os.getenv("DB_PORT", "3306")))
    parser.add_argument("--user", default=os.getenv("DB_USER", "root"))
    parser.add_argument("--password", default=os.getenv("DB_PASSWORD", ""))
    parser.add_argument("--db", default=os.getenv("DB_NAME", "sf_project_bench"))
    parser.add_argument(
        "--handoff-dir",
        default="/Users/avery/Desktop/5003/handoff",
        help="Destination directory for raw benchmark evidence.",
    )
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parent.parent
    queries = parse_queries(repo_root / "database" / "queries.sql")
    qmap = {q["id"]: q for q in queries}

    handoff = Path(args.handoff_dir)
    sq_dir = handoff / "sample_queries"
    bm_dir = handoff / "benchmarks"
    sq_dir.mkdir(parents=True, exist_ok=True)
    bm_dir.mkdir(parents=True, exist_ok=True)

    env_info = collect_environment_info(args.host, args.port, args.user, args.password)
    (bm_dir / "environment.json").write_text(json.dumps(env_info, indent=2), encoding="utf-8")
    print("Environment:", json.dumps(env_info, indent=2))

    # -------------------------------------------------------------------------
    # Step A: Seed Medium (~100K rows, indexed) & run all 8 sample queries Q1-Q8
    # -------------------------------------------------------------------------
    print("\n[1/3] Seeding Medium (~100K rows, indexed) for Q1-Q8 sample query capture...")
    med_counts = seed_database(
        args.host, args.port, args.user, args.password, args.db, scale="medium", with_indexes=True
    )
    print("Medium counts:", med_counts)

    conn = pymysql.connect(host=args.host, port=args.port, user=args.user, password=args.password, db=args.db)
    summary_lines = [
        "# Sample Queries Execution Summary (Dataset: Medium ~100,528 rows, Indexed)\n",
        f"- Dataset counts: `{json.dumps(med_counts)}`\n",
    ]
    try:
        for q in queries:
            t0 = time.perf_counter()
            with conn.cursor() as cur:
                cur.execute(q["sql"])
                cols = [d[0] for d in cur.description]
                rows = cur.fetchall()
            dt_ms = round((time.perf_counter() - t0) * 1000.0, 2)
            md_tbl = format_markdown_table(cols, rows, max_rows=15)

            q_md = (
                f"# {q['id']}: {q['title']}\n\n"
                f"**Business Question:** {q['question']}\n\n"
                f"**Execution Time:** {dt_ms} ms | **Total Rows Returned:** {len(rows)}\n\n"
                f"## SQL\n```sql\n{q['sql']};\n```\n\n"
                f"## Result Preview (up to 15 rows)\n\n{md_tbl}\n"
            )
            (sq_dir / f"{q['id']}.md").write_text(q_md, encoding="utf-8")

            with (sq_dir / f"{q['id']}.csv").open("w", newline="", encoding="utf-8") as f:
                w = csv.writer(f)
                w.writerow(cols)
                w.writerows(rows)

            summary_lines.append(
                f"## {q['id']}: {q['title']}\n"
                f"- **Question:** {q['question']}\n"
                f"- **Time:** {dt_ms} ms | **Rows:** {len(rows)}\n\n"
                f"{md_tbl}\n"
            )
            print(f"  {q['id']}: {len(rows)} rows in {dt_ms} ms")
    finally:
        conn.close()
    (sq_dir / "ALL_QUERIES_SUMMARY.md").write_text("\n".join(summary_lines), encoding="utf-8")

    # -------------------------------------------------------------------------
    # Step B & C: Scalability across Small / Medium / Large & No-Index vs Indexed
    # -------------------------------------------------------------------------
    scalability_rows: List[Dict[str, Any]] = []
    explain_no_idx_chunks: List[str] = []
    explain_with_idx_chunks: List[str] = []
    index_comp_rows: List[Dict[str, Any]] = []
    scale_counts_record: Dict[str, Any] = {}

    for scale in ("small", "medium", "large"):
        for index_mode, with_idx in (("no_index", False), ("with_index", True)):
            print(f"\n[2/3] Benchmarking scale={scale}, mode={index_mode}...")
            counts = seed_database(
                args.host, args.port, args.user, args.password, args.db, scale=scale, with_indexes=with_idx
            )
            if with_idx:
                scale_counts_record[scale] = counts
            print(f"  Seeded: {counts}")

            conn = pymysql.connect(
                host=args.host, port=args.port, user=args.user, password=args.password, db=args.db
            )
            try:
                for qid in CORE_BENCHMARK_QUERIES:
                    sql = qmap[qid]["sql"]
                    warmup_ms, timings, row_cnt = run_timed_query(conn, sql, warmup=1, repeats=5)
                    med_ms = round(statistics.median(timings), 3)
                    mean_ms = round(statistics.mean(timings), 3)
                    analyze_txt, explain_rows, _ = get_explain_outputs(conn, sql)
                    scan_summary = summarize_access_types(explain_rows)

                    scalability_rows.append(
                        {
                            "scale": scale,
                            "total_rows": counts["_total_rows"],
                            "orders_rows": counts["orders"],
                            "reviews_rows": counts["review"],
                            "index_mode": index_mode,
                            "query_id": qid,
                            "warmup_ms": warmup_ms,
                            "run1_ms": timings[0],
                            "run2_ms": timings[1],
                            "run3_ms": timings[2],
                            "run4_ms": timings[3],
                            "run5_ms": timings[4],
                            "median_ms": med_ms,
                            "mean_ms": mean_ms,
                            "rows_returned": row_cnt,
                            "scan_type": scan_summary,
                        }
                    )
                    print(f"  {qid} [{index_mode}]: median={med_ms} ms, mean={mean_ms} ms | {scan_summary}")

                    if scale == "large":
                        block = (
                            f"======================================================================\n"
                            f"{qid}: {qmap[qid]['title']} ({index_mode}, Large ~{counts['_total_rows']} rows)\n"
                            f"Median: {med_ms} ms | Mean: {mean_ms} ms | Runs: {timings}\n"
                            f"EXPLAIN Summary: {scan_summary}\n"
                            f"----------------------------------------------------------------------\n"
                            f"SQL:\n{sql};\n\n"
                            f"EXPLAIN ANALYZE:\n{analyze_txt}\n\n"
                            f"EXPLAIN ROWS:\n{json.dumps(explain_rows, indent=2, default=str)}\n\n"
                        )
                        if with_idx:
                            explain_with_idx_chunks.append(block)
                        else:
                            explain_no_idx_chunks.append(block)
            finally:
                conn.close()

    # Build Section 6.2 Index Comparison CSV (using Large dataset timings)
    large_no = {
        r["query_id"]: r for r in scalability_rows if r["scale"] == "large" and r["index_mode"] == "no_index"
    }
    large_idx = {
        r["query_id"]: r for r in scalability_rows if r["scale"] == "large" and r["index_mode"] == "with_index"
    }
    for qid in CORE_BENCHMARK_QUERIES:
        no_r = large_no[qid]
        ix_r = large_idx[qid]
        speedup = round(no_r["median_ms"] / ix_r["median_ms"], 2) if ix_r["median_ms"] > 0 else 0.0
        index_comp_rows.append(
            {
                "query_id": qid,
                "title": qmap[qid]["title"],
                "no_index_median_ms": no_r["median_ms"],
                "no_index_mean_ms": no_r["mean_ms"],
                "no_index_scan": no_r["scan_type"],
                "with_index_median_ms": ix_r["median_ms"],
                "with_index_mean_ms": ix_r["mean_ms"],
                "with_index_scan": ix_r["scan_type"],
                "speedup_x": speedup,
            }
        )

    with (bm_dir / "scalability_results.csv").open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(scalability_rows[0].keys()))
        writer.writeheader()
        writer.writerows(scalability_rows)

    with (bm_dir / "index_comparison.csv").open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(index_comp_rows[0].keys()))
        writer.writeheader()
        writer.writerows(index_comp_rows)

    (bm_dir / "explain_analyze_no_index.txt").write_text("\n".join(explain_no_idx_chunks), encoding="utf-8")
    (bm_dir / "explain_analyze_with_index.txt").write_text("\n".join(explain_with_idx_chunks), encoding="utf-8")
    (bm_dir / "dataset_scales.json").write_text(json.dumps(scale_counts_record, indent=2), encoding="utf-8")

    # Finally seed the live application DB `sf_project` with Small (~10K) dataset for live UI demo
    print("\n[3/3] Seeding live application DB `sf_project` (small, indexed) for UI & backend testing...")
    app_counts = seed_database(
        args.host, args.port, args.user, args.password, "sf_project", scale="small", with_indexes=True
    )
    print("Live `sf_project` counts:", app_counts)
    print("\nAll benchmarks completed successfully.")


if __name__ == "__main__":
    main()
