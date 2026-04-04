'use client';

import { useState, useEffect, useRef } from 'react';

// ── Configuración ────────────────────────────────────────────
const CONFIG = {
  totalQuestions: 15,
  difficulty: {
    facil:   { label: 'Fácil',    seconds: 10, points: 1 },
    medio:   { label: 'Medio',    seconds: 6,  points: 2 },
    dificil: { label: 'Difícil',  seconds: 3,  points: 3 },
  } as const,
};

type DiffKey = keyof typeof CONFIG.difficulty;

interface Question {
  a: number;
  b: number;
  correct: number;
  options: number[];
}

// ── Audio ────────────────────────────────────────────────────
function playTone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.3) {
  try {
    const ac   = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc  = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    gain.gain.setValueAtTime(vol, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + dur);
  } catch (_) {}
}

const soundCorrect = () => { playTone(520, 0.12); setTimeout(() => playTone(660, 0.15, 'sine', 0.25), 100); };
const soundWrong   = () => playTone(220, 0.25, 'sawtooth', 0.2);
const soundAlert   = () => playTone(440, 0.08, 'square', 0.15);

// ── Helpers ──────────────────────────────────────────────────
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateOptions(correct: number): number[] {
  const opts = new Set([correct]);
  while (opts.size < 3) {
    const delta = randInt(1, 4) * (Math.random() < 0.5 ? 1 : -1);
    const wrong = correct + delta * randInt(1, 3);
    if (wrong > 0 && wrong !== correct) opts.add(wrong);
  }
  return shuffle([...opts]);
}

function generateQuestions(tableRange: number): Question[] {
  return Array.from({ length: CONFIG.totalQuestions }, () => {
    const a = tableRange === 0 ? randInt(1, 12) : tableRange;
    const b = randInt(1, 12);
    const correct = a * b;
    return { a, b, correct, options: generateOptions(correct) };
  });
}

// ── Tipos de pantalla ────────────────────────────────────────
type Screen = 'setup' | 'game' | 'result';

// ── Componente principal ─────────────────────────────────────
export default function TablasMult() {
  const [screen,      setScreen]      = useState<Screen>('setup');
  const [tableRange,  setTableRange]  = useState(0);
  const [diffKey,     setDiffKey]     = useState<DiffKey | null>(null);
  const [questions,   setQuestions]   = useState<Question[]>([]);
  const [current,     setCurrent]     = useState(0);
  const [score,       setScore]       = useState(0);
  const [hits,        setHits]        = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [answered,    setAnswered]    = useState(false);
  const [optStates,   setOptStates]   = useState<Record<number, 'correct' | 'wrong' | null>>({});
  const [alerting,    setAlerting]    = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const diff = diffKey ? CONFIG.difficulty[diffKey] : null;

  // ── Iniciar juego ──────────────────────────────────────────
  function startGame() {
    if (!diffKey) return;
    setCurrent(0);
    setScore(0);
    setHits(0);
    setQuestions(generateQuestions(tableRange));
    setScreen('game');
  }

  // ── Timer ──────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== 'game' || !diff) return;
    setSecondsLeft(diff.seconds);
    setAnswered(false);
    setOptStates({});
    setAlerting(false);
  }, [screen, current]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (screen !== 'game' || answered || !diff) return;

    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        const next = prev - 1;
        if (next <= 2 && next > 0) soundAlert();
        if (next <= 2) setAlerting(true);
        if (next <= 0) {
          clearInterval(timerRef.current!);
          soundWrong();
          setAnswered(true);
          // Mostrar respuesta correcta
          setOptStates(() => {
            const q = questions[current];
            return { [q.correct]: 'correct' };
          });
          setTimeout(() => advance(), 800);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [screen, current, answered]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Responder ──────────────────────────────────────────────
  function handleAnswer(val: number) {
    if (answered) return;
    clearInterval(timerRef.current!);
    setAnswered(true);

    const q = questions[current];
    const correct = val === q.correct;

    if (correct) {
      setScore(s => s + diff!.points);
      setHits(h => h + 1);
      soundCorrect();
      setOptStates({ [q.correct]: 'correct' });
    } else {
      soundWrong();
      setOptStates({ [q.correct]: 'correct', [val]: 'wrong' });
    }

    setTimeout(() => advance(), 600);
  }

  function advance() {
    setCurrent(c => {
      const next = c + 1;
      if (next >= CONFIG.totalQuestions) {
        setScreen('result');
      }
      return next;
    });
  }

  // ── Circumference para SVG ─────────────────────────────────
  const CIRCUMFERENCE = 94.25;
  const arcOffset = diff
    ? CIRCUMFERENCE * (1 - secondsLeft / diff.seconds)
    : 0;

  // ── Render ─────────────────────────────────────────────────
  if (screen === 'setup') {
    return (
      <div className="tg-setup">
        <div className="tg-section-label">¿Hasta qué tabla practicar?</div>
        <div className="tg-table-selector">
          {[0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
            <button
              key={n}
              className={`tg-table-btn${tableRange === n ? ' tg-table-btn--active' : ''}`}
              onClick={() => setTableRange(n)}
            >
              {n === 0 ? 'Todas (1–12)' : `Tabla del ${n}`}
            </button>
          ))}
        </div>

        <div className="tg-section-label" style={{ marginTop: '1.5rem' }}>Dificultad</div>
        <div className="tg-difficulty">
          {(Object.entries(CONFIG.difficulty) as [DiffKey, typeof CONFIG.difficulty[DiffKey]][]).map(([key, d]) => (
            <button
              key={key}
              className={`tg-diff-btn${diffKey === key ? ' tg-diff-btn--active' : ''}`}
              onClick={() => setDiffKey(key)}
            >
              <span className={`tg-diff-dot tg-diff-dot--${key}`} />
              <span>{d.label}</span>
              <span className="tg-diff-sub">{d.seconds}s por pregunta</span>
            </button>
          ))}
        </div>

        <button className="tg-start-btn" disabled={!diffKey} onClick={startGame}>
          Jugar
        </button>
      </div>
    );
  }

  if (screen === 'game' && questions.length > 0) {
    const q = questions[Math.min(current, CONFIG.totalQuestions - 1)];
    return (
      <div className="tg-game">
        <div className="tg-hud">
          <div className="tg-timer">
            <svg viewBox="0 0 36 36" width="48" height="48">
              <circle cx="18" cy="18" r="15" fill="none" stroke="var(--tg-timer-track,#e5e7eb)" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15" fill="none"
                stroke={alerting ? '#ef4444' : 'var(--tg-timer-bar,#0d9488)'}
                strokeWidth="3"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={arcOffset}
                strokeLinecap="round"
                transform="rotate(-90 18 18)"
              />
            </svg>
            <span className="tg-timer-num" style={{ color: alerting ? '#ef4444' : undefined }}>
              {secondsLeft}
            </span>
          </div>

          <div className="tg-progress">
            <span>{current + 1}</span>/<span>{CONFIG.totalQuestions}</span>
          </div>

          <div className="tg-score-box">
            <span className="tg-heart">♥</span>
            <span>{score}</span>
          </div>
        </div>

        <div className="tg-question">{q.a} × {q.b}</div>

        <div className="tg-options">
          {q.options.map(opt => (
            <button
              key={opt}
              className={`tg-opt-btn${optStates[opt] === 'correct' ? ' tg-opt--correct' : optStates[opt] === 'wrong' ? ' tg-opt--wrong' : ''}`}
              disabled={answered}
              onClick={() => handleAnswer(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (screen === 'result') {
    const maxScore = CONFIG.totalQuestions * (diff?.points ?? 1);
    const pct = Math.round((hits / CONFIG.totalQuestions) * 100);
    const emoji = pct === 100 ? '🏆' : pct >= 80 ? '⭐' : pct >= 50 ? '👍' : '💪';
    const title = pct === 100 ? '¡Perfecto!' : pct >= 80 ? '¡Muy bien!' : pct >= 50 ? '¡Bien!' : '¡Sigue practicando!';

    return (
      <div className="tg-result">
        <div className="tg-result-emoji">{emoji}</div>
        <h3 className="tg-result-title">{title}</h3>
        <div className="tg-result-stats">
          <div className="tg-stat">
            <span className="tg-stat-val">{hits}<span className="tg-stat-total">/{CONFIG.totalQuestions}</span></span>
            <span className="tg-stat-label">Aciertos</span>
          </div>
          <div className="tg-stat">
            <span className="tg-stat-val">{score}<span className="tg-stat-total">/{maxScore}</span></span>
            <span className="tg-stat-label">Puntos</span>
          </div>
          <div className="tg-stat">
            <span className="tg-stat-val">{pct}<span className="tg-stat-total">%</span></span>
            <span className="tg-stat-label">Precisión</span>
          </div>
        </div>
        <div className="tg-result-actions">
          <button className="tg-action-btn tg-action-btn--primary" onClick={() => { setCurrent(0); setScreen('setup'); }}>
            Otra vez
          </button>
        </div>
      </div>
    );
  }

  return null;
}