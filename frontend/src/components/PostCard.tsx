import type { Post } from '../services/posts_service'

interface PostCardProps {
    post: Post
    onClick: () => void
    variant?: 'large' | 'small'
}

const PostCard = ({ post, onClick, variant = 'large' }: PostCardProps) => {
    const imageSize = variant === 'large' ? '250px' : '150px'

    return (
        <div 
            onClick={onClick}
            style={{
                backgroundColor: '#ffffff',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                gap: '16px',
                minHeight: 'auto',
                cursor: 'pointer',
                transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
                e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)'
                e.currentTarget.style.transform = 'translateY(0)'
            }}
        >
            {post.image && (
                <div style={{
                    width: imageSize,
                    height: imageSize,
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
                    <span style={{
                        fontSize: '12px',
                        color: '#a0aec0',
                        textAlign: 'right'
                    }}>
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
                    </span>
                </div>
                
                <p style={{
                    fontSize: '14px',
                    color: '#4a5568',
                    lineHeight: '1.5',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    marginBottom: '12px'
                }}>{post.message}</p>

                <div style={{
                    fontSize: '12px',
                    color: '#a0aec0',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    {post.commentCount || 0} {post.commentCount === 1 ? 'comment' : 'comments'}
                </div>
            </div>
        </div>
    )
}

export default PostCard
