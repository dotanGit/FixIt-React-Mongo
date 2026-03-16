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
    likes: string[],
    commentCount?: number,
    createdAt?: string,
    updatedAt?: string
}

export interface PostRequest {
    message: string,
    image?: string
}

export interface PaginatedPosts {
    posts: Post[],
    hasMore: boolean,
    page: number,
    total: number
}

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

const getPosts = (page: number = 1, limit: number = 10) => {
    const abortController = new AbortController()
    const request = apiClient.get<PaginatedPosts>('/api/posts', {
        signal: abortController.signal,
        params: { page, limit }
    })
    return { request, abort: () => abortController.abort() }
}

const createPost = (post: PostRequest) => {
    const abortController = new AbortController()
    const request = apiClient.post<Post>('/api/posts',
        post,
        { 
            signal: abortController.signal,
            headers: getAuthHeader()
        })
    return { request, abort: () => abortController.abort() }
}

const updatePost = (id: string, post: PostRequest) => {
    const abortController = new AbortController()
    const request = apiClient.put<Post>(`/api/posts/${id}`,
        post,
        { 
            signal: abortController.signal,
            headers: getAuthHeader()
        })
    return { request, abort: () => abortController.abort() }
}

const deletePost = (id: string) => {
    const abortController = new AbortController()
    const request = apiClient.delete<Post>(`/api/posts/${id}`,
        { 
            signal: abortController.signal,
            headers: getAuthHeader()
        })
    return { request, abort: () => abortController.abort() }
}

const getPostById = (id: string) => {
    const abortController = new AbortController()
    const request = apiClient.get<Post>(`/api/posts/${id}`,
        { signal: abortController.signal })
    return { request, abort: () => abortController.abort() }
}

const getMyPosts = () => {
    const abortController = new AbortController()
    const request = apiClient.get<Post[]>('/api/posts/my',
        { 
            signal: abortController.signal,
            headers: getAuthHeader()
        })
    return { request, abort: () => abortController.abort() }
}


const toggleLike = (id: string) => {
    const abortController = new AbortController()
    const request = apiClient.post<Post>(`/api/posts/${id}/like`, {}, {
        signal: abortController.signal,
        headers: getAuthHeader()
    })
    return { request, abort: () => abortController.abort() }
}

const searchPosts = (query: string) => {
    const abortController = new AbortController()
    const request = apiClient.post<Post[]>('/posts/search', { query }, {
        signal: abortController.signal
    })
    return { request, abort: () => abortController.abort() }
}

export default { getPosts, createPost, updatePost, deletePost, getPostById, getMyPosts, toggleLike, searchPosts }