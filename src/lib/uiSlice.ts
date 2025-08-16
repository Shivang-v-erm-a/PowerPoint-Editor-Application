import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ToolType = 'select' | 'text' | 'rect' | 'circle' | 'line' | 'image';

export interface ElementProperties {
  fill: string;
  stroke: string;
  strokeWidth: number;
  fontSize: number;
  fontFamily: string;
}

interface UIState {
  selectedTool: ToolType;
  selectedElementId: string | null;
  elementProperties: ElementProperties;
  showImageUpload: boolean;
  showColorPicker: boolean;
}

const initialState: UIState = {
  selectedTool: 'select',
  selectedElementId: null,
  elementProperties: {
    fill: '#000000',
    stroke: '#000000',
    strokeWidth: 1,
    fontSize: 16,
    fontFamily: 'Arial'
  },
  showImageUpload: false,
  showColorPicker: false
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSelectedTool: (state, action: PayloadAction<ToolType>) => {
      state.selectedTool = action.payload;
      if (action.payload !== 'select') {
        state.selectedElementId = null;
      }
    },
    setSelectedElement: (state, action: PayloadAction<string | null>) => {
      state.selectedElementId = action.payload;
    },
    updateElementProperties: (state, action: PayloadAction<Partial<ElementProperties>>) => {
      state.elementProperties = { ...state.elementProperties, ...action.payload };
    },
    setShowImageUpload: (state, action: PayloadAction<boolean>) => {
      state.showImageUpload = action.payload;
    },
    setShowColorPicker: (state, action: PayloadAction<boolean>) => {
      state.showColorPicker = action.payload;
    },
    resetUI: (state) => {
      state.selectedTool = 'select';
      state.selectedElementId = null;
      state.showImageUpload = false;
      state.showColorPicker = false;
    }
  }
});

export const {
  setSelectedTool,
  setSelectedElement,
  updateElementProperties,
  setShowImageUpload,
  setShowColorPicker,
  resetUI
} = uiSlice.actions;

export default uiSlice.reducer;
