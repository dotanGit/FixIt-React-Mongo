import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import postsService, { type PostRequest } from '../services/posts_service'
import userService from '../services/user_service'
import ImageUploadField from '../components/ImageUploadField'
import Header from '../components/Header'

interface FormData {
    message: string
}

const PostFormPage = () => {
    const { register, handleSubmit } = useForm<FormData>()
    const navigate = useNavigate()
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true)
        try {
            let imageUrl: string | undefined = undefined

            if (selectedImage) {
                const { request } = userService.uploadImage(selectedImage)
                const response = await request
                imageUrl = response.data.url
            }

            const post: PostRequest = {
                message: data.message,
                image: imageUrl
            }

            const { request } = postsService.createPost(post)
            await request
            navigate('/posts')
        } catch (error: any) {
            console.error('Error creating post:', error)
            const message = error?.response?.data?.message || 'Failed to create post. Please try again.'
            alert(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleImageChange = (file: File | null) => {
        setSelectedImage(file)
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
            <Header />
            <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                width: '100vw',
                backgroundColor: '#f5f7fa',
                padding: '84px 20px 20px'
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#ffffff',
                    padding: '40px',
                    borderRadius: '12px',
                    width: '100%',
                    maxWidth: '600px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 8px 20px rgba(0, 0, 0, 0.08)',
                    gap: '20px'
                }}>
                    <h2 style={{ 
                        alignSelf: 'center', 
                        margin: '0 0 10px 0',
                        fontSize: '28px',
                        fontWeight: '600',
                        color: '#1a202c'
                    }}>Create New Post</h2>
                    
                    <p style={{ 
                        alignSelf: 'center',
                        margin: '0 0 10px 0',
                        fontSize: '15px',
                        color: '#718096',
                        textAlign: 'center'
                    }}>Share your thoughts with the community</p>
                    
                    <ImageUploadField
                        onImageChange={handleImageChange}
                        shape="square"
                    />
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ 
                            fontSize: '14px', 
                            fontWeight: '500',
                            color: '#2d3748',
                            marginBottom: '4px'
                        }}>Message</label>
                        <textarea 
                            {...register("message")} 
                            placeholder="What's on your mind?"
                            rows={6}
                            style={{
                                padding: '12px 16px',
                                fontSize: '15px',
                                border: '1px solid #cbd5e0',
                                borderRadius: '8px',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                resize: 'vertical',
                                fontFamily: 'inherit'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3182ce'}
                            onBlur={(e) => e.target.style.borderColor = '#cbd5e0'}
                        />
                    </div>

                    <div style={{ 
                        display: 'flex', 
                        gap: '12px',
                        marginTop: '12px'
                    }}>
                        <button
                            type="button"
                            onClick={() => navigate('/posts')}
                            disabled={isSubmitting}
                            style={{
                                flex: 1,
                                padding: '14px',
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#4a5568',
                                backgroundColor: '#e2e8f0',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                transition: 'background-color 0.2s',
                                opacity: isSubmitting ? 0.6 : 1,
                            }}
                            onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.backgroundColor = '#cbd5e0' }}
                            onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.backgroundColor = '#e2e8f0' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                flex: 1,
                                padding: '14px',
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#ffffff',
                                backgroundColor: isSubmitting ? '#a0aec0' : '#3182ce',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.backgroundColor = '#2c5aa0' }}
                            onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.backgroundColor = '#3182ce' }}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Post'}
                        </button>
                    </div>
                </div>
            </div>
        </form>
        </div>
    )
}

export default PostFormPage
