import apiClient, { CanceledError } from "./api-client";

export { CanceledError }

export interface Post {
    _id: string,
    message: string,
    image?: string,
    createdBy: {
        _id: string,
        username: string,
        email: string,
        avatar?: string
    },
    commentCount?: number,
    createdAt?: string,
    updatedAt?: string
}

export interface PostRequest {
    message: string,
    image?: string
}

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

const getPosts = () => {
    const abortController = new AbortController()
    const request = apiClient.get<Post[]>('/posts',
        { signal: abortController.signal })
    return { request, abort: () => abortController.abort() }
}

const createPost = (post: PostRequest) => {
    const abortController = new AbortController()
    const request = apiClient.post<Post>('/posts',
        post,
        { 
            signal: abortController.signal,
            headers: getAuthHeader()
        })
    return { request, abort: () => abortController.abort() }
}

const updatePost = (id: string, post: PostRequest) => {
    const abortController = new AbortController()
    const request = apiClient.put<Post>(`/posts/${id}`,
        post,
        { 
            signal: abortController.signal,
            headers: getAuthHeader()
        })
    return { request, abort: () => abortController.abort() }
}

const deletePost = (id: string) => {
    const abortController = new AbortController()
    const request = apiClient.delete<Post>(`/posts/${id}`,
        { 
            signal: abortController.signal,
            headers: getAuthHeader()
        })
    return { request, abort: () => abortController.abort() }
}

const getPostById = (id: string) => {
    const abortController = new AbortController()
    const request = apiClient.get<Post>(`/posts/${id}`,
        { signal: abortController.signal })
    return { request, abort: () => abortController.abort() }
}

const getMyPosts = () => {
    const abortController = new AbortController()
    const request = apiClient.get<Post[]>('/posts/my',
        { 
            signal: abortController.signal,
            headers: getAuthHeader()
        })
    return { request, abort: () => abortController.abort() }
}


export default { getPosts, createPost, updatePost, deletePost, getPostById, getMyPosts }