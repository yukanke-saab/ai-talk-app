-- 拡張機能の有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID生成用
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- 文字列類似性検索用
CREATE EXTENSION IF NOT EXISTS "unaccent";       -- アクセント記号を無視した検索用

-- データベースの文字コード設定を確認
ALTER DATABASE aitalk SET timezone TO 'Asia/Tokyo';
