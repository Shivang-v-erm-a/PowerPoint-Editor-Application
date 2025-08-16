# PowerPoint Editor Application

A full-stack, production-ready web application that replicates the core functionality of a PowerPoint-style presentation editor. Built with Next.js 15, TypeScript, Fabric.js, Redux Toolkit, and Tailwind CSS.

## 🚀 Features

### Core Functionality
- **Slide Management**: Add, delete, and switch between slides
- **Element Creation**: Add text boxes, images, rectangles, circles, and lines
- **Interactive Canvas**: Full Fabric.js integration for element manipulation
- **Real-time Editing**: Move, resize, and modify elements on the fly

### Advanced Features
- **Undo/Redo**: Comprehensive undo/redo functionality for all canvas operations.
- **Export Slide**: Export individual slides as high-quality PNG or JPEG images.
- **Mobile Responsive**: Adaptive layout for seamless experience across devices.
- **API Persistence**: Temporarily save and share presentations via a Next.js API route using Vercel KV.
- **State Management**: Robust Redux Toolkit implementation.
- **File Persistence**: Save presentations as JSON files and load them back.
- **Image Support**: Upload images from URLs or local files.
- **Property Controls**: Modify colors, fonts, stroke widths, and more.
- **Responsive Design**: Clean, intuitive interface built with Tailwind CSS.

### Technical Highlights
- **Next.js 15**: Latest App Router architecture
- **TypeScript**: Strict mode enabled for type safety
- **Fabric.js**: Professional canvas manipulation library
- **Redux Toolkit**: Modern state management with RTK
- **Tailwind CSS**: Utility-first CSS framework

## 🛠️ Technology Stack

- **Frontend Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Canvas Library**: Fabric.js
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Build Tool**: Next.js built-in bundler
- **Package Manager**: npm

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd powerpoint-editor-application
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## 🌐 Live Demo

You can access the live deployed application here: [https://power-point-editor-application.vercel.app/](https://power-point-editor-application.vercel.app/)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with Redux Provider
│   ├── page.tsx           # Main page component
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Canvas.tsx         # Fabric.js canvas integration
│   ├── Editor.tsx         # Main editor layout
│   ├── FileOperations.tsx # Save/load functionality
│   ├── ImageUploadModal.tsx # Image upload interface
│   ├── SlideThumbnails.tsx # Slide navigation
│   └── Toolbar.tsx        # Editing tools and properties
└── lib/                   # Redux store and utilities
    ├── hooks.ts           # Typed Redux hooks
    ├── providers.tsx      # Redux Provider wrapper
    ├── slidesSlice.ts     # Slides state management
    ├── store.ts           # Redux store configuration
    └── uiSlice.ts         # UI state management
```

## 🎯 How to Use

### Creating Presentations
1. **Add Slides**: Click the "+" button in the left sidebar
2. **Select Tools**: Choose from the toolbar (select, text, shapes, images)
3. **Add Elements**: Click on the canvas to place elements
4. **Edit Properties**: Use the toolbar to modify colors, fonts, and sizes

### Managing Content
- **Text**: Click the text tool, then click on canvas to add text
- **Shapes**: Select rectangle, circle, or line tools and click to place
- **Images**: Use the image tool and upload from URL or local file
- **Navigation**: Click slide thumbnails to switch between slides

### File Operations
- **Save**: Click "Save" to download presentation as JSON
- **Load**: Click "Load" to upload a previously saved presentation
- **New**: Click "New" to start a fresh presentation

## 🔧 Development

### Key Components

#### Canvas Component
- Integrates Fabric.js with Redux state
- Handles element creation, selection, and modification
- Manages canvas events and object lifecycle

#### Redux Store
- **slidesSlice**: Manages presentation data and slide operations
- **uiSlice**: Handles UI state, selected tools, and element properties
- **store**: Centralized state configuration

#### Element Management
- Each slide stores elements as JSON objects
- Fabric.js objects are synchronized with Redux state
- Real-time updates between canvas and state

### State Structure

```typescript
interface SlideElement {
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
```

## 📝 Example Presentation File

Here's an example JSON structure for testing the load functionality:

```json
[
  {
    "id": "1",
    "elements": [
      {
        "id": "text1",
        "type": "text",
        "left": 100,
        "top": 100,
        "text": "Welcome to PowerPoint Editor",
        "fontSize": 24,
        "fontFamily": "Arial",
        "fill": "#000000"
      },
      {
        "id": "rect1",
        "type": "rect",
        "left": 200,
        "top": 200,
        "width": 150,
        "height": 100,
        "fill": "#e3f2fd",
        "stroke": "#1976d2",
        "strokeWidth": 2
      }
    ],
    "background": "#ffffff"
  }
]
```

## 🎨 Customization

### Adding New Element Types
1. Extend the `SlideElement` interface in `slidesSlice.ts`
2. Add the new type to the `ToolType` union in `uiSlice.ts`
3. Implement creation logic in the `Canvas` component
4. Add tool button to the `Toolbar` component

### Styling Changes
- Modify Tailwind classes in component files
- Update color schemes in the `elementProperties` state
- Customize canvas dimensions in the `Editor` component

### Performance Tips

- Limit the number of elements per slide for better performance
- Use appropriate image sizes for uploads
- Consider implementing element virtualization for large presentations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or issues:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the code comments for implementation details

---

**Built with ❤️ using Next.js, Fabric.js, and Redux Toolkit**
