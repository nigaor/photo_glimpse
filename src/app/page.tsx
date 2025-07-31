'use client';

import { useState, useCallback } from 'react';
import Map from "@/components/Map";
import PostForm from "@/components/PostForm";
import { supabase } from '@/utils/supabaseClient';

export default function Home() {
  const [selectedPosition, setSelectedPosition] = useState<google.maps.LatLngLiteral | null>(null);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setSelectedPosition({
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      });
    }
  }, []);

  const handleSubmit = async (comment: string, file: File) => {
    if (!selectedPosition) return;

    // 1. Upload image to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `posts/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from('posts')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return;
    }

    // 2. Get public URL of the uploaded image
    const { data: urlData } = supabase.storage
      .from('posts')
      .getPublicUrl(filePath);

    if (!urlData) {
        console.error('Error getting public url');
        return;
    }

    // 3. Save post data to Supabase database
    const { error: insertError } = await supabase.from('posts').insert([
      {
        comment,
        image_url: urlData.publicUrl,
        lat: selectedPosition.lat,
        lng: selectedPosition.lng,
      },
    ]);

    if (insertError) {
      console.error('Error inserting post:', insertError);
      // Optionally, delete the uploaded image if the DB insert fails
      await supabase.storage.from('posts').remove([filePath]);
      return;
    }

    alert('投稿が完了しました！');
    setSelectedPosition(null);
  };

  return (
    <main className="flex flex-col h-screen">
      <div className="h-3/5">
        <Map
          selectedPosition={selectedPosition}
          onMapClick={handleMapClick}
        />
      </div>
      <div className="h-2/5">
        <PostForm
          position={selectedPosition}
          onSubmit={handleSubmit}
        />
      </div>
    </main>
  );
}
