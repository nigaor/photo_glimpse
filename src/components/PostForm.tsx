'use client';

import { useState } from 'react';

interface PostFormProps {
  position: { lat: number; lng: number } | null;
  onSubmit: (comment: string, file: File) => void;
}

export default function PostForm({ position, onSubmit }: PostFormProps) {
  const [comment, setComment] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!position) {
      setError('地図上で場所を選択してください。');
      return;
    }
    if (!file) {
      setError('画像を選択してください。');
      return;
    }
    if (!comment) {
        setError('コメントを入力してください。');
        return;
    }
    onSubmit(comment, file);
    setComment('');
    setFile(null);
    setError(null);
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg z-10 w-80">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700">コメント</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
            placeholder='一言コメント...'
          />
        </div>
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700">画像</label>
          <input
            id="file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
          />
        </div>
        {position && (
          <p className="text-sm text-gray-500">
            選択中の場所: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
          </p>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">投稿</button>
      </form>
    </div>
  );
}
