'use client';

import React, { useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { loadPresentation, clearPresentation, Slide } from '@/lib/slidesSlice';
import { resetUI } from '@/lib/uiSlice';

interface FileOperationsProps {
  onExport: (format: 'png' | 'jpeg') => void;
}

const FileOperations: React.FC<FileOperationsProps> = ({ onExport }) => {
  const dispatch = useAppDispatch();
  const { slides } = useAppSelector((state) => state.slides);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const presentationData = JSON.stringify(slides, null, 2);
    const blob = new Blob([presentationData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `presentation-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const presentationData = JSON.parse(e.target?.result as string) as Slide[];
        if (Array.isArray(presentationData) && presentationData.length > 0) {
          dispatch(resetUI());
          dispatch(loadPresentation(presentationData));
        } else {
          alert('Invalid presentation file format.');
        }
      } catch {
        alert('Error loading presentation file. Please check the file format.');
      }
    };

    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleNew = () => {
    if (
      confirm(
        'Are you sure you want to create a new presentation? This will clear all current slides.'
      )
    ) {
      dispatch(resetUI());
      dispatch(clearPresentation());
    }
  };

  const handleSharePresentation = async () => {
    try {
      const response = await fetch('/api/presentations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presentation: slides }),
      });

      if (response.ok) {
        const { id } = await response.json();
        alert(
          `Presentation shared! Share this ID: ${id}\n(Link: ${window.location.origin}?load=${id})`
        );
      } else {
        const errorData = await response.json();
        alert(`Failed to share presentation: ${errorData.error || response.statusText}`);
      }
    } catch (err) {
      console.error('Error sharing presentation:', err);
      alert('An unexpected error occurred while sharing the presentation.');
    }
  };

  const handleLoadSharedPresentation = async () => {
    const id = prompt('Enter the presentation ID to load:');
    if (!id) return;

    try {
      const response = await fetch(`/api/presentations?id=${id}`);
      if (response.ok) {
        const { presentation } = await response.json();
        if (Array.isArray(presentation) && presentation.length > 0) {
          dispatch(resetUI());
          dispatch(loadPresentation(presentation));
          alert('Presentation loaded successfully!');
        } else {
          alert('Invalid presentation data received from shared ID.');
        }
      } else {
        const errorData = await response.json();
        alert(`Failed to load shared presentation: ${errorData.error || response.statusText}`);
      }
    } catch (err) {
      console.error('Error loading shared presentation:', err);
      alert('An unexpected error occurred while loading the shared presentation.');
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center space-x-3">
        <button
          onClick={handleNew}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          New
        </button>

        <button
          onClick={handleSave}
          disabled={slides.length === 0}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Save
        </button>

        <label className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
          Load
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleLoad}
            className="hidden"
          />
        </label>

        <div className="w-px h-8 bg-gray-200 mx-2"></div>

        <button
          onClick={() => onExport('png')}
          disabled={slides.length === 0}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Export PNG
        </button>
        <button
          onClick={() => onExport('jpeg')}
          disabled={slides.length === 0}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Export JPEG
        </button>

        <div className="w-px h-8 bg-gray-200 mx-2"></div>

        <button
          onClick={handleSharePresentation}
          disabled={slides.length === 0}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Share (API)
        </button>
        <button
          onClick={handleLoadSharedPresentation}
          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
        >
          Load Shared (API)
        </button>
      </div>

      <div className="mt-2 text-sm text-gray-500">
        {slides.length} slide{slides.length !== 1 ? 's' : ''} in presentation
      </div>
    </div>
  );
};

export default FileOperations;
