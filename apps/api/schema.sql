-- Run once in cPanel phpMyAdmin. Timestamps are epoch ms to match `placedAt` / `updatedAt`.

USE yukunxuc_spark;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(32) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username),
  CONSTRAINT ck_users_username CHECK (username REGEXP '^[A-Za-z0-9_]{3,32}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  token_hash CHAR(64) NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  created_at BIGINT UNSIGNED NOT NULL,
  expires_at BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (token_hash),
  KEY ix_sessions_user (user_id),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id CHAR(21) NOT NULL,
  seq BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  product_id VARCHAR(20) NOT NULL,
  side ENUM('buy', 'sell') NOT NULL,
  type ENUM('market', 'limit') NOT NULL,
  time_in_force ENUM('GTC', 'IOC', 'FOK') NOT NULL,
  price DECIMAL(24, 10) NOT NULL,
  size DECIMAL(24, 10) NOT NULL,
  filled_size DECIMAL(24, 10) NOT NULL DEFAULT 0,
  status ENUM('pending', 'fulfilling', 'fulfilled', 'cancelled') NOT NULL DEFAULT 'pending',
  provider VARCHAR(32) NOT NULL,
  placed_at BIGINT UNSIGNED NOT NULL,
  ticked_at BIGINT UNSIGNED NOT NULL,
  updated_at BIGINT UNSIGNED NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_seq (seq),
  KEY ix_orders_user_placed (user_id, placed_at),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
  user_id INT UNSIGNED NOT NULL,
  update_interval_ms INT UNSIGNED NOT NULL DEFAULT 1000,
  streaming TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_settings_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS widgets (
  user_id INT UNSIGNED NOT NULL,
  id CHAR(21) NOT NULL,
  type ENUM('instrument', 'watchlist', 'orders') NOT NULL,
  grid_row INT UNSIGNED NOT NULL,
  grid_col INT UNSIGNED NOT NULL,
  row_span INT UNSIGNED NOT NULL DEFAULT 1,
  col_span INT UNSIGNED NOT NULL DEFAULT 1,
  product_id VARCHAR(20) NULL,
  name VARCHAR(64) NULL,
  product_ids JSON NULL,
  PRIMARY KEY (user_id, id),
  CONSTRAINT fk_widgets_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
