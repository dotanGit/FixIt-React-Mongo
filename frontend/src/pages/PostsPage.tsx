import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import postsService, { CanceledError, type Post } from "../services/posts_service"
import Header from "../components/Header"
import PostCard from "../components/PostCard"

function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const navigate = useNavigate()

  useEffect(() => {
    setIsLoading(true)
    const { request, abort } = postsService.getPosts()
    request.then((response) => {
      setPosts(response.data)
      setIsLoading(false)
    }).catch((error) => {
      if (!(error instanceof CanceledError)) {
        setError('Error fetching data...')
        setIsLoading(false)
      }
    })
    return () => { abort() }
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f7fa',
    }}>
      <Header />

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '84px 20px 20px',
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#1a202c',
          margin: '0 0 24px 0',
        }}>Posts</h1>

        {isLoading && <p style={{ color: '#718096', fontSize: '16px' }}>Loading posts...</p>}
        {error && <div style={{
          backgroundColor: '#fed7d7',
          color: '#9b2c2c',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>{error}</div>}

        {posts.length === 0 && !isLoading && (
          <div style={{
            backgroundColor: '#ffffff',
            padding: '60px 40px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
          }}>
            <p style={{
              fontSize: '18px',
              color: '#718096',
              margin: 0
            }}>No posts yet. Be the first to create one!</p>
          </div>
        )}

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onClick={() => navigate(`/posts/${post._id}`)}
              variant="large"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default PostsPage
