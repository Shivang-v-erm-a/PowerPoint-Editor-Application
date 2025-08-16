'use client';

import React, { useCallback, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { addSlide, deleteSlide, setActiveSlide, clearError } from '@/lib/slidesSlice';

const SlideThumbnails: React.FC = () => {
  const dispatch = useAppDispatch();
  const { slides, activeSlideId, error } = useAppSelector(state => state.slides);

  const handleAddSlide = useCallback(() => {
    try {
      dispatch(addSlide());
    } catch (error) {
      console.error('Error adding slide:', error);
    }
  }, [dispatch]);

  const handleDeleteSlide = useCallback((slideId: string) => {
    try {
      if (slides.length > 1) {
        dispatch(deleteSlide(slideId));
      }
    } catch (error) {
      console.error('Error deleting slide:', error);
    }
  }, [dispatch, slides.length]);

  const handleSelectSlide = useCallback((slideId: string) => {
    try {
      dispatch(setActiveSlide(slideId));
    } catch (error) {
      console.error('Error selecting slide:', error);
    }
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Memoize slide thumbnails to prevent unnecessary re-renders
  const slideThumbnails = useMemo(() => 
    slides.map((slide, index) => (
      <div
        key={`slide-${slide.id}`}
        className={`relative cursor-pointer rounded-lg border-2 transition-all ${
          activeSlideId === slide.id
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => handleSelectSlide(slide.id)}
      >
        {/* Slide Number */}
        <div className="absolute top-2 left-2 bg-gray-600 text-white text-xs px-2 py-1 rounded">
          {index + 1}
        </div>

        {/* Delete Button */}
        {slides.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteSlide(slide.id);
            }}
            className="absolute top-2 right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
            title="Delete Slide"
          >
            ×
          </button>
        )}

        {/* Slide Thumbnail */}
        <div className="w-full h-32 bg-white rounded-lg p-2 mt-6">
          {slide.elements.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              Empty Slide
            </div>
          ) : (
            <div className="w-full h-full relative">
              {/* Render a simplified version of slide elements */}
              {slide.elements.slice(0, 5).map((element, elementIndex) => (
                <div
                  key={`${slide.id}-element-${elementIndex}`}
                  className="absolute"
                  style={{
                    left: `${(element.left / 800) * 100}%`,
                    top: `${(element.top / 600) * 100}%`,
                    width: element.width ? `${(element.width / 800) * 100}%` : 'auto',
                    height: element.height ? `${(element.height / 600) * 100}%` : 'auto',
                  }}
                >
                  {element.type === 'text' && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                  {element.type === 'rect' && (
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                  )}
                  {element.type === 'circle' && (
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  )}
                  {element.type === 'line' && (
                    <div className="w-3 h-0.5 bg-orange-500"></div>
                  )}
                  {element.type === 'image' && (
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )), [slides, activeSlideId, handleSelectSlide, handleDeleteSlide]
  );

  return (
    <div className="w-full lg:w-64 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200 p-4 overflow-x-auto lg:overflow-y-auto flex lg:flex-col">
      <div className="flex items-center justify-between mb-4 lg:flex-col lg:items-start">
        <h2 className="text-lg font-semibold text-gray-800 mb-0 lg:mb-4">Slides</h2>
        <button
          onClick={handleAddSlide}
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex-shrink-0"
          title="Add New Slide"
        >
          <span className="text-lg">+</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-red-700 text-sm">{error}</span>
            <button
              onClick={handleClearError}
              className="text-red-500 hover:text-red-700 text-lg"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="flex lg:flex-col space-x-3 lg:space-x-0 lg:space-y-3 pb-4 lg:pb-0">
        {slideThumbnails}
      </div>

      {slides.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <p>No slides yet</p>
          <button
            onClick={handleAddSlide}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create First Slide
          </button>
        </div>
      )}
    </div>
  );
};

export default SlideThumbnails;
