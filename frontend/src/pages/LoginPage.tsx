import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'

interface FormData {
    email: string
    password: string
}

const LoginPage = () => {
    const { register, handleSubmit } = useForm<FormData>()
    const navigate = useNavigate()
    const auth = useAuth()

    const onSubmit = async (data: FormData) => {
        try {
            await auth.login(data.email, data.password)
            navigate('/posts')
        } catch (error) {
            console.error(error)
            alert('Login failed. Please check your credentials.')
        }
    }

    const onGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        try {
            if (!credentialResponse.credential) {
                alert('Google sign-in failed: no credential received.')
                return
            }
            await auth.googleLogin(credentialResponse.credential)
            navigate('/posts')
        } catch (error) {
            console.error(error)
            alert('Google sign-in failed. Please try again.')
        }
    }

    const onGoogleError = () => {
        alert('Google sign-in was cancelled or failed.')
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
                    }}>Welcome Back</h2>

                    <p style={{
                        alignSelf: 'center',
                        margin: '0 0 20px 0',
                        fontSize: '15px',
                        color: '#718096',
                        textAlign: 'center'
                    }}>Sign in to your account</p>

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
                        Sign In
                    </button>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}>
                        <hr style={{ flex: 1, borderColor: '#e2e8f0', margin: 0 }} />
                        <span style={{ fontSize: '13px', color: '#a0aec0' }}>or</span>
                        <hr style={{ flex: 1, borderColor: '#e2e8f0', margin: 0 }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <GoogleLogin
                            onSuccess={onGoogleSuccess}
                            onError={onGoogleError}
                            useOneTap={false}
                            text="signin_with"
                            shape="rectangular"
                            theme="outline"
                            size="large"
                            width="370"
                        />
                    </div>

                    <p style={{
                        alignSelf: 'center',
                        margin: '10px 0 0 0',
                        fontSize: '14px',
                        color: '#718096',
                        textAlign: 'center'
                    }}>
                        Don't have an account? <span
                            onClick={() => navigate('/register')}
                            style={{ color: '#3182ce', textDecoration: 'none', fontWeight: '500', cursor: 'pointer' }}
                        >Sign up</span>
                    </p>
                </div>
            </div>
        </form>
    )
}

export default LoginPage
