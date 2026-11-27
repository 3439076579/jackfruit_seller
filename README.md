# Jackfruit Seller E-Commerce Platform (`jackfruit_seller`)

> **Course Project — COMP 5003 (Track 1: Database Application Development)**  
> A full-stack specialty e-commerce and management platform for jackfruit varieties, featuring a Go (Gin + GORM) REST API backend, dual Vue.js (Buyer Storefront + Seller/Admin Dashboard) frontends, normalized MySQL 8.x relational schema with integrity constraints, composite/covering indexing, and reproducible SQL performance benchmarking.

---

## 1. Project Overview & Architecture

The platform adopts a layered client–server architecture:
- **Buyer Storefront (`波罗蜜前台管理系统/Final_Works/`)**: Account registration & login, live platform announcements, jackfruit catalog browsing, product detail & customer reviews, order placement with transactional inventory deduction, personal order history with pagination, and profile management.
- **Seller / Admin Dashboard (`波罗蜜后台管理系统/`)**: Member CRUD, jackfruit variety & category CRUD with image upload, global order lookup, announcement publishing, and SQL-backed sales/revenue/rating analytics.
- **Backend API (`software_project_design/`)**: Layered Go service (`router` → `controller` → `service` → `model`) using Gin HTTP router, GORM ORM, Zap structured logging, and MySQL 8.x InnoDB with `SELECT ... FOR UPDATE` row-level locking on order creation.
- **Database Engineering & Evaluation (`database/`, `scripts/`)**: Normalized DDL (`PRIMARY KEY`, `FOREIGN KEY`, `NOT NULL`, `UNIQUE`, `CHECK`), composite/covering index suite, deterministic synthetic data generator (`small`/`medium`/`large`), 8 analytical & operational SQL queries (`Q1–Q8`), and an automated `EXPLAIN ANALYZE` + scalability benchmark runner.

---

## 2. Directory Structure

```text
jackfruit_seller/
├── README.md                          # Project documentation & reproduction guide
├── database/
│   ├── schema.sql                     # Canonical 6-table DDL (PK, FK, UNIQUE, CHECK, NOT NULL)
│   ├── schema_no_indexes.sql          # Benchmark baseline DDL (PK + CHECK only, no secondary indexes)
│   ├── indexes.sql                    # Secondary, composite & covering B-Tree indexes
│   └── queries.sql                    # 8 business-meaningful SQL queries (Q1–Q8)
├── scripts/
│   ├── requirements.txt               # Python dependencies for seeding, benchmarking & charts
│   ├── seed_data.py                   # Deterministic synthetic dataset seeder (10K / 100K / 500K)
│   └── run_benchmarks.py              # Runs Q1–Q8, EXPLAIN ANALYZE comparisons & scalability CSV export
├── software_project_design/           # Go backend (Gin + GORM + MySQL)
│   ├── main.go                        # HTTP server entrypoint (localhost:8082)
│   ├── go.mod / go.sum                # Go module dependencies
│   ├── global/global.go               # MySQL connection init (supports DB_DSN env var) & AutoMigrate
│   ├── middleware/cors.go             # CORS middleware
│   ├── model/                         # 6 GORM models (user, category, jackfruit, orders, review, notify)
│   ├── router/                        # Route group definitions
│   ├── controller/                    # Request parsing & JSON response handlers
│   ├── service/                       # Business logic & transactional/SQL queries
│   ├── utils/file.go                  # Product image upload helper
│   └── data/                          # Static product image assets (/static/)
├── 波罗蜜前台管理系统/Final_Works/      # Buyer storefront (Vue 2.6 + Element UI 2.15 + Vue CLI 3)
└── 波罗蜜后台管理系统/                  # Seller/Admin portal (Vue 2.5 + Element UI 2.15 + ECharts 5.4 + Webpack 3)
```

---

## 3. Environment & Dependencies

Verified local toolchain versions:
- **Database**: MySQL `8.4.13` (InnoDB engine)
- **Backend**: Go `1.27.4` (`go.mod` targets `go 1.19+`), Gin `v1.9.1`, GORM `v1.25.5`, `gorm.io/driver/mysql v1.5.2`, `go.uber.org/zap v1.26.0`
- **Frontends**: Node.js (`v26.0.0` verified with `NODE_OPTIONS=--openssl-legacy-provider` for Webpack 3 / Vue CLI 3; or Node 14/16 LTS natively), Vue `2.6.10` / `2.5.2`, Element UI `2.15.x`, Axios `1.x`, ECharts `5.4.0`
- **Benchmark & Seeding Scripts**: Python `3.11+` (`pymysql`, `matplotlib`, `seaborn`, `pandas`, `numpy`, `pillow`)

---

## 4. Database Initialization & Synthetic Data Generation

### 4.1 Manual SQL Initialization
```bash
mysql -u root < database/schema.sql
mysql -u root sf_project < database/indexes.sql
```

### 4.2 Reproducible Data Seeding (`scripts/seed_data.py`)
Install Python dependencies (e.g., via `uv` or `pip`):
```bash
python3 -m pip install -r scripts/requirements.txt
```

Generate datasets at one of three built-in scales (`small` ~10K rows, `medium` ~100K rows, `large` ~502K rows):
```bash
# Seed live application database `sf_project` with ~10K rows (indexed)
python3 scripts/seed_data.py --user root --password "" --db sf_project --scale small

# Seed ~100K rows
python3 scripts/seed_data.py --user root --password "" --db sf_project_bench --scale medium

# Seed ~502K rows without non-PK indexes (for before-index baseline testing)
python3 scripts/seed_data.py --user root --password "" --db sf_project_bench --scale large --no-indexes
```

---

## 5. Running the Application

### 5.1 Backend API (`http://localhost:8082`)
`software_project_design/global/global.go` reads `DB_DSN` from the environment (falling back to the default local DSN if unset):
```bash
cd software_project_design
DB_DSN="root:@tcp(127.0.0.1:3306)/sf_project?charset=utf8mb4&parseTime=True&loc=Local" go run .
```

### 5.2 Buyer Storefront (`http://localhost:8081` or `8080`)
```bash
cd "波罗蜜前台管理系统/Final_Works"
NODE_OPTIONS=--openssl-legacy-provider npm run serve
```
*(Dependencies are pre-installed; run `npm install` first if setting up from a clean checkout without `node_modules`.)*

### 5.3 Seller / Admin Dashboard (`http://localhost:8080`)
- **On Node.js 14/16 LTS** (native `webpack-dev-server` / `spdy` support):
```bash
cd "波罗蜜后台管理系统"
npm install --legacy-peer-deps
npm run dev
```
- **On Node.js 18+ (verified on `v26.0.0`)** where legacy `spdy` fails due to removed `http_parser` binding: build the static bundle and serve `dist/` over HTTP:
```bash
cd "波罗蜜后台管理系统"
npm install --legacy-peer-deps
NODE_OPTIONS=--openssl-legacy-provider npm run build
python3 -m http.server 8080 --directory dist --bind 127.0.0.1
```
Default seeded demo account: username `wjb`, password `123456`.

---

## 6. Reproducing SQL Benchmarks & Scalability Evaluation

Run the full automated evaluation suite (executes Q1–Q8, captures `EXPLAIN ANALYZE` before/after indexing at Large ~502K scale, and benchmarks Small/Medium/Large scalability into CSV):
```bash
python3 scripts/run_benchmarks.py --user root --password "" --handoff-dir ./benchmark_output
```

Outputs generated:
- `sample_queries/Q1.md` – `Q8.md` & `Q1.csv` – `Q8.csv`: SQL text, execution time, total rows, and result previews.
- `benchmarks/index_comparison.csv`: Median/mean latency (ms) and speedup ratios before vs. after indexing.
- `benchmarks/explain_analyze_no_index.txt` & `explain_analyze_with_index.txt`: Raw MySQL `EXPLAIN ANALYZE` and `EXPLAIN` plans.
- `benchmarks/scalability_results.csv`: Per-run timings across `small`, `medium`, and `large` datasets.
