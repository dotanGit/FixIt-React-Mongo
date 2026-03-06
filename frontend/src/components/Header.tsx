interface HeaderProps {
    title?: string
    onLogout: () => void
    onNavigateToProfile?: () => void
    onBack?: () => void
    showProfileButton?: boolean
    showBackButton?: boolean
    rightContent?: React.ReactNode
}

const Header = ({ 
    title, 
    onLogout, 
    onNavigateToProfile, 
    onBack,
    showProfileButton = false,
    showBackButton = false,
    rightContent
}: HeaderProps) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {showBackButton && onBack && (
                    <button
                        onClick={onBack}
                        style={{
                            padding: '10px 20px',
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
                        ← Back to Posts
                    </button>
                )}
                {title && (
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: '700',
                        color: '#1a202c',
                        margin: 0
                    }}>{title}</h1>
                )}
            </div>
            
            <div style={{
                display: 'flex',
                gap: '12px'
            }}>
                {rightContent}
                {showProfileButton && onNavigateToProfile && (
                    <button
                        onClick={onNavigateToProfile}
                        style={{
                            padding: '10px 20px',
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
                )}
                <button
                    onClick={onLogout}
                    style={{
                        padding: '10px 20px',
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
    )
}

export default Header
