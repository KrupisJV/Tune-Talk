import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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

    return (
        <motion.div
            className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex justify-center items-start py-12 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className="w-full max-w-5xl bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-8 flex flex-col md:flex-row gap-8"
                initial={{ scale: 0.95, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {/* Sidebar */}
                <motion.div
                    className="w-full md:w-1/3 flex flex-col items-center text-center"
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <motion.div className="relative group" whileHover={{ scale: 1.05 }}>
                        <motion.img
                            src={imagePreview || user.profilePicture || "/default-avatar.png"}
                            alt={user.username}
                            className="w-36 h-36 md:w-44 md:h-44 rounded-full border-4 border-red-500 object-cover shadow-lg"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 120 }}
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
                            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-red-600 hover:bg-red-700 text-xs font-medium px-3 py-1 rounded-full shadow-md cursor-pointer transition"
                        >
                            Change
                        </label>
                    </motion.div>
                    <h1 className="mt-5 text-2xl font-bold">{user.username}</h1>
                    <p className="mt-2 text-sm text-gray-300">{user.bio || "No bio available."}</p>
                    <div className="flex flex-col gap-2 mt-5 w-full">
                        <button
                            onClick={() => setEditMode(true)}
                            className="bg-red-600 hover:bg-red-700 text-sm font-medium py-2 rounded-full transition shadow-md"
                        >
                            Edit Profile
                        </button>
                        <button
                            onClick={handleLogout}
                            className="bg-gray-700 hover:bg-gray-600 text-sm font-medium py-2 rounded-full transition shadow-md"
                        >
                            Logout
                        </button>
                    </div>
                </motion.div>

                {/* Profile Content */}
                <div className="w-full md:w-2/3">
                    <h2 className="text-2xl font-semibold text-red-400 mb-4 border-b border-white/10 pb-2">
                        Your Posts
                    </h2>

                    <motion.ul
                        className="space-y-4"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: {
                                transition: {
                                    staggerChildren: 0.1
                                }
                            }
                        }}
                    >
                        {userPosts.length > 0 ? (
                            userPosts.map((post, index) => (
                                <motion.li
                                    key={index}
                                    className="bg-gray-800 p-4 rounded-lg shadow-md"
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 }
                                    }}
                                    transition={{ duration: 0.4 }}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <p className="text-white">{post.content}</p>
                                </motion.li>
                            ))
                        ) : (
                            <p className="text-gray-400">You haven't posted anything yet.</p>
                        )}
                    </motion.ul>

                    {/* Edit Profile Section */}
                    <AnimatePresence>
                        {editMode && (
                            <motion.form
                                onSubmit={handleSaveChanges}
                                className="mt-8 bg-gray-800 p-6 rounded-xl shadow-lg space-y-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.4 }}
                            >
                                <h3 className="text-xl font-semibold text-red-400">Edit Your Profile</h3>
                                <div>
                                    <label className="block text-sm text-gray-300 mb-1">Bio</label>
                                    <textarea
                                        value={newBio}
                                        onChange={(e) => setNewBio(e.target.value)}
                                        className="w-full p-3 bg-gray-900 text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-300 mb-1">Caption</label>
                                    <textarea
                                        value={newCaption}
                                        onChange={(e) => setNewCaption(e.target.value)}
                                        className="w-full p-3 bg-gray-900 text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-full text-sm font-medium transition"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditMode(false)}
                                        className="text-sm text-gray-400 hover:underline"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Profile;
