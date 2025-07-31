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
    <div className="bg-gray-50 dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                <div className="w-full sm:w-1/3">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">コメント</label>
                    <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-800 text-black dark:text-white"
                        placeholder='一言コメント...'
                        rows={3}
                    />
                </div>
                <div className="w-full sm:w-1/3">
                    <label htmlFor="file" className="block text-sm font-medium text-gray-700 dark:text-gray-300">画像</label>
                    <input
                        id="file"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 dark:file:bg-violet-900 file:text-violet-700 dark:file:text-violet-300 hover:file:bg-violet-100 dark:hover:file:bg-violet-800"
                    />
                </div>
                <div className="w-full sm:w-1/3 flex flex-col gap-2">
                    {position && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        📍場所選択済み: {position.lat.toFixed(3)}, {position.lng.toFixed(3)}
                    </p>
                    )}
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full">投稿する</button>
                </div>
            </form>
        </div>
    </div>
  );
}
