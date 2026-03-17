import apiClient, { CanceledError } from "./api-client";

export { CanceledError }

export interface Comment {
    _id: string,
    postId: string,
    message: string,
    createdBy: {
        _id: string,
        username: string,
        email: string,
        avatar?: string
    },
    createdAt?: string,
    updatedAt?: string
}

export interface CommentRequest {
    message: string
}

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

const getCommentsByPostId = (postId: string) => {
    const abortController = new AbortController()
    const request = apiClient.get<Comment[]>(`/comments?postId=${postId}`,
        { signal: abortController.signal })
    return { request, abort: () => abortController.abort() }
}

const createComment = (postId: string, comment: CommentRequest) => {
    const abortController = new AbortController()
    const request = apiClient.post<Comment>(`/comments/${postId}`,
        comment,
        { 
            signal: abortController.signal,
            headers: getAuthHeader()
        })
    return { request, abort: () => abortController.abort() }
}

const updateComment = (id: string, comment: CommentRequest) => {
    const abortController = new AbortController()
    const request = apiClient.put<Comment>(`/comments/${id}`,
        comment,
        {
            signal: abortController.signal,
            headers: getAuthHeader()
        })
    return { request, abort: () => abortController.abort() }
}

const deleteComment = (id: string) => {
    const abortController = new AbortController()
    const request = apiClient.delete<Comment>(`/comments/${id}`,
        {
            signal: abortController.signal,
            headers: getAuthHeader()
        })
    return { request, abort: () => abortController.abort() }
}

export default { getCommentsByPostId, createComment, updateComment, deleteComment }
