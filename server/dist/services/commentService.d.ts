import { Comment, CreateCommentRequest } from '../types';
export declare class CommentService {
    getCommentsByUrl(url: string, deviceId: string): Promise<Comment[]>;
    getCommentsByUrlWithLikes(url: string, deviceId: string): Promise<Comment[]>;
    createComment(commentData: CreateCommentRequest): Promise<Comment>;
    toggleLike(commentId: string, deviceId: string): Promise<{
        liked: boolean;
    }>;
    deleteComment(commentId: string, deviceId: string): Promise<void>;
    private ensureUserExists;
}
//# sourceMappingURL=commentService.d.ts.map