import { useEffect, useState, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import postsService, { CanceledError, type Post } from "../services/posts_service"
import { useAuth } from "../context/AuthContext"
import Header from "../components/Header"
import PostCard from "../components/PostCard"

const PAGE_SIZE = 10

function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [page, setPage] = useState<number>(1)
  const [showLikedOnly, setShowLikedOnly] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<Post[] | null>(null)
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  // Initial load
  useEffect(() => {
    setIsLoading(true)
    const { request, abort } = postsService.getPosts(1, PAGE_SIZE)
    request.then((response) => {
      setPosts(response.data.posts)
      setHasMore(response.data.hasMore)
      setPage(1)
      setIsLoading(false)
    }).catch((err) => {
      if (!(err instanceof CanceledError)) {
        setError('Error fetching data...')
        setIsLoading(false)
      }
    })
    return () => { abort() }
  }, [])

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    try {
      const nextPage = page + 1
      const { request } = postsService.getPosts(nextPage, PAGE_SIZE)
      const response = await request
      setPosts(prev => [...prev, ...response.data.posts])
      setHasMore(response.data.hasMore)
      setPage(nextPage)
    } catch (err) {
      if (!(err instanceof CanceledError)) {
        console.error('Error loading more posts:', err)
      }
    } finally {
      setIsLoadingMore(false)
    }
  }, [page, hasMore, isLoadingMore])

  // IntersectionObserver — triggers loadMore when sentinel is visible
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '200px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  const handleLike = async (postId: string) => {
    try {
      const { request } = postsService.toggleLike(postId)
      const response = await request
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, likes: response.data.likes } : p))
      if (searchResults) {
        setSearchResults(prev => prev!.map(p => p._id === postId ? { ...p, likes: response.data.likes } : p))
      }
    } catch (err) {
      console.error('Error toggling like:', err)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) {
      setSearchResults(null)
      return
    }
    setIsSearching(true)
    try {
      const { request } = postsService.searchPosts(q)
      const response = await request
      setSearchResults(response.data)
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchResults(null)
  }

  const displayedPosts = searchResults !== null
    ? searchResults
    : showLikedOnly
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

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search posts with AI..."
                style={{
                  padding: '8px 14px',
                  fontSize: '14px',
                  border: '1px solid #cbd5e0',
                  borderRadius: '8px',
                  outline: 'none',
                  width: '220px',
                }}
              />
              <button
                type="submit"
                disabled={isSearching}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#ffffff',
                  backgroundColor: '#805ad5',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isSearching ? 'not-allowed' : 'pointer',
                  opacity: isSearching ? 0.7 : 1,
                }}
              >
                {isSearching ? '...' : '🔍 Search'}
              </button>
              {searchResults !== null && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  style={{
                    padding: '8px 12px',
                    fontSize: '14px',
                    color: '#718096',
                    backgroundColor: '#edf2f7',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  ✕ Clear
                </button>
              )}
            </form>
          </div>

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
        {error && (
          <div style={{
            backgroundColor: '#fed7d7',
            color: '#9b2c2c',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>{error}</div>
        )}

        {displayedPosts.length === 0 && !isLoading && !isSearching && (
          <div style={{
            backgroundColor: '#ffffff',
            padding: '60px 40px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
          }}>
            <p style={{ fontSize: '18px', color: '#718096', margin: 0 }}>
              {searchResults !== null ? 'No posts matched your search.' : showLikedOnly ? "You haven't liked any posts yet." : 'No posts yet. Be the first to create one!'}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

        {/* Sentinel for IntersectionObserver — only active when showing all posts, not during search */}
        {!showLikedOnly && searchResults === null && <div ref={sentinelRef} style={{ height: '1px' }} />}

        {isLoadingMore && (
          <p style={{ textAlign: 'center', color: '#718096', fontSize: '14px', padding: '16px 0' }}>
            Loading more posts...
          </p>
        )}

        {!hasMore && posts.length > 0 && !showLikedOnly && (
          <p style={{ textAlign: 'center', color: '#a0aec0', fontSize: '13px', padding: '16px 0' }}>
            You've reached the end
          </p>
        )}
      </div>
    </div>
  )
}

export default PostsPage
