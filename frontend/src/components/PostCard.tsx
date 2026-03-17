import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart } from '@fortawesome/free-solid-svg-icons'
import type { Post } from '../services/posts_service'
import timeAgo from '../utils/timeAgo'

interface PostCardProps {
    post: Post
    onClick: () => void
    variant?: 'large' | 'small'
    onLike?: (e: React.MouseEvent) => void
    isLiked?: boolean
}

const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    const weeks = Math.floor(days / 7)
    if (weeks < 5) return `${weeks}w ago`
    return new Date(date).toLocaleDateString()
}

const PostCard = ({ post, onClick, variant = 'large', onLike, isLiked = false }: PostCardProps) => {
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
                        {post.createdAt ? timeAgo(post.createdAt) : ''}
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginTop: 'auto'
                }}>
                    <span style={{
                        fontSize: '12px',
                        color: '#a0aec0',
                        fontWeight: '500',
                    }}>
                        {post.commentCount || 0} {post.commentCount === 1 ? 'comment' : 'comments'}
                    </span>

                    {onLike && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onLike(e); }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '4px 10px',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: isLiked ? '#e53e3e' : '#a0aec0',
                                backgroundColor: isLiked ? '#fff5f5' : 'transparent',
                                border: `1px solid ${isLiked ? '#fed7d7' : '#e2e8f0'}`,
                                borderRadius: '20px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#e53e3e'
                                e.currentTarget.style.backgroundColor = '#fff5f5'
                                e.currentTarget.style.borderColor = '#fed7d7'
                            }}
                            onMouseLeave={(e) => {
                                if (!isLiked) {
                                    e.currentTarget.style.color = '#a0aec0'
                                    e.currentTarget.style.backgroundColor = 'transparent'
                                    e.currentTarget.style.borderColor = '#e2e8f0'
                                }
                            }}
                        >
                            <FontAwesomeIcon icon={faHeart} style={{ fontSize: '11px' }} />
                            {post.likes?.length || 0}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PostCard
