# TypingSpeed — Comprehensive Technical Documentation

> **Author:** Project Developer  
> **Date:** March 2026  
> **Stack:** Next.js 15 · React 19 · TypeScript · Zustand · Supabase · Tailwind CSS · Husky · GitHub Actions

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [State Management Theory](#2-state-management-theory)
3. [Database Schema & Security](#3-database-schema--security)
4. [UI/UX Philosophy](#4-uiux-philosophy)
5. [The DevOps Pipeline (CI/CD)](#5-the-devops-pipeline-cicd)
6. [Scalability & Future Growth](#6-scalability--future-growth)

---

## 1. System Architecture

### Overview: The Client-Server Model

TypingSpeed follows a modern **Jamstack architecture** — a decoupled, serverless model where the frontend is statically generated/served by a CDN and the backend is a managed cloud service. There is no traditional application server (e.g., no Express.js, no Django). Instead, the client communicates directly with Supabase via its REST/PostgREST API.

```
┌───────────────────────────────────────────────────────────┐
│                        USER BROWSER                       │
│                                                           │
│   ┌─────────────────────────────────────────────────┐    │
│   │        Next.js 15 Application (Frontend)         │    │
│   │                                                  │    │
│   │   ┌──────────────┐    ┌─────────────────────┐   │    │
│   │   │  Zustand Store│    │   React Components  │   │    │
│   │   │  (App State) │◄──►│  (UI Layer)         │   │    │
│   │   └──────┬───────┘    └─────────────────────┘   │    │
│   │          │                                       │    │
│   │          │  lib/supabase.ts (getSupabase())      │    │
│   └──────────┼───────────────────────────────────────┘    │
└──────────────┼────────────────────────────────────────────┘
               │ HTTPS / REST API (anon key auth)
               ▼
┌──────────────────────────────────┐
│        Supabase (Backend)        │
│                                  │
│   ┌──────────────────────────┐   │
│   │   PostgREST Auto-API     │   │
│   └────────────┬─────────────┘   │
│                │                 │
│   ┌────────────▼─────────────┐   │
│   │  PostgreSQL Database     │   │
│   │  (leaderboards table)    │   │
│   └──────────────────────────┘   │
└──────────────────────────────────┘
```

### How the Frontend Communicates with the Backend

The bridge between the React frontend and Supabase is the singleton client located in `lib/supabase.ts`.

```typescript
// lib/supabase.ts
export function getSupabase(): SupabaseClient {
  // Safety: Supabase client is browser-only; never instantiated during SSR.
  if (typeof window === "undefined") {
    throw new Error("Supabase client is browser-only (called during SSR).");
  }
  if (client) return client; // Singleton pattern — only initialised once

  client = createClient(supabaseUrl, supabaseAnonKey);
  return client;
}
```

**Key design decisions:**

- **Singleton pattern**: The client is created once and reused across all components. This avoids unnecessary WebSocket connections and memory overhead.
- **Browser-only guard**: Since Next.js can render components on the server (SSR), the guard prevents the client from being instantiated in Node.js where `window` is undefined.
- **Environment variables**: The URL and `anon` key are read from `NEXT_PUBLIC_*` variables, making them available to the browser bundle while keeping them configurable per environment.

When the user saves a score, the Zustand store action `saveScore` calls this client directly:
```typescript
const { error } = await supabase.from("leaderboards").insert(payload);
```
This sends an authenticated `HTTP POST` request to Supabase's auto-generated PostgREST endpoint. No custom API routes are needed.

---

## 2. State Management Theory

### Why Zustand Instead of `useState`?

The typing game has two interlinked categories of concerns:

| Concern | Problem with local `useState` |
|---|---|
| Timer countdown | Timer is started in `TypingArena`, but the final WPM displayed in `ResultsSummary` needs the elapsed time. Sharing this via props creates a brittle chain. |
| Score saving | `TestComplete` must call `saveScore()`, but the WPM/Accuracy live in the component that initiated typing. Without a global store, you'd need complex prop drilling or React Context. |
| Keyboard shortcuts | `Tab` (reset) and `Escape` (back to menu) must be bound globally on `window`. They need to trigger store-level resets, not just local state updates. |

Zustand solves all of these with a **single, shared store** (`useTypingStore`) accessible from any component without prop drilling or a Provider wrapper.

### The Two Stores

#### `useTypingStore` — Core Game State
Manages the entire game lifecycle: `idle → typing → finished`. It holds `targetText`, `userInput`, `wpm`, `accuracy`, `timeLeft`, and all actions.

#### `useSettingsStore` — Persistent User Preferences
Manages settings like `soundEnabled`. Critically, it **hydrates from `localStorage`** on startup:
```typescript
if (typeof window !== "undefined") {
  useSettingsStore.setState({ soundEnabled: readInitialSoundEnabled() });
}
```
This means user sound preferences survive page refreshes without any server round-trip.

---

### Algorithm 1: The Space-to-Skip Logic

Standard typing tests require you to type every character. Our implementation allows pressing `Space` to jump to the start of the next word — a UX optimisation for speed typists who mistype a word and don't want to laboriously backspace.

**The algorithm (in `updateInput`):**
```
Input: user presses Space
  1. Find the index of the NEXT space character in targetText, searching forward from the current cursor position.
  2. Calculate jumpToIndex = nextSpaceIndex + 1 (the first char of the next word).
  3. Fill all skipped character slots with a placeholder error value ('X' for regular chars, '_' for spaces).
     → These placeholders don't match the target chars, so they render as red (incorrect).
  4. The space at the word boundary itself is recorded correctly (as ' ').
  5. The cursor (caret) jumps to the new position.
```

This design choice is deliberate: skipping a word is *penalised* in accuracy but *rewarded* in speed, accurately reflecting a real-world WPM test philosophy.

---

### Algorithm 2: WPM Calculation

WPM (Words Per Minute) is calculated using the **international standard** where 1 word = 5 characters. This makes the metric consistent regardless of actual word length.

```typescript
function calcWpm(startTime: number, charsTyped: number): number {
    const elapsedMinutes = (Date.now() - startTime) / 60000;
    if (elapsedMinutes === 0) return 0;
    return Math.round(charsTyped / 5 / elapsedMinutes);
}
```

- **Real-time**: WPM is recalculated on every keystroke during a live test.
- **Final (timer-based)**: When the countdown timer expires, WPM is calculated using the full timer duration for precision. This prevents a final-second keystroke from skewing the result.

```typescript
// On timer expiry in tick():
const elapsedMinutes = timerDuration / 60;
const finalWpm = Math.round(userInput.length / 5 / elapsedMinutes);
```

---

## 3. Database Schema & Security

### The `leaderboards` Table (PostgreSQL via Supabase)

The application uses a single table to store all typing test results.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Unique identifier for each score entry |
| `created_at` | `timestamptz` | `DEFAULT now()` | Timestamp when the score was recorded |
| `username` | `text` | `NOT NULL` | Display name chosen by the user |
| `wpm` | `numeric` | `NOT NULL` | Words per minute (rounded to 1 decimal) |
| `accuracy` | `numeric` | `NOT NULL` | Keystroke accuracy percentage (rounded to 1 decimal) |
| `story_title` | `text` | `NOT NULL` | Title of the passage that was typed |

### Row Level Security (RLS)

Supabase enforces **Row Level Security** at the database level, not the application level. This is a critical distinction.

**Without RLS:** Anyone with the `anon` key could read, modify, or delete *all* rows in the table by crafting a direct API request.

**With RLS enabled, we define explicit policies:**

| Policy | Operation | Condition | Rationale |
|---|---|---|---|
| `allow_public_insert` | `INSERT` | `true` (everyone) | Any user can submit a new score without logging in |
| `allow_public_select` | `SELECT` | `true` (everyone) | Anyone can view the leaderboard |
| No `UPDATE` / `DELETE` policy | — | — | No one can modify or remove existing scores |

### Why We Use the `anon` Key (Not the `service_role` Key)

The Supabase project has two keys:

- **`anon` key**: A public, safe-to-expose key. It respects all RLS policies. This is what is used in the application (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- **`service_role` key**: A super-admin key that **bypasses all RLS**. If this were exposed in the browser, any user could delete the entire database. **It is never used client-side.**

The `NEXT_PUBLIC_` prefix makes the `anon` key visible in the browser bundle — this is intentional and safe *only because* RLS is correctly configured.

---

## 4. UI/UX Philosophy

### The 70% Viewport Width Rule

The main typing arena is constrained to 70% of the viewport width:
```tsx
<div className="w-[70%] max-w-[70vw] flex flex-col gap-12">
```

**Rationale:** At full width on large monitors, the text lines become too long for the eye to comfortably track from end to start. The 70% constraint creates a comfortable, focused reading column — similar to the 65-75 character line length recommended in typography best practices. This reduces cognitive load and keeps the user's gaze within a natural focal zone.

### The Animated Caret

The caret (typing cursor) is a separate `<div>` element positioned absolutely over the text, not a native input cursor. Its position is calculated in a `useLayoutEffect` hook.

```typescript
useLayoutEffect(() => {
    const activeSpan = charElements[targetIndex] as HTMLElement;
    const spanRect = activeSpan.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    setCaretPos({
        top: spanRect.top - containerRect.top,
        left: spanRect.left - containerRect.left
    });
}, [userInput.length, targetText.length]);
```

**Why `useLayoutEffect` instead of `useEffect`?** `useLayoutEffect` fires synchronously after DOM mutations but before the browser paints. This ensures the caret position is calculated from the *final* rendered position of the character spans, preventing a single-frame visual flicker where the caret would briefly appear in the wrong position.

**The caret's CSS transition:**
```css
transition: "all 75ms cubic-bezier(0.175, 0.885, 0.32, 1.275)"
```
The cubic bezier (`0.175, 0.885, 0.32, 1.275`) creates a subtle "overshoot" spring effect. The caret slightly overshoots its target position before settling, giving it a tactile, physical quality that reinforces the feeling of responsiveness.

**Idle pulse animation:** When `status === 'idle'`, the caret applies `animate-pulse`, blinking like a standard terminal cursor — a universally understood affordance that the interface is waiting for input.

### Micro-Animations

Two custom keyframe animations in `tailwind.config.ts` provide haptic-like visual feedback:

| Animation | Trigger | Effect | Purpose |
|---|---|---|---|
| `animate-pop` | Correct keypress | Scale `1 → 1.2 → 1` in 150ms | Positive reinforcement for accuracy |
| `animate-shake` | Wrong keypress | Horizontal jitter ±2px in 200ms | Tactile error feedback without breaking focus |

### Why Tailwind CSS (Utility-First Design)

Traditional CSS requires context-switching between `.css` files and template files. In a component-driven framework like Next.js, utility-first CSS keeps styling co-located with structure. For a project with many small, unique components (`StatsBar`, `ProgressBar`, `TimerSelector`, etc.), Tailwind eliminates class-naming overhead and dead CSS — only the classes actually used in the markup are included in the production bundle.

---

## 5. The DevOps Pipeline (CI/CD)

### The Journey of a Commit

Every single commit to this project passes through three sequential gates before it goes live. This is the complete code lifecycle:

```
Developer's Machine
       │
       ▼
┌──────────────────┐        ┌──────────────────┐        ┌──────────────┐
│  GATE 1: Husky   │──────► │ GATE 2: GitHub   │──────► │ GATE 3:      │
│  (Local, pre-    │ git    │ Actions          │ merge  │ Vercel       │
│  commit hook)    │ push   │ (Cloud Validator)│ to main│ (Production) │
└──────────────────┘        └──────────────────┘        └──────────────┘
```

---

### Gate 1: Husky (The Local Guard)

**What it is:** A Node.js tool that hooks into Git's event lifecycle. Configured in `.husky/pre-commit`.

**When it runs:** *Before* a commit is even created on the developer's machine.

**What it checks:**
```sh
# .husky/pre-commit
npm run lint    # ESLint: catches syntax errors, unused vars, React rule violations
npm run build   # Next.js build: verifies no TypeScript errors or broken imports
```

If either command fails, the commit is **aborted**. The developer must fix the error before they can commit. This is the "shift left" principle in software engineering — finding bugs as early as possible in the development cycle.

**CI Environment Safety:** The `prepare` script in `package.json` is conditionally guarded so Husky only sets up git hooks in a local development environment and is safely skipped in the cloud:
```json
"prepare": "if [ \"$NODE_ENV\" != \"production\" ]; then husky; fi"
```

---

### Gate 2: GitHub Actions (The Cloud Validator)

**What it is:** A YAML-defined automation workflow in `.github/workflows/ci.yml`.

**When it runs:** Automatically triggered on every `push` and `pull_request` targeting the `main` branch. It runs on a fresh Ubuntu virtual machine in Microsoft Azure's cloud.

**The pipeline steps:**
```yaml
steps:
  - Checkout repository      # Clone the source code
  - Setup Node.js 20         # Install the correct Node.js runtime
  - npm ci                   # Clean install: strict, reproducible dependency installation
  - npm run check-types      # tsc --noEmit: TypeScript-only type check (fast)
  - npm run build            # Full Next.js production build validation
```

**`npm ci` vs `npm install`:** `npm ci` (Clean Install) is used in CI environments because it:
1. Deletes `node_modules` and rebuilds from scratch for a guaranteed clean slate.
2. Strictly enforces that `package.json` and `package-lock.json` are in sync (fails if not).
3. Never modifies `package-lock.json`, keeping builds reproducible.

**Why two type checks?** `check-types` (`tsc --noEmit`) is fast and type-only. `npm run build` is slower but also catches Next.js-specific issues like broken dynamic imports or missing environment variables detected at build time.

---

### Gate 3: Vercel (Production Host)

**What it is:** The platform responsible for deploying the production application. When all GitHub Actions checks pass and a PR is merged to `main`, Vercel automatically receives a webhook, pulls the latest code, runs `npm run build`, and deploys the output to a global CDN edge network.

**Outcome:** The application is served from data centres geographically close to each user, ensuring fast load times worldwide.

---

## 6. Scalability & Future Growth

### Stress Test: What Would Break at 10,000 Concurrent Users?

| Component | Current Behaviour | Likely Failure at Scale |
|---|---|---|
| **Supabase Free Tier** | Handles light traffic. | The free tier handles ~500 simultaneous connections. At 10,000 users, database connection limits would be exhausted, causing insert failures on `saveScore`. |
| **Leaderboard Query** | Fetches all rows on every mount with no pagination. | A `SELECT *` on a table with millions of rows would time out, causing the leaderboard to fail to load. |
| **Client-side Supabase** | One connection per browser tab. | 10,000 open tabs = 10,000 open PostgREST connections. Supabase's connection pooler (PgBouncer) would need to be upgraded. |

**Recommended Remediations:**
1. **Paginate the leaderboard:** `supabase.from('leaderboards').select('*').order('wpm', { ascending: false }).limit(50)`
2. **Add a database index:** `CREATE INDEX ON leaderboards(wpm DESC);` for fast leaderboard sorting.
3. **Upgrade Supabase plan** to access dedicated pooling capacity.

---

### Feature Proposal: Real-time Multiplayer with Supabase Broadcast

Supabase provides a **Realtime** service built on WebSockets. The `Broadcast` channel feature allows clients to send low-latency, ephemeral messages to all other subscribers on a channel — without persisting data to the database.

**Implementation approach:**

1. **Create a room system:** When a user starts a multiplayer race, they join a Supabase channel named after a unique room ID (e.g., `race:abc123`).

2. **Broadcast progress on each keystroke:** Each user's `updateInput` action would also emit their current progress percentage:
    ```typescript
    channel.send({
        type: 'broadcast',
        event: 'progress',
        payload: { userId: myId, progress: userInput.length / targetText.length }
    });
    ```

3. **Receive opponent progress:** Each client subscribes to `progress` events and renders opponent progress bars in real-time:
    ```typescript
    channel.on('broadcast', { event: 'progress' }, ({ payload }) => {
        updateOpponentProgress(payload.userId, payload.progress);
    });
    ```

4. **Race completion:** When any player's status becomes `finished`, they broadcast a `race_complete` event with their final WPM + accuracy. The leaderboard then shows the race winner.

**Architectural advantage:** Because Supabase Broadcast does not write to the database (it's peer-to-peer via the Supabase relay), it can handle thousands of concurrent race events without adding database write load.

---

*End of Document. This report was prepared to accurately reflect the current state of the TypingSpeed project codebase.*
