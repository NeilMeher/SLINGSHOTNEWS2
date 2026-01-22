# Slingshot News 🚀

Slingshot News is a modern news platform designed for Gen Z, featuring swipeable news cards, AI-powered summaries, and a sleek mobile-first experience.

## Project Structure

- `backend/`: Node.js + TypeScript + Express API
- `frontend/`: React + TypeScript + Vite + Tailwind CSS

## Prerequisites

- Node.js (v18+)
- npm or yarn

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the example environment file and fill in your keys:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5173`.

## Features

- **Mobile-First Swipe Interface**: Effortlessly browse news with intuitive swipe gestures.
- **Gen Z Tone**: News rewritten by AI to be relatable, emoji-heavy, and lowercase-friendly.
- **Reactions**: Interact with news using curated Gen Z emojis.
- **Fast & Lightweight**: Optimized for speed and performance.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Framer Motion, React Swipeable.
- **Backend**: Node.js, Express, TypeScript, Axios, Helmet, CORS.
- **AI Integration**: Groq API for translation and tone adjustment.
- **News APIs**: Reuters, AP News, etc.

## Health Check

You can verify the backend is running by visiting:
`GET /api/health`
