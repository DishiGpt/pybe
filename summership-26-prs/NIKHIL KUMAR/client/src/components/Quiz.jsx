import CodeSlotChallenge from './CodeSlotChallenge';
import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

const Quiz = ({ questions, onPass, onComplete, codeChallenge, onClose }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState('');

  const [jumbleSelected, setJumbleSelected] = useState([]);
  const [debugInput, setDebugInput] = useState('');

  useEffect(() => {
    setJumbleSelected([]);
    setDebugInput('');
    setFeedback('');
  }, [currentQ]);

  const handleNext = (isCorrect) => {
    if (isCorrect) {
      setScore(s => s + 1);
      setFeedback('Correct!');
    } else {
      setFeedback('Incorrect, but keep going!');
    }

    setTimeout(() => {
      if (currentQ + 1 < questions.length) {
        setCurrentQ(currentQ + 1);
      } else {
        setShowResult(true);
        const finalScore = score + (isCorrect ? 1 : 0);
        if (finalScore === questions.length && !codeChallenge) {
          if (onPass) onPass();
          if (onComplete) onComplete();
        }
      }
    }, 1000);
  };

  if (showResult) {
    if (score === questions.length && codeChallenge) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            padding: '14px 18px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid var(--success)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle size={22} color="#10b981" />
              <div>
                <h4 style={{ margin: 0, color: '#34d399', fontSize: '1.1rem', fontWeight: 800 }}>
                  Questions Passed (3/3 Correct)!
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#cbd5e1' }}>
                  Now complete the final practical challenge below to patch the code and unlock the next level!
                </p>
              </div>
            </div>
            <span style={{
              background: '#10b981',
              color: '#000',
              fontWeight: 800,
              fontSize: '0.72rem',
              padding: '3px 10px',
              borderRadius: '20px'
            }}>
              Final Practical Test
            </span>
          </div>

          <CodeSlotChallenge
            {...codeChallenge}
            onClose={onClose}
            onUnlockNextLevel={() => {
              if (onPass) onPass();
              if (onComplete) onComplete();
            }}
          />
        </div>
      );
    }

    return (
      <div style={{ padding: '24px', background: score === questions.length ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${score === questions.length ? 'var(--success)' : 'var(--danger)'}`, borderRadius: '12px', marginTop: '20px' }}>
        <h3 style={{ color: score === questions.length ? 'var(--success)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.4rem' }}>
          <CheckCircle /> {score === questions.length ? (questions.length >= 10 ? "Mega Exam Mastered!" : "Quiz Mastered!") : "Quiz Incomplete"}
        </h3>
        <p style={{ fontSize: '1.1rem', marginTop: '8px' }}>You scored <strong>{score}</strong> out of <strong>{questions.length}</strong>.</p>
        {score === questions.length ? (
          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '8px', border: '1px solid var(--success)' }}>
            <p style={{ margin: 0, fontWeight: 700, color: '#34d399' }}>🏆 Outstanding! You answered all {questions.length} questions correctly!</p>
          </div>
        ) : (
          <button className="btn primary" style={{ marginTop: '16px', padding: '10px 20px' }} onClick={() => { setCurrentQ(0); setScore(0); setShowResult(false); }}>
            {questions.length >= 10 ? "Retry Exam" : "Retry Quiz"}
          </button>
        )}
      </div>
    );
  }

  const q = questions[currentQ];
  const qType = q.type || 'mcq';

  const checkTextAnswer = () => {
    const trimmedInput = debugInput.trim().toLowerCase();
    if (q.acceptableWords && Array.isArray(q.acceptableWords)) {
      return q.acceptableWords.map(w => w.toLowerCase()).includes(trimmedInput);
    }
    return trimmedInput === (q.correctWord || '').toLowerCase();
  };

  const getTypeBadge = () => {
    switch (qType) {
      case 'mcq':
        return { label: 'MCQ', bg: 'rgba(59, 130, 246, 0.2)', border: '#3b82f6', color: '#60a5fa' };
      case 'debug':
        return { label: 'DEBUGGING', bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', color: '#f87171' };
      case 'fill':
        return { label: 'FILL IN THE BLANKS', bg: 'rgba(168, 85, 247, 0.2)', border: '#a855f7', color: '#c084fc' };
      case 'jumble':
        return { label: 'JUMBLED CODE', bg: 'rgba(245, 158, 11, 0.2)', border: '#f59e0b', color: '#fbbf24' };
      default:
        return { label: 'QUESTION', bg: 'rgba(255, 255, 255, 0.1)', border: '#94a3b8', color: '#cbd5e1' };
    }
  };

  const badge = getTypeBadge();

  return (
    <div style={{ padding: '24px', background: 'rgba(30, 41, 59, 0.85)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '12px', marginTop: '20px', backdropFilter: 'blur(12px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc' }}>
          Question {currentQ + 1} of {questions.length}
        </h3>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 800,
          letterSpacing: '0.8px',
          padding: '4px 10px',
          borderRadius: '20px',
          background: badge.bg,
          border: `1px solid ${badge.border}`,
          color: badge.color
        }}>
          {badge.label}
        </span>
      </div>

      <p style={{ fontSize: '1.15rem', marginBottom: '22px', lineHeight: '1.6', color: '#e2e8f0', textAlign: 'left' }}>
        {q.question}
      </p>
      
      {qType === 'mcq' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {q.options.map((opt, i) => (
            <button
              key={i}
              className="btn"
              style={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                padding: '12px 18px',
                lineHeight: '1.45',
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f1f5f9'
              }}
              onClick={() => handleNext(opt.isCorrect)}
            >
              <span style={{ marginRight: '10px', color: '#94a3b8', fontWeight: 'bold' }}>{String.fromCharCode(65 + i)}.</span>
              {opt.text}
            </button>
          ))}
        </div>
      )}

      {qType === 'jumble' && (
        <div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', minHeight: '44px', padding: '10px', background: '#000', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.2)', alignItems: 'center', flexWrap: 'wrap' }}>
            {jumbleSelected.length === 0 ? (
              <span style={{ color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic' }}>Click word tokens below to construct code...</span>
            ) : (
              jumbleSelected.map((word, i) => (
                <span
                  key={i}
                  style={{ background: 'var(--accent)', color: '#000', fontWeight: 'bold', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'monospace' }}
                  onClick={() => setJumbleSelected(jumbleSelected.filter((_, idx) => idx !== i))}
                  title="Click to remove token"
                >
                  {word} ✕
                </span>
              ))
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '18px' }}>
            {q.words.map((word, i) => (
              <button
                key={i}
                className="btn"
                disabled={jumbleSelected.includes(word)}
                style={{ fontFamily: 'monospace', padding: '8px 14px' }}
                onClick={() => setJumbleSelected([...jumbleSelected, word])}
              >
                {word}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn primary" onClick={() => handleNext(jumbleSelected.join(' ') === q.correctOrder.join(' '))}>
              Submit Order
            </button>
            {jumbleSelected.length > 0 && (
              <button className="btn" onClick={() => setJumbleSelected([])}>
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      {(qType === 'debug' || qType === 'fill') && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', background: '#000', padding: '16px', fontFamily: 'monospace', fontSize: '1.15rem', marginBottom: '18px', borderRadius: '8px', color: '#38bdf8', border: '1px solid rgba(255,255,255,0.1)' }}>
            {q.codeSnippet.split('___').map((part, index, array) => (
              <React.Fragment key={index}>
                <span>{part}</span>
                {index < array.length - 1 && (
                  <input 
                    type="text" 
                    value={debugInput} 
                    onChange={(e) => setDebugInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNext(checkTextAnswer());
                    }}
                    placeholder="enter code..."
                    style={{ width: '130px', padding: '6px 10px', textAlign: 'center', borderRadius: '6px', border: '1px solid #38bdf8', background: '#1e293b', color: '#fff', outline: 'none', fontWeight: 'bold', fontFamily: 'monospace' }}
                    autoComplete="off"
                    autoFocus
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          <button className="btn primary" onClick={() => handleNext(checkTextAnswer())}>
            Submit Answer
          </button>
        </div>
      )}
      
      {feedback && (
        <p style={{ marginTop: '16px', color: feedback === 'Correct!' ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold', fontSize: '1.05rem' }}>
          {feedback}
        </p>
      )}
    </div>
  );
};

export default Quiz;
