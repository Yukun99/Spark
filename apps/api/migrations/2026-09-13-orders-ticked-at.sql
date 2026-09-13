-- Run once in phpMyAdmin (the API's DB user has no ALTER right). Adds the execution clock.
USE yukunxuc_spark;

ALTER TABLE orders ADD COLUMN ticked_at BIGINT UNSIGNED NOT NULL DEFAULT 0 AFTER placed_at;
UPDATE orders SET ticked_at = placed_at WHERE ticked_at = 0;
