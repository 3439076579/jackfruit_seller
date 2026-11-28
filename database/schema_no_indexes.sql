-- =============================================================================
-- Benchmark Baseline Schema (Primary Keys + NOT NULL + CHECK only; NO non-PK indexes)
-- Purpose: Isolate full-table-scan baseline performance before applying indexes.sql
-- =============================================================================

DROP TABLE IF EXISTS `review`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `jackfruit`;
DROP TABLE IF EXISTS `category`;
DROP TABLE IF EXISTS `notify`;
DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted_at` DATETIME(3) NULL DEFAULT NULL,
  `username` VARCHAR(20) NOT NULL,
  `password` VARCHAR(20) NOT NULL,
  `phone` VARCHAR(17) NULL DEFAULT NULL,
  `email` VARCHAR(25) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_user_username_nonempty` CHECK (CHAR_LENGTH(`username`) >= 1),
  CONSTRAINT `chk_user_password_nonempty` CHECK (CHAR_LENGTH(`password`) >= 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `category` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted_at` DATETIME(3) NULL DEFAULT NULL,
  `category_name` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_category_name_nonempty` CHECK (CHAR_LENGTH(`category_name`) >= 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `jackfruit` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted_at` DATETIME(3) NULL DEFAULT NULL,
  `category_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `product_name` VARCHAR(100) NOT NULL,
  `storage` INT NOT NULL DEFAULT 0,
  `price` FLOAT NOT NULL,
  `image` VARCHAR(255) NULL DEFAULT NULL,
  `management_info` TEXT NULL,
  `jackfruit_feature` TEXT NULL,
  `plant_intro` TEXT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_jackfruit_name_nonempty` CHECK (CHAR_LENGTH(`product_name`) >= 1),
  CONSTRAINT `chk_jackfruit_storage_nonneg` CHECK (`storage` >= 0),
  CONSTRAINT `chk_jackfruit_price_pos` CHECK (`price` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `orders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted_at` DATETIME(3) NULL DEFAULT NULL,
  `order_user_id` BIGINT UNSIGNED NOT NULL,
  `user_address` VARCHAR(255) NOT NULL,
  `total_cost` DOUBLE NOT NULL,
  `quantity` BIGINT UNSIGNED NOT NULL,
  `jackfruit_id` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_orders_quantity_pos` CHECK (`quantity` > 0),
  CONSTRAINT `chk_orders_total_nonneg` CHECK (`total_cost` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `review` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted_at` DATETIME(3) NULL DEFAULT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `jackfruit_id` BIGINT UNSIGNED NOT NULL,
  `rating` TINYINT NOT NULL,
  `content` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_review_rating_range` CHECK (`rating` BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `notify` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted_at` DATETIME(3) NULL DEFAULT NULL,
  `message` TEXT NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_notify_message_nonempty` CHECK (CHAR_LENGTH(`message`) >= 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
