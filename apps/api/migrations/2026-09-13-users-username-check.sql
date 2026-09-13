-- Run once in phpMyAdmin (the API's DB user has no ALTER right). Lets the table itself reject
-- usernames with spaces or outside 3-32 letters, digits and underscores. Passwords are stored
-- hashed, so their rule lives in Auth.php only.
USE yukunxuc_spark;

ALTER TABLE users ADD CONSTRAINT ck_users_username CHECK (username REGEXP '^[A-Za-z0-9_]{3,32}$');
