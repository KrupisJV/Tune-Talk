"use client"

import { useState, useEffect } from "react"
import { Upload, Loader2, Home, Trash2 } from "lucide-react"

const API_URL = "krupis.kantans.com"

const RecommendedPlaylists = () => {
  const [spotifyUrl, setSpotifyUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [playlists, setPlaylists] = useState([])
  const [fetchingPlaylists, setFetchingPlaylists] = useState(true)

  const user = JSON.parse(localStorage.getItem("user") || '{"username":"Guest"}')

  const fetchPlaylists = async () => {
    setFetchingPlaylists(true)
    try {
      const res = await fetch(`${API_URL}/get_playlist.php`)
      if (!res.ok) throw new Error("Failed to load playlists.")
      const text = await res.text()
      let data = JSON.parse(text)
      if (!Array.isArray(data)) {
        data = Array.isArray(data.playlists) ? data.playlists : []
      }
      setPlaylists(data)
      localStorage.setItem("cachedPlaylists", JSON.stringify(data))
    } catch (err) {
      const cachedData = localStorage.getItem("cachedPlaylists")
      if (cachedData) {
        try {
          setPlaylists(JSON.parse(cachedData))
        } catch (e) {
          console.error("Error parsing cached playlists:", e)
        }
      }
    } finally {
      setFetchingPlaylists(false)
    }
  }

  useEffect(() => {
    fetchPlaylists()
  }, [])

  const handleAddPlaylist = async (e) => {
    e.preventDefault()
    setError("")
    setSuccessMsg("")

    if (!spotifyUrl.trim()) {
      setError("Please enter a Spotify playlist URL.")
      return
    }

    setIsLoading(true)

    try {
      const oEmbedRes = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl.trim())}`)
      if (!oEmbedRes.ok) throw new Error("Invalid Spotify URL or failed to fetch metadata.")
      const metadata = await oEmbedRes.json()

      const newPlaylist = {
        title: metadata.title || `Playlist ${playlists.length + 1}`,
        url: spotifyUrl.trim(),
        owner: user.username,
        cover:
          metadata.thumbnail_url || `https://via.placeholder.com/300x300.png?text=Playlist+${playlists.length + 1}`,
      }

      const response = await fetch(`${API_URL}/add_playlist.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPlaylist),
      })

      const responseText = await response.text()
      const data = JSON.parse(responseText)

      if (!response.ok || data.error) {
        throw new Error(data.message || "Failed to add playlist.")
      }

      setSuccessMsg("Playlist uploaded successfully!")
      setSpotifyUrl("")

      const newPlaylistWithId = {
        ...newPlaylist,
        id: data.id || Date.now().toString(),
      }

      setPlaylists((prevPlaylists) => {
        const updatedPlaylists = [newPlaylistWithId, ...prevPlaylists]
        localStorage.setItem("cachedPlaylists", JSON.stringify(updatedPlaylists))
        return updatedPlaylists
      })

      setTimeout(fetchPlaylists, 500)
    } catch (err) {
      console.error("Error adding playlist:", err)
      setError(err.message || "Something went wrong.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm("Are you sure you want to delete this playlist?")) return

    try {
      const res = await fetch(`${API_URL}/delete_playlist.php?id=${playlistId}`, {
        method: "DELETE",
      })

      const responseText = await res.text()
      const data = JSON.parse(responseText)

      if (data.error) {
        throw new Error(data.message || "Failed to delete playlist.")
      }

      setPlaylists((prev) => {
        const updated = prev.filter((pl) => pl.id !== playlistId)
        localStorage.setItem("cachedPlaylists", JSON.stringify(updated))
        return updated
      })
    } catch (err) {
      console.error("Error deleting playlist:", err)
      alert(err.message || "Failed to delete playlist.")
    }
  }

  return (
    <div className="min-h-screen p-6 bg-black text-white">
      <h2 className="text-4xl font-bold mb-6">Upload a Playlist</h2>

      <form onSubmit={handleAddPlaylist} className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="url"
          placeholder="Paste Spotify Playlist Link"
          className="flex-1 p-3 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-red-500"
          value={spotifyUrl}
          onChange={(e) => setSpotifyUrl(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg font-semibold flex items-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
          Upload
        </button>
      </form>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {successMsg && <div className="text-green-500 mb-4">{successMsg}</div>}

      {fetchingPlaylists ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 size={40} className="animate-spin text-red-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
          {playlists && playlists.length > 0 ? (
            playlists.map((playlist, index) => (
              <div
                key={playlist.id || index}
                className="relative bg-gray-900 p-3 rounded-xl hover:bg-gray-800 transition group"
              >
                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeletePlaylist(playlist.id)
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-red-700 hover:bg-red-800 text-white opacity-0 group-hover:opacity-100 transition"
                  title="Delete Playlist"
                >
                  <Trash2 size={16} />
                </button>

                <div onClick={() => window.open(playlist.url, "_blank")}>
                  <img
                    src={playlist.cover || "/placeholder.svg?height=300&width=300"}
                    alt={playlist.title}
                    className="w-full h-48 object-cover rounded-md mb-3"
                    onError={(e) => {
                      e.target.src = "/placeholder.svg?height=300&width=300"
                    }}
                  />
                  <h3 className="text-lg font-semibold truncate">{playlist.title || "Untitled Playlist"}</h3>
                  <p className="text-sm text-gray-400">By {playlist.owner || "Unknown"}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-400 py-10">
              No playlists found. Add your first playlist above!
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <button
          onClick={() => (window.location.href = "/")}
          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 py-3 px-6 rounded-full text-sm font-semibold transition shadow-md"
        >
          <Home size={16} /> Home
        </button>
      </div>
    </div>
  )
}

export default RecommendedPlaylists
