import { createContext, useState, useEffect, useContext, type ReactNode } from 'react'
import userService from '../services/user_service'

export interface User {
    _id?: string
    username: string
    email: string
    avatar?: string
}

export interface AuthContextType {
    isAuthenticated: boolean
    user: User | null
    loading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (username: string, email: string, password: string, avatar?: string) => Promise<void>
    logout: () => Promise<void>
    googleLogin: (credential: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
    children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    const checkAuth = async () => {
        const token = localStorage.getItem('token')
        if (token) {
            try {
                const { request } = userService.getCurrentUser()
                const response = await request
                setUser(response.data)
                setIsAuthenticated(true)
            } catch (error) {
                console.error('Error fetching user:', error)
                localStorage.removeItem('token')
                localStorage.removeItem('refreshToken')
                setIsAuthenticated(false)
                setUser(null)
            }
        } else {
            setIsAuthenticated(false)
            setUser(null)
        }
        setLoading(false)
    }

    useEffect(() => {
        checkAuth()
    }, [])

    const login = async (email: string, password: string) => {
        const { request } = userService.login({ email, password })
        const response = await request
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('refreshToken', response.data.refreshToken)
        
        const { request: userRequest } = userService.getCurrentUser()
        const userResponse = await userRequest
        setUser(userResponse.data)
        setIsAuthenticated(true)
    }

    const register = async (username: string, email: string, password: string, avatar?: string) => {
        const userData = {
            username,
            email,
            password,
            avatar
        }
        const { request } = userService.register(userData)
        const response = await request
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('refreshToken', response.data.refreshToken)
        
        const { request: userRequest } = userService.getCurrentUser()
        const userResponse = await userRequest
        setUser(userResponse.data)
        setIsAuthenticated(true)
    }

    const googleLogin = async (credential: string) => {
        const { request } = userService.googleLogin(credential)
        const response = await request
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('refreshToken', response.data.refreshToken)

        const { request: userRequest } = userService.getCurrentUser()
        const userResponse = await userRequest
        setUser(userResponse.data)
        setIsAuthenticated(true)
    }

    const logout = async () => {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
            try {
                const { request } = userService.logout(refreshToken)
                await request
            } catch (error) {
                console.error('Error during logout:', error)
            }
        }
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        setIsAuthenticated(false)
        setUser(null)
    }

    const value: AuthContextType = {
        isAuthenticated,
        user,
        loading,
        login,
        register,
        logout,
        googleLogin
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
