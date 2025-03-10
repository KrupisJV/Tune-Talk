import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imagePreview, setImagePreview] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [newBio, setNewBio] = useState("");
    const [newCaption, setNewCaption] = useState("");
    const [userPosts, setUserPosts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfileFromStorage = () => {
            const user = JSON.parse(localStorage.getItem("user"));
            const posts = JSON.parse(localStorage.getItem("posts")) || [];
            
            if (user) {
                setUser(user);
                setImagePreview(user.profilePicture);
                setNewBio(user.bio || "");
                setNewCaption(user.caption || "");
                setUserPosts(posts.filter(post => post.username === user.username));
            } else {
                navigate("/login");
            }
            setLoading(false);
        };

        fetchProfileFromStorage();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                const updatedUser = { ...user, profilePicture: reader.result };
                setUser(updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveChanges = (e) => {
        e.preventDefault();
        const updatedUser = { ...user, bio: newBio, caption: newCaption };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setEditMode(false);
    };

    if (loading) return <div className="text-white text-center mt-10">Loading...</div>;

    if (!user) return <div className="text-white text-center mt-10">No profile data available.</div>;

    return (
        <div className="flex flex-col items-center min-h-screen bg-black text-white">
            <header className="flex justify-center items-center">
                <nav className="flex gap-6">
                    <a href="/" className="text-white/80 hover:text-white transition">Home</a>
                    <a href="/posts" className="text-white/80 hover:text-white transition">Posts</a>
                    <a href="/recommended-playlists" className="text-white/80 hover:text-white transition">Recommended</a>
                </nav>
                <div className="flex gap-4">
                    <button onClick={() => setEditMode(true)} className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700 transition">
                        Edit Profile
                    </button>
                    <button className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </header>

            <main className="mt-20 w-full max-w-md text-center p-6">
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <img
                            src={imagePreview || user.profilePicture || "/default-avatar.png"}
                            alt={user.username}
                            className="w-32 h-32 rounded-full border-4 border-red-600"
                        />
                        <input
                            type="file"
                            accept="image/*"
                            id="profile-picture-upload"
                            onChange={handleProfilePictureChange}
                            className="hidden"
                        />
                        <label
                            htmlFor="profile-picture-upload"
                            className="bg-red-600 px-3 py-1 rounded cursor-pointer hover:bg-red-700 transition mt-2 inline-block"
                        >
                            Change Picture
                        </label>
                    </div>
                    <h1 className="mt-4 text-xl font-bold">{user.username}</h1>
                    <p className="mt-2 text-gray-400">{user.bio || "No bio available."}</p>
                </div>

                <section className="bg-gray-900 p-4 mt-6 rounded-lg shadow-lg">
                    <h2 className="text-lg font-semibold text-red-600">Your Posts</h2>
                    {userPosts.length > 0 ? (
                        <ul className="mt-3 space-y-2">
                            {userPosts.map((post, index) => (
                                <li key={index} className="bg-gray-800 p-3 rounded">
                                    <p className="text-white">{post.content}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400 mt-2">No posts available.</p>
                    )}
                </section>

                <section className="bg-gray-900 p-4 mt-6 rounded-lg shadow-lg">
                    <h2 className="text-lg font-semibold text-red-600">Details</h2>
                    {editMode ? (
                        <form onSubmit={handleSaveChanges} className="flex flex-col gap-3">
                            <label className="text-left">
                                <span className="text-gray-400">Bio:</span>
                                <textarea
                                    value={newBio}
                                    onChange={(e) => setNewBio(e.target.value)}
                                    className="w-full p-2 rounded bg-gray-800 text-white mt-1"
                                />
                            </label>
                            <label className="text-left">
                                <span className="text-gray-400">Caption:</span>
                                <textarea
                                    value={newCaption}
                                    onChange={(e) => setNewCaption(e.target.value)}
                                    className="w-full p-2 rounded bg-gray-800 text-white mt-1"
                                />
                            </label>
                            <button type="submit" className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition">
                                Save Changes
                            </button>
                            <button type="button" onClick={() => setEditMode(false)} className="text-gray-400 mt-2">
                                Cancel
                            </button>
                        </form>
                    ) : (
                        <div>
                            <p className="text-gray-400">
                                <span className="text-white font-semibold">Bio:</span> {user.bio || "No bio available."}
                            </p>
                            <p className="text-gray-400 mt-2">
                                <span className="text-white font-semibold">Caption:</span> {user.caption || "No caption available."}
                            </p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default Profile;
