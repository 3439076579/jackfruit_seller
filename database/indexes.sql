-- =============================================================================
-- Jackfruit Seller - Secondary, Composite & Covering Indexes (MySQL 8.x InnoDB)
-- Apply after schema_no_indexes.sql or on top of schema.sql (skip duplicate UQs)
-- =============================================================================

-- User lookups (login, profile retrieval)
CREATE INDEX `idx_user_deleted_username`
  ON `user` (`deleted_at`, `username`);

-- Jackfruit catalog & inventory alerts
CREATE INDEX `idx_jackfruit_deleted_category`
  ON `jackfruit` (`deleted_at`, `category_id`, `id`);

CREATE INDEX `idx_jackfruit_deleted_storage`
  ON `jackfruit` (`deleted_at`, `storage`, `id`);

CREATE INDEX `idx_jackfruit_product_name`
  ON `jackfruit` (`product_name`);

-- Orders: buyer paginated order history (eliminates filesort on created_at DESC)
CREATE INDEX `idx_orders_user_deleted_created`
  ON `orders` (`order_user_id`, `deleted_at`, `created_at` DESC);

-- Orders: covering index for sales ranking (Q1) and category revenue (Q2)
CREATE INDEX `idx_orders_deleted_jackfruit_metrics`
  ON `orders` (`deleted_at`, `jackfruit_id`, `quantity`, `total_cost`);

-- Orders: covering index for time-windowed demand (Q5) and monthly trends (Q8)
CREATE INDEX `idx_orders_deleted_created_metrics`
  ON `orders` (`deleted_at`, `created_at`, `jackfruit_id`, `quantity`, `total_cost`);

-- Orders: covering index for customer repeat-purchase & LTV analytics (Q6)
CREATE INDEX `idx_orders_deleted_user_jackfruit_cost`
  ON `orders` (`deleted_at`, `order_user_id`, `jackfruit_id`, `quantity`, `total_cost`, `created_at`);

-- Reviews: covering index for product rating aggregation (Q3, Q7) & review feed
CREATE INDEX `idx_review_deleted_jackfruit_rating`
  ON `review` (`deleted_at`, `jackfruit_id`, `rating`, `created_at` DESC);
