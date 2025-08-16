import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { generateUniqueId } from './utils';

export interface SlideElement {
  id: string;
  type: 'text' | 'image' | 'rect' | 'circle' | 'line';
  left: number;
  top: number;
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  fontSize?: number;
  fontFamily?: string;
  text?: string;
  src?: string;
  radius?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}

export interface Slide {
  id: string;
  elements: SlideElement[];
  background?: string;
}

interface SlidesState {
  slides: Slide[];
  activeSlideId: string | null;
  isLoading: boolean;
  error: string | null;
  history: Slide[][];
  historyIndex: number;
  maxHistorySize: number;
}

const initialSlides = [
  {
    id: generateUniqueId(),
    elements: [],
    background: '#ffffff'
  }
];

const initialState: SlidesState = {
  slides: initialSlides,
  activeSlideId: initialSlides[0].id,
  isLoading: false,
  error: null,
  history: [JSON.parse(JSON.stringify(initialSlides))],
  historyIndex: 0,
  maxHistorySize: 50
};

// Helper function to save state to history
const saveToHistory = (state: SlidesState) => {
  const currentSlides = JSON.parse(JSON.stringify(state.slides));
  
  // Remove future history if we're not at the end
  if (state.historyIndex < state.history.length - 1) {
    state.history = state.history.slice(0, state.historyIndex + 1);
  }
  
  // Add new state to history
  state.history.push(currentSlides);
  
  // Limit history size
  if (state.history.length > state.maxHistorySize) {
    state.history = state.history.slice(-state.maxHistorySize);
  }
  
  state.historyIndex = state.history.length - 1;
};

const slidesSlice = createSlice({
  name: 'slides',
  initialState,
  reducers: {
    addSlide: (state) => {
      try {
        saveToHistory(state);
        const newSlide: Slide = {
          id: generateUniqueId(),
          elements: [],
          background: '#ffffff'
        };
        state.slides.push(newSlide);
        state.activeSlideId = newSlide.id;
        state.error = null;
      } catch (error) {
        state.error = 'Failed to add slide';
        console.error('Error adding slide:', error);
      }
    },
    deleteSlide: (state, action: PayloadAction<string>) => {
      try {
        saveToHistory(state);
        const slideIndex = state.slides.findIndex(slide => slide.id === action.payload);
        if (slideIndex !== -1) {
          state.slides.splice(slideIndex, 1);
          if (state.slides.length === 0) {
            // Add a default slide if all slides are deleted
            state.slides.push({
              id: generateUniqueId(),
              elements: [],
              background: '#ffffff'
            });
          }
          if (state.activeSlideId === action.payload) {
            state.activeSlideId = state.slides[0].id;
          }
          state.error = null;
        }
      } catch (error) {
        state.error = 'Failed to delete slide';
        console.error('Error deleting slide:', error);
      }
    },
    setActiveSlide: (state, action: PayloadAction<string>) => {
      try {
        const slideExists = state.slides.some(slide => slide.id === action.payload);
        if (slideExists) {
          state.activeSlideId = action.payload;
          state.error = null;
        } else {
          state.error = 'Slide not found';
        }
      } catch (error) {
        state.error = 'Failed to set active slide';
        console.error('Error setting active slide:', error);
      }
    },
    addElement: (state, action: PayloadAction<{ slideId: string; element: SlideElement }>) => {
      try {
        saveToHistory(state);
        const slide = state.slides.find(s => s.id === action.payload.slideId);
        if (slide) {
          // Ensure element has a unique ID
          if (!action.payload.element.id) {
            action.payload.element.id = generateUniqueId();
          }
          slide.elements.push(action.payload.element);
          state.error = null;
        } else {
          state.error = 'Slide not found';
        }
      } catch (error) {
        state.error = 'Failed to add element';
        console.error('Error adding element:', error);
      }
    },
    updateElement: (state, action: PayloadAction<{ slideId: string; elementId: string; updates: Partial<SlideElement> }>) => {
      try {
        saveToHistory(state); // Save state before updating element
        const slide = state.slides.find(s => s.id === action.payload.slideId);
        if (slide) {
          const element = slide.elements.find(e => e.id === action.payload.elementId);
          if (element) {
            Object.assign(element, action.payload.updates);
            state.error = null;
          } else {
            state.error = 'Element not found';
          }
        } else {
          state.error = 'Slide not found';
        }
      } catch (error) {
        state.error = 'Failed to update element';
        console.error('Error updating element:', error);
      }
    },
    deleteElement: (state, action: PayloadAction<{ slideId: string; elementId: string }>) => {
      try {
        saveToHistory(state);
        const slide = state.slides.find(s => s.id === action.payload.slideId);
        if (slide) {
          slide.elements = slide.elements.filter(e => e.id !== action.payload.elementId);
          state.error = null;
        } else {
          state.error = 'Slide not found';
        }
      } catch (error) {
        state.error = 'Failed to delete element';
        console.error('Error deleting element:', error);
      }
    },
    updateSlideBackground: (state, action: PayloadAction<{ slideId: string; background: string }>) => {
      try {
        saveToHistory(state);
        const slide = state.slides.find(s => s.id === action.payload.slideId);
        if (slide) {
          slide.background = action.payload.background;
          state.error = null;
        } else {
          state.error = 'Slide not found';
        }
      } catch (error) {
        state.error = 'Failed to update slide background';
        console.error('Error updating slide background:', error);
      }
    },
    loadPresentation: (state, action: PayloadAction<Slide[]>) => {
      try {
        if (Array.isArray(action.payload) && action.payload.length > 0) {
          // Validate each slide has required properties
          const validSlides = action.payload.filter(slide => 
            slide.id && Array.isArray(slide.elements)
          );
          
          if (validSlides.length > 0) {
            state.slides = validSlides;
            state.activeSlideId = validSlides[0].id;
            state.error = null;
          } else {
            state.error = 'Invalid presentation format';
          }
        } else {
          state.error = 'Invalid presentation data';
        }
      } catch (error) {
        state.error = 'Failed to load presentation';
        console.error('Error loading presentation:', error);
      }
    },
    clearPresentation: (state) => {
      try {
        state.slides = [{
          id: generateUniqueId(),
          elements: [],
          background: '#ffffff'
        }];
        state.activeSlideId = state.slides[0].id;
        state.error = null;
      } catch (error) {
        state.error = 'Failed to clear presentation';
        console.error('Error clearing presentation:', error);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    undo: (state) => {
      try {
        if (state.historyIndex > 0) {
          state.historyIndex -= 1;
          const previousState = state.history[state.historyIndex];
          state.slides = JSON.parse(JSON.stringify(previousState));
          
          // Ensure active slide still exists
          if (!state.slides.find(slide => slide.id === state.activeSlideId)) {
            state.activeSlideId = state.slides[0]?.id || null;
          }
          state.error = null;
        }
      } catch (error) {
        state.error = 'Failed to undo';
        console.error('Error during undo:', error);
      }
    },
    redo: (state) => {
      try {
        if (state.historyIndex < state.history.length - 1) {
          state.historyIndex += 1;
          const nextState = state.history[state.historyIndex];
          state.slides = JSON.parse(JSON.stringify(nextState));
          
          // Ensure active slide still exists
          if (!state.slides.find(slide => slide.id === state.activeSlideId)) {
            state.activeSlideId = state.slides[0]?.id || null;
          }
          state.error = null;
        }
      } catch (error) {
        state.error = 'Failed to redo';
        console.error('Error during redo:', error);
      }
    },
    saveToHistoryAction: (state) => {
      saveToHistory(state);
    }
  }
});

export const {
  addSlide,
  deleteSlide,
  setActiveSlide,
  addElement,
  updateElement,
  deleteElement,
  updateSlideBackground,
  loadPresentation,
  clearPresentation,
  clearError,
  setLoading,
  undo,
  redo,
  saveToHistoryAction
} = slidesSlice.actions;

export default slidesSlice.reducer;
