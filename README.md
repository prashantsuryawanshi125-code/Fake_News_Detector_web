# Fake News Detector - Local Setup

This project is built with React, Vite, and Tailwind CSS. It uses the Gemini API for news analysis.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Gemini API Key (get one at [ai.google.dev](https://ai.google.dev))

## Getting Started

1. **Clone or download the project files.**

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000` (or the port shown in your terminal).

## Project Structure

- `src/`: Contains the source code.
  - `components/`: UI components.
  - `services/`: API integration services.
  - `data/`: Local dataset for benchmarking.
  - `App.tsx`: Main application component.
  - `index.tsx`: Entry point.
  - `index.css`: Global styles and Tailwind imports.
- `index.html`: Main HTML file.
- `vite.config.ts`: Vite configuration.
- `tsconfig.json`: TypeScript configuration.

## Features

- **Real-time Analysis:** Analyze news articles for authenticity using Gemini.
- **LSTM Visualization:** View neural network gate activations for each analysis.
- **Dataset Benchmarking:** Run performance tests on a pre-defined dataset of 60 articles.
- **Metrics:** Track Accuracy, Precision, Recall, and F1-Score.
- **Confusion Matrix:** Detailed breakdown of true/false positives and negatives.
