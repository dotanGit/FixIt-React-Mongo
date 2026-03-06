import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import postsService, { CanceledError, type Post } from "../services/posts_service"
import { useAuth } from "../context/AuthContext"
import Header from "../components/Header"
import PostCard from "../components/PostCard"

function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showLikedOnly, setShowLikedOnly] = useState<boolean>(false)
  const navigate = useNavigate()
  const { user } = useAuth()

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

  const handleLike = async (postId: string) => {
    try {
      const { request } = postsService.toggleLike(postId)
      const response = await request
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, likes: response.data.likes } : p))
    } catch (err) {
      console.error('Error toggling like:', err)
    }
  }

  const displayedPosts = showLikedOnly
    ? posts.filter(p => p.likes?.includes(user?._id ?? ''))
    : posts

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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1a202c',
            margin: 0,
          }}>Posts</h1>

          <div style={{
            display: 'flex',
            gap: '8px',
            backgroundColor: '#e2e8f0',
            borderRadius: '10px',
            padding: '4px',
          }}>
            <button
              onClick={() => setShowLikedOnly(false)}
              style={{
                padding: '7px 18px',
                fontSize: '13px',
                fontWeight: '600',
                color: !showLikedOnly ? '#ffffff' : '#718096',
                backgroundColor: !showLikedOnly ? '#3182ce' : 'transparent',
                border: 'none',
                borderRadius: '7px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              All Posts
            </button>
            <button
              onClick={() => setShowLikedOnly(true)}
              style={{
                padding: '7px 18px',
                fontSize: '13px',
                fontWeight: '600',
                color: showLikedOnly ? '#ffffff' : '#718096',
                backgroundColor: showLikedOnly ? '#e53e3e' : 'transparent',
                border: 'none',
                borderRadius: '7px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              ♥ Liked
            </button>
          </div>
        </div>

        {isLoading && <p style={{ color: '#718096', fontSize: '16px' }}>Loading posts...</p>}
        {error && <div style={{
          backgroundColor: '#fed7d7',
          color: '#9b2c2c',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>{error}</div>}

        {displayedPosts.length === 0 && !isLoading && (
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
            }}>
              {showLikedOnly ? "You haven't liked any posts yet." : "No posts yet. Be the first to create one!"}
            </p>
          </div>
        )}

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {displayedPosts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onClick={() => navigate(`/posts/${post._id}`)}
              variant="large"
              onLike={() => handleLike(post._id)}
              isLiked={post.likes?.includes(user?._id ?? '')}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default PostsPage
