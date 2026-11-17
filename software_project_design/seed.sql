-- ============================================================
--  sf_project 种子数据
--
--  用法（在 software_project_design 目录下执行）：
--    "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" ^
--      -u root -p --default-character-set=utf8mb4 sf_project < seed.sql
--
--  可重复执行：用户/分类/评价靠唯一索引去重，
--  商品/订单/公告只在表为空时插入，不会重复。
--
--  列名说明：GORM 按 Go 字段名转下划线，与 JSON tag 不同！
--    ProductName      -> product_name        （JSON 叫 name）
--    JackfruitFeature -> jackfruit_feature   （JSON 叫 feature）
--    UserAddress      -> user_address        （JSON 叫 address）
--    TotalCost        -> total_cost          （JSON 叫 total）
-- ============================================================

SET NAMES utf8mb4;
USE sf_project;

-- ---------- 1. 用户（密码明文，后端就是这么比对的）----------
INSERT IGNORE INTO `user` (created_at, updated_at, username, password, phone, email) VALUES
  (NOW(), NOW(), 'admin',  '123456', '13800000001', 'admin@example.com'),
  (NOW(), NOW(), 'omnis',  '123456', '13900000002', 'omnis@example.com'),
  (NOW(), NOW(), 'user01', '123456', '', '');

-- ---------- 2. 分类 ----------
INSERT IGNORE INTO category (created_at, updated_at, category_name) VALUES
  (NOW(), NOW(), '特级果'),
  (NOW(), NOW(), '一级果'),
  (NOW(), NOW(), '果肉制品');

-- ---------- 3. 商品（图片走 Gin 的 /static/ 直出）----------
SET @skip_products := (SELECT COUNT(*) FROM jackfruit);

INSERT INTO jackfruit
  (created_at, updated_at, category_id, product_name, storage, price, image,
   management_info, jackfruit_feature, plant_intro)
SELECT NOW(), NOW(), c.id, '特级红肉波罗蜜', 30, 158,
       'http://localhost:8082/static/jackfruit1.png',
       '恒温 12℃ 存放，避免挤压，建议 3 天内食用',
       '果肉橙红、干包少汁、香气浓郁，单果 8-10 斤',
       '海南万宁产区，树龄 8 年以上老树，自然成熟后采摘'
FROM category c WHERE c.category_name = '特级果' AND @skip_products = 0;

INSERT INTO jackfruit
  (created_at, updated_at, category_id, product_name, storage, price, image,
   management_info, jackfruit_feature, plant_intro)
SELECT NOW(), NOW(), c.id, '一级红肉波罗蜜', 45, 128,
       'http://localhost:8082/static/jackfruit2.png',
       '常温阴凉处存放，切开后需冷藏',
       '果肉饱满、甜度适中，单果 6-8 斤',
       '广东湛江产区，施用有机肥，无催熟剂'
FROM category c WHERE c.category_name = '一级果' AND @skip_products = 0;

INSERT INTO jackfruit
  (created_at, updated_at, category_id, product_name, storage, price, image,
   management_info, jackfruit_feature, plant_intro)
SELECT NOW(), NOW(), c.id, '特级黄肉波罗蜜', 22, 138,
       'http://localhost:8082/static/jackfruit3.png',
       '避免阳光直射，成熟后可冷藏 5 天',
       '果肉金黄、纤维细腻、清甜不腻，单果 7-9 斤',
       '云南西双版纳产区，海拔 600 米山地种植'
FROM category c WHERE c.category_name = '特级果' AND @skip_products = 0;

INSERT INTO jackfruit
  (created_at, updated_at, category_id, product_name, storage, price, image,
   management_info, jackfruit_feature, plant_intro)
SELECT NOW(), NOW(), c.id, '珍珠波罗蜜小果', 60, 88,
       'http://localhost:8082/static/jackfruit4.png',
       '常温存放即可，小果成熟快，尽快食用',
       '单果 3-4 斤，果苞小而密，适合一人食',
       '广西钦州产区，早熟品种'
FROM category c WHERE c.category_name = '一级果' AND @skip_products = 0;

INSERT INTO jackfruit
  (created_at, updated_at, category_id, product_name, storage, price, image,
   management_info, jackfruit_feature, plant_intro)
SELECT NOW(), NOW(), c.id, '波罗蜜果肉真空装 500g', 120, 45,
       'http://localhost:8082/static/images.jpg',
       '冷冻 -18℃ 保存，解冻后 24 小时内食用',
       '去核果肉真空锁鲜，开袋即食',
       '由上述产区鲜果当日剥取，冷链直发'
FROM category c WHERE c.category_name = '果肉制品' AND @skip_products = 0;

-- ---------- 4. 订单（total_cost 必须等于 price * quantity，统计才自洽）----------
SET @skip_orders := (SELECT COUNT(*) FROM orders);

INSERT INTO orders
  (created_at, updated_at, order_user_id, user_address, total_cost, quantity, jackfruit_id)
SELECT NOW(), NOW(), u.id, '广东省东莞市松山湖大学路 1 号', 256, 2, j.id
FROM `user` u, jackfruit j
WHERE u.username = 'admin' AND j.product_name = '一级红肉波罗蜜' AND @skip_orders = 0;

INSERT INTO orders
  (created_at, updated_at, order_user_id, user_address, total_cost, quantity, jackfruit_id)
SELECT NOW(), NOW(), u.id, '广东省广州市天河区体育西路 100 号', 135, 3, j.id
FROM `user` u, jackfruit j
WHERE u.username = 'omnis' AND j.product_name = '波罗蜜果肉真空装 500g' AND @skip_orders = 0;

INSERT INTO orders
  (created_at, updated_at, order_user_id, user_address, total_cost, quantity, jackfruit_id)
SELECT NOW(), NOW(), u.id, '广东省深圳市南山区科技园南路 8 号', 138, 1, j.id
FROM `user` u, jackfruit j
WHERE u.username = 'user01' AND j.product_name = '特级黄肉波罗蜜' AND @skip_orders = 0;

-- ---------- 5. 评价（靠 (user_id, jackfruit_id) 联合唯一索引去重）----------
INSERT IGNORE INTO review (created_at, updated_at, user_id, jackfruit_id, rating, content)
SELECT NOW(), NOW(), u.id, j.id, 5, '果肉厚实，甜度刚好，家里人都说好吃，回购了。'
FROM `user` u, jackfruit j
WHERE u.username = 'admin' AND j.product_name = '特级红肉波罗蜜';

INSERT IGNORE INTO review (created_at, updated_at, user_id, jackfruit_id, rating, content)
SELECT NOW(), NOW(), u.id, j.id, 4, '物流很快，果子有一点点磕碰，不影响口感。'
FROM `user` u, jackfruit j
WHERE u.username = 'omnis' AND j.product_name = '特级红肉波罗蜜';

INSERT IGNORE INTO review (created_at, updated_at, user_id, jackfruit_id, rating, content)
SELECT NOW(), NOW(), u.id, j.id, 5, '性价比很高，剥出来的果苞比想象中多。'
FROM `user` u, jackfruit j
WHERE u.username = 'omnis' AND j.product_name = '一级红肉波罗蜜';

-- ---------- 6. 公告 ----------
SET @skip_notify := (SELECT COUNT(*) FROM notify);

INSERT INTO notify (created_at, updated_at, message)
SELECT NOW(), NOW(), '本周新到一批特级红肉波罗蜜，产地直发，欢迎选购。'
WHERE @skip_notify = 0;

-- ---------- 汇总 ----------
SELECT 'user' AS 表, COUNT(*) AS 行数 FROM `user`
UNION ALL SELECT 'category',  COUNT(*) FROM category
UNION ALL SELECT 'jackfruit', COUNT(*) FROM jackfruit
UNION ALL SELECT 'orders',    COUNT(*) FROM orders
UNION ALL SELECT 'review',    COUNT(*) FROM review
UNION ALL SELECT 'notify',    COUNT(*) FROM notify;
