// PostDetail.js
import React from 'react';
import { useParams } from 'react-router-dom';

const featuredPosts = [
    {
        id: 1,
        title: 'The Evolution of Rock Music',
        content: 'Discover how rock music evolved over the decades.',
        image: 'https://upload.wikimedia.org/wikipedia/en/c/c9/King-Of-Rhythm.jpg'
    },
    {
        id: 2,
        title: 'The Rise of Metal',
        content: 'Explore the origins of heavy metal music.',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Black_Sabbath_%281970%29.jpg/440px-Black_Sabbath_%281970%29.jpg'
    },
    {
        id: 3,
        title: 'Exploring Electronic Music',
        content: 'Dive into the world of electronic beats and rhythms.',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/From_First_To_Last_-_Emo_Nite_2_-_PH_Carl_Pocket_%28cropped%29.jpg/440px-From_First_To_Last_-_Emo_Nite_2_-_PH_Carl_Pocket_%28cropped%29.jpg'
    },
    {
        id: 4,
        title: 'Jazz',
        content: 'Jazz away',
        image: 'https://i.redd.it/tul2qp9zkicd1.jpeg'
    }
];

function PostDetail() {
    const { id } = useParams();
    const post = featuredPosts.find(post => post.id === parseInt(id));

    if (!post) {
        return <h2>Post not found</h2>;
    }

    return (
        <div className="post-detail">
            <h1>{post.title}</h1>
            <img src={post.image} alt={post.title} />
            <p>{post.content}</p>
        </div>
    );
}

export default PostDetail;
