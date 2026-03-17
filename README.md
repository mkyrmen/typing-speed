# NeonType | Minimalist Speed Typing

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase)

NeonType is a lightning-fast, minimalist typing speed test application designed to help users accurately measure and improve their typing speed (WPM) and accuracy. Built with a modern tech stack, NeonType provides instant feedback, dynamic themes, space-to-skip error handling, and a global, real-time leaderboard.

---

## 🏗 Technical Architecture

NeonType is a full-stack application leveraging the latest React Server Components and edge-ready database technologies.

*   **Frontend**: Next.js 15 (App Router) + Tailwind CSS for a highly responsive, zero-layout-shift interface.
*   **State Control**: Zustand handles high-frequency typing events entirely on the client, isolating expensive re-renders from the main application layout.
*   **Backend / Database**: Supabase PostgreSQL is used for securely storing and fetching the Top 10 High Scores via direct REST endpoints.

---

## 🚀 Key Features

*   **Real-Time WPM & Accuracy Tracking**: Immediate metric calculations precisely updated as you type.
*   **Space-to-Skip Logic**: Intelligently handles mistyped words. Pressing space jumps you to the next word and retroactively marks skipped characters as incorrect, preventing the user from getting stuck.
*   **Global Leaderboards**: Post your scores automatically to the cloud and compete on a global Top 10 High Score board.
*   **Custom Themes**: Effortlessly switch between meticulously crafted dark, light, and terminal aesthetics.
*   **Minimalist Interface**: Distraction-free arena focused entirely on the typing experience and typography.

---

## 👷 Local Setup & Installation

If you want to clone this project and run it entirely locally:

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/TypingSpeed.git
cd TypingSpeed
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a new file named `.env.local` in the root of the project. You must supply your own Supabase project credentials for the leaderboard to function.

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## ⚡ Deployment to Vercel

Deploying NeonType to Vercel is incredibly straightforward.

Log into [Vercel](https://vercel.com/) and click **Add New > Project**. Select your GitHub repository. Before clicking Deploy, expand the **Environment Variables** section and add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your Supabase Dashboard. Vercel will automatically build the Next.js production bundle!

---

## 🧠 Technical Challenges & Solutions

### High-Frequency State Updates
Typing speed metrics require state updates on every single keystroke. Using standard React `useState` at the top level caused immense unnecessary re-renders across the entire application interface.
**Solution**: We transitioned the core game loop into a centralized **Zustand** store (`useTypingStore`). This decoupled the rapidly changing typing state from the heavy UI components.

### Caret Positioning & Space-to-Skip Logic
Implementing an authentic typing test feel requires complex cursor handling, especially when a user wants to abandon a deeply misspelled word.
**Solution**: We implemented custom "Space-to-Skip" logic within the Zustand action payload. Pressing `Space` calculates the index of the *next* space in the target string. The store then automatically pads the `userInput` array with placeholder error tokens, visually painting the skipped letters red and snapping the virtual caret directly to the start of the next word.
