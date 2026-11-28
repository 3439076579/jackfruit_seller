# jackfruit_seller

Course project for COMP 5003 (Track 1: Database Application Development): an online store and admin system for selling jackfruit, built on MySQL 8.4.

| Path | What it is |
| --- | --- |
| `jackfruit-frontend-V3/` | **Current frontend**: Vue 3 + TypeScript + Vite + Pinia + Element Plus. A single SPA with a shop area and an admin area. See [`jackfruit-frontend-V3/docs/启动方案.md`](jackfruit-frontend-V3/docs/启动方案.md). |
| `software_project_design/` | Go backend (Gin + GORM), REST API on `localhost:8082`. |
| `database/` | Hand-written MySQL schema (`schema.sql`), PK-only baseline (`schema_no_indexes.sql`), secondary/covering indexes (`indexes.sql`) and 8 analytical queries (`queries.sql`, Q1–Q8). |
| `scripts/` | Deterministic data generator (`seed_data.py`) and benchmark runner (`run_benchmarks.py`). |
| `波罗蜜前台管理系统/`, `波罗蜜后台管理系统/` | Legacy Vue 2 frontends, kept for reference only. |

## Quick start

Requires MySQL 8.4, Go 1.19+, Node 18+ and Python 3.11+.

**1. Create and fill the database.** Either:

- run the full schema plus about 10K rows of synthetic data (recommended; this is also what the report evaluates):

  ```bash
  python3 -m pip install -r scripts/requirements.txt
  python3 scripts/seed_data.py --user root --password "<pw>" --db sf_project --scale small
  ```

- or use the lightweight path: `CREATE DATABASE sf_project`, start the backend once (it creates the tables on an empty database), then load `software_project_design/seed.sql`.

Both paths create the demo accounts `admin` (admin area), `omnis` and `user01`, all with password `123456`.

**2. Start the backend.**

```bash
cd software_project_design
DB_DSN="root:<pw>@tcp(127.0.0.1:3306)/sf_project?charset=utf8mb4&parseTime=True&loc=Local" go run main.go
```

- `DB_DSN` is optional. Without it, the backend connects as password-less `root@localhost`.
- GORM `AutoMigrate` only runs on an empty database. Once the tables exist, `database/schema.sql` is the source of truth: AutoMigrate would otherwise rewrite column types, drop `NOT NULL`/`DEFAULT` clauses and add duplicate indexes.
- Force AutoMigrate on or off with `DB_AUTO_MIGRATE=true|false`.

**3. Start the frontend.**

```bash
cd jackfruit-frontend-V3
npm install
npm run dev   # http://localhost:5173
```

The frontend proxies `/api` to `localhost:8082`. To browse the UI with built-in mock data and no backend, set `VITE_USE_MOCK=true` in `.env.development`.

## Data generation and benchmarks

`seed_data.py` builds three scales from fixed seed `5003`:

| Scale | Total rows | Orders |
| --- | --- | --- |
| small | 10,118 | 7,500 |
| medium | 100,528 | 75,000 |
| large | 502,058 | 400,000 |

Add `--no-indexes` to load the PK-only baseline schema.

```bash
python3 scripts/run_benchmarks.py --user root --password "<pw>"
```

`run_benchmarks.py` does three things:

1. Runs Q1–Q8 on the medium dataset.
2. Compares no-index vs indexed `EXPLAIN ANALYZE` on the large dataset (1 warm-up run + 5 timed runs per query).
3. Records scalability across all three scales.

It works in its own database (`--db`, default `sf_project_bench`) and writes results to `./benchmark_output/`. It only drops and re-seeds the application database `sf_project` if you pass `--reseed-app-db`.
