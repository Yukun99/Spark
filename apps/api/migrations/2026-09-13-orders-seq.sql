-- Run once in phpMyAdmin (the API's DB user has no ALTER right). Adds the insertion order used
-- as the final sort tiebreak; existing rows are numbered oldest first.
USE yukunxuc_spark;

ALTER TABLE orders ADD COLUMN seq BIGINT UNSIGNED NULL AFTER id;
SET @n := 0;
UPDATE orders SET seq = (@n := @n + 1) ORDER BY placed_at, id;
ALTER TABLE orders MODIFY seq BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, ADD UNIQUE KEY uq_orders_seq (seq);
