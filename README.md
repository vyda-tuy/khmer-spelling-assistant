# Khmer Spelling Assistant

A full-stack application for checking spelling, performing fuzzy matching, and providing text-to-speech for the Khmer language. 

## Project Architecture

- **Backend (`/backend`)**: Node.js/Express server providing APIs for Khmer dictionary lookups, Gemini AI-powered spelling corrections, and proxying text-to-speech data.
- **Frontend (`/frontend`)**: React application (Vite template) providing the user interface for spell-checking and interacting with the backend APIs.
- **Data/Scripts**: Centralized scripts (`/scripts`) and dictionary definitions in various formats (e.g., Parquet, JSON, trained data).

## Setup & Installation

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment variables example file:
   ```bash
   cp .env.example .env
   ```
4. Put your Gemini API key in the `.env` file.
5. Start the backend development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment variables example file:
   ```bash
   cp .env.example .env
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Development and Architecture Decisions
- Centralized error handling handles graceful error surfacing in the API layer. 
- React Error Boundaries prevent complete whitescreen UI failures and offer visual recovery clues.
- The spell checker relies firmly on the Royal Academy of Cambodia (RAC) dictionary with algorithmic fuzzy matching, falling back on Google Gemini AI intelligently for context-based spelling resolutions on multi-word segments.

## License
MIT
