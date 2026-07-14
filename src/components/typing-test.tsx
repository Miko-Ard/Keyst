"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { LANGUAGES, DURATIONS } from "@/lib/types";

import englishWords from "@/data/words/english.json";
import indonesianWords from "@/data/words/indonesian.json";

/* ─── constants ────────────────────────────────────────────────────── */

const WORD_LISTS: Record<string, string[]> = {
  english: englishWords,
  indonesian: indonesianWords,
};

const ease = [0.22, 0.61, 0.36, 1] as const;
const WORDS_COUNT = 300;

/* ─── helpers ──────────────────────────────────────────────────────── */

interface WordResult {
  word: string;
  typed: string;
}

function generateWords(language: string, count = WORDS_COUNT): string[] {
  const list = WORD_LISTS[language] ?? WORD_LISTS.english;
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(list[Math.floor(Math.random() * list.length)]);
  }
  return out;
}

function calcStats(results: WordResult[]) {
  let correctChars = 0;
  let incorrectChars = 0;
  let extraChars = 0;
  let missedChars = 0;

  for (const r of results) {
    const maxLen = Math.max(r.word.length, r.typed.length);
    for (let i = 0; i < maxLen; i++) {
      if (i >= r.typed.length) {
        missedChars++;
      } else if (i >= r.word.length) {
        extraChars++;
      } else if (r.typed[i] === r.word[i]) {
        correctChars++;
      } else {
        incorrectChars++;
      }
    }
  }

  // Count spaces between completed words as correct keystrokes
  const spaces = Math.max(0, results.length - 1);
  correctChars += spaces;

  const totalChars = correctChars + incorrectChars + extraChars;

  return { correctChars, incorrectChars, extraChars, missedChars, totalChars };
}

/* ─── component ────────────────────────────────────────────────────── */

type Phase = "idle" | "typing" | "result";

export function TypingTest() {
  /* ── config ── */
  const [language, setLanguage] = useState("english");
  const [duration, setDuration] = useState(30);

  /* ── test state ── */
  const [phase, setPhase] = useState<Phase>("idle");
  const [words, setWords] = useState<string[]>(() =>
    generateWords("english", WORDS_COUNT)
  );
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [wordResults, setWordResults] = useState<WordResult[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [liveWpm, setLiveWpm] = useState(0);
  const [liveAccuracy, setLiveAccuracy] = useState(100);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  /* ── result ── */
  const [finalWpm, setFinalWpm] = useState(0);
  const [finalRaw, setFinalRaw] = useState(0);
  const [finalAcc, setFinalAcc] = useState(0);
  const [finalCorrect, setFinalCorrect] = useState(0);
  const [finalIncorrect, setFinalIncorrect] = useState(0);

  /* ── refs (avoid stale closures) ── */
  const wrapperRef = useRef<HTMLDivElement>(null);
  const wordsInnerRef = useRef<HTMLDivElement>(null);
  const wordEls = useRef<Map<number, HTMLSpanElement>>(new Map());
  const caretRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const wordResultsRef = useRef<WordResult[]>([]);
  const currentInputRef = useRef("");
  const currentWordIndexRef = useRef(0);
  const wordsRef = useRef<string[]>(words);
  const phaseRef = useRef<Phase>("idle");

  /* keep refs in sync */
  wordResultsRef.current = wordResults;
  currentInputRef.current = currentInput;
  currentWordIndexRef.current = currentWordIndex;
  wordsRef.current = words;
  phaseRef.current = phase;
  startTimeRef.current = startTime;

  /* ── scroll offset ── */
  const [scrollOffset, setScrollOffset] = useState(0);

  /* ── reset ── */
  const resetTest = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const newWords = generateWords(language, WORDS_COUNT);
    setWords(newWords);
    setCurrentWordIndex(0);
    setCurrentInput("");
    setWordResults([]);
    setTimeLeft(duration);
    setStartTime(null);
    setLiveWpm(0);
    setLiveAccuracy(100);
    setSaving(false);
    setSaved(false);
    setPhase("idle");
    setScrollOffset(0);
    setFinalWpm(0);
    setFinalRaw(0);
    setFinalAcc(0);
    setFinalCorrect(0);
    setFinalIncorrect(0);
    wordEls.current.clear();

    // Refocus the typing area
    setTimeout(() => wrapperRef.current?.focus(), 50);
  }, [language, duration]);

  /* when config changes in idle, regenerate */
  useEffect(() => {
    if (phase === "idle") {
      const newWords = generateWords(language, WORDS_COUNT);
      setWords(newWords);
      setTimeLeft(duration);
      setScrollOffset(0);
      setCurrentWordIndex(0);
      setCurrentInput("");
      setWordResults([]);
      wordEls.current.clear();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, duration]);

  /* ── finish test ── */
  const finishTest = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Include current (unfinished) word
    const allResults = [...wordResultsRef.current];
    if (currentInputRef.current.length > 0) {
      allResults.push({
        word: wordsRef.current[currentWordIndexRef.current],
        typed: currentInputRef.current,
      });
    }

    const elapsed = startTimeRef.current
      ? (Date.now() - startTimeRef.current) / 1000
      : duration;
    const minutes = elapsed / 60;
    const { correctChars, incorrectChars, totalChars } = calcStats(allResults);

    const wpm = minutes > 0 ? Math.round(correctChars / 5 / minutes) : 0;
    const raw = minutes > 0 ? Math.round(totalChars / 5 / minutes) : 0;
    const acc =
      correctChars + incorrectChars > 0
        ? Math.round(
            (correctChars / (correctChars + incorrectChars)) * 100
          )
        : 0;

    setFinalWpm(wpm);
    setFinalRaw(raw);
    setFinalAcc(acc);
    setFinalCorrect(correctChars);
    setFinalIncorrect(incorrectChars);
    setPhase("result");

    // Auto-save
    setSaving(true);
    fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wpm,
        rawWpm: raw,
        accuracy: acc,
        duration: Math.round(elapsed),
        language,
        testDuration: duration,
        feeling: "focused",
        notes: "",
      }),
    })
      .then((res) => {
        if (res.ok) setSaved(true);
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  }, [duration, language]);

  /* ── timer tick ── */
  useEffect(() => {
    if (phase !== "typing" || !startTime) return;

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        finishTest();
        return;
      }

      // Live stats
      const minutes = elapsed / 60;
      if (minutes > 0) {
        const { correctChars, incorrectChars } =
          calcStats(wordResultsRef.current);
        setLiveWpm(Math.round(correctChars / 5 / minutes));
        setLiveAccuracy(
          correctChars + incorrectChars > 0
            ? Math.round(
                (correctChars / (correctChars + incorrectChars)) * 100
              )
            : 100
        );
      }
    }, 200);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, startTime, duration, finishTest]);

  /* ── keydown ── */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (phaseRef.current === "result") return;

      // Tab or Escape to restart
      if (e.key === "Tab" || e.key === "Escape") {
        e.preventDefault();
        resetTest();
        return;
      }

      // Ctrl+Backspace → delete whole word
      if (e.key === "Backspace" && e.ctrlKey) {
        e.preventDefault();
        setCurrentInput("");
        return;
      }

      // Ignore other modifier combos
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      /* ── Space → submit current word ── */
      if (e.key === " ") {
        e.preventDefault();
        if (currentInputRef.current.length === 0) return;

        // Start timer on first input
        if (phaseRef.current === "idle") {
          setStartTime(Date.now());
          setPhase("typing");
        }

        setWordResults((prev) => [
          ...prev,
          {
            word: wordsRef.current[currentWordIndexRef.current],
            typed: currentInputRef.current,
          },
        ]);
        setCurrentWordIndex((prev) => prev + 1);
        setCurrentInput("");
        return;
      }

      /* ── Backspace ── */
      if (e.key === "Backspace") {
        e.preventDefault();

        // If current input is empty, go back to previous word
        if (
          currentInputRef.current.length === 0 &&
          currentWordIndexRef.current > 0
        ) {
          const prevIndex = currentWordIndexRef.current - 1;
          const prevResult = wordResultsRef.current[prevIndex];
          if (prevResult) {
            setCurrentWordIndex(prevIndex);
            setCurrentInput(prevResult.typed);
            setWordResults((prev) => prev.slice(0, -1));
          }
        } else {
          setCurrentInput((prev) => prev.slice(0, -1));
        }
        return;
      }

      /* ── Printable character ── */
      if (e.key.length === 1) {
        e.preventDefault();

        // Start timer on first char
        if (phaseRef.current === "idle") {
          setStartTime(Date.now());
          setPhase("typing");
        }

        setCurrentInput((prev) => prev + e.key);
      }
    },
    [resetTest]
  );

  /* ── focus management ── */
  useEffect(() => {
    if (phase !== "result") {
      wrapperRef.current?.focus();
    }
  }, [phase]);

  /* ── scroll tracking ── */
  useLayoutEffect(() => {
    if (phase === "result") return;

    const currentEl = wordEls.current.get(currentWordIndex);
    const firstEl = wordEls.current.get(0);
    if (!currentEl || !firstEl) return;

    const lineHeight = firstEl.offsetHeight + 10;
    const currentTop = currentEl.offsetTop - firstEl.offsetTop;
    const currentLine = Math.floor(currentTop / lineHeight);
    const newOffset = Math.max(0, currentLine - 1) * lineHeight;

    setScrollOffset(newOffset);
  }, [currentWordIndex, phase, words]);

  /* ── caret position ── */
  useLayoutEffect(() => {
    if (phase === "result" || !caretRef.current || !wordsInnerRef.current)
      return;

    const wordEl = wordEls.current.get(currentWordIndex);
    if (!wordEl) return;

    const chars = wordEl.querySelectorAll<HTMLSpanElement>(".char, .extra");
    const containerRect = wordsInnerRef.current.getBoundingClientRect();

    let x: number;
    let y: number;

    if (currentInput.length === 0) {
      // Before first char of word
      const rect = (chars[0] ?? wordEl).getBoundingClientRect();
      x = rect.left - containerRect.left;
      y = rect.top - containerRect.top;
    } else {
      // After the last typed char
      const idx = Math.min(currentInput.length - 1, chars.length - 1);
      const target = chars[idx];
      if (target) {
        const rect = target.getBoundingClientRect();
        x = rect.right - containerRect.left;
        y = rect.top - containerRect.top;
      } else {
        const rect = wordEl.getBoundingClientRect();
        x = rect.right - containerRect.left;
        y = rect.top - containerRect.top;
      }
    }

    caretRef.current.style.transform = `translate(${x}px, ${y}px)`;
  }, [currentInput, currentWordIndex, phase, words]);

  /* ── word rendering ── */
  const renderedWords = useMemo(() => {
    return words.map((word, wi) => {
      const isActive = wi === currentWordIndex;
      const isPast = wi < currentWordIndex;
      const result = isPast ? wordResults[wi] : undefined;
      const input = isActive ? currentInput : "";

      // Underline incorrect past words
      const isIncorrect =
        isPast && result && (result.typed !== result.word);

      return (
        <span
          key={`${wi}`}
          ref={(el) => {
            if (el) wordEls.current.set(wi, el);
          }}
          className={`inline-block mr-[0.6em] mb-[0.4em] ${
            isPast ? "opacity-50" : ""
          } ${isIncorrect ? "border-b-2 border-[#ca7070]/50" : ""}`}
        >
          {word.split("").map((char, ci) => {
            let cls = "char ";

            if (isPast && result) {
              if (ci < result.typed.length) {
                cls +=
                  result.typed[ci] === char
                    ? "text-ink"
                    : "text-[#ca7070]";
              } else {
                cls += "text-[#ca7070]/40";
              }
            } else if (isActive) {
              if (ci < input.length) {
                cls +=
                  input[ci] === char
                    ? "text-ink"
                    : "text-[#ca7070]";
              } else {
                cls += "text-[#64605a]/40";
              }
            } else {
              // Future words
              cls += "text-[#64605a]/40";
            }

            return (
              <span key={ci} className={cls}>
                {char}
              </span>
            );
          })}
          {/* Extra chars (typed more than the word) */}
          {isActive &&
            input.length > word.length &&
            input
              .slice(word.length)
              .split("")
              .map((ch, ei) => (
                <span
                  key={`e${ei}`}
                  className="extra text-[#ca7070]/70"
                >
                  {ch}
                </span>
              ))}
          {isPast &&
            result &&
            result.typed.length > word.length &&
            result.typed
              .slice(word.length)
              .split("")
              .map((ch, ei) => (
                <span
                  key={`e${ei}`}
                  className="extra text-[#ca7070]/50"
                >
                  {ch}
                </span>
              ))}
        </span>
      );
    });
  }, [words, currentWordIndex, currentInput, wordResults]);

  /* ── config bar ── */
  const configBar = (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease }}
      className="flex flex-wrap items-center justify-center gap-3"
    >
      {/* Language pills */}
      <div className="inline-flex rounded-full bg-surface/80 p-1">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.value}
            onClick={() => {
              if (phase !== "idle") return;
              setLanguage(lang.value);
            }}
            className={`relative rounded-full px-4 py-1.5 text-xs font-medium transition-colors duration-200 ${
              language === lang.value
                ? "text-ink"
                : "text-ink-soft/60 hover:text-ink-soft"
            } ${phase !== "idle" ? "pointer-events-none opacity-40" : ""}`}
          >
            {language === lang.value && (
              <motion.span
                layoutId="lang-pill"
                className="absolute inset-0 rounded-full bg-background shadow-soft"
                transition={{ duration: 0.25, ease }}
              />
            )}
            <span className="relative">{lang.label}</span>
          </button>
        ))}
      </div>

      <span className="h-4 w-px bg-ink-soft/15" />

      {/* Duration pills */}
      <div className="inline-flex rounded-full bg-surface/80 p-1">
        {DURATIONS.map((d) => (
          <button
            key={d}
            onClick={() => {
              if (phase !== "idle") return;
              setDuration(d);
            }}
            className={`relative rounded-full px-4 py-1.5 text-xs font-medium tabular-nums transition-colors duration-200 ${
              duration === d
                ? "text-ink"
                : "text-ink-soft/60 hover:text-ink-soft"
            } ${phase !== "idle" ? "pointer-events-none opacity-40" : ""}`}
          >
            {duration === d && (
              <motion.span
                layoutId="dur-pill"
                className="absolute inset-0 rounded-full bg-background shadow-soft"
                transition={{ duration: 0.25, ease }}
              />
            )}
            <span className="relative">{d}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );

  /* ── timer bar ── */
  const timerProgress = phase === "typing" ? timeLeft / duration : 1;

  /* ─────────── RESULT SCREEN ─────────── */
  if (phase === "result") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Top bar */}
        <header className="border-b border-border/50">
          <div className="mx-auto flex h-14 max-w-[1250px] items-center justify-between px-5">
            <Link
              href="/"
              className="flex items-center gap-2 transition-opacity hover:opacity-70"
            >
              <span className="text-lg" aria-hidden>⌨</span>
              <span className="font-display text-base tracking-tight text-ink">
                Keyst
              </span>
            </Link>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[600px] px-5 py-16">
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease }}
                className="text-center"
              >
                {/* Big WPM */}
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease, delay: 0.1 }}
                >
                  <span className="text-xs font-medium uppercase tracking-[0.16em] text-ink-soft/60">
                    wpm
                  </span>
                  <p className="font-mono text-8xl leading-none tracking-tighter text-ink tabular-nums md:text-9xl">
                    {finalWpm}
                  </p>
                </motion.div>

                {/* Stats grid */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease, delay: 0.25 }}
                  className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4"
                >
                  <ResultStat label="raw" value={`${finalRaw}`} />
                  <ResultStat label="accuracy" value={`${finalAcc}%`} />
                  <ResultStat label="correct" value={`${finalCorrect}`} />
                  <ResultStat
                    label="errors"
                    value={`${finalIncorrect}`}
                    error={finalIncorrect > 0}
                  />
                </motion.div>

                {/* Meta */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="mt-5 flex items-center justify-center gap-3 text-xs text-ink-soft/50"
                >
                  <span className="capitalize">{language}</span>
                  <span>·</span>
                  <span>{duration}s</span>
                  <span>·</span>
                  <span>
                    {saving ? "saving…" : saved ? "✓ saved" : ""}
                  </span>
                </motion.div>

                {/* Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease, delay: 0.35 }}
                  className="mt-8 flex flex-wrap items-center justify-center gap-3"
                >
                  <button
                    onClick={resetTest}
                    className="inline-flex items-center gap-2 rounded-full bg-[#3B3B3B] px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-[#2a2a2a] active:scale-[0.97]"
                  >
                    <RepeatIcon />
                    Try again
                  </button>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm font-medium text-ink-soft transition-all duration-200 hover:text-ink hover:bg-card active:scale-[0.97]"
                  >
                    ← Dashboard
                  </Link>
                </motion.div>

                <p className="mt-6 text-[10px] text-ink-soft/30">
                  <kbd className="rounded border border-border/50 bg-surface/60 px-1.5 py-0.5 font-mono text-[10px]">tab</kbd>{" "}
                  or{" "}
                  <kbd className="rounded border border-border/50 bg-surface/60 px-1.5 py-0.5 font-mono text-[10px]">esc</kbd>{" "}
                  — restart
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────── TYPING / IDLE SCREEN ─────────── */
  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      onClick={() => wrapperRef.current?.focus()}
    >
      {/* Top bar */}
      <header className="border-b border-border/50">
        <div className="mx-auto flex h-14 max-w-[1250px] items-center justify-between px-5">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-70"
          >
            <span className="text-lg" aria-hidden>⌨</span>
            <span className="font-display text-base tracking-tight text-ink">
              Keyst
            </span>
          </Link>

          {/* Live stats */}
          <AnimatePresence>
            {phase === "typing" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-4 font-mono text-sm tabular-nums"
              >
                <span className="text-ink-soft/50">
                  <span className="text-lg text-ink">{liveWpm}</span>{" "}
                  <span className="text-xs">wpm</span>
                </span>
                <span className="h-3 w-px bg-ink-soft/15" />
                <span className="text-ink-soft/50">
                  <span className="text-lg text-ink">{liveAccuracy}</span>
                  <span className="text-xs">%</span>
                </span>
                <span className="h-3 w-px bg-ink-soft/15" />
                <span className="text-lg text-ink">
                  {Math.ceil(timeLeft)}
                  <span className="text-xs text-ink-soft/50">s</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <Link
            href="/"
            className="text-xs text-ink-soft/50 transition-colors hover:text-ink-soft"
          >
            ← back
          </Link>
        </div>
      </header>

      {/* Timer bar */}
      <div className="h-[2px] bg-transparent">
        <motion.div
          className="h-full bg-ink-soft/20 origin-left"
          animate={{ scaleX: timerProgress }}
          transition={{ duration: 0.3, ease: "linear" }}
          style={{ transformOrigin: "left" }}
        />
      </div>

      {/* Main content — centered vertically */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-[1250px] px-5">
          {/* Config bar */}
          <div className="mb-8">{configBar}</div>

          {/* Words area — no border, clean */}
          <div
            ref={wrapperRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            className="relative cursor-text outline-none select-none"
          >
            {/* Scrollable words container */}
            <div className="relative overflow-hidden" style={{ height: "150px" }}>
              <div
                ref={wordsInnerRef}
                className="relative font-mono text-[1.75rem] leading-[1.8] tracking-[0.03em]"
                style={{
                  transform: `translateY(-${scrollOffset}px)`,
                  transition:
                    "transform 0.2s cubic-bezier(0.22,0.61,0.36,1)",
                }}
              >
                {/* Caret */}
                <div
                  ref={caretRef}
                  className={`absolute top-[0.25em] h-[1em] w-[2px] rounded-full bg-[#3B3B3B] ${
                    phase === "idle" ? "animate-caret" : ""
                  }`}
                  style={{
                    zIndex: 10,
                    transition: "transform 80ms ease-out",
                  }}
                />
                {renderedWords}
              </div>
            </div>

            {/* Start hint */}
            <AnimatePresence>
              {phase === "idle" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  className="mt-4 text-center text-xs text-ink-soft/30"
                >
                  start typing
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom hints */}
          <div className="mt-10 flex items-center justify-center gap-5 text-[10px] text-ink-soft/25">
            <span>
              <kbd className="font-mono">tab</kbd> — restart
            </span>
            <span>
              <kbd className="font-mono">esc</kbd> — reset
            </span>
            <span>
              <kbd className="font-mono">backspace</kbd> — previous word
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── sub-components ───────────────────────────────────────────────── */

function ResultStat({
  label,
  value,
  error = false,
}: {
  label: string;
  value: string;
  error?: boolean;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-surface/60 px-4 py-4">
      <span
        className={`font-mono text-2xl tabular-nums ${
          error ? "text-[#ca7070]" : "text-ink"
        }`}
      >
        {value}
      </span>
      <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-soft/50">
        {label}
      </span>
    </div>
  );
}

function RepeatIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}
