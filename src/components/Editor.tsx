'use client';

import React, { useRef } from 'react';
import SlideThumbnails from './SlideThumbnails';
import Canvas, { CanvasRef } from './Canvas';
import Toolbar from './Toolbar';
import FileOperations from './FileOperations';
import ImageUploadModal from './ImageUploadModal';

const Editor: React.FC = () => {
  const canvasRef = useRef<CanvasRef>(null);

  const handleExport = (format: 'png' | 'jpeg') => {
    if (canvasRef.current) {
      canvasRef.current.exportCanvas(format);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 p-4 lg:p-8">
      {/* Header with File Operations */}
      <FileOperations onExport={handleExport} />
      
      {/* Toolbar */}
      <Toolbar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar - Slide Thumbnails */}
        <SlideThumbnails />
        
        {/* Main Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8 overflow-auto">
          <div className="bg-white rounded-lg shadow-md p-2 lg:p-4 max-w-full max-h-full flex items-center justify-center">
            <Canvas ref={canvasRef} width={800} height={600} />
          </div>
        </div>
      </div>
      
      {/* Image Upload Modal */}
      <ImageUploadModal />
    </div>
  );
};

export default Editor;

