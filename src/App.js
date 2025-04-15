// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import Features from './Features';
import Login from './Login';
import Register from './Register';
import LandingPage from './LandingPage';
import PostPage from './PostPage';
import PostDetail from './PostDetail';
import RecommendedPlaylists from './components/RecommendedPlaylists';
import Profile from './Profile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Router>
            <div className="App">
                <main>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/features" element={<Features />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/posts" element={<PostPage />} />
                        <Route path="/post/:id" element={<PostDetail />} />
                        <Route path="/recommended-playlists" element={<RecommendedPlaylists />} />

                        <Route path="/profile" element={<Profile />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
