
"use client"

import { useState, useEffect } from "react"

function LandingPage() {
  const [posts, setPosts] = useState([])
  const [selectedPost, setSelectedPost] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE}/post.php`)
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

  const handleOpenModal = (post) => setSelectedPost(post)
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
    return imagePath ? `http://localhost:8887/${imagePath}` : "/placeholder.svg?height=169&width=300"
  }

  // Get featured post (first post or placeholder)
  const featuredPost = posts.length > 0 ? posts[0] : null

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
              <button
                onClick={() => handleOpenModal(featuredPost)}
                className="bg-white text-black px-6 py-2 rounded font-medium flex items-center hover:bg-white/90"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                Read
              </button>
              <button
                onClick={() => handleOpenModal(featuredPost)}
                className="bg-[#6d6d6eb3] text-white px-6 py-2 rounded font-medium flex items-center hover:bg-[#6d6d6e]"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                More Info
              </button>
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
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <>
            <section className="px-4 md:px-16 mb-8 relative z-20">
              <h2 className="text-white text-xl md:text-2xl font-medium mb-2">Popular on Tune Talk</h2>
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
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="px-4 md:px-16 mb-8">
              <h2 className="text-white text-xl md:text-2xl font-medium mb-2">Trending Now</h2>
              <div className="row-container">
                <div className="flex overflow-x-auto space-x-2 pb-4 scrollbar-hide">
                  {posts
                    .slice(0, 10)
                    .reverse()
                    .map((post) => (
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
            className="bg-[#181818] text-white rounded-md shadow-2xl w-full max-w-4xl mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={getImageUrl(selectedPost.image) || "/placeholder.svg"}
                alt={selectedPost.title}
                className="w-full h-[40vh] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181818] to-transparent"></div>
              <button
                className="absolute top-4 right-4 text-white/70 hover:text-white bg-[#181818]/60 hover:bg-[#181818]/80 rounded-full p-1"
                onClick={handleCloseModal}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-3xl font-bold mb-2">{selectedPost.title}</h3>
                <div className="flex space-x-3 mb-4">
                  <button className="bg-white text-black px-5 py-1.5 rounded-md font-medium flex items-center hover:bg-white/90">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Play
                  </button>
                  <button className="bg-[#2a2a2a] text-white/90 p-2 rounded-full hover:bg-[#2a2a2a]/80">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <button className="bg-[#2a2a2a] text-white/90 p-2 rounded-full hover:bg-[#2a2a2a]/80">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 pt-0">
              <div className="flex space-x-4 mb-6">
              </div>
              <p className="text-white/90 text-base mb-6">{selectedPost.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LandingPage

