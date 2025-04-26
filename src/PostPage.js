import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Loader2, ArrowLeft } from 'lucide-react';

function PostPage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [author, setAuthor] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (user) {
            setAuthor(user.user_id);
        } else {
            setError("User not found in local storage.");
        }
    }, [user]);

    const validateForm = () => {
        if (!title.trim() || !content.trim() || !author) {
            setError("Please fill in all fields.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccessMessage('');
        if (!validateForm()) return;
        setIsLoading(true);

        const formData = new FormData();
        formData.append('image', image);
        formData.append('title', title);
        formData.append('content', content);
        formData.append('author_id', author);

        try {
            const response = await fetch('http://krupis.kantans.com/post.php', {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage(data.success || "Post created successfully.");
                setTimeout(() => navigate('/'), 1500);
            } else {
                setError(data.error || "Failed to create post.");
            }
        } catch (error) {
            setError("An error occurred: " + error.message);
        } finally {
            setIsLoading(false);
            setTitle('');
            setContent('');
            setImage(null);
        }
    };

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen px-6 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black via-red-800 to-black animate-gradient-move"></div>
            <div className="relative w-full max-w-2xl p-8 bg-gray-800 rounded-2xl shadow-xl border border-gray-700">
                <div className="flex items-center justify-center mb-6">
                    <button onClick={() => navigate('/')} className="text-white hover:text-gray-400 transition">
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-3xl font-bold text-white text-center flex-1">Create a New Post</h2>
                </div>
                {error && <div className="bg-red-500 text-white p-3 rounded-lg text-center mb-4">{error}</div>}
                {successMessage && <div className="bg-green-500 text-white p-3 rounded-lg text-center mb-4">{successMessage}</div>}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <input
                        type="text"
                        placeholder="Title"
                        className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-red-500"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <textarea
                        placeholder="Content"
                        className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-red-500"
                        rows="5"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    ></textarea>
                    <label className="flex items-center justify-center gap-2 w-full bg-gray-700 text-white p-3 rounded-lg cursor-pointer hover:bg-gray-600 transition">
                        <Upload size={20} /> Upload Image
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => setImage(e.target.files[0])}
                            required
                        />
                    </label>
                    <button
                        type="submit"
                        className="w-full bg-red-600 hover:bg-red-700 transition p-3 rounded-xl text-lg font-semibold flex items-center justify-center gap-2"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Create Post'}
                    </button>
                </form>
            </div>
            <style>
                {`
                    @keyframes gradientMove {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                    .animate-gradient-move {
                        background-size: 200% 200%;
                        animation: gradientMove 5s infinite alternate ease-in-out;
                    }
                `}
            </style>
        </div>
    );
}

export default PostPage;
