'use client';

import { useState, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { supabase } from '@/utils/supabaseClient';
import { Post } from '@/types';

interface MapProps {
  selectedPosition: google.maps.LatLngLiteral | null;
  onMapClick: (e: google.maps.MapMouseEvent) => void;
}

export default function Map({ selectedPosition, onMapClick }: MapProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const [posts, setPosts] = useState<Post[]>([]);
  const [activePost, setActivePost] = useState<Post | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching posts:', error);
      } else {
        setPosts(data as Post[]);
      }
    };

    fetchPosts();
  }, []);

  const handleLike = async (post: Post) => {
    // Optimistic UI update
    setPosts(posts.map(p => p.id === post.id ? { ...p, likes: p.likes + 1 } : p));
    setActivePost(prev => prev && prev.id === post.id ? { ...prev, likes: prev.likes + 1 } : prev);

    // Call RPC function
    const { error } = await supabase.rpc('increment_likes', { post_id_in: post.id });
    if (error) {
      console.error('Error incrementing likes:', error);
      // Revert optimistic update on error
      setPosts(posts.map(p => p.id === post.id ? { ...p, likes: p.likes - 1 } : p));
      setActivePost(prev => prev && prev.id === post.id ? { ...prev, likes: prev.likes - 1 } : prev);
    }
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap
      zoom={10}
      center={{ lat: 35.681236, lng: 139.767125 }}
      mapContainerClassName="map-container"
      onClick={onMapClick}
    >
      {selectedPosition && <Marker position={selectedPosition} />}

      {posts.map((post) => (
        <Marker
          key={post.id}
          position={{ lat: post.lat, lng: post.lng }}
          onMouseOver={() => setActivePost(post)}
        />
      ))}

      {activePost && (
        <InfoWindow
          position={{ lat: activePost.lat, lng: activePost.lng }}
          onCloseClick={() => setActivePost(null)}
        >
          <div className="flex flex-col gap-2">
            <img src={activePost.image_url} alt={activePost.comment} className="max-w-xs" />
            <p className="text-black">{activePost.comment}</p>
            <div className="flex items-center gap-2">
                <button onClick={() => handleLike(activePost)} className="bg-pink-500 text-white rounded-full px-3 py-1 text-sm">❤️</button>
                <span className="text-black">{activePost.likes} likes</span>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
