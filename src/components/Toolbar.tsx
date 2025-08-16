'use client';

import React, { useCallback, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { setSelectedTool, updateElementProperties, setShowImageUpload } from '@/lib/uiSlice';
import { ToolType } from '@/lib/uiSlice';
import { undo, redo } from '@/lib/slidesSlice';

const Toolbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedTool, elementProperties, selectedElementId } = useAppSelector(state => state.ui);

  const tools = useMemo(() => [
    { type: 'select' as ToolType, icon: '👆', label: 'Select' },
    { type: 'text' as ToolType, icon: 'T', label: 'Text' },
    { type: 'rect' as ToolType, icon: '⬜', label: 'Rectangle' },
    { type: 'circle' as ToolType, icon: '⭕', label: 'Circle' },
    { type: 'line' as ToolType, icon: '➖', label: 'Line' },
    { type: 'image' as ToolType, icon: '🖼️', label: 'Image' },
  ], []);

  const handleToolSelect = useCallback((tool: ToolType) => {
    try {
      dispatch(setSelectedTool(tool));
    } catch (error) {
      console.error('Error selecting tool:', error);
    }
  }, [dispatch]);

  const handlePropertyChange = useCallback((property: keyof typeof elementProperties, value: string | number) => {
    try {
      dispatch(updateElementProperties({ [property]: value }));
    } catch (error) {
      console.error('Error updating property:', error);
    }
  }, [dispatch]);

  const handleImageUpload = useCallback(() => {
    try {
      dispatch(setShowImageUpload(true));
    } catch (error) {
      console.error('Error showing image upload:', error);
    }
  }, [dispatch]);

  // Memoize tool buttons to prevent unnecessary re-renders
  const toolButtons = useMemo(() => 
    tools.map((tool) => (
      <button
        key={tool.type}
        onClick={() => handleToolSelect(tool.type)}
        className={`p-2 rounded-lg border-2 transition-colors ${
          selectedTool === tool.type
            ? 'border-blue-500 bg-blue-50 text-blue-600'
            : 'border-gray-200 hover:border-gray-300'
        }`}
        title={tool.label}
      >
        <span className="text-lg">{tool.icon}</span>
      </button>
    )), [tools, selectedTool, handleToolSelect]
  );

  // Memoize property controls to prevent unnecessary re-renders
  const propertyControls = useMemo(() => {
    if (!selectedElementId) return null;

    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Fill:</label>
          <input
            type="color"
            value={elementProperties.fill}
            onChange={(e) => handlePropertyChange('fill', e.target.value)}
            className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Stroke:</label>
          <input
            type="color"
            value={elementProperties.stroke}
            onChange={(e) => handlePropertyChange('stroke', e.target.value)}
            className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Stroke Width:</label>
          <input
            type="number"
            min="0"
            max="20"
            value={elementProperties.strokeWidth}
            onChange={(e) => handlePropertyChange('strokeWidth', parseInt(e.target.value) || 1)}
            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </div>

        {selectedTool === 'text' && (
          <>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Font Size:</label>
              <input
                type="number"
                min="8"
                max="72"
                value={elementProperties.fontSize}
                onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value) || 16)}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Font:</label>
              <select
                value={elementProperties.fontFamily}
                onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
              </select>
            </div>
          </>
        )}
      </div>
    );
  }, [selectedElementId, selectedTool, elementProperties, handlePropertyChange]);

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center space-x-4">
        {/* Tools */}
        <div className="flex items-center space-x-2">
          {toolButtons}
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200"></div>

        {/* Element Properties */}
        {propertyControls}

        {/* Image Upload Button */}
        {selectedTool === 'image' && (
          <button
            onClick={handleImageUpload}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Upload Image
          </button>
        )}

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200"></div>

        {/* Undo/Redo Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => dispatch(undo())}
            className="p-2 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
            title="Undo"
          >
            <span className="text-lg">↩️</span>
          </button>
          <button
            onClick={() => dispatch(redo())}
            className="p-2 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
            title="Redo"
          >
            <span className="text-lg">↪️</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
