import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function PostPage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [author, setAuthor] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [posts, setPosts] = useState([]);

    const navigate = useNavigate(); // Import navigation hook
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (user) {
            setAuthor(user.username);
        } else {
            setError("User not found in local storage.");
        }
    }, [user]);

    const fetchPosts = async () => {
        try {
            const response = await fetch('http://localhost:8887/post.php');
            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }
            const data = await response.json();
            
            const updatedPosts = data.map(post => ({
                ...post,
                image: post.image ? `http://localhost:8887/uploads/${post.image}` : "/placeholder.svg"
            }));
            
            setPosts(updatedPosts);
        } catch (error) {
            setError("An error occurred while fetching posts: " + error.message);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const validateForm = () => {
        if (!title.trim() || !content.trim() || !author.trim()) {
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
        formData.append('author', author);

        try {
            const response = await fetch('http://localhost:8887/post.php', {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage(data.success || "Post created successfully.");
                navigate('/'); // Redirect to landing page
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
        <div className="bg-black min-h-screen text-white px-8 py-4">
            <h2 className="text-4xl font-bold mb-6">Create a New Post</h2>
            {error && <div className="bg-red-600 text-white p-3 rounded mb-4">{error}</div>}
            {successMessage && <div className="bg-green-600 text-white p-3 rounded mb-4">{successMessage}</div>}
            <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg mx-auto">
                <input
                    type="text"
                    placeholder="Title"
                    className="w-full p-3 bg-gray-700 text-white rounded mb-3"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <textarea
                    placeholder="Content"
                    className="w-full p-3 bg-gray-700 text-white rounded mb-3"
                    rows="5"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                ></textarea>
                <input
                    type="file"
                    accept="image/*"
                    className="w-full bg-gray-700 text-white p-3 rounded mb-3"
                    onChange={(e) => setImage(e.target.files[0])}
                    required
                />
                <button type="submit" className="w-full bg-red-600 p-3 rounded font-bold hover:bg-red-700" disabled={isLoading}>
                    {isLoading ? 'Creating post...' : 'Create Post'}
                </button>
            </form>
        </div>
    );
}

export default PostPage;
