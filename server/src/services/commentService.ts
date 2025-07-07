import { supabase, TABLES } from '../config/database';
import { Comment, CreateCommentRequest, User } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { normalizeUrl } from '../utils/validation';

export class CommentService {
  // 获取页面评论（包含回复和点赞信息）
  async getCommentsByUrl(url: string, deviceId: string): Promise<Comment[]> {
    const normalizedUrl = normalizeUrl(url);
    console.log(`[CommentService] Getting comments for URL: ${normalizedUrl}, Device ID: ${deviceId}`);

    // 获取主评论（parent_id为null的评论）
    const { data: mainComments, error: mainError } = await supabase
      .from(TABLES.COMMENTS)
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
    const { data: replies, error: repliesError } = await supabase
      .from(TABLES.COMMENTS)
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

    let likedCommentIds = new Set<string>();
    let likeCountMap = new Map<string, number>();

    if (allCommentIds.length > 0) {
      const { data: userLikes, error: userLikesError } = await supabase
        .from(TABLES.LIKES)
        .select('comment_id')
        .eq('device_id', deviceId)
        .in('comment_id', allCommentIds);

      console.log(`[CommentService] User likes query:`, { userLikes, userLikesError });

      likedCommentIds = new Set(userLikes?.map(like => like.comment_id) || []);

      // 获取点赞数量
      const { data: likeCounts, error: likeCountsError } = await supabase
        .from(TABLES.LIKES)
        .select('comment_id')
        .in('comment_id', allCommentIds);

      console.log(`[CommentService] Like counts query:`, { likeCounts, likeCountsError });

      (likeCounts || []).forEach(like => {
        const count = likeCountMap.get(like.comment_id) || 0;
        likeCountMap.set(like.comment_id, count + 1);
      });
    }

    // 组装评论数据
    const processComment = (comment: any): Comment => ({
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
      mainComment.replies = processedReplies.filter(
        reply => reply.parent_id === mainComment.id
      );
    });

    console.log(`[CommentService] Final result:`, processedMainComments);
    return processedMainComments;
  }

  // 创建评论
  async createComment(commentData: CreateCommentRequest): Promise<Comment> {
    const normalizedUrl = normalizeUrl(commentData.url);
    
    // 确保用户存在
    await this.ensureUserExists(commentData.device_id, commentData.display_name);

    // 如果是回复，验证父评论存在
    if (commentData.parent_id) {
      const { data: parentComment, error } = await supabase
        .from(TABLES.COMMENTS)
        .select('id, url')
        .eq('id', commentData.parent_id)
        .eq('url', normalizedUrl)
        .single();

      if (error || !parentComment) {
        throw new Error('Parent comment not found');
      }
    }

    const newComment = {
      id: uuidv4(),
      url: normalizedUrl,
      content: commentData.content,
      device_id: commentData.device_id,
      display_name: commentData.display_name,
      parent_id: commentData.parent_id || null,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(TABLES.COMMENTS)
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
  async toggleLike(commentId: string, deviceId: string): Promise<{ liked: boolean }> {
    // 检查评论是否存在
    const { data: comment, error: commentError } = await supabase
      .from(TABLES.COMMENTS)
      .select('id')
      .eq('id', commentId)
      .single();

    if (commentError || !comment) {
      throw new Error('Comment not found');
    }

    // 检查是否已经点赞
    const { data: existingLike, error: likeError } = await supabase
      .from(TABLES.LIKES)
      .select('id')
      .eq('comment_id', commentId)
      .eq('device_id', deviceId)
      .single();

    if (likeError && likeError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Failed to check like status: ${likeError.message}`);
    }

    if (existingLike) {
      // 取消点赞
      const { error: deleteError } = await supabase
        .from(TABLES.LIKES)
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) {
        throw new Error(`Failed to remove like: ${deleteError.message}`);
      }

      return { liked: false };
    } else {
      // 添加点赞
      const newLike = {
        id: uuidv4(),
        comment_id: commentId,
        device_id: deviceId,
        created_at: new Date().toISOString()
      };

      const { error: insertError } = await supabase
        .from(TABLES.LIKES)
        .insert(newLike);

      if (insertError) {
        throw new Error(`Failed to add like: ${insertError.message}`);
      }

      return { liked: true };
    }
  }

  // 删除评论（仅限评论作者）
  async deleteComment(commentId: string, deviceId: string): Promise<void> {
    // 验证评论存在且属于当前用户
    const { data: comment, error: commentError } = await supabase
      .from(TABLES.COMMENTS)
      .select('id, device_id')
      .eq('id', commentId)
      .eq('device_id', deviceId)
      .single();

    if (commentError || !comment) {
      throw new Error('Comment not found or access denied');
    }

    // 删除相关的点赞记录
    await supabase
      .from(TABLES.LIKES)
      .delete()
      .eq('comment_id', commentId);

    // 删除回复
    await supabase
      .from(TABLES.COMMENTS)
      .delete()
      .eq('parent_id', commentId);

    // 删除主评论
    const { error: deleteError } = await supabase
      .from(TABLES.COMMENTS)
      .delete()
      .eq('id', commentId);

    if (deleteError) {
      throw new Error(`Failed to delete comment: ${deleteError.message}`);
    }
  }

  // 确保用户存在，如果不存在则创建
  private async ensureUserExists(deviceId: string, currentUsername: string): Promise<void> {
    const { data: existingUser, error } = await supabase
      .from(TABLES.USERS)
      .select('device_id, current_username')
      .eq('device_id', deviceId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Failed to check user: ${error.message}`);
    }

    if (!existingUser) {
      // 创建新用户
      const newUser: User = {
        device_id: deviceId,
        current_username: currentUsername,
        created_at: new Date().toISOString()
      };

      const { error: insertError } = await supabase
        .from(TABLES.USERS)
        .insert(newUser);

      if (insertError) {
        throw new Error(`Failed to create user: ${insertError.message}`);
      }
    } else if (existingUser.current_username !== currentUsername) {
      // 更新用户名
      const { error: updateError } = await supabase
        .from(TABLES.USERS)
        .update({ current_username: currentUsername })
        .eq('device_id', deviceId);

      if (updateError) {
        throw new Error(`Failed to update username: ${updateError.message}`);
      }
    }
  }
}
