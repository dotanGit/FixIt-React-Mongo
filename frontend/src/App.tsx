import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import PostsPage from './pages/PostsPage'
import PostFormPage from './pages/PostFormPage'
import PostDetailsPage from './pages/PostDetailsPage'
import ProfilePage from './pages/ProfilePage'
import { AuthProvider, useAuth } from './context/AuthContext'
import './App.css'

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f7fa'
      }}>
        <div style={{
          fontSize: '18px',
          color: '#718096',
          fontWeight: '500'
        }}>
          Loading...
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {!isAuthenticated ? (
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <>
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/posts/new" element={<PostFormPage />} />
          <Route path="/posts/:id" element={<PostDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<Navigate to="/posts" replace />} />
          <Route path="/register" element={<Navigate to="/posts" replace />} />
          <Route path="/" element={<Navigate to="/posts" replace />} />
          <Route path="*" element={<Navigate to="/posts" replace />} />
        </>
      )}
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
