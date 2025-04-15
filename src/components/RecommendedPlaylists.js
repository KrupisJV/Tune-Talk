import React, { useState, useEffect } from "react";
import { Upload, Loader2 } from "lucide-react";

const API_URL = "http://localhost:8887";

const RecommendedPlaylists = () => {
    const [spotifyUrl, setSpotifyUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [playlists, setPlaylists] = useState([]);

    const user = JSON.parse(localStorage.getItem("user")) || { username: "Guest" };

    // Fetch playlists from backend
    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const res = await fetch(`${API_URL}/get_playlist.php`);
                if (!res.ok) throw new Error("Failed to load playlists.");
                const data = await res.json();
                setPlaylists(data);
            } catch (err) {
                console.error("Fetch error:", err.message);
            }
        };
        fetchPlaylists();
    }, []);

    const handleAddPlaylist = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMsg("");

        if (!spotifyUrl.trim()) {
            setError("Please enter a Spotify playlist URL.");
            return;
        }

        setIsLoading(true);

        try {
            const newPlaylist = {
                title: `Playlist ${playlists.length + 1}`,
                url: spotifyUrl.trim(),
                owner: user.username,
                cover: `https://via.placeholder.com/300x300.png?text=Playlist+${playlists.length + 1}`
            };

            const response = await fetch(`${API_URL}/add_playlist.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newPlaylist)
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                throw new Error(data.message || "Failed to add playlist.");
            }

            setSuccessMsg("Playlist uploaded successfully!");
            setSpotifyUrl("");
            setPlaylists([data, ...playlists]); // add new playlist to top
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-6 bg-black text-white">
            <h2 className="text-4xl font-bold mb-6">Upload a Playlist</h2>

            <form onSubmit={handleAddPlaylist} className="flex gap-4 mb-6">
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

            {/* Playlist Display Section */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-10">
                {playlists.map((playlist) => (
                    <div
                        key={playlist.id}
                        className="bg-gray-900 p-3 rounded-xl hover:bg-gray-800 transition cursor-pointer"
                        onClick={() => window.open(playlist.url, "_blank")}
                    >
                        <img
                            src={playlist.cover}
                            alt={playlist.title}
                            className="w-full h-48 object-cover rounded-md mb-3"
                        />
                        <h3 className="text-lg font-semibold truncate">{playlist.title}</h3>
                        <p className="text-sm text-gray-400">By {playlist.owner}</p>
                    </div>
                ))}
            </div>
            
        </div>
    );
};

export default RecommendedPlaylists;
