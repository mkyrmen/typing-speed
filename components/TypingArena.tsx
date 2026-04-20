"use client";

import React, {
  useEffect,
  useRef,
  useLayoutEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useTypingStore } from "@/store/useTypingStore";
import TimerSelector from "./TimerSelector";
import ProgressBar from "./ProgressBar";
import TestComplete from "./TestComplete";
import StatsBar from "./StatsBar";
import ThemeToggle from "./ThemeToggle";
import SoundToggle from "./SoundToggle";
import AudioPreload from "./AudioPreload";
import GenreSelector from "./GenreSelector";
import { typingSound } from "@/lib/audio/typingSound";
import { useSettingsStore } from "@/store/useSettingsStore";
import { ArrowLeft } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface WordGroup {
  chars: string[];
  startIndex: number;
}

interface Line {
  words: WordGroup[];
  startIndex: number; // global char index of line's first char
  endIndex: number;   // global char index of line's last char (inclusive)
}

// ─── Waterfall constants ──────────────────────────────────────────────────────
const VISIBLE_LINES = 3;   // how many lines total in the window
const LINES_ABOVE = 1;     // how many lines above the active one to show

// ─── Helpers ─────────────────────────────────────────────────────────────────
function buildWords(targetText: string[]): WordGroup[] {
  const words: WordGroup[] = [];
  let cur: WordGroup = { chars: [], startIndex: 0 };
  targetText.forEach((ch, i) => {
    cur.chars.push(ch);
    if (ch === " " || i === targetText.length - 1) {
      words.push(cur);
      cur = { chars: [], startIndex: i + 1 };
    }
  });
  return words;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function TypingArena() {
  const {
    targetText,
    userInput,
    updateInput,
    backspace,
    status,
    resetGame,
    tick,
    resetToMenu,
  } = useTypingStore();
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);

  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLDivElement>(null); // hidden div for layout calculation

  const [caretPos, setCaretPos] = useState({ top: 0, left: 0 });
  const [inputValue, setInputValue] = useState("");
  const [shake, setShake] = useState(false);

  const [lines, setLines] = useState<Line[]>([]);
  const [activeLineIndex, setActiveLineIndex] = useState(0);

  // ── Focus ────────────────────────────────────────────────────────────────
  useEffect(() => { inputRef.current?.focus(); }, []);

  // ── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "typing") {
      interval = setInterval(() => tick(), 1000);
    }
    return () => clearInterval(interval);
  }, [status, tick]);

  // ── Global Shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") { e.preventDefault(); resetGame(); inputRef.current?.focus(); }
      if (e.key === "Enter" && status === "finished") { resetGame(); inputRef.current?.focus(); }
      if (e.key === "Escape") { e.preventDefault(); resetToMenu(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [resetGame, resetToMenu, status]);

  // ── Layout Calculation ───────────────────────────────────────────────────
  // We use an invisible clone that wraps words to find where lines break.
  const recalcLines = useCallback(() => {
    if (!measureRef.current) return;
    const wordDivs = Array.from(measureRef.current.querySelectorAll<HTMLElement>("div.m-word"));
    if (wordDivs.length === 0) return;

    const newLines: Line[] = [];
    let currentLineTop = wordDivs[0].getBoundingClientRect().top;
    let currentLine: Line = { words: [], startIndex: 0, endIndex: 0 };

    let globalCharIdx = 0;
    wordDivs.forEach((wordDiv) => {
      const top = wordDiv.getBoundingClientRect().top;
      const wordChars = Array.from(wordDiv.querySelectorAll("span")).map(s => s.dataset.char ?? "");
      const wordLen = wordChars.length;
      
      if (Math.abs(top - currentLineTop) > 5) {
        // new line detected
        newLines.push(currentLine);
        currentLineTop = top;
        currentLine = { words: [], startIndex: globalCharIdx, endIndex: globalCharIdx + wordLen - 1 };
      } else {
        currentLine.endIndex = globalCharIdx + wordLen - 1;
      }
      
      currentLine.words.push({ chars: wordChars, startIndex: globalCharIdx });
      globalCharIdx += wordLen;
    });
    newLines.push(currentLine);
    setLines(newLines);
  }, []);

  useLayoutEffect(() => {
    recalcLines();
  }, [targetText, recalcLines]);

  useEffect(() => {
    const observer = new ResizeObserver(recalcLines);
    if (measureRef.current) observer.observe(measureRef.current);
    return () => observer.disconnect();
  }, [recalcLines]);

  // Track active line
  useEffect(() => {
    const cursorIdx = userInput.length;
    const lineIdx = lines.findIndex(l => cursorIdx >= l.startIndex && cursorIdx <= l.endIndex + (cursorIdx === targetText.length ? 0 : 1));
    if (lineIdx !== -1) setActiveLineIndex(lineIdx);
  }, [userInput.length, lines, targetText.length]);

  // ── Caret position in VISIBLE space ───────────────────────────────────────
  const visibleRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!visibleRef.current) return;
    const activeWordAndChar = visibleRef.current.querySelectorAll<HTMLElement>("span.char-span");
    if (activeWordAndChar.length === 0) return;

    const targetIdx = Math.min(userInput.length, targetText.length - 1);
    const activeSpan = activeWordAndChar[targetIdx];
    if (!activeSpan) return;

    const containerRect = visibleRef.current.getBoundingClientRect();
    const spanRect = activeSpan.getBoundingClientRect();

    if (userInput.length === targetText.length && targetText.length > 0) {
      const lastSpan = activeWordAndChar[targetText.length - 1];
      const lr = lastSpan.getBoundingClientRect();
      setCaretPos({ top: lr.top - containerRect.top, left: lr.right - containerRect.left });
    } else {
      setCaretPos({ top: spanRect.top - containerRect.top, left: spanRect.left - containerRect.left });
    }
  }, [userInput.length, targetText.length, activeLineIndex, lines]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleClick = () => inputRef.current?.focus();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.length > 0) {
      const char = val.slice(-1);
      const targetChar = targetText[userInput.length];
      if (char !== targetChar) {
        setShake(true);
        setTimeout(() => setShake(false), 200);
      }
      updateInput(char);
    }
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (soundEnabled) {
      const k = e.key;
      const isModifier = ["Shift", "Alt", "Control", "Meta"].includes(k);
      const isNav = ["Tab", "Escape", "Enter"].includes(k);
      if (!isModifier && !isNav) {
        void typingSound.unlock();
        typingSound.play();
      }
    }
    if (e.key === "Backspace") backspace();
  };

  const handleBackClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    resetToMenu();
  };

  // ── Rendering logic ───────────────────────────────────────────────────────
  // Waterfall window: current line is pinned to index 1 (or 0 if at start)
  const windowStart = Math.max(0, activeLineIndex - LINES_ABOVE);
  // Ensure we always show VISIBLE_LINES if possible
  const clampedStart = Math.max(0, Math.min(windowStart, lines.length - VISIBLE_LINES));
  const visibleLines = lines.slice(clampedStart, clampedStart + VISIBLE_LINES);

  const words = useMemo(() => buildWords(targetText), [targetText]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center pt-24 md:pt-32 pb-16 px-4 md:px-8 bg-[var(--background)] text-[color:var(--foreground)] selection:bg-[color:var(--caret)]/25">
      <AudioPreload />
      <StatsBar />

      <div className="absolute top-0 left-0 w-full flex flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6 md:py-6 z-50 min-h-[80px]">
        <button
          onClick={handleBackClick}
          className="inline-flex items-center gap-2 rounded-full border border-[color:var(--foreground)]/12 bg-[color:var(--foreground)]/6 px-3 py-2 text-xs font-medium text-[color:var(--foreground)]/70 hover:text-[color:var(--foreground)] transition backdrop-blur"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
          <span className="text-[10px] opacity-60 ml-1 border border-current/30 px-1.5 py-0.5 rounded hidden sm:inline-block">Esc</span>
        </button>

        <div className="flex items-center gap-2">
          <SoundToggle />
          <ThemeToggle />
        </div>
      </div>

      <div className="w-[95%] sm:w-[90%] md:w-[75%] max-w-[95vw] md:max-w-[75vw] flex flex-col gap-6 md:gap-8 p-4 sm:p-6 md:p-10 rounded-3xl backdrop-blur-sm bg-[color:var(--foreground)]/5 border border-[color:var(--foreground)]/10 shadow-2xl relative">
        <div className="flex flex-col items-center w-full gap-4">
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4 md:gap-0">
            <TimerSelector />
            <GenreSelector />
          </div>

          <ProgressBar />

          {status === "finished" ? (
            <TestComplete />
          ) : (
            <div className={`relative w-full cursor-text ${shake ? "animate-shake" : ""}`} onClick={handleClick}>
              
              <div 
                className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-700 z-[60] bg-[var(--background)]/95 backdrop-blur-sm ${
                  userInput.length > 0 ? "opacity-0" : "opacity-100"
                }`}
              >
                <div className="px-6 py-4 rounded-2xl shadow-xl flex flex-col items-center border border-[color:var(--foreground)]/10 bg-[color:var(--foreground)]/5 backdrop-blur">
                  <p className="text-base sm:text-xl font-medium text-[color:var(--foreground)]/80 mb-3 drop-shadow-md">Start typing to begin</p>
                  <p className="text-[10px] sm:text-xs font-semibold tracking-wider text-[color:var(--foreground)]/50 uppercase border border-[color:var(--foreground)]/20 px-2 py-1 rounded">Press ESC to exit</p>
                </div>
              </div>

              <input
                ref={inputRef}
                type="text"
                className="absolute w-0 h-0 opacity-0 pointer-events-none"
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                autoFocus
                autoComplete="off"
                spellCheck="false"
                aria-label="Typing input field"
              />

              <div 
                ref={measureRef} 
                aria-hidden="true" 
                className="absolute top-0 left-0 w-full text-lg sm:text-xl md:text-2xl font-mono leading-relaxed tracking-tight flex flex-wrap opacity-0 pointer-events-none"
                style={{ visibility: "hidden" }}
              >
                {words.map((w, wi) => (
                  <div key={wi} className="m-word flex whitespace-nowrap items-baseline">
                    {w.chars.map((ch, ci) => (
                      <span key={ci} className="m-char relative leading-[1.5]" data-char={ch}>{ch === " " ? "\u00A0" : ch}</span>
                    ))}
                  </div>
                ))}
              </div>

              {/* ── VISIBLE WATERFALL ── */}
              <div
                ref={visibleRef}
                className="relative w-full text-lg sm:text-xl md:text-2xl font-mono leading-relaxed tracking-tight overflow-hidden flex flex-col items-center"
                style={{ height: `calc(${VISIBLE_LINES} * 1em * 1.625)` }} /* line-height 1.625 (relaxed) */
              >
                {/* Caret Wrapper */}
                {targetText.length > 0 && (
                  <div
                    className={`absolute z-20 flex items-end ${status === "idle" ? "animate-pulse" : ""}`}
                    style={{
                      height: "1.5em",
                      top: caretPos.top,
                      left: caretPos.left,
                      transition: "left 75ms cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    }}
                  >
                    <div 
                      className="w-[3px] bg-[color:var(--caret)] relative bottom-[0.1em]" 
                      style={{ height: "1.1em", boxShadow: "0 0 12px var(--caret)" }} 
                    />
                  </div>
                )}

                {/* VISIBLE LINES rendering */}
                <div className="w-full flex flex-col items-center transition-all duration-300">
                  {visibleLines.map((line, li) => {
                    const globalLineIdx = clampedStart + li;
                    const isLineActive = globalLineIdx === activeLineIndex;
                    
                    // High-level fading
                    const opacity = isLineActive ? "opacity-100" : (globalLineIdx < activeLineIndex ? "opacity-15" : "opacity-30");

                    return (
                      <div 
                        key={globalLineIdx} 
                        className={`w-full flex flex-wrap justify-center items-baseline gap-x-0 transition-opacity duration-300 ${opacity}`}
                      >
                        {line.words.map((word, wi) => {
                          const isWordActive = userInput.length >= word.startIndex && userInput.length < word.startIndex + word.chars.length;
                          
                          return (
                            <div 
                              key={word.startIndex} 
                              className={`flex whitespace-nowrap items-baseline transition-all duration-200 ${isWordActive ? "scale-[1.02] drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]" : "scale-100"}`}
                            >
                              {word.chars.map((ch, ci) => {
                                const globalIndex = word.startIndex + ci;
                                let colorClass = "text-gray-200";
                                if (globalIndex < userInput.length) {
                                  colorClass = userInput[globalIndex] === ch ? "text-green-500 font-bold" : "text-red-500 bg-red-500/20 underline decoration-red-500 decoration-2 underline-offset-[6px] font-bold rounded-[2px]";
                                }

                                const activeUnderline = (isWordActive && ch !== " " && !colorClass.includes("underline")) 
                                  ? "underline decoration-[color:var(--caret)]/60 decoration-2 underline-offset-[6px]" 
                                  : "";

                                return (
                                  <span key={globalIndex} className={`char-span relative leading-[1.5] ${colorClass} ${activeUnderline} transition-colors duration-150`}>
                                    {ch === " " ? "\u00A0" : ch}
                                  </span>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

                {/* Edge Fades */}
                <div className="absolute top-0 left-0 w-full h-8 pointer-events-none z-10 bg-gradient-to-b from-[var(--background)] to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-8 pointer-events-none z-10 bg-gradient-to-t from-[var(--background)] to-transparent" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
