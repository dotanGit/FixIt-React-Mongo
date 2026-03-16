import type { Comment } from '../services/comments_service'
import defaultAvatar from '../assets/avatar.png'

interface CommentListProps {
    comments: Comment[]
    isLoading: boolean
}

const CommentList = ({ comments, isLoading }: CommentListProps) => {
    return (
        <div style={{ marginBottom: '20px' }}>
            <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1a202c',
                marginBottom: '20px'
            }}>Comments ({comments.length})</h2>

            {isLoading && <p style={{ color: '#718096', fontSize: '14px' }}>Loading comments...</p>}

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}>
                {comments.length === 0 && !isLoading && (
                    <p style={{
                        color: '#a0aec0',
                        fontSize: '14px',
                        textAlign: 'center',
                        padding: '20px'
                    }}>No comments yet. Be the first to comment!</p>
                )}

                {comments.map((comment) => (
                    <div key={comment._id} style={{
                        backgroundColor: '#ffffff',
                        padding: '16px',
                        borderRadius: '8px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                        display: 'flex',
                        gap: '12px'
                    }}>
                        <img 
                            src={comment.createdBy?.avatar || defaultAvatar} 
                            alt={`${comment.createdBy?.username}'s avatar`}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                flexShrink: 0,
                                border: '2px solid #e2e8f0'
                            }}
                            onError={(e) => {
                                e.currentTarget.src = defaultAvatar
                            }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '8px'
                            }}>
                                <span style={{
                                    fontSize: '13px',
                                    color: '#3182ce',
                                    fontWeight: '600'
                                }}>
                                    {comment.createdBy?.username || 'Unknown'}
                                </span>
                                <span style={{
                                    fontSize: '11px',
                                    color: '#a0aec0'
                                }}>
                                    {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
                                </span>
                            </div>
                            <p style={{
                                fontSize: '14px',
                                color: '#4a5568',
                                lineHeight: '1.5',
                                margin: 0,
                                whiteSpace: 'pre-wrap'
                            }}>{comment.message}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CommentList
