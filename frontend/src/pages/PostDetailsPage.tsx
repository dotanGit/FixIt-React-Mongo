import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import postsService, { CanceledError, type Post } from '../services/posts_service'
import commentsService, { type Comment } from '../services/comments_service'
import userService from '../services/user_service'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import PostDisplay from '../components/PostDisplay'
import PostEditForm from '../components/PostEditForm'
import CommentList from '../components/CommentList'
import CommentForm from '../components/CommentForm'

const PostDetailsPage = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user, logout } = useAuth()
    const [post, setPost] = useState<Post | null>(null)
    const [comments, setComments] = useState<Comment[]>([])
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isLoadingComments, setIsLoadingComments] = useState<boolean>(true)
    const [isEditMode, setIsEditMode] = useState<boolean>(false)
    const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false)
    const [isSubmittingEdit, setIsSubmittingEdit] = useState<boolean>(false)

    const isPostOwner = (): boolean => {
        return user !== null && post !== null && post.createdBy._id === user._id
    }

    useEffect(() => {
        if (!id) return
        
        setIsLoading(true)
        const { request, abort } = postsService.getPostById(id)
        request.then((response) => {
            setPost(response.data)
            setIsLoading(false)
        }).catch((error) => {
            if (!(error instanceof CanceledError)) {
                setError('Error fetching post...')
                setIsLoading(false)
            }
        })
        return () => { abort() }
    }, [id])

    useEffect(() => {
        if (!id) return
        
        setIsLoadingComments(true)
        const { request, abort } = commentsService.getCommentsByPostId(id)
        request.then((response) => {
            setComments(response.data)
            setIsLoadingComments(false)
        }).catch((error) => {
            if (!(error instanceof CanceledError)) {
                setIsLoadingComments(false)
            }
        })
        return () => { abort() }
    }, [id])

    const handleAddComment = async (message: string) => {
        if (!id) return

        setIsSubmittingComment(true)
        try {
            const { request } = commentsService.createComment(id, { message })
            const response = await request
            setComments([...comments, response.data])
        } catch (error: any) {
            console.error('Error creating comment:', error)
            const msg = error?.response?.data?.message || 'Failed to add comment. Make sure you are logged in.'
            alert(msg)
        } finally {
            setIsSubmittingComment(false)
        }
    }

    const handleEditSubmit = async (message: string, imageFile: File | null) => {
        if (!id || !post) return

        setIsSubmittingEdit(true)
        try {
            let imageUrl = post.image

            if (imageFile) {
                const { request } = userService.uploadImage(imageFile)
                const uploadResponse = await request
                imageUrl = uploadResponse.data.url
            }

            const updatedPost = {
                message: message,
                image: imageUrl
            }

            const { request } = postsService.updatePost(id, updatedPost)
            const response = await request
            setPost(response.data)
            setIsEditMode(false)
        } catch (error: any) {
            console.error('Error updating post:', error)
            const msg = error?.response?.data?.message || 'Failed to update post. Please try again.'
            alert(msg)
        } finally {
            setIsSubmittingEdit(false)
        }
    }

    const handleEditClick = () => {
        setIsEditMode(true)
    }

    const handleCancelEdit = () => {
        setIsEditMode(false)
    }

    const handleDeletePost = async () => {
        if (!id || !post) return

        const confirmDelete = window.confirm('Are you sure you want to delete this post? This action cannot be undone.')
        if (!confirmDelete) return

        try {
            const { request } = postsService.deletePost(id)
            await request
            navigate('/posts')
        } catch (error) {
            console.error('Error deleting post:', error)
            alert('Failed to delete post. Please try again.')
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f5f7fa',
            padding: '20px'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                <Header
                    onLogout={logout}
                    showBackButton
                    showProfileButton
                    onBack={() => navigate('/posts')}
                    onNavigateToProfile={() => navigate('/profile')}
                />

                {isLoading && <p style={{ color: '#718096', fontSize: '16px' }}>Loading post...</p>}

                {error && <div style={{
                    backgroundColor: '#fed7d7',
                    color: '#9b2c2c',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>{error}</div>}

                {post && !isEditMode && (
                    <PostDisplay
                        post={post}
                        isOwner={isPostOwner()}
                        onEdit={handleEditClick}
                        onDelete={handleDeletePost}
                    />
                )}

                {post && isEditMode && (
                    <PostEditForm
                        post={post}
                        onSubmit={handleEditSubmit}
                        onCancel={handleCancelEdit}
                        isSubmitting={isSubmittingEdit}
                    />
                )}

                {post && (
                    <div style={{
                        backgroundColor: '#ffffff',
                        padding: '24px',
                        borderRadius: '8px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                        marginTop: '20px'
                    }}>
                        <CommentList
                            comments={comments}
                            isLoading={isLoadingComments}
                        />
                        
                        <CommentForm
                            onSubmit={handleAddComment}
                            isSubmitting={isSubmittingComment}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export default PostDetailsPage
