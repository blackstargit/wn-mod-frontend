# Frontend - Novel Reader Manager

A modern, high-performance React application for managing and reading novels. Built with a focus on premium aesthetics (Glassmorphism), responsiveness, and user experience.

## 🛠️ Technology Stack

- **Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Routing**: [React Router](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State/Data**: React Hooks (`useState`, `useEffect`) + Axios

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1.  **Install dependencies**:

    ```bash
    npm install
    # or
    yarn install
    ```

2.  **Start Development Server**:

    ```bash
    npm run dev
    ```

    The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

## ✨ Key Features

### 📖 Immersive Reading Experience

- **Reader Interface**: Clean, distraction-free reading mode.
- **Navigation**: Easy chapter navigation and volume management.
- **Progress Tracking**: Automatically saves your last read chapter.

### 📚 Library Management

- **Grid View**: Beautiful card-based layout for your novel collection.
- **Filtering & Search**: Filter by category, tags, or search by title.
- **Batch Actions**: Select multiple novels to delete or organize.
- **Category Management**: Create and assign custom categories.

### 🔍 Smart Integration

- **Auto-Scraping**: Automatically fetches novel descriptions, chapters, and metadata.
- **Live Status**: Real-time progress indicators for background scraping tasks.
- **Emoji Parsing**: Converts Webnovel-style stickers (`[img=joy]`) to native emojis (😂).
- **CORS Proxying**: Seamlessly loads external images via the backend proxy.

### 🎨 Premium UI/UX

- **Glassmorphism**: Modern, translucent UI elements with blur effects.
- **Animations**: Smooth transitions and loading states (e.g., `ScrapingLoader`).
- **Responsive Design**: Optimized for both desktop and tablet experiences.

## 📂 Project Structure

```
frontend/src/
├── api/            # API client configuration
├── components/     # Reusable UI components
│   ├── Library/    # Library-specific components (NovelCard, Filter)
│   └── ...
├── pages/          # Main application pages (Home, Reader, Description)
├── types/          # TypeScript interface definitions
├── App.tsx         # Main router configuration
└── main.tsx        # Entry point
```

## 🧩 Key Components

- **`BookDescriptionPage`**: Detailed view with Synopsis, Collapsible TOC, and Reviews.
- **`ReaderPage`**: The core reading interface.
- **`NovelCard`**: Interactive card component for the library grid.
- **`ScrapingLoader`**: Animated loading screen for scraping operations.
