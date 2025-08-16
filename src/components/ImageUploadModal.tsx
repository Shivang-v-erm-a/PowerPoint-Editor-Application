'use client';

import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { addElement, SlideElement } from '@/lib/slidesSlice';
import { setShowImageUpload } from '@/lib/uiSlice';
import { generateUniqueId } from '@/lib/utils';

const ImageUploadModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { showImageUpload } = useAppSelector((state) => state.ui);
  const { activeSlideId } = useAppSelector((state) => state.slides);

  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    dispatch(setShowImageUpload(false));
    setImageUrl('');
    setError('');
  };

  const handleUrlSubmit = async () => {
    if (!imageUrl.trim() || !activeSlideId) return;

    setIsLoading(true);
    setError('');

    try {
      const img = new Image();
      img.onload = () => {
        const elementId = generateUniqueId();
        const newElement: SlideElement = {
          id: elementId,
          type: 'image',
          left: 100,
          top: 100,
          width: 200,
          height: 200,
          src: imageUrl,
        };
        dispatch(addElement({ slideId: activeSlideId, element: newElement }));
        handleClose();
      };
      img.onerror = () => {
        setError('Invalid image URL. Please check the URL and try again.');
        setIsLoading(false);
      };
      img.src = imageUrl;
    } catch (error) {
      setError('Failed to load image. Please try again.');
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeSlideId) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    setIsLoading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const elementId = Date.now().toString();
      const newElement: SlideElement = {
        id: elementId,
        type: 'image',
        left: 100,
        top: 100,
        width: 200,
        height: 200,
        src: e.target?.result as string,
      };
      dispatch(addElement({ slideId: activeSlideId, element: newElement }));
      handleClose();
    };
    reader.onerror = () => {
      setError('Failed to read image file. Please try again.');
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  if (!showImageUpload) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Add Image</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL
            </label>
            <div className="flex space-x-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleUrlSubmit}
                disabled={!imageUrl.trim() || isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Loading...' : 'Add'}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OR</span>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Image File
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Supported Formats */}
          <div className="text-xs text-gray-500">
            Supported formats: JPG, PNG, GIF, WebP
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;
