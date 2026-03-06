import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import userService, { CanceledError } from '../services/user_service'
import postsService, { type Post } from '../services/posts_service'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import PostCard from '../components/PostCard'
import ImageUploadField from '../components/ImageUploadField'

interface ProfileFormData {
    username: string
}

const ProfilePage = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [posts, setPosts] = useState<Post[]>([])
    const [isLoadingPosts, setIsLoadingPosts] = useState<boolean>(true)
    const [isEditMode, setIsEditMode] = useState<boolean>(false)
    const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null)
    const { register, handleSubmit, setValue } = useForm<ProfileFormData>()

    useEffect(() => {
        setIsLoadingPosts(true)
        const { request, abort } = postsService.getMyPosts()
        request.then((response) => {
            setPosts(response.data)
            setIsLoadingPosts(false)
        }).catch((error) => {
            if (!(error instanceof CanceledError)) {
                setIsLoadingPosts(false)
            }
        })
        return () => { abort() }
    }, [])

    const handleEditClick = () => {
        if (user) {
            setValue('username', user.username)
            setIsEditMode(true)
        }
    }

    const handleCancelEdit = () => {
        setIsEditMode(false)
        setSelectedAvatar(null)
    }

    const onSubmitProfile = async (data: ProfileFormData) => {
        if (!user) return

        try {
            let avatarUrl = user.avatar

            if (selectedAvatar) {
                const { request } = userService.uploadImage(selectedAvatar)
                const uploadResponse = await request
                avatarUrl = uploadResponse.data.url
            }

            const updates = {
                username: data.username,
                avatar: avatarUrl
            }

            const { request } = userService.updateProfile(updates)
            await request
            
            window.location.reload()
        } catch (error) {
            console.error('Error updating profile:', error)
            alert('Failed to update profile. Please try again.')
        }
    }

    const handleAvatarChange = (file: File | null) => {
        setSelectedAvatar(file)
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f5f7fa',
        }}>
            <Header />
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '84px 20px 20px',
            }}>

                {user && !isEditMode && (
                    <div style={{
                        backgroundColor: '#ffffff',
                        padding: '32px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 8px 20px rgba(0, 0, 0, 0.08)',
                        marginBottom: '30px'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '24px',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '24px'
                            }}>
                                <img 
                                    src={user.avatar || 'https://localhost:3000/uploads/default-avatar.png'} 
                                    alt={`${user.username}'s avatar`}
                                    style={{
                                        width: '120px',
                                        height: '120px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '4px solid #e2e8f0',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                    }}
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://localhost:3000/uploads/default-avatar.png'
                                    }}
                                />
                                <div>
                                    <h1 style={{
                                        fontSize: '32px',
                                        fontWeight: '700',
                                        color: '#1a202c',
                                        margin: '0 0 8px 0'
                                    }}>{user.username}</h1>
                                    <p style={{
                                        fontSize: '16px',
                                        color: '#718096',
                                        margin: 0
                                    }}>{user.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleEditClick}
                                style={{
                                    padding: '10px 20px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#ffffff',
                                    backgroundColor: '#3182ce',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2c5aa0'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3182ce'}
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>
                )}

                {user && isEditMode && (
                    <form onSubmit={handleSubmit(onSubmitProfile)} style={{
                        backgroundColor: '#ffffff',
                        padding: '32px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 8px 20px rgba(0, 0, 0, 0.08)',
                        marginBottom: '30px'
                    }}>
                        <h3 style={{
                            fontSize: '24px',
                            fontWeight: '600',
                            color: '#1a202c',
                            marginBottom: '24px'
                        }}>Edit Profile</h3>

                        <ImageUploadField
                            currentImage={selectedAvatar ? URL.createObjectURL(selectedAvatar) : user.avatar}
                            onImageChange={handleAvatarChange}
                            shape="circle"
                            defaultImage="https://localhost:3000/uploads/default-avatar.png"
                        />

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#4a5568'
                            }}>
                                Username
                            </label>
                            <input
                                {...register("username", { required: true })}
                                type="text"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    border: '1px solid #cbd5e0',
                                    borderRadius: '8px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    fontFamily: 'inherit'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3182ce'}
                                onBlur={(e) => e.target.style.borderColor = '#cbd5e0'}
                            />
                        </div>

                        <div style={{ 
                            padding: '12px 16px',
                            backgroundColor: '#f7fafc',
                            borderRadius: '8px',
                            marginBottom: '20px'
                        }}>
                            <label style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '500',
                                color: '#718096',
                                marginBottom: '4px'
                            }}>
                                Email
                            </label>
                            <p style={{
                                fontSize: '14px',
                                color: '#4a5568',
                                margin: 0
                            }}>{user.email}</p>
                            <p style={{
                                fontSize: '11px',
                                color: '#a0aec0',
                                margin: '4px 0 0 0'
                            }}>Email cannot be changed</p>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button 
                                type="submit"
                                style={{
                                    padding: '12px 24px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#ffffff',
                                    backgroundColor: '#3182ce',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2c5aa0'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3182ce'}
                            >
                                Save Changes
                            </button>
                            <button 
                                type="button"
                                onClick={handleCancelEdit}
                                style={{
                                    padding: '12px 24px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#4a5568',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #cbd5e0',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f7fafc'
                                    e.currentTarget.style.borderColor = '#3182ce'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#ffffff'
                                    e.currentTarget.style.borderColor = '#cbd5e0'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                <div style={{
                    marginTop: '30px'
                }}>
                    <h2 style={{
                        fontSize: '24px',
                        fontWeight: '600',
                        color: '#1a202c',
                        marginBottom: '20px'
                    }}>My Posts ({posts.length})</h2>

                    {isLoadingPosts && <p style={{ color: '#718096', fontSize: '16px' }}>Loading posts...</p>}

                    {!isLoadingPosts && posts.length === 0 && (
                        <div style={{
                            backgroundColor: '#ffffff',
                            padding: '40px',
                            borderRadius: '8px',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                            textAlign: 'center'
                        }}>
                            <p style={{
                                fontSize: '16px',
                                color: '#a0aec0',
                                margin: 0
                            }}>You haven't created any posts yet.</p>
                        </div>
                    )}

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                    }}>
                        {posts.map((post) => (
                            <PostCard
                                key={post._id}
                                post={post}
                                onClick={() => navigate(`/posts/${post._id}`)}
                                variant="small"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfilePage
