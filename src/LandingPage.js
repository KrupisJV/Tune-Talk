"use client"

import { useState, useEffect } from "react"

function LandingPage() {
  const [posts, setPosts] = useState([])
  const [selectedPost, setSelectedPost] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [likedPosts, setLikedPosts] = useState([])
  // Add a new state for comments and comment input
  const [comments, setComments] = useState({})
  const [commentInput, setCommentInput] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [commentsError, setCommentsError] = useState(null)

  // Define the API base URL to ensure consistency
  const API_BASE_URL = "http://krupis.kantans.com"

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Use the consistent API base URL
        const response = await fetch(`${API_BASE_URL}/post.php`)
        if (!response.ok) {
          throw new Error("Failed to fetch posts")
        }
        const data = await response.json()
        setPosts(data)
      } catch (error) {
        console.error("Error fetching posts:", error)
      }
    }
    fetchPosts()
  }, [])

  // Modify the handleOpenModal function to fetch comments when opening a post
  const handleOpenModal = (post) => {
    setSelectedPost(post)
    setCommentsError(null)
    // Clear any existing comments for this post first
    setComments((prev) => ({ ...prev, [post.id]: undefined }))
    // Then fetch new comments 
    fetchComments(post.id)
  }

  const handleCloseModal = () => setSelectedPost(null)
  const toggleMenu = () => setMenuOpen(!menuOpen)

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const getImageUrl = (imagePath) => {
    // Ensure a valid image path
    return imagePath ? `${API_BASE_URL}/${imagePath}` : "/placeholder.svg?height=169&width=300"
  }

  // Get featured post (first post or placeholder)
  const featuredPost = posts.length > 0 ? posts[0] : null

  const handleLikePost = async (postId) => {
    // Update local state to reflect the like change
    setLikedPosts((prevLikedPosts) => {
      if (prevLikedPosts.includes(postId)) {
        return prevLikedPosts.filter((id) => id !== postId) // Unlike if it's already liked
      } else {
        return [...prevLikedPosts, postId] // Like if it's not liked
      }
    })

    try {
      // Send a PATCH request to the backend to update the like count in the database
      const response = await fetch(`${API_BASE_URL}/post.php`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: postId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // After the like update, you can optionally update the UI with the new like count
        console.log("Likes updated:", data.likes)
        // Optionally, you can update the state with the new like count here if needed
      } else {
        console.error("Failed to update likes")
      }
    } catch (error) {
      console.error("Error while liking post:", error)
    }
  }

  // Update the fetchComments function to make the Authorization header optional
  // and add better error handling
  const fetchComments = async (postId) => {
    try {
      console.log(`Fetching comments for post ${postId}`)
      setCommentsError(null)

      // Try with comment.php (singular) instead of comments.php (plural)
      const response = await fetch(`${API_BASE_URL}/comment.php?post_id=${postId}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.status}`)
      }

      const data = await response.json()
      console.log("Comments received:", data)

      // Ensure data is an array before updating state
      const commentsArray = Array.isArray(data) ? data : []

      // Force a state update with the new comments
      setComments((prevComments) => {
        const newComments = { ...prevComments, [postId]: commentsArray }
        console.log("Updated comments state:", newComments)
        return newComments
      })
    } catch (error) {
      console.error("Error fetching comments:", error)
      setCommentsError(`Failed to load comments: ${error.message}`)
      // Set an empty array for this post's comments to indicate we tried loading
      setComments((prev) => ({ ...prev, [postId]: [] }))
    }
  }

  // Also update the handleSubmitComment function to make the Authorization header optional
  const handleSubmitComment = async () => {
    // Log the current login state and token
    const user = JSON.parse(localStorage.getItem("user"))
    const isLoggedIn = !!user
    console.log("User logged in:", isLoggedIn)

    if (!commentInput.trim()) return
    setIsSubmittingComment(true)
    setCommentsError(null)

    try {
      console.log(user)
      const response = await fetch(`${API_BASE_URL}/comment.php`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: selectedPost.id,
          content: commentInput,
          user_id: user.user_id
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to post comment")
      }

      const result = await response.json()

      // Handle successful comment post
      console.log("Comment posted successfully")

      // Create a new comment object
      const newComment = {
        id: result.comment_id || Date.now(), // Use the returned ID or generate a temporary one
        content: commentInput,
        commenter_name: "You", // Or get the actual user name if available
        created_at: new Date().toISOString(),
      }

      // Update the comments state safely
      setComments((prev) => {
        // Make sure we're working with an array
        const currentComments = prev[selectedPost.id] || []
        const commentsArray = Array.isArray(currentComments) ? currentComments : []

        return {
          ...prev,
          [selectedPost.id]: [...commentsArray, newComment],
        }
      })

      setCommentInput("") // Clear the input field
    } catch (error) {
      console.error("Error posting comment:", error.message)
      setCommentsError(`Failed to post comment: ${error.message}`)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const isPostLiked = (postId) => likedPosts.includes(postId)

  useEffect(() => {
    if (selectedPost) {
      console.log("Current comments state:", comments[selectedPost.id])
    }
  }, [comments, selectedPost])

  // Add this debugging function after handleSubmitComment
  const debugComments = () => {
    if (selectedPost) {
      console.log("Current post ID:", selectedPost.id)
      console.log("All comments state:", comments)
      console.log("Comments for this post:", comments[selectedPost.id])

      // Try to force a re-render
      setComments({ ...comments })
    }
  }

  // Helper function to ensure comments are always an array
  const getCommentsArray = (postId) => {
    const postComments = comments[postId]
    if (!postComments) return []
    return Array.isArray(postComments) ? postComments : []
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans">
      {/* Netflix-style header */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-[#141414]" : "bg-transparent"}`}
      >
        <div className="flex items-center justify-between px-4 md:px-16 py-3">
          <div className="flex items-center">
            <div className="text-[#E50914] text-2xl md:text-4xl font-bold tracking-wider mr-8">TUNE TALK</div>
            <div className="hidden md:flex space-x-5">
              <a href="/" className="text-sm text-white/80 hover:text-white/100">
                Home
              </a>
              <a href="/posts" className="text-sm text-white/80 hover:text-white/100">
                Posts
              </a>
              <a href="/recommended-playlists" className="text-sm text-white/80 hover:text-white/100">
                Playlists
              </a>
              <a href="/profile" className="text-sm text-white/80 hover:text-white/100">
                Profile
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <svg
                className="w-5 h-5 text-white/70 absolute left-2 top-1/2 transform -translate-y-1/2 group-hover:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Titles, people, genres"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black/40 border border-transparent focus:border-white/50 text-white pl-9 pr-3 py-1 rounded text-sm w-36 md:w-48 focus:outline-none transition-all"
              />
            </div>
            <button className="md:hidden text-white" onClick={toggleMenu}>
              ☰
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-[#141414] py-4 px-4 border-t border-white/10">
            <div className="flex flex-col space-y-4">
              <a href="/" className="text-white/80 hover:text-white">
                Home
              </a>
              <a href="/posts" className="text-white/80 hover:text-white">
                Posts
              </a>
              <a href="/recommended-playlists" className="text-white/80 hover:text-white">
                Playlists
              </a>
              <a href="/profile" className="text-white/80 hover:text-white">
                Profile
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Netflix-style hero banner */}
      {featuredPost && !searchTerm && (
        <div className="relative w-full h-[56.25vw] max-h-[80vh] min-h-[30rem] overflow-hidden">
          <div className="absolute inset-0 bg-black/30 z-10"></div>
          <img
            src={getImageUrl(featuredPost.image) || "/placeholder.svg"}
            alt={featuredPost.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-[#141414] via-[#141414]/80 to-transparent h-[30vh]"></div>
          <div className="absolute bottom-[20%] left-[4%] md:left-[60px] z-20 max-w-xl">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">{featuredPost.title}</h1>
            <p className="text-base md:text-lg text-white/80 mb-6 line-clamp-3">{featuredPost.content}</p>
            <div className="flex space-x-3">
             
            </div>
          </div>
        </div>
      )}

      <div className={`pb-16 ${searchTerm || !featuredPost ? "pt-24" : "-mt-16"}`}>
        {searchTerm ? (
          <section className="px-4 md:px-16 mb-8">
            <h2 className="text-white text-xl md:text-2xl font-medium mb-2">Search Results</h2>
            <div className="row-container">
              <div className="flex overflow-x-auto space-x-2 pb-4 scrollbar-hide">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex-none w-[160px] md:w-[200px] lg:w-[240px] relative group cursor-pointer"
                    onClick={() => handleOpenModal(post)}
                  >
                    <img
                      src={getImageUrl(post.image) || "/placeholder.svg"}
                      alt={post.title}
                      className="w-full aspect-[16/9] object-cover rounded-sm group-hover:rounded-none transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <h3 className="text-white text-sm font-medium truncate">{post.title}</h3>
                    </div>
                    {/* Like Button */}
                    <div
                      className={`absolute top-2 right-2 p-2 rounded-full bg-black/60 cursor-pointer ${isPostLiked(post.id) ? "bg-red-600" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLikePost(post.id)
                      }}
                    >
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <>
            <section className="px-4 md:px-16 mb-8 relative z-20">
              <h2 className="text-white text-xl md:text-2xl font-medium mb-2">Posts</h2>
              <div className="row-container">
                <div className="flex overflow-x-auto space-x-2 pb-4 scrollbar-hide">
                  {posts.slice(0, 10).map((post) => (
                    <div
                      key={post.id}
                      className="flex-none w-[160px] md:w-[200px] lg:w-[240px] relative group cursor-pointer"
                      onClick={() => handleOpenModal(post)}
                    >
                      <img
                        src={getImageUrl(post.image) || "/placeholder.svg"}
                        alt={post.title}
                        className="w-full aspect-[16/9] object-cover rounded-sm group-hover:rounded-none transition-all duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <h3 className="text-white text-sm font-medium truncate">{post.title}</h3>
                      </div>
                      {/* Like Button */}
                      <div
                        className={`absolute top-2 right-2 p-2 rounded-full bg-black/60 cursor-pointer ${isPostLiked(post.id) ? "bg-red-600" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLikePost(post.id)
                        }}
                      >
                        <svg
                          className="w-5 h-5 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Netflix-style modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={handleCloseModal}>
          <div
            className="relative bg-[#141414] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="absolute top-4 right-4 text-white" onClick={handleCloseModal}>
              X
            </button>
            <div className="flex flex-col md:flex-row md:space-x-6">
              <img
                src={getImageUrl(selectedPost.image) || "/placeholder.svg"}
                alt={selectedPost.title}
                className="w-full md:w-64 h-64 object-cover rounded-md mb-4 md:mb-0"
              />
              <div className="flex-1">
                <h2 className="text-white text-3xl font-bold">{selectedPost.title}</h2>
                <p className="text-white/80 mt-4">{selectedPost.content}</p>
                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={() => handleLikePost(selectedPost.id)}
                    className="bg-red-600 text-white px-6 py-2 rounded font-medium flex items-center"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {isPostLiked(selectedPost.id) ? "Unlike" : "Like"}
                  </button>
                </div>

                {/* Comments Section */}
                <div className="mt-8 border-t border-white/20 pt-6">
                  {/* In the Comments Section, after the h3 heading */}
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white text-xl font-bold">Comments</h3>
                    <button onClick={debugComments} className="text-xs text-white/50 hover:text-white">
                      Refresh Comments
                    </button>
                  </div>

                  {/* Error message display */}
                  {commentsError && (
                    <div className="bg-red-900/50 text-white p-3 rounded mb-4">
                      <p>{commentsError}</p>
                      <p className="text-sm mt-1">
                        Note: It appears the comments.php endpoint doesn't exist. Make sure your backend has the correct
                        API endpoint.
                      </p>
                    </div>
                  )}

                  {/* Comment Form */}
                  <div className="flex space-x-2 mb-6">
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 bg-[#333] text-white px-4 py-2 rounded focus:outline-none focus:ring-1 focus:ring-white/50"
                    />
                    <button
                      onClick={() => handleSubmitComment()}
                      disabled={isSubmittingComment || !commentInput.trim()}
                      className="bg-red-600 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
                    >
                      {isSubmittingComment ? "Posting..." : "Post"}
                    </button>
                  </div>

                  {/* Comments List - Using the helper function to ensure we always have an array */}
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {selectedPost && (
                      <>
                        {comments[selectedPost.id] === undefined ? (
                          <p className="text-white/50 text-center py-4">Loading comments...</p>
                        ) : getCommentsArray(selectedPost.id).length > 0 ? (
                          getCommentsArray(selectedPost.id).map((comment) => (
                            <div key={comment.id || Math.random()} className="bg-[#333] rounded p-3">
                              <div className="flex items-center mb-2">
                                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm font-bold mr-2">
                                  {comment.username
                                    ? comment.username.charAt(0).toUpperCase()
                                    : comment.commentername
                                      ? comment.commentername.charAt(0).toUpperCase()
                                      : "U"}
                                </div>
                                <div>
                                  <p className="text-white text-sm font-medium">
                                    {comment.username || comment.commenter_name || "Anonymous"}
                                  </p>
                                  <p className="text-white/50 text-xs">
                                    {comment.created_at
                                      ? new Date(comment.created_at).toLocaleDateString()
                                      : "Just now"}
                                  </p>
                                </div>
                              </div>
                              <p className="text-white/90 text-sm">{comment.content}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-white/50 text-center py-4">No comments yet. Be the first to comment!</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LandingPage
