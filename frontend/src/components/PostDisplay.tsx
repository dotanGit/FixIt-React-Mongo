import type { Post } from '../services/posts_service'
import timeAgo from '../utils/timeAgo'

interface PostDisplayProps {
    post: Post
    isOwner: boolean
    onEdit: () => void
    onDelete: () => void
}

const PostDisplay = ({ post, isOwner, onEdit, onDelete }: PostDisplayProps) => {
    return (
        <div style={{
            backgroundColor: '#ffffff',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            gap: '16px',
            minHeight: 'auto'
        }}>
            {post.image && (
                <div style={{
                    width: '150px',
                    height: '150px',
                    flexShrink: 0,
                    overflow: 'hidden',
                    borderRadius: '8px',
                    backgroundColor: '#f7fafc'
                }}>
                    <img 
                        src={post.image} 
                        alt="Post content"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block'
                        }}
                        onError={(e) => {
                            const parent = e.currentTarget.parentElement
                            if (parent) parent.style.display = 'none'
                        }}
                    />
                </div>
            )}
            
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minWidth: 0
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                }}>
                    <div style={{
                        fontSize: '13px',
                        color: '#718096',
                        fontWeight: '500',
                        textAlign: 'left'
                    }}>
                        Posted By: <span style={{ color: '#3182ce', fontWeight: '600' }}>
                            {post.createdBy?.username || 'Unknown'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{
                            fontSize: '12px',
                            color: '#a0aec0',
                            textAlign: 'right'
                        }}>
                            {post.createdAt ? timeAgo(post.createdAt) : ''}
                        </span>
                        {isOwner && (
                            <>
                                <button
                                    onClick={onEdit}
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#ffffff',
                                        backgroundColor: '#3182ce',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2c5aa0'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3182ce'}
                                >
                                    Edit Post
                                </button>
                                <button
                                    onClick={onDelete}
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#ffffff',
                                        backgroundColor: '#e53e3e',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c53030'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e53e3e'}
                                >
                                    Delete Post
                                </button>
                            </>
                        )}
                    </div>
                </div>
                
                <p style={{
                    fontSize: '14px',
                    color: '#4a5568',
                    lineHeight: '1.5',
                    margin: 0,
                    whiteSpace: 'pre-wrap'
                }}>{post.message}</p>
            </div>
        </div>
    )
}

export default PostDisplay
