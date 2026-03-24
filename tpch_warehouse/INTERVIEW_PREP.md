# Interview Prep: dbt TPCH Data Warehouse Project

Use this document to confidently talk about your project in any data engineering interview.
Every answer below is written to be spoken naturally — not read verbatim.

---

## 🎯 The 30-Second Elevator Pitch

> *"I built a full production-style data warehouse using dbt, Snowflake, and GitHub Actions CI/CD.
> The project ingests TPC-H benchmark data — a standard wholesale supplier dataset —
> transforms it through three layers (staging, intermediate, and marts) into a Star Schema
> with a central fact table and four dimension tables. I added 51 automated data quality tests
> and wired everything into a CI/CD pipeline that blocks any pull request from merging if a
> test fails. It's the kind of setup you'd find at companies like GitLab, Airbnb, or Shopify."*

---

## 🏗️ Architecture Questions

### Q: Walk me through the architecture of your project.

> "The project follows a three-layer dbt architecture.
> The first layer is **staging** — seven SQL models, one per source table, that rename columns
> from the raw TPC-H prefix format (like `o_orderkey`) to clean snake_case names and calculate
> a few derived fields. These materialize as views because they're just transformation logic —
> no point storing them.
>
> The second layer is **intermediate** — two models that join staging tables together.
> `int_order_items` joins orders to their line items at the line-item grain and adds
> fulfillment metrics like days-to-ship. `int_customer_locations` fully resolves the customer's
> country and region by joining three tables into one flat view.
>
> The third layer is **marts** — these are the business-ready tables that analysts query.
> I have one fact table, `fct_orders`, at the order-line-item grain, and four dimension tables:
> customers, parts, suppliers, and locations. The marts materialize as physical tables
> in Snowflake for fast query performance."

---

### Q: Why did you choose a Star Schema? Why not just one big flat table?

> "A Star Schema separates measurable facts from descriptive attributes.
> The fact table stays narrow and fast — it only has foreign keys and measures.
> Dimensions hold all the descriptive context. This means analysts can join exactly
> the two tables they need rather than scanning one massive denormalized table.
>
> It also means changes are isolated. If a customer's market segment category is renamed,
> I update `dim_customers` — not the fact table or every downstream report.
> Star Schemas are the industry standard for a reason: they balance query performance,
> maintainability, and ease of use for non-engineers."

---

### Q: What is the grain of your fact table?

> "The grain of `fct_orders` is **one row per order line item** — meaning one row for each
> product within each order. An order with five products generates five rows.
> I chose this grain because it's the most granular level in the source data
> and supports the widest range of analyses — revenue by product, by customer segment,
> by ship mode, fulfillment latency, and so on — without pre-aggregating and losing detail."

---

## 🔧 dbt-Specific Questions

### Q: What is dbt and why did you use it?

> "dbt — Data Build Tool — is a transformation framework that lets you write data
> transformations as version-controlled SQL files. Before dbt, teams would write raw SQL
> stored procedures with no tests, no documentation, and no way to see how tables depended
> on each other. dbt solves all three: it builds a dependency graph via `ref()` calls,
> auto-generates documentation, and has a built-in testing framework.
>
> I used it because it's the industry standard — used at Airbnb, GitLab, Shopify —
> and because it turns data transformation into proper software engineering with all the
> practices teams already use for application code: version control, code review, testing, CI/CD."

---

### Q: What is the difference between `ref()` and `source()` in dbt?

> "`source()` is how you reference raw, external tables — the data that lives in Snowflake
> but wasn't created by dbt. In my project that's `SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.ORDERS`.
> You register those tables in `sources.yml` and then reference them with
> `{{ source('tpch', 'orders') }}`.
>
> `ref()` is how you reference another dbt model — a SQL file you wrote yourself.
> So `int_order_items` uses `{{ ref('stg_orders') }}` to pull from the staging model.
>
> The critical difference is that `ref()` tells dbt about the dependency. dbt uses those
> references to build a DAG — a directed acyclic graph — and guarantees it always builds
> staging models before intermediates, and intermediates before marts. If you hardcode
> table names instead, dbt doesn't know the order and the build can fail randomly."

---

### Q: What does `materialized: view` vs `materialized: table` mean in dbt?

> "Materialization controls how dbt physically stores the result of a model in the warehouse.
>
> A `view` doesn't store any rows — it's just saved SQL that runs every time someone queries it.
> It's cheap on storage but can be slow if the underlying data is large.
>
> A `table` physically writes all the rows to disk in Snowflake when dbt runs.
> Queries against it are fast because the data is already computed and stored.
>
> In my project, staging and intermediate models are views because they're just cleaning logic —
> no point storing intermediate steps. The mart layer materializes as tables because those are
> what analysts query constantly, and we want sub-second response times."

---

## ✅ Testing Questions

### Q: How did you test your data warehouse?

> "I added 51 schema tests across all three layers using dbt's built-in test framework.
>
> For every primary key in every model I added `unique` and `not_null` tests —
> if a customer key is ever null or duplicated, the build fails immediately.
>
> For status and flag columns I added `accepted_values` tests. For example, order status
> must be one of 'O', 'F', or 'P' — any unexpected value like 'X' fails the test.
> This catches upstream data quality issues before they corrupt dashboards.
>
> The most powerful tests are the `relationships` tests on the fact table.
> They verify that every `customer_key` in `fct_orders` exists in `dim_customers`,
> every `part_key` exists in `dim_parts`, and so on. This is referential integrity —
> catching orphaned records that would silently drop rows in analyst JOINs."

---

### Q: What happens if a test fails in production?

> "In a real production setup, dbt tests would run on a schedule — say, every morning after
> the nightly data load. If any test fails, the pipeline flags it and the on-call engineer
> gets an alert. Depending on the team's severity policy, either the downstream tables are
> quarantined until the issue is fixed, or the failed rows are routed to an error table
> for investigation while clean rows continue flowing.
>
> In my CI/CD setup, a test failure blocks the pull request from merging into main —
> so bad transformations can never reach production in the first place."

---

## 🚀 CI/CD Questions

### Q: Tell me about your CI/CD setup.

> "I set up a GitHub Actions workflow that triggers automatically on every pull request
> to the main branch. The pipeline installs dbt, writes `profiles.yml` dynamically
> from GitHub Secrets — so credentials are never in the repository — then runs `dbt build`,
> which runs all models and all 51 tests in dependency order.
>
> Each PR gets its own isolated Snowflake schema named after the PR number — so PR #5
> builds into `ANALYTICS.CI_5` and PR #7 builds into `ANALYTICS.CI_7`.
> They never interfere with each other or with production.
>
> If any model errors or any test fails, the GitHub check shows red and the PR cannot
> be merged. When it passes, the schema is automatically dropped to avoid storage costs.
> This is exactly how production data teams work."

---

### Q: How do you manage secrets like Snowflake passwords in CI/CD?

> "I never put credentials in code or in any file that goes into the repository.
> The `.gitignore` excludes `profiles.yml` — the file that holds the password locally.
>
> In GitHub Actions, credentials are stored as **encrypted repository secrets**
> in Settings → Secrets and Variables. The workflow references them as
> `${{ secrets.DBT_SNOWFLAKE_PASSWORD }}` — GitHub injects them at runtime and
> they're masked in all logs. Even if someone gains read access to the workflow YAML,
> they can't see the actual values."

---

## 📊 Snowflake Questions

### Q: Why Snowflake?

> "Snowflake separates compute from storage, which means you can scale your query power
> up or down without moving data. You pay for storage continuously but only pay for
> compute when queries are actually running — the warehouse suspends automatically.
>
> For a data engineering portfolio project it's ideal because the free trial comes with
> pre-loaded sample datasets, the SQL dialect is standard ANSI with some useful extensions
> like `datediff()`, and it integrates natively with dbt, Airflow, and every major BI tool."

---

### Q: What schema structure did you use in Snowflake and why?

> "I used one database called `ANALYTICS` with three schemas per environment:
> `DEV_STAGING`, `DEV_INTERMEDIATE`, and `DEV_MARTS` for local development.
> In CI each PR gets its own numbered schema. In a production setup you'd have
> `PROD_STAGING`, `PROD_INTERMEDIATE`, and `PROD_MARTS`.
>
> This separation means analysts can give the BI tool access to `PROD_MARTS` only —
> they never see raw or intermediate data. Developers work in `DEV_*` and never
> accidentally overwrite production."

---

## 💡 Bonus: Questions to Ask the Interviewer

These show you think like an engineer, not just a coder.

1. *"What materialization strategies does your team use for large fact tables — incremental or full refresh?"*
2. *"How do you handle schema changes in source systems? Do you use dbt snapshot for slowly changing dimensions?"*
3. *"What's your current test coverage like, and how do you prioritize which models get tested first?"*
4. *"Does your team use dbt Cloud or self-hosted Airflow for orchestration?"*
5. *"How do you handle late-arriving data in your pipelines?"*
