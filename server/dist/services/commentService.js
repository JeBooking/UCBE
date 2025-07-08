"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
const database_1 = require("../config/database");
const uuid_1 = require("uuid");
const validation_1 = require("../utils/validation");
class CommentService {
    // 快速获取页面评论（优化版本）
    async getCommentsByUrl(url, deviceId) {
        const normalizedUrl = (0, validation_1.normalizeUrl)(url);
        // 单次查询获取所有评论
        const { data: allComments, error } = await database_1.supabase
            .from(database_1.TABLES.COMMENTS)
            .select('*')
            .eq('url', normalizedUrl)
            .order('created_at', { ascending: false });
        if (error) {
            throw new Error(`Failed to fetch comments: ${error.message}`);
        }
        if (!allComments || allComments.length === 0) {
            return [];
        }
        // 分离主评论和回复
        const mainComments = allComments.filter(c => !c.parent_id);
        const replies = allComments.filter(c => c.parent_id);
        // 简化处理：暂时设置默认值，大幅提升速度
        const processComment = (comment) => ({
            id: comment.id,
            url: comment.url,
            content: comment.content,
            device_id: comment.device_id,
            display_name: comment.display_name,
            parent_id: comment.parent_id,
            created_at: comment.created_at,
            likes_count: 0, // 暂时设为0，提升加载速度
            is_liked: false, // 暂时设为false
            replies: []
        });
        const processedMainComments = mainComments.map(processComment);
        const processedReplies = replies.map(processComment);
        // 将回复分组到对应的主评论下
        processedMainComments.forEach(mainComment => {
            mainComment.replies = processedReplies.filter(reply => reply.parent_id === mainComment.id);
        });
        return processedMainComments;
    }
    // 原始版本（保留备用）
    async getCommentsByUrlWithLikes(url, deviceId) {
        const normalizedUrl = (0, validation_1.normalizeUrl)(url);
        console.log(`[CommentService] Getting comments for URL: ${normalizedUrl}, Device ID: ${deviceId}`);
        // 获取主评论（parent_id为null的评论）
        const { data: mainComments, error: mainError } = await database_1.supabase
            .from(database_1.TABLES.COMMENTS)
            .select('*')
            .eq('url', normalizedUrl)
            .is('parent_id', null)
            .order('created_at', { ascending: false });
        console.log(`[CommentService] Main comments query result:`, { mainComments, mainError });
        if (mainError) {
            throw new Error(`Failed to fetch comments: ${mainError.message}`);
        }
        if (!mainComments || mainComments.length === 0) {
            console.log(`[CommentService] No main comments found`);
            return [];
        }
        console.log(`[CommentService] Found ${mainComments.length} main comments`);
        // 获取所有回复
        const { data: replies, error: repliesError } = await database_1.supabase
            .from(database_1.TABLES.COMMENTS)
            .select('*')
            .eq('url', normalizedUrl)
            .not('parent_id', 'is', null)
            .order('created_at', { ascending: true });
        if (repliesError) {
            throw new Error(`Failed to fetch replies: ${repliesError.message}`);
        }
        // 获取当前用户的点赞记录
        const allCommentIds = [
            ...mainComments.map(c => c.id),
            ...(replies || []).map(c => c.id)
        ];
        console.log(`[CommentService] All comment IDs:`, allCommentIds);
        let likedCommentIds = new Set();
        let likeCountMap = new Map();
        if (allCommentIds.length > 0) {
            const { data: userLikes, error: userLikesError } = await database_1.supabase
                .from(database_1.TABLES.LIKES)
                .select('comment_id')
                .eq('device_id', deviceId)
                .in('comment_id', allCommentIds);
            console.log(`[CommentService] User likes query:`, { userLikes, userLikesError });
            likedCommentIds = new Set(userLikes?.map(like => like.comment_id) || []);
            // 获取点赞数量
            const { data: likeCounts, error: likeCountsError } = await database_1.supabase
                .from(database_1.TABLES.LIKES)
                .select('comment_id')
                .in('comment_id', allCommentIds);
            console.log(`[CommentService] Like counts query:`, { likeCounts, likeCountsError });
            (likeCounts || []).forEach(like => {
                const count = likeCountMap.get(like.comment_id) || 0;
                likeCountMap.set(like.comment_id, count + 1);
            });
        }
        // 组装评论数据
        const processComment = (comment) => ({
            id: comment.id,
            url: comment.url,
            content: comment.content,
            device_id: comment.device_id,
            display_name: comment.display_name,
            parent_id: comment.parent_id,
            created_at: comment.created_at,
            likes_count: likeCountMap.get(comment.id) || 0,
            is_liked: likedCommentIds.has(comment.id),
            replies: []
        });
        const processedMainComments = mainComments.map(processComment);
        const processedReplies = (replies || []).map(processComment);
        console.log(`[CommentService] Processed ${processedMainComments.length} main comments`);
        console.log(`[CommentService] Processed ${processedReplies.length} replies`);
        // 将回复分组到对应的主评论下
        processedMainComments.forEach(mainComment => {
            mainComment.replies = processedReplies.filter(reply => reply.parent_id === mainComment.id);
        });
        console.log(`[CommentService] Final result:`, processedMainComments);
        return processedMainComments;
    }
    // 创建评论
    async createComment(commentData) {
        const normalizedUrl = (0, validation_1.normalizeUrl)(commentData.url);
        // 确保用户存在
        await this.ensureUserExists(commentData.device_id, commentData.display_name);
        // 如果是回复，验证父评论存在
        if (commentData.parent_id) {
            const { data: parentComment, error } = await database_1.supabase
                .from(database_1.TABLES.COMMENTS)
                .select('id, url')
                .eq('id', commentData.parent_id)
                .eq('url', normalizedUrl)
                .single();
            if (error || !parentComment) {
                throw new Error('Parent comment not found');
            }
        }
        const newComment = {
            id: (0, uuid_1.v4)(),
            url: normalizedUrl,
            content: commentData.content,
            device_id: commentData.device_id,
            display_name: commentData.display_name,
            parent_id: commentData.parent_id || null,
            created_at: new Date().toISOString()
        };
        const { data, error } = await database_1.supabase
            .from(database_1.TABLES.COMMENTS)
            .insert(newComment)
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to create comment: ${error.message}`);
        }
        return {
            ...data,
            likes_count: 0,
            is_liked: false,
            replies: []
        };
    }
    // 切换点赞状态
    async toggleLike(commentId, deviceId) {
        // 检查评论是否存在
        const { data: comment, error: commentError } = await database_1.supabase
            .from(database_1.TABLES.COMMENTS)
            .select('id')
            .eq('id', commentId)
            .single();
        if (commentError || !comment) {
            throw new Error('Comment not found');
        }
        // 检查是否已经点赞
        const { data: existingLike, error: likeError } = await database_1.supabase
            .from(database_1.TABLES.LIKES)
            .select('id')
            .eq('comment_id', commentId)
            .eq('device_id', deviceId)
            .single();
        if (likeError && likeError.code !== 'PGRST116') { // PGRST116 = no rows returned
            throw new Error(`Failed to check like status: ${likeError.message}`);
        }
        if (existingLike) {
            // 取消点赞
            const { error: deleteError } = await database_1.supabase
                .from(database_1.TABLES.LIKES)
                .delete()
                .eq('id', existingLike.id);
            if (deleteError) {
                throw new Error(`Failed to remove like: ${deleteError.message}`);
            }
            return { liked: false };
        }
        else {
            // 添加点赞
            const newLike = {
                id: (0, uuid_1.v4)(),
                comment_id: commentId,
                device_id: deviceId,
                created_at: new Date().toISOString()
            };
            const { error: insertError } = await database_1.supabase
                .from(database_1.TABLES.LIKES)
                .insert(newLike);
            if (insertError) {
                throw new Error(`Failed to add like: ${insertError.message}`);
            }
            return { liked: true };
        }
    }
    // 删除评论（仅限评论作者）
    async deleteComment(commentId, deviceId) {
        // 验证评论存在且属于当前用户
        const { data: comment, error: commentError } = await database_1.supabase
            .from(database_1.TABLES.COMMENTS)
            .select('id, device_id')
            .eq('id', commentId)
            .eq('device_id', deviceId)
            .single();
        if (commentError || !comment) {
            throw new Error('Comment not found or access denied');
        }
        // 删除相关的点赞记录
        await database_1.supabase
            .from(database_1.TABLES.LIKES)
            .delete()
            .eq('comment_id', commentId);
        // 删除回复
        await database_1.supabase
            .from(database_1.TABLES.COMMENTS)
            .delete()
            .eq('parent_id', commentId);
        // 删除主评论
        const { error: deleteError } = await database_1.supabase
            .from(database_1.TABLES.COMMENTS)
            .delete()
            .eq('id', commentId);
        if (deleteError) {
            throw new Error(`Failed to delete comment: ${deleteError.message}`);
        }
    }
    // 确保用户存在，如果不存在则创建
    async ensureUserExists(deviceId, currentUsername) {
        const { data: existingUser, error } = await database_1.supabase
            .from(database_1.TABLES.USERS)
            .select('device_id, current_username')
            .eq('device_id', deviceId)
            .single();
        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            throw new Error(`Failed to check user: ${error.message}`);
        }
        if (!existingUser) {
            // 创建新用户
            const newUser = {
                device_id: deviceId,
                current_username: currentUsername,
                created_at: new Date().toISOString()
            };
            const { error: insertError } = await database_1.supabase
                .from(database_1.TABLES.USERS)
                .insert(newUser);
            if (insertError) {
                throw new Error(`Failed to create user: ${insertError.message}`);
            }
        }
        else if (existingUser.current_username !== currentUsername) {
            // 更新用户名
            const { error: updateError } = await database_1.supabase
                .from(database_1.TABLES.USERS)
                .update({ current_username: currentUsername })
                .eq('device_id', deviceId);
            if (updateError) {
                throw new Error(`Failed to update username: ${updateError.message}`);
            }
        }
    }
}
exports.CommentService = CommentService;
//# sourceMappingURL=commentService.js.map