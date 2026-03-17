import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Header = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { logout } = useAuth()

    const handleLogoClick = () => {
        if (location.pathname === '/posts') {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
            navigate('/posts')
        }
    }

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
                    onClick={handleLogoClick}
                    style={{
                        fontSize: '22px',
                        fontWeight: '700',
                        color: '#4a6fa5',
                        cursor: 'pointer',
                        userSelect: 'none',
                    }}
                >
                    FixIt
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                        onClick={() => navigate('/posts/new')}
                        style={{
                            padding: '8px 18px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#ffffff',
                            backgroundColor: '#4a6fa5',
                            border: '1px solid #4a6fa5',
                            borderRadius: '7px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3d5d8a'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4a6fa5'}
                    >
                        + New Post
                    </button>
                    <button
                        onClick={() => navigate('/profile')}
                        style={{
                            padding: '8px 18px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#4a6fa5',
                            backgroundColor: '#ffffff',
                            border: '1px solid #4a6fa5',
                            borderRadius: '7px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f4f8'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                    >
                        My Profile
                    </button>
                    <button
                        onClick={logout}
                        style={{
                            padding: '8px 18px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#4a6fa5',
                            backgroundColor: '#ffffff',
                            border: '1px solid #4a6fa5',
                            borderRadius: '7px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f4f8'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default Header
