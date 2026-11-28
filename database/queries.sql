-- =============================================================================
-- Jackfruit Seller - 8 Business-Meaningful Analytical & Operational SQL Queries
-- =============================================================================

-- Q1: Top-10 Best-Selling Jackfruit Varieties (Multi-table JOIN + Aggregation + LIMIT)
-- Business question: Which top 10 jackfruit varieties generate the highest total
-- unit sales and revenue across active orders?
SELECT
    j.id AS jackfruit_id,
    j.product_name,
    c.category_name,
    SUM(o.quantity) AS total_units_sold,
    ROUND(SUM(o.total_cost), 2) AS total_revenue,
    COUNT(o.id) AS order_count
FROM orders o
JOIN jackfruit j ON j.id = o.jackfruit_id AND j.deleted_at IS NULL
LEFT JOIN category c ON c.id = j.category_id AND c.deleted_at IS NULL
WHERE o.deleted_at IS NULL
GROUP BY j.id, j.product_name, c.category_name
ORDER BY total_units_sold DESC, total_revenue DESC
LIMIT 10;

-- Q2: Category Revenue & Average Order Value Breakdown (3-table JOIN + Aggregation)
-- Business question: How do total revenue, order volume, units sold, and average
-- order value compare across jackfruit categories?
SELECT
    c.id AS category_id,
    c.category_name,
    COUNT(o.id) AS order_count,
    SUM(o.quantity) AS total_units_sold,
    ROUND(SUM(o.total_cost), 2) AS total_revenue,
    ROUND(AVG(o.total_cost), 2) AS avg_order_value
FROM orders o
JOIN jackfruit j ON j.id = o.jackfruit_id AND j.deleted_at IS NULL
JOIN category c ON c.id = j.category_id AND c.deleted_at IS NULL
WHERE o.deleted_at IS NULL
GROUP BY c.id, c.category_name
ORDER BY total_revenue DESC;

-- Q3: High-Rated Varieties with Verified Review Volume (JOIN + GROUP BY + HAVING)
-- Business question: Which jackfruit varieties achieve an average rating >= 4.0
-- across at least 5 customer reviews?
SELECT
    j.id AS jackfruit_id,
    j.product_name,
    c.category_name,
    ROUND(AVG(r.rating), 2) AS avg_rating,
    COUNT(r.id) AS review_count,
    j.price,
    j.storage
FROM review r
JOIN jackfruit j ON j.id = r.jackfruit_id AND j.deleted_at IS NULL
LEFT JOIN category c ON c.id = j.category_id AND c.deleted_at IS NULL
WHERE r.deleted_at IS NULL
GROUP BY j.id, j.product_name, c.category_name, j.price, j.storage
HAVING AVG(r.rating) >= 4.0 AND COUNT(r.id) >= 5
ORDER BY avg_rating DESC, review_count DESC
LIMIT 20;

-- Q4: Paginated Buyer Order History (Multi-table JOIN + Selective Filter + Pagination)
-- Business question: Retrieve page 1 (20 most recent orders) for buyer user_id = 42
-- with variety, category, unit price snapshot, quantity, and total cost.
SELECT
    o.id AS order_id,
    o.created_at AS ordered_at,
    j.product_name,
    c.category_name,
    o.quantity,
    ROUND(o.total_cost / o.quantity, 2) AS unit_price_paid,
    ROUND(o.total_cost, 2) AS total_cost,
    o.user_address
FROM orders o
JOIN jackfruit j ON j.id = o.jackfruit_id
LEFT JOIN category c ON c.id = j.category_id
WHERE o.order_user_id = 42
  AND o.deleted_at IS NULL
ORDER BY o.created_at DESC
LIMIT 20 OFFSET 0;

-- Q5: Low-Stock Inventory Alert & 30-Day Replenishment Priority (CTE + LEFT JOIN + Filter)
-- Business question: Which active varieties have low stock (storage < 50) relative
-- to their recent 30-day order demand, and what is their estimated days of supply?
WITH recent_demand AS (
    SELECT
        o.jackfruit_id,
        SUM(o.quantity) AS units_30d,
        COUNT(o.id) AS orders_30d
    FROM orders o
    WHERE o.deleted_at IS NULL
      AND o.created_at >= DATE_SUB((SELECT MAX(created_at) FROM orders WHERE deleted_at IS NULL), INTERVAL 30 DAY)
    GROUP BY o.jackfruit_id
)
SELECT
    j.id AS jackfruit_id,
    j.product_name,
    c.category_name,
    j.storage AS current_stock,
    COALESCE(rd.units_30d, 0) AS units_sold_30d,
    COALESCE(rd.orders_30d, 0) AS orders_30d,
    CASE
        WHEN COALESCE(rd.units_30d, 0) = 0 THEN NULL
        ELSE ROUND(j.storage / (rd.units_30d / 30.0), 1)
    END AS est_days_of_supply
FROM jackfruit j
LEFT JOIN category c ON c.id = j.category_id AND c.deleted_at IS NULL
LEFT JOIN recent_demand rd ON rd.jackfruit_id = j.id
WHERE j.deleted_at IS NULL
  AND j.storage < 50
ORDER BY est_days_of_supply IS NULL ASC, est_days_of_supply ASC, j.storage ASC
LIMIT 20;

-- Q6: Customer Repeat-Purchase & Lifetime Value (LTV) Ranking (CTE + HAVING + JOIN)
-- Business question: Who are the top 15 repeat buyers (at least 2 orders) ranked
-- by lifetime spend, showing order frequency and distinct varieties purchased?
WITH customer_orders AS (
    SELECT
        o.order_user_id,
        COUNT(o.id) AS order_count,
        COUNT(DISTINCT o.jackfruit_id) AS distinct_varieties,
        SUM(o.quantity) AS total_units,
        ROUND(SUM(o.total_cost), 2) AS lifetime_spend,
        MAX(o.created_at) AS last_order_at
    FROM orders o
    WHERE o.deleted_at IS NULL
    GROUP BY o.order_user_id
    HAVING COUNT(o.id) >= 2
)
SELECT
    u.id AS user_id,
    u.username,
    co.order_count,
    co.distinct_varieties,
    co.total_units,
    co.lifetime_spend,
    ROUND(co.lifetime_spend / co.order_count, 2) AS avg_order_value,
    co.last_order_at
FROM customer_orders co
JOIN user u ON u.id = co.order_user_id AND u.deleted_at IS NULL
ORDER BY co.lifetime_spend DESC, co.order_count DESC
LIMIT 15;

-- Q7: Premium Varieties Outperforming Both Category Mean Price & Platform Rating (Subqueries + CTE)
-- Business question: Which varieties priced above their category average also earn
-- an average rating higher than the platform-wide mean rating?
WITH product_ratings AS (
    SELECT
        r.jackfruit_id,
        ROUND(AVG(r.rating), 2) AS avg_rating,
        COUNT(r.id) AS review_count
    FROM review r
    WHERE r.deleted_at IS NULL
    GROUP BY r.jackfruit_id
),
category_avg_price AS (
    SELECT
        j.category_id,
        AVG(j.price) AS cat_avg_price
    FROM jackfruit j
    WHERE j.deleted_at IS NULL
    GROUP BY j.category_id
)
SELECT
    j.id AS jackfruit_id,
    j.product_name,
    c.category_name,
    ROUND(j.price, 2) AS unit_price,
    ROUND(cap.cat_avg_price, 2) AS category_avg_price,
    pr.avg_rating,
    pr.review_count
FROM jackfruit j
JOIN category c ON c.id = j.category_id AND c.deleted_at IS NULL
JOIN category_avg_price cap ON cap.category_id = j.category_id
JOIN product_ratings pr ON pr.jackfruit_id = j.id
WHERE j.deleted_at IS NULL
  AND j.price > cap.cat_avg_price
  AND pr.avg_rating > (SELECT AVG(rating) FROM review WHERE deleted_at IS NULL)
  AND pr.review_count >= 3
ORDER BY pr.avg_rating DESC, j.price DESC
LIMIT 20;

-- Q8: Monthly Revenue Trend & Month-over-Month Growth Rate (CTE + Window Function)
-- Business question: How do monthly order count, units sold, revenue, and MoM
-- revenue growth evolve over time?
WITH monthly_sales AS (
    SELECT
        DATE_FORMAT(o.created_at, '%Y-%m') AS sales_month,
        COUNT(o.id) AS order_count,
        SUM(o.quantity) AS total_units,
        ROUND(SUM(o.total_cost), 2) AS total_revenue
    FROM orders o
    WHERE o.deleted_at IS NULL
    GROUP BY DATE_FORMAT(o.created_at, '%Y-%m')
)
SELECT
    sales_month,
    order_count,
    total_units,
    total_revenue,
    LAG(total_revenue) OVER (ORDER BY sales_month) AS prev_month_revenue,
    ROUND(
        (total_revenue - LAG(total_revenue) OVER (ORDER BY sales_month))
        / NULLIF(LAG(total_revenue) OVER (ORDER BY sales_month), 0) * 100,
        2
    ) AS mom_growth_pct
FROM monthly_sales
ORDER BY sales_month ASC;
