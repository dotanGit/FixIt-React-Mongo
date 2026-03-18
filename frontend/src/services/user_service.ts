import apiClient, { CanceledError } from "./api-client.ts";

export { CanceledError }

export interface User {
    _id?: string,
    username: string,
    email: string,
    password: string,
    avatar?: string
}

export interface LoginCredentials {
    email: string,
    password: string
}

export interface AuthResponse {
    token: string,
    refreshToken: string
}

const register = (user: User) => {
    const abortController = new AbortController()
    const request = apiClient.post<AuthResponse>('/users/register',
        user,
        { signal: abortController.signal })
    return { request, abort: () => abortController.abort() }
}

const login = (credentials: LoginCredentials) => {
    const abortController = new AbortController()
    const request = apiClient.post<AuthResponse>('/users/login',
        credentials,
        { signal: abortController.signal })
    return { request, abort: () => abortController.abort() }
}

const googleLogin = (credential: string) => {
    const abortController = new AbortController()
    const request = apiClient.post<AuthResponse>('/users/google-login',
        { credential },
        { signal: abortController.signal })
    return { request, abort: () => abortController.abort() }
}

const uploadImage = (img: File) => {
    // const abortController = new AbortController()
    const formData = new FormData();
    formData.append("file", img);
    const request = apiClient.post('/upload', formData, {
        headers: {
            'Content-Type': 'image/*'
        }
    })
    return { request }
}

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

const getCurrentUser = () => {
    const abortController = new AbortController()
    const request = apiClient.get<User>('/users/me',
        { 
            signal: abortController.signal,
            headers: getAuthHeader()
        })
    return { request, abort: () => abortController.abort() }
}

const updateProfile = (updates: { username?: string, avatar?: string }) => {
    const abortController = new AbortController()
    const request = apiClient.put<User>('/users/me',
        updates,
        { 
            signal: abortController.signal,
            headers: getAuthHeader()
        })
    return { request, abort: () => abortController.abort() }
}

const refreshToken = (refreshToken: string) => {
    const request = apiClient.post<AuthResponse>('/users/refresh-token',
        { refreshToken })
    return { request }
}




const logout = (refreshToken: string) => {
    const request = apiClient.post('/users/logout', { refreshToken })
    return { request }
}

export default { register, login, googleLogin, uploadImage, getCurrentUser, updateProfile, refreshToken, logout }