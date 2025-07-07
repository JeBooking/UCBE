-- Universal Comments 数据库架构
-- 适用于 Supabase PostgreSQL

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    device_id VARCHAR(100) PRIMARY KEY,
    current_username VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 为用户名创建索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(current_username);

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT NOT NULL,
    content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 1000),
    device_id VARCHAR(100) NOT NULL,
    display_name VARCHAR(50) NOT NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 外键约束
    FOREIGN KEY (device_id) REFERENCES users(device_id) ON DELETE CASCADE
);

-- 为评论表创建索引
CREATE INDEX IF NOT EXISTS idx_comments_url ON comments(url);
CREATE INDEX IF NOT EXISTS idx_comments_device_id ON comments(device_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- 复合索引用于查询特定URL的评论
CREATE INDEX IF NOT EXISTS idx_comments_url_parent_created ON comments(url, parent_id, created_at DESC);

-- 点赞表
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL,
    device_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 外键约束
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (device_id) REFERENCES users(device_id) ON DELETE CASCADE,
    
    -- 确保同一用户不能对同一评论重复点赞
    UNIQUE(comment_id, device_id)
);

-- 为点赞表创建索引
CREATE INDEX IF NOT EXISTS idx_likes_comment_id ON likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_likes_device_id ON likes(device_id);

-- 创建视图：带点赞数的评论
CREATE OR REPLACE VIEW comments_with_likes AS
SELECT 
    c.*,
    COALESCE(l.likes_count, 0) as likes_count
FROM comments c
LEFT JOIN (
    SELECT 
        comment_id,
        COUNT(*) as likes_count
    FROM likes
    GROUP BY comment_id
) l ON c.id = l.comment_id;

-- 行级安全策略（RLS）- 可选，用于更严格的安全控制
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- 创建函数：获取评论的回复数量
CREATE OR REPLACE FUNCTION get_reply_count(comment_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM comments
        WHERE parent_id = comment_id
    );
END;
$$ LANGUAGE plpgsql;

-- 创建函数：清理孤立的用户记录（没有评论和点赞的用户）
CREATE OR REPLACE FUNCTION cleanup_orphaned_users()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM users
    WHERE device_id NOT IN (
        SELECT DISTINCT device_id FROM comments
        UNION
        SELECT DISTINCT device_id FROM likes
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器：自动清理删除评论时的相关数据
CREATE OR REPLACE FUNCTION cleanup_comment_data()
RETURNS TRIGGER AS $$
BEGIN
    -- 删除相关的点赞记录
    DELETE FROM likes WHERE comment_id = OLD.id;
    
    -- 删除子评论
    DELETE FROM comments WHERE parent_id = OLD.id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 如果触发器不存在则创建
DROP TRIGGER IF EXISTS trigger_cleanup_comment_data ON comments;
CREATE TRIGGER trigger_cleanup_comment_data
    BEFORE DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_comment_data();

-- 插入一些示例数据（可选，用于测试）
-- INSERT INTO users (device_id, current_username) VALUES 
-- ('test_device_1', '测试用户1'),
-- ('test_device_2', '测试用户2');

-- INSERT INTO comments (url, content, device_id, display_name) VALUES 
-- ('https://example.com', '这是第一条测试评论', 'test_device_1', '测试用户1'),
-- ('https://example.com', '这是第二条测试评论', 'test_device_2', '测试用户2');

-- 创建数据库统计视图
CREATE OR REPLACE VIEW comment_statistics AS
SELECT 
    COUNT(DISTINCT url) as total_pages,
    COUNT(*) as total_comments,
    COUNT(DISTINCT device_id) as total_users,
    COUNT(*) FILTER (WHERE parent_id IS NULL) as main_comments,
    COUNT(*) FILTER (WHERE parent_id IS NOT NULL) as reply_comments,
    (SELECT COUNT(*) FROM likes) as total_likes
FROM comments;
