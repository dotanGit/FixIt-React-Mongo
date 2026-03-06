import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import ImageUploadField from './ImageUploadField'
import type { Post } from '../services/posts_service'

interface PostEditFormData {
    message: string
}

interface PostEditFormProps {
    post: Post
    onSubmit: (message: string, imageFile: File | null) => void
    onCancel: () => void
    isSubmitting?: boolean
}

const PostEditForm = ({ post, onSubmit, onCancel, isSubmitting = false }: PostEditFormProps) => {
    const { register, handleSubmit, setValue } = useForm<PostEditFormData>()
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>(post.image)

    useEffect(() => {
        setValue('message', post.message)
        setCurrentImageUrl(post.image)
    }, [post, setValue])

    const handleFormSubmit = (data: PostEditFormData) => {
        onSubmit(data.message, selectedImage)
    }

    const handleImageChange = (file: File | null) => {
        setSelectedImage(file)
    }

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} style={{
            backgroundColor: '#ffffff',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
            <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1a202c',
                marginBottom: '20px'
            }}>Edit Post</h3>

            <ImageUploadField
                currentImage={selectedImage ? URL.createObjectURL(selectedImage) : currentImageUrl}
                onImageChange={handleImageChange}
                shape="square"
            />

            <div style={{ marginBottom: '20px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#4a5568'
                }}>
                    Message
                </label>
                <textarea
                    {...register("message", { required: true })}
                    rows={4}
                    disabled={isSubmitting}
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '14px',
                        border: '1px solid #cbd5e0',
                        borderRadius: '8px',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        opacity: isSubmitting ? 0.6 : 1
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3182ce'}
                    onBlur={(e) => e.target.style.borderColor = '#cbd5e0'}
                />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                        padding: '12px 24px',
                        fontSize: '14px',
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
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    style={{
                        padding: '12px 24px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#4a5568',
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e0',
                        borderRadius: '8px',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        opacity: isSubmitting ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => {
                        if (!isSubmitting) {
                            e.currentTarget.style.backgroundColor = '#f7fafc'
                            e.currentTarget.style.borderColor = '#3182ce'
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isSubmitting) {
                            e.currentTarget.style.backgroundColor = '#ffffff'
                            e.currentTarget.style.borderColor = '#cbd5e0'
                        }
                    }}
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}

export default PostEditForm
