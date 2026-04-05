'use client';

import { useState, useEffect, useRef } from 'react';

const CONFIG = {
  gameDuration: 60,
  difficulty: {
    mfacil:  { label: 'Muy fácil', emoji: '😊', options: 2, lives: 5, goal: 10  },
    facil:   { label: 'Fácil',     emoji: '😄', options: 3, lives: 5, goal: 12  },
    medio:   { label: 'Medio',     emoji: '🤩', options: 3, lives: 5, goal: 15  },
    dificil: { label: 'Difícil',   emoji: '😎', options: 3, lives: 3, goal: 20  },
  } as const,
};

type DiffKey = keyof typeof CONFIG.difficulty;
type EndReason = 'tiempo' | 'copa' | 'vidas';

interface Question {
  a: number;
  b: number;
  correct: number;
  options: number[];
}

const HIT_MESSAGES  = ['¡Bien!', '¡Excelente!', '¡Súper!', '¡Genial!', '¡Crack!', '¡Perfecto!'];
const MISS_MESSAGES = ['¡Ups!', 'Ohhh...', 'Nuuu...', '¡Casi!', 'No fue...'];

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

const soundCorrect = () => {
  playTone(520, 0.1);
  setTimeout(() => playTone(660, 0.12, 'sine', 0.25), 80);
  setTimeout(() => playTone(800, 0.1, 'sine', 0.2), 180);
};
const soundWrong = () => playTone(200, 0.3, 'sawtooth', 0.2);
const soundWin   = () => {
  [520, 660, 780, 1040].forEach((f, i) => setTimeout(() => playTone(f, 0.15, 'sine', 0.25), i * 120));
};

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateOptions(correct: number, count: number): number[] {
  const opts = new Set([correct]);
  while (opts.size < count) {
    const delta = randInt(1, 3) * (Math.random() < 0.5 ? 1 : -1);
    const wrong = correct + delta;
    if (wrong > 0 && wrong !== correct) opts.add(wrong);
  }
  return shuffle([...opts]);
}

function generateQuestion(tableRange: number, optionCount: number): Question {
  const a = tableRange === 0 ? randInt(1, 12) : tableRange;
  const b = randInt(1, 12);
  const correct = a * b;
  return { a, b, correct, options: generateOptions(correct, optionCount) };
}

const CHIP_COLORS: Record<number, string> = {
  0: 'tg-chip-0', 2: 'tg-chip-2', 3: 'tg-chip-3', 4: 'tg-chip-4',
  5: 'tg-chip-5', 6: 'tg-chip-6', 7: 'tg-chip-7', 8: 'tg-chip-8',
  9: 'tg-chip-9', 10: 'tg-chip-10', 11: 'tg-chip-11', 12: 'tg-chip-12',
};
const CHIP_ROTATIONS = [-2, 1.5, -1, 2, 1, -2.5, 1.5, -1, 2, -1.5, 1, -2];
const CHIPS = [
  { n: 0,  label: 'Todas (1–12)' },
  { n: 2,  label: 'Tabla del 2'  },
  { n: 3,  label: 'Tabla del 3'  },
  { n: 4,  label: 'Tabla del 4'  },
  { n: 5,  label: 'Tabla del 5'  },
  { n: 6,  label: 'Tabla del 6'  },
  { n: 7,  label: 'Tabla del 7'  },
  { n: 8,  label: 'Tabla del 8'  },
  { n: 9,  label: 'Tabla del 9'  },
  { n: 10, label: 'Tabla del 10' },
  { n: 11, label: 'Tabla del 11' },
  { n: 12, label: 'Tabla del 12' },
];
const DIFF_ORDER: DiffKey[] = ['mfacil', 'facil', 'medio', 'dificil'];

const OPT_COLORS = [
  '#FF66FF', '#92D050', '#00B0F0', '#FFC000',
  '#FFFF00', '#9C85FF', '#FF0066', '#25D366',
  '#FF5050', '#00FFFF', '#00FF00', '#CC3300',
];

type Screen = 'setup' | 'game' | 'result';

export default function TablasMult() {
  const [screen,     setScreen]     = useState<Screen>('setup');
  const [tableRange, setTableRange] = useState(0);
  const [diffKey,    setDiffKey]    = useState<DiffKey | null>(null);
  const [question,   setQuestion]   = useState<Question | null>(null);
  const [hits,       setHits]       = useState(0);
  const [misses,     setMisses]     = useState(0);
  const [lives,      setLives]      = useState(5);
  const [timeLeft,   setTimeLeft]   = useState(CONFIG.gameDuration);
  const [answered,   setAnswered]   = useState(false);
  const [optStates,  setOptStates]  = useState<Record<number, 'correct' | 'wrong' | null>>({});
  const [feedback,   setFeedback]   = useState<{ msg: string; ok: boolean } | null>(null);
  const [endReason,  setEndReason]  = useState<EndReason | null>(null);
  const [optColors, setOptColors] = useState<string[]>([]);

  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const diff = diffKey ? CONFIG.difficulty[diffKey] : null;

  function startGame() {
    if (!diffKey || !diff) return;
    setHits(0);
    setMisses(0);
    setLives(diff.lives);
    setTimeLeft(CONFIG.gameDuration);
    setAnswered(false);
    setOptStates({});
    setFeedback(null);
    setEndReason(null);
    setOptColors(randomColors(diff.options));
    setQuestion(generateQuestion(tableRange, diff.options));
    setScreen('game');
  }

  useEffect(() => {
    if (screen !== 'game') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setEndReason('tiempo');
          setScreen('result');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [screen]);

  function randomColors(count: number): string[] {
  return shuffle([...OPT_COLORS]).slice(0, count);
}

  function handleAnswer(val: number) {
    if (answered || !question || !diff) return;
    setAnswered(true);
    const ok = val === question.correct;

    if (ok) {
      soundCorrect();
      setOptStates({ [question.correct]: 'correct' });
      const newHits = hits + 1;
      setHits(newHits);
      showFeedback(pick(HIT_MESSAGES), true);
      if (newHits >= diff.goal) {
        clearInterval(timerRef.current!);
        setTimeout(() => { soundWin(); setEndReason('copa'); setScreen('result'); }, 400);
        return;
      }
    } else {
      soundWrong();
      setOptStates({ [question.correct]: 'correct', [val]: 'wrong' });
      setMisses(m => m + 1);
      const newLives = lives - 1;
      setLives(newLives);
      showFeedback(pick(MISS_MESSAGES), false);
      if (newLives <= 0) {
        clearInterval(timerRef.current!);
        setTimeout(() => { setEndReason('vidas'); setScreen('result'); }, 600);
        return;
      }
    }

    setTimeout(() => {
      setAnswered(false);
      setOptStates({});
      setOptColors(randomColors(diff.options));
      setQuestion(generateQuestion(tableRange, diff.options));
    }, 500);
  }

  function showFeedback(msg: string, ok: boolean) {
    setFeedback({ msg, ok });
    if (feedbackRef.current) clearTimeout(feedbackRef.current);
    feedbackRef.current = setTimeout(() => setFeedback(null), 900);
  }

  if (screen === 'setup') {
    return (
      <div className="tg-wrap">
        <div className="tg-game-title">✖ Tablas de multiplicar</div>

        <div className="tg-section-label">Elige tu tabla</div>
        <div className="tg-table-selector">
          {CHIPS.map(({ n, label }, i) => (
            <button
              key={n}
              className={`tg-table-btn ${CHIP_COLORS[n]}${tableRange === n ? ' tg-table-btn--active' : ''}`}
              style={{ transform: `rotate(${CHIP_ROTATIONS[i]}deg)` }}
              onClick={() => setTableRange(n)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="tg-section-label">Dificultad</div>
        <div className="tg-difficulty">
          {DIFF_ORDER.map(key => (
            <button
              key={key}
              className={`tg-diff-btn${diffKey === key ? ' tg-diff-btn--active' : ''}`}
              onClick={() => setDiffKey(key)}
            >
              <span className="tg-diff-emoji">{CONFIG.difficulty[key].emoji}</span>
              <span className="tg-diff-label">{CONFIG.difficulty[key].label}</span>
            </button>
          ))}
        </div>

        <button className="tg-start-btn" disabled={!diffKey} onClick={startGame}>
          JUGAR
        </button>
      </div>
    );
  }

  if (screen === 'game' && question && diff) {
    const progressPct = Math.min((hits / diff.goal) * 100, 100);
    return (
      <div className="tg-wrap">
        <div className="tg-hud">
          <div className="tg-lives">
            {Array.from({ length: diff.lives }).map((_, i) => (
              <span key={i} className={`tg-heart${i >= lives ? ' tg-heart--lost' : ''}`}>♥</span>
            ))}
          </div>
          <div className="tg-timer-box" style={{ color: timeLeft <= 10 ? '#ef4444' : '#1a1a6e' }}>
            ⏱ {timeLeft}s
          </div>
        </div>

        <div className="tg-progress-wrap">
          <div className="tg-progress-bar">
            <div className="tg-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="tg-progress-trophy">🏆</span>
        </div>
        <div className="tg-progress-label">{hits} / {diff.goal} aciertos</div>

        <div className="tg-question" style={{ position: 'relative' }}>
          {question.a} × {question.b}
          {feedback && (
            <span className={`tg-feedback-pop${feedback.ok ? ' tg-feedback-ok' : ' tg-feedback-err'}`}>
              {feedback.msg}
            </span>
          )}
        </div>

        <div className={`tg-options tg-options--${question.options.length}`}>
          {question.options.map((opt, i) => (
            <button
              key={opt}
              className="tg-opt-btn"
              style={{ background: optColors[i] }}
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

  if (screen === 'result' && diff) {
    const gotCopa  = endReason === 'copa';
    const outLives = endReason === 'vidas';
    const emoji = gotCopa ? '🏆' : outLives ? '💔' : hits >= diff.goal * 0.8 ? '⭐' : hits >= diff.goal * 0.5 ? '👍' : '💪';
    const title = gotCopa ? '¡Conseguiste la copa!'
      : outLives ? '¡Se acabaron las vidas!'
      : hits >= diff.goal * 0.8 ? '¡Muy bien!'
      : hits >= diff.goal * 0.5 ? '¡Buen intento!'
      : '¡Sigue practicando!';
    const subtitle = gotCopa ? '¡Lo lograste, eres increíble!'
      : outLives ? `Llegaste a ${hits} aciertos. ¡La próxima lo logras!`
      : `Tiempo agotado. Llegaste a ${hits} de ${diff.goal} aciertos.`;

    return (
      <div className="tg-wrap tg-result">
        <div className="tg-result-emoji">{emoji}</div>
        <div className="tg-result-title">{title}</div>
        <div className="tg-result-subtitle">{subtitle}</div>
        <div className="tg-result-stats">
          <div className="tg-stat">
            <span className="tg-stat-val">{hits}</span>
            <span className="tg-stat-label">Aciertos</span>
          </div>
          <div className="tg-stat">
            <span className="tg-stat-val">{misses}</span>
            <span className="tg-stat-label">Errores</span>
          </div>
          <div className="tg-stat">
            <span className="tg-stat-val">{CONFIG.gameDuration - timeLeft}s</span>
            <span className="tg-stat-label">Tiempo</span>
          </div>
        </div>
        <div className="tg-result-actions">
          <button className="tg-action-btn tg-action-btn--secondary"
            onClick={() => setScreen('setup')}>
            Cambiar opciones
          </button>
          <button className="tg-action-btn tg-action-btn--primary"
            onClick={startGame}>
            Otra vez
          </button>
        </div>
      </div>
    );
  }

  return null;
}