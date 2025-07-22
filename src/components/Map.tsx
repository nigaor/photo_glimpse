'use client';

import { useState, useCallback } from 'react';
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { supabase } from '@/utils/supabaseClient';
import PostForm from './PostForm';

export default function Map() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

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

    const { data: urlData } = supabase.storage
      .from('posts')
      .getPublicUrl(filePath);

    if (!urlData) {
        console.error('Error getting public url');
        return;
    }

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
      await supabase.storage.from('posts').remove([filePath]);
      return;
    }

    alert('投稿が完了しました！');
    setSelectedPosition(null);
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <>
      <PostForm position={selectedPosition} onSubmit={handleSubmit} />
      <GoogleMap
        zoom={10}
        center={{ lat: 35.681236, lng: 139.767125 }}
        mapContainerClassName="map-container"
        onClick={handleMapClick}
      >
        {selectedPosition && <Marker position={selectedPosition} />}
      </GoogleMap>
    </>
  );
}
