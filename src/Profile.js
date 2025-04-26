import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, LogOut, Save, X, Home } from "lucide-react";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [newBio, setNewBio] = useState("");
    const [newCaption, setNewCaption] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser) {
            navigate("/login");
            return;
        }

        setUser(storedUser);

        // Use correct URL and check if backend is up
        fetch(`http://krupis.kantans.com/tunetalk/profile.php?user_id=${storedUser.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.profile) {
                    setNewBio(data.profile.bio || "");
                    setNewCaption(data.profile.caption || "");
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch profile:", err);
                setLoading(false);
            });
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const handleSaveChanges = async (e) => {
        e.preventDefault();

        // Validate the bio and caption
        if (!newBio && !newCaption) {
            alert("Please enter at least one field to save.");
            return;
        }

        try {
            // Update the URL for the correct backend API
            const res = await fetch("http://krupis.kantans.com/tunetalk/profile.php", { // Use correct URL and port
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user.id,
                    bio: newBio,
                    caption: newCaption
                })
            });

            const result = await res.json();

            if (result.success) {
                const updatedUser = { ...user, bio: newBio, caption: newCaption };
                setUser(updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setEditMode(false);
            } else {
                throw new Error(result.error || "Unknown error occurred while saving profile.");
            }
        } catch (err) {
            console.error("Error saving changes:", err);
            alert("Failed to save profile changes. Please try again later.");
        }
    };

    if (loading) return <div className="text-white text-center mt-10">Loading...</div>;

    return (
        <motion.div
            className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex justify-center items-center py-12 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="w-full max-w-lg aspect-square bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-8 relative flex flex-col items-center text-center">
                {/* Removed Avatar Section */}
                <h1 className="text-xl font-bold text-red-400 bg-white/10 px-4 py-1 rounded-full shadow-inner">
                    @{user.username}
                </h1>
                <p className="mt-2 text-sm text-gray-300 italic max-w-xs">
                    {/* {user.bio || "No bio available."} */}
                </p>

                <div className="flex flex-col gap-3 mt-6 w-full px-4">
                    <button
                        onClick={() => setEditMode(true)}
                        className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 py-2 rounded-full transition shadow-md"
                    >
                        <Pencil size={16} /> Edit Profile
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 py-2 rounded-full transition shadow-md"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 py-2 rounded-full transition shadow-md"
                    >
                        <Home size={16} /> Home
                    </button>
                </div>

                <AnimatePresence>
                    {editMode && (
                        <motion.form
                            onSubmit={handleSaveChanges}
                            className="absolute top-0 left-0 right-0 mx-auto max-w-xl bg-gray-900 p-8 rounded-xl shadow-2xl z-50"
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -50, opacity: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-pink-400">Edit Profile</h3>
                                <button type="button" onClick={() => setEditMode(false)} className="text-gray-400 hover:text-red-500">
                                    <X />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-300 mb-1">Bio</label>
                                    <textarea
                                        value={newBio}
                                        onChange={(e) => setNewBio(e.target.value)}
                                        className="w-full p-3 bg-gray-800 text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-300 mb-1">Caption</label>
                                    <textarea
                                        value={newCaption}
                                        onChange={(e) => setNewCaption(e.target.value)}
                                        className="w-full p-3 bg-gray-800 text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-full text-sm font-medium transition"
                                    >
                                        <Save size={16} /> Save Changes
                                    </button>
                                </div>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default Profile;
