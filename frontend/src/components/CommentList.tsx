import { useState } from 'react'
import type { Comment } from '../services/comments_service'
import defaultAvatar from '../assets/avatar.png'
import timeAgo from '../utils/timeAgo'

interface CommentListProps {
    comments: Comment[]
    isLoading: boolean
    currentUserId?: string
    onEditComment?: (commentId: string, message: string) => Promise<void>
    onDeleteComment?: (commentId: string) => Promise<void>
}

const CommentList = ({ comments, isLoading, currentUserId, onEditComment, onDeleteComment }: CommentListProps) => {
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editMessage, setEditMessage] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const handleStartEdit = (comment: Comment) => {
        setEditingId(comment._id)
        setEditMessage(comment.message)
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setEditMessage('')
    }

    const handleSaveEdit = async (commentId: string) => {
        if (!onEditComment || !editMessage.trim()) return
        setIsSaving(true)
        try {
            await onEditComment(commentId, editMessage)
            setEditingId(null)
            setEditMessage('')
        } catch {
            // error handled by parent
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (commentId: string) => {
        if (!onDeleteComment) return
        const confirmed = window.confirm('Are you sure you want to delete this comment?')
        if (!confirmed) return
        await onDeleteComment(commentId)
    }

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

                {comments.map((comment) => {
                    const isOwner = currentUserId && comment.createdBy?._id === currentUserId
                    const isEditing = editingId === comment._id

                    return (
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{
                                            fontSize: '11px',
                                            color: '#a0aec0'
                                        }}>
                                            {comment.updatedAt && comment.createdAt && comment.updatedAt !== comment.createdAt
                                                ? `${timeAgo(comment.updatedAt)} (edited)`
                                                : comment.createdAt ? timeAgo(comment.createdAt) : ''}
                                        </span>
                                        {isOwner && !isEditing && (
                                            <>
                                                <button
                                                    onClick={() => handleStartEdit(comment)}
                                                    style={{
                                                        padding: '2px 8px',
                                                        fontSize: '11px',
                                                        fontWeight: '500',
                                                        color: '#718096',
                                                        backgroundColor: 'transparent',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.color = '#3182ce'
                                                        e.currentTarget.style.borderColor = '#3182ce'
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.color = '#718096'
                                                        e.currentTarget.style.borderColor = '#e2e8f0'
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(comment._id)}
                                                    style={{
                                                        padding: '2px 8px',
                                                        fontSize: '11px',
                                                        fontWeight: '500',
                                                        color: '#718096',
                                                        backgroundColor: 'transparent',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.color = '#e53e3e'
                                                        e.currentTarget.style.borderColor = '#e53e3e'
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.color = '#718096'
                                                        e.currentTarget.style.borderColor = '#e2e8f0'
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {isEditing ? (
                                    <div>
                                        <textarea
                                            value={editMessage}
                                            onChange={(e) => setEditMessage(e.target.value)}
                                            disabled={isSaving}
                                            rows={3}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                fontSize: '14px',
                                                border: '1px solid #cbd5e0',
                                                borderRadius: '6px',
                                                outline: 'none',
                                                resize: 'vertical',
                                                fontFamily: 'inherit',
                                                marginBottom: '8px',
                                                opacity: isSaving ? 0.6 : 1
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#3182ce'}
                                            onBlur={(e) => e.target.style.borderColor = '#cbd5e0'}
                                        />
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => handleSaveEdit(comment._id)}
                                                disabled={isSaving || !editMessage.trim()}
                                                style={{
                                                    padding: '4px 12px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    color: '#ffffff',
                                                    backgroundColor: isSaving ? '#a0aec0' : '#3182ce',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: isSaving ? 'not-allowed' : 'pointer',
                                                    transition: 'background-color 0.2s',
                                                }}
                                                onMouseEnter={(e) => { if (!isSaving) e.currentTarget.style.backgroundColor = '#2c5aa0' }}
                                                onMouseLeave={(e) => { if (!isSaving) e.currentTarget.style.backgroundColor = '#3182ce' }}
                                            >
                                                {isSaving ? 'Saving...' : 'Save'}
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                disabled={isSaving}
                                                style={{
                                                    padding: '4px 12px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    color: '#4a5568',
                                                    backgroundColor: 'transparent',
                                                    border: '1px solid #cbd5e0',
                                                    borderRadius: '4px',
                                                    cursor: isSaving ? 'not-allowed' : 'pointer',
                                                    transition: 'all 0.2s',
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isSaving) e.currentTarget.style.borderColor = '#3182ce'
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isSaving) e.currentTarget.style.borderColor = '#cbd5e0'
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p style={{
                                        fontSize: '14px',
                                        color: '#4a5568',
                                        lineHeight: '1.5',
                                        margin: 0,
                                        whiteSpace: 'pre-wrap'
                                    }}>{comment.message}</p>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default CommentList
