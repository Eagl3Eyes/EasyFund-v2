'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, ThumbsUp, Reply, Trash2 } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { getApiUrl } from '@/lib/config';

interface Comment {
  _id: string;
  userId: string;
  userName: string;
  userImage: string;
  content: string;
  likes: string[];
  createdAt: string;
}

interface CommentThreadProps {
  campaignId: string;
}

export function CommentThread({ campaignId }: CommentThreadProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/campaigns/${campaignId}/comments?limit=50`);
      const data = await res.json();
      setComments(data.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function handleSubmit() {
    if (!newComment.trim() || !user) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ campaignId, content: newComment }),
      });
      if (res.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLike(commentId: string) {
    if (!user) return;
    try {
      await fetch(`${getApiUrl()}/api/comments/${commentId}/like`, {
        method: 'POST',
        credentials: 'include',
      });
      fetchComments();
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  }

  async function handleDelete(commentId: string) {
    try {
      await fetch(`${getApiUrl()}/api/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      fetchComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        Comments ({comments.length})
      </h3>

      {user && (
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || ''} />
            <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={2}
            />
            <Button
              size="sm"
              className="mt-2"
              onClick={handleSubmit}
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-20" />
            </Card>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No comments yet. Be the first to share your thoughts!</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <Card key={comment._id}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.userImage} />
                    <AvatarFallback>{comment.userName?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{comment.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{comment.content}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleLike(comment._id)}
                      >
                        <ThumbsUp className="mr-1 h-3 w-3" />
                        {comment.likes?.length || 0}
                      </Button>
                      {user && user._id === comment.userId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-destructive"
                          onClick={() => handleDelete(comment._id)}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
