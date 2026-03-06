import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import userService from '../services/user_service'
import { useAuth } from '../context/AuthContext'
import ImageUploadField from '../components/ImageUploadField'

interface FormData {
    username: string
    email: string
    password: string
}

const RegisterPage = () => {
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const { register, handleSubmit } = useForm<FormData>()
    const navigate = useNavigate()
    const auth = useAuth()

    const onSubmit = async (data: FormData) => {
        try {
            let avatarUrl: string | undefined = undefined

            if (selectedImage) {
                const { request } = userService.uploadImage(selectedImage)
                const response = await request
                avatarUrl = response.data.url
            }

            await auth.register(data.username, data.email, data.password, avatarUrl)
            navigate('/posts')
        } catch (error) {
            console.error(error)
            alert('Registration failed. Please try again.')
        }
    }

    const handleImageChange = (file: File | null) => {
        setSelectedImage(file)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} >
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                width: '100vw',
                backgroundColor: '#f5f7fa',
                padding: '20px'
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#ffffff',
                    padding: '40px',
                    borderRadius: '12px',
                    width: '100%',
                    maxWidth: '450px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 8px 20px rgba(0, 0, 0, 0.08)',
                    gap: '20px'
                }}>
                    <h2 style={{ 
                        alignSelf: 'center', 
                        margin: '0 0 10px 0',
                        fontSize: '28px',
                        fontWeight: '600',
                        color: '#1a202c'
                    }}>Create Account</h2>
                    
                    <ImageUploadField
                        onImageChange={handleImageChange}
                        shape="circle"
                        defaultImage="http://localhost:3000/uploads/default-avatar.png"
                    />
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ 
                            fontSize: '14px', 
                            fontWeight: '500',
                            color: '#2d3748',
                            marginBottom: '4px'
                        }}>Username</label>
                        <input 
                            {...register("username")} 
                            type="text" 
                            placeholder="johndoe"
                            style={{
                                padding: '12px 16px',
                                fontSize: '15px',
                                border: '1px solid #cbd5e0',
                                borderRadius: '8px',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3182ce'}
                            onBlur={(e) => e.target.style.borderColor = '#cbd5e0'}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ 
                            fontSize: '14px', 
                            fontWeight: '500',
                            color: '#2d3748',
                            marginBottom: '4px'
                        }}>Email Address</label>
                        <input 
                            {...register("email")} 
                            type="email" 
                            placeholder="you@example.com"
                            style={{
                                padding: '12px 16px',
                                fontSize: '15px',
                                border: '1px solid #cbd5e0',
                                borderRadius: '8px',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3182ce'}
                            onBlur={(e) => e.target.style.borderColor = '#cbd5e0'}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ 
                            fontSize: '14px', 
                            fontWeight: '500',
                            color: '#2d3748',
                            marginBottom: '4px'
                        }}>Password</label>
                        <input 
                            {...register("password")} 
                            type="password"
                            placeholder="Enter your password"
                            style={{
                                padding: '12px 16px',
                                fontSize: '15px',
                                border: '1px solid #cbd5e0',
                                borderRadius: '8px',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3182ce'}
                            onBlur={(e) => e.target.style.borderColor = '#cbd5e0'}
                        />
                    </div>

                    <button 
                        type="submit" 
                        style={{
                            marginTop: '12px',
                            padding: '14px',
                            fontSize: '16px',
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
                        Create Account
                    </button>

                    <p style={{ 
                        alignSelf: 'center',
                        margin: '10px 0 0 0',
                        fontSize: '14px',
                        color: '#718096',
                        textAlign: 'center'
                    }}>
                        Already have an account? <span 
                            onClick={() => navigate('/login')} 
                            style={{ color: '#3182ce', textDecoration: 'none', fontWeight: '500', cursor: 'pointer' }}
                        >Sign in</span>
                    </p>
                </div>
            </div>
        </form>
    )
}

export default RegisterPage
