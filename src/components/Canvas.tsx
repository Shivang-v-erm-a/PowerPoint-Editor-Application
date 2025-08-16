'use client';

import React, {
  useEffect,
  useRef,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react';
import * as fabric from 'fabric';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { addElement, updateElement, deleteElement, SlideElement } from '@/lib/slidesSlice';
import { setSelectedElement, setSelectedTool } from '@/lib/uiSlice';
import { generateUniqueId } from '@/lib/utils';
import { debounce } from '@/lib/performance';

export interface CanvasRef {
  exportCanvas: (format: 'png' | 'jpeg') => void;
}

interface CanvasProps {
  width: number;
  height: number;
}

const Canvas = forwardRef<CanvasRef, CanvasProps>(({ width, height }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const dispatch = useAppDispatch();

  const { slides, activeSlideId } = useAppSelector((state) => state.slides);
  const { selectedTool } = useAppSelector((state) => state.ui);

  const activeSlide = useMemo(
    () => slides.find((slide) => slide.id === activeSlideId),
    [slides, activeSlideId]
  );

  useImperativeHandle(
    ref,
    () => ({
      exportCanvas: (format: 'png' | 'jpeg') => {
        if (fabricCanvasRef.current && activeSlideId) {
          const dataURL = fabricCanvasRef.current.toDataURL({
            format,
            quality: 1,
            multiplier: 2,
          });
          const link = document.createElement('a');
          link.href = dataURL;
          link.download = `slide-${activeSlideId}.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      },
    }),
    [activeSlideId]
  );

  const updateElementDebounced = useCallback(
    debounce((slideId: string, elementId: string, updates: Partial<SlideElement>) => {
      dispatch(updateElement({ slideId, elementId, updates }));
    }, 100) as (slideId: string, elementId: string, updates: Partial<SlideElement>) => void,
    [dispatch, updateElement]
  );

  const handleSelection = useCallback(
    (e: { selected?: fabric.Object[]; target?: fabric.Object }) => {
      const selectedObjects = e.selected || (e.target ? [e.target] : []);
      if (selectedObjects.length > 0) {
        const firstObject = selectedObjects[0];
        dispatch(setSelectedElement((firstObject as { id?: string }).id || null));
        dispatch(setSelectedTool('select'));
      } else {
        dispatch(setSelectedElement(null));
      }
    },
    [dispatch]
  );

  const handleSelectionCleared = useCallback(() => {
    dispatch(setSelectedElement(null));
  }, [dispatch]);

  const handleObjectModified = useCallback(
    (e: { target: fabric.Object & { id?: string } }) => {
      const object = e.target;
      if (object && activeSlide) {
        const updates: Partial<SlideElement> = {
          left: object.left || 0,
          top: object.top || 0,
        };
        updateElementDebounced(activeSlide.id, object.id!, updates);
      }
    },
    [activeSlide, updateElementDebounced]
  );

  const handleObjectMoving = useCallback(
    (e: { target: fabric.Object }) => {
      const object = e.target;
      if (object) {
        object.set({ left: object.left || 0, top: object.top || 0 });
      }
    },
    []
  );

  const handleObjectScaling = useCallback((e: { target: fabric.Object }) => {
    const object = e.target;
    if (object?.type === 'rect') {
      object.set({ width: object.width || 100, height: object.height || 100 });
    }
    if (object?.type === 'circle') {
      object.set({ radius: (object as fabric.Circle).radius || 50 });
    }
  }, []);

  const handleObjectRemoved = useCallback(
    (e: { target: fabric.Object & { id?: string } }) => {
      const object = e.target;
      if (object && activeSlide) {
        dispatch(deleteElement({ slideId: activeSlide.id, elementId: object.id! }));
      }
    },
    [dispatch, activeSlide]
  );

  const createFabricObject = useCallback((element: SlideElement) => {
    if (!fabricCanvasRef.current) return;

    if (!element.id) element.id = generateUniqueId();

    let fabricObject: fabric.Object | null = null;

    switch (element.type) {
      case 'text':
        fabricObject = new fabric.IText(element.text || 'Text', {
          left: element.left,
          top: element.top,
          fontSize: element.fontSize || 16,
          fontFamily: element.fontFamily || 'Arial',
          fill: element.fill || '#000000',
          selectable: true,
          editable: true,
          evented: true,
        });
        break;
      case 'rect':
        fabricObject = new fabric.Rect({
          left: element.left,
          top: element.top,
          width: element.width || 100,
          height: element.height || 100,
          fill: element.fill || '#ffffff',
          stroke: element.stroke || '#000000',
          strokeWidth: element.strokeWidth || 1,
          selectable: true,
          evented: true,
        });
        break;
      case 'circle':
        fabricObject = new fabric.Circle({
          left: element.left,
          top: element.top,
          radius: element.radius || 50,
          fill: element.fill || '#ffffff',
          stroke: element.stroke || '#000000',
          strokeWidth: element.strokeWidth || 1,
          selectable: true,
          evented: true,
        });
        break;
      case 'line':
        fabricObject = new fabric.Line(
          [element.x1 || 0, element.y1 || 0, element.x2 || 100, element.y2 || 100],
          {
            stroke: element.stroke || '#000000',
            strokeWidth: element.strokeWidth || 1,
            selectable: true,
            evented: true,
          }
        );
        break;
      case 'image':
        if (element.src) {
          fabric.Image.fromURL(
            element.src,
            { crossOrigin: 'anonymous' },
            (img: fabric.Image) => {
              if (img) {
                img.set({
                  left: element.left,
                  top: element.top,
                  width: element.width || 200,
                  height: element.height || 200,
                  selectable: true,
                  evented: true,
                });
                fabricCanvasRef.current?.add(img);
                fabricCanvasRef.current?.renderAll();
              }
            }
          );
          return;
        }
        break;
    }

    if (fabricObject) fabricCanvasRef.current.add(fabricObject);
  }, []);

  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
        width,
        height,
        backgroundColor: activeSlide?.background || '#ffffff',
        selection: true,
        isDrawingMode: false,
      });

      fabricCanvasRef.current.on('selection:created', handleSelection);
      fabricCanvasRef.current.on('selection:updated', handleSelection);
      fabricCanvasRef.current.on('selection:cleared', handleSelectionCleared);
      fabricCanvasRef.current.on('object:modified', handleObjectModified);
      fabricCanvasRef.current.on('object:removed', handleObjectRemoved);
      fabricCanvasRef.current.on('object:moving', handleObjectMoving);
      fabricCanvasRef.current.on('object:scaling', handleObjectScaling);
    }

    return () => {
      fabricCanvasRef.current?.dispose();
      fabricCanvasRef.current = null;
    };
  }, [
    width,
    height,
    activeSlide?.background,
    handleSelection,
    handleSelectionCleared,
    handleObjectModified,
    handleObjectRemoved,
    handleObjectMoving,
    handleObjectScaling,
  ]);

  useEffect(() => {
    if (fabricCanvasRef.current && activeSlide) {
      fabricCanvasRef.current.backgroundColor = activeSlide.background || '#ffffff';
      fabricCanvasRef.current.renderAll();
    }
  }, [activeSlide?.background, activeSlide]);

  useEffect(() => {
    if (fabricCanvasRef.current && activeSlide) {
      fabricCanvasRef.current.clear();
      activeSlide.elements.forEach((element) => {
        createFabricObject(element);
      });
      fabricCanvasRef.current.renderAll();
    }
  }, [activeSlideId, activeSlide?.elements, createFabricObject, activeSlide]);

  const handleCanvasClick = useCallback(
    ({ e, pointer }: { e: fabric.TPointerEvent; pointer: fabric.Point }) => {
      if (!fabricCanvasRef.current || selectedTool === 'select' || !activeSlide) return;
      const elementId = generateUniqueId();
      let newElement: SlideElement;

      switch (selectedTool) {
        case 'text':
          newElement = { id: elementId, type: 'text', left: pointer.x, top: pointer.y, text: 'New Text' };
          break;
        case 'rect':
          newElement = { id: elementId, type: 'rect', left: pointer.x, top: pointer.y, width: 100, height: 100 };
          break;
        case 'circle':
          newElement = { id: elementId, type: 'circle', left: pointer.x, top: pointer.y, radius: 50 };
          break;
        case 'line':
          newElement = { id: elementId, type: 'line', left: pointer.x, top: pointer.y, x1: 0, y1: 0, x2: 100, y2: 100 };
          break;
        default:
          return;
      }

      dispatch(addElement({ slideId: activeSlide.id, element: newElement }));
      dispatch(setSelectedTool('select'));
    },
    [selectedTool, activeSlide, dispatch]
  );

  useEffect(() => {
    fabricCanvasRef.current?.on('mouse:down', handleCanvasClick);
  }, [handleCanvasClick]);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <canvas ref={canvasRef} />
    </div>
  );
});

Canvas.displayName = 'Canvas';
export default Canvas;
