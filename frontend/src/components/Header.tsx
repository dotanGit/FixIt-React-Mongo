import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Header = () => {
    const navigate = useNavigate()
    const { logout } = useAuth()

    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
        }}>
            <div style={{
                maxWidth: '1200px',
                width: '100%',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <span
                    onClick={() => navigate('/posts')}
                    style={{
                        fontSize: '22px',
                        fontWeight: '700',
                        color: '#3182ce',
                        cursor: 'pointer',
                        userSelect: 'none',
                    }}
                >
                    FixIt
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={() => navigate('/posts/new')}
                        style={{
                            padding: '9px 20px',
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
                        + New Post
                    </button>
                    <button
                        onClick={() => navigate('/profile')}
                        style={{
                            padding: '9px 20px',
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
                        My Profile
                    </button>
                    <button
                        onClick={logout}
                        style={{
                            padding: '9px 20px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#e53e3e',
                            backgroundColor: '#ffffff',
                            border: '1px solid #e53e3e',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#fff5f5'
                            e.currentTarget.style.borderColor = '#c53030'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#ffffff'
                            e.currentTarget.style.borderColor = '#e53e3e'
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default Header
