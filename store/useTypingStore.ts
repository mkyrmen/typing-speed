import { create } from "zustand";
import { getSupabase } from "@/lib/supabase";

export type Difficulty = "Easy" | "Medium" | "Hard";
export type GameStatus = "idle" | "typing" | "finished";
export type AppView = "menu" | "arena";

interface TypingState {
    // UI
    view: AppView;

    // Data
    targetText: string[];
    userInput: string[];
    currentStoryTitle: string | null;
    status: GameStatus;
    isFinished: boolean;
    startTime: number | null;
    wpm: number;
    accuracy: number;

    // State
    timeLeft: number;
    timerDuration: number;

    // Actions
    setStory: (text: string, title?: string) => void;
    setView: (view: AppView) => void;
    resetToMenu: () => void;
    saveScore: (username: string) => Promise<void>;
    updateInput: (char: string) => void;
    backspace: () => void;
    resetGame: () => void;
    setTimerDuration: (seconds: number) => void;
    tick: () => void;
}

function calcWpm(startTime: number, charsTyped: number): number {
    const elapsedMinutes = (Date.now() - startTime) / 60000;
    if (elapsedMinutes === 0) return 0;
    // Standard: 5 chars = 1 word
    return Math.round(charsTyped / 5 / elapsedMinutes);
}

function calcAccuracy(targetText: string[], userInput: string[]): number {
    if (userInput.length === 0) return 100;
    const correct = userInput.filter(
        (char, i) => char === targetText[i]
    ).length;
    return (correct / userInput.length) * 100;
}

export const useTypingStore = create<TypingState>()((set, get) => ({
    view: "menu",
    targetText: [],
    userInput: [],
    currentStoryTitle: null,
    status: "idle",
    isFinished: false,
    startTime: null,
    wpm: 0,
    accuracy: 100,
    timeLeft: 30,
    timerDuration: 30,

    setStory: (text: string, title?: string) => {
        const { timerDuration } = get();
        set({
            view: "arena",
            targetText: text.split(""),
            userInput: [],
            currentStoryTitle: title ?? null,
            status: "idle",
            isFinished: false,
            startTime: null,
            wpm: 0,
            accuracy: 100,
            timeLeft: timerDuration,
        });
    },

    setView: (view: AppView) => set({ view }),

    resetToMenu: () => {
        const { timerDuration } = get();
        set({
            view: "menu",
            targetText: [],
            userInput: [],
            currentStoryTitle: null,
            status: "idle",
            isFinished: false,
            startTime: null,
            wpm: 0,
            accuracy: 100,
            timeLeft: timerDuration,
        });
    },

    saveScore: async (username: string) => {
        const { wpm, accuracy, currentStoryTitle } = get();
        const cleanName = username.trim();
        if (!cleanName) throw new Error("Username is required");

        const round1 = (n: number) => Math.round(n * 10) / 10;
        const payload = {
            username: cleanName,
            wpm: round1(wpm),
            accuracy: round1(accuracy),
            story_title: currentStoryTitle ?? "Unknown",
        };

        const supabase = getSupabase();
        const { error } = await supabase.from("leaderboards").insert(payload);
        if (error) throw new Error(error.message);
    },

    updateInput: (char: string) => {
        const { targetText, userInput, status, startTime, timeLeft } = get();
        if (status === "finished") return;
        if (userInput.length >= targetText.length) return;

        const newStartTime = status === "idle" ? Date.now() : startTime;
        let newInput = [...userInput];

        // Space-to-Skip Logic
        if (char === " ") {
            const nextSpaceIndex = targetText.indexOf(" ", userInput.length);
            const jumpToIndex = nextSpaceIndex !== -1 ? nextSpaceIndex + 1 : targetText.length;
            
            // Fill missed characters as incorrect (or whatever they were)
            for (let i = userInput.length; i < jumpToIndex; i++) {
                // If it's the space itself at the end of word, keep it as space
                // otherwise it's a skipped character
                newInput.push(userInput.length === i && targetText[i] === " " ? " " : "§"); 
                // Using a placeholder '§' or just the wrong char to mark as error
                // Actually, the current renderer checks if userInput[i] === targetText[i]
                // So we can just push anything that ISN'T the target char.
            }
            
            // Refined fill: push whatever char is NOT the target char to ensure it shows as red
            newInput = [...userInput];
            for (let i = userInput.length; i < jumpToIndex; i++) {
                if (i === jumpToIndex - 1 && targetText[i] === " ") {
                    newInput.push(" "); // Correctly type the space
                } else {
                    newInput.push(targetText[i] === " " ? "_" : "X"); // Mark as error
                }
            }
        } else {
            newInput.push(char);
        }

        const newStatus: GameStatus =
            newInput.length >= targetText.length ? "finished" : "typing";
        const newIsFinished = newStatus === "finished";

        const newWpm =
            newStartTime !== null ? calcWpm(newStartTime, newInput.length) : 0;
        const newAccuracy = calcAccuracy(targetText, newInput);

        set({
            userInput: newInput,
            status: newStatus,
            isFinished: newIsFinished,
            startTime: newStartTime,
            wpm: newWpm,
            accuracy: newAccuracy,
        });
    },

    backspace: () => {
        const { userInput, targetText, startTime } = get();
        if (userInput.length === 0) return;
        const newInput = userInput.slice(0, -1);
        const newStatus: GameStatus = newInput.length === 0 ? "idle" : "typing";
        const newIsFinished = false;
        const newWpm =
            startTime !== null ? calcWpm(startTime, newInput.length) : 0;
        const newAccuracy = calcAccuracy(targetText, newInput);
        set({
            userInput: newInput,
            status: newStatus,
            isFinished: newIsFinished,
            wpm: newWpm,
            accuracy: newAccuracy,
        });
    },

    resetGame: () => {
        const { targetText, timerDuration } = get();
        set({
            userInput: [],
            status: "idle",
            isFinished: false,
            startTime: null,
            wpm: 0,
            accuracy: 100,
            timeLeft: timerDuration,
            targetText: [...targetText],
        });
    },

    setTimerDuration: (seconds: number) => {
        set({ 
            timerDuration: seconds,
            timeLeft: seconds,
            status: "idle",
            isFinished: false,
            userInput: [],
            startTime: null
         });
    },

    tick: () => {
        const { timeLeft, status, userInput, targetText, timerDuration } = get();
        if (status !== "typing") return;
        
        if (timeLeft <= 1) {
            // Calculate final stats based on full duration
            const elapsedMinutes = timerDuration / 60;
            const finalWpm = Math.round(userInput.length / 5 / elapsedMinutes);
            const finalAccuracy = calcAccuracy(targetText, userInput);
            
            set({ 
                timeLeft: 0, 
                status: "finished",
                isFinished: true,
                wpm: finalWpm,
                accuracy: finalAccuracy
            });
        } else {
            set({ timeLeft: timeLeft - 1 });
        }
    },
}));
