import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, Play, RefreshCw, X, ArrowRight, Zap, Code, HelpCircle } from 'lucide-react';
import { playThud, playPop, unlockAudio } from '../utils/audio';

const CodeSlotChallenge = ({
  levelNumber = 1,
  title = "Level 1: Fix the Memory Leak",
  subtitle = "Interactive Drag-and-Drop Patch Challenge",
  description = "The current function deep-copies a 20 GB noticeboard inside a 1,000-iteration loop, crashing the server. Drag the correct replacement block into Line 4 to patch the memory leak!",
  codeLinesBefore = [
    "def distribute(announcement):",
    "    students = []",
    "    for i in range(1000):"
  ],
  slotLineNumber = 4,
  buggyCode = "        copy_obj = copy.deepcopy(announcement)",
  codeLinesAfter = [
    "        students.append(student_pointer)",
    "    return students"
  ],
  replacementOptions = [
    {
      id: "copy_shallow",
      codeText: "        student_pointer = copy.copy(announcement)",
      shortText: "student_pointer = copy.copy(announcement)",
      label: "copy.copy(announcement)",
      isCorrect: false,
      tag: "Shallow Copy",
      feedbackTitle: "⚠️ Memory Still Explodes!",
      feedbackText: "Even copy.copy() allocates a brand-new list object container in RAM on every iteration! 1,000 clones will still overload the 100 GB memory limit."
    },
    {
      id: "pointer_assign",
      codeText: "        student_pointer = announcement",
      shortText: "student_pointer = announcement",
      label: "student_pointer = announcement",
      isCorrect: true,
      tag: "Reference Assignment",
      feedbackTitle: "🎉 Zero-RAM Pointer Patch Confirmed!",
      feedbackText: "Brilliant! In Python, assignment binds a tiny 64-bit reference to the existing noticeboard in Memory Box #1. 0 duplicate copies are created and 0 extra GB of RAM is wasted!"
    },
    {
      id: "list_constructor",
      codeText: "        student_pointer = list(announcement)",
      shortText: "student_pointer = list(announcement)",
      label: "student_pointer = list(announcement)",
      isCorrect: false,
      tag: "List Constructor",
      feedbackTitle: "⚠️ Duplicate Container Allocated!",
      feedbackText: "Calling list(...) instantiates a completely new list object in heap memory for each student. This continues to generate duplicate boxes and crashes RAM."
    }
  ],
  onApplyFix,
  onUnlockNextLevel,
  onClose
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [testResult, setTestResult] = useState(null); // { isCorrect, title, message }
  const [isRunning, setIsRunning] = useState(false);

  const selectedOption = replacementOptions.find(o => o.id === selectedOptionId);

  const handleSelectOption = (optionId) => {
    unlockAudio();
    playPop();
    setSelectedOptionId(optionId);
    setTestResult(null);
  };

  const handleRemoveOption = () => {
    unlockAudio();
    playPop();
    setSelectedOptionId(null);
    setTestResult(null);
  };

  const handleDragStart = (e, optionId) => {
    e.dataTransfer.setData('text/plain', optionId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const optionId = e.dataTransfer.getData('text/plain');
    if (optionId && replacementOptions.some(o => o.id === optionId)) {
      handleSelectOption(optionId);
    }
  };

  const handleRunPatch = () => {
    unlockAudio();
    if (!selectedOption) return;
    setIsRunning(true);

    setTimeout(() => {
      setIsRunning(false);
      if (selectedOption.isCorrect) {
        playPop();
        setTestResult({
          isCorrect: true,
          title: selectedOption.feedbackTitle,
          message: selectedOption.feedbackText
        });
      } else {
        playThud();
        setTestResult({
          isCorrect: false,
          title: selectedOption.feedbackTitle,
          message: selectedOption.feedbackText
        });
      }
    }, 600);
  };

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.96)',
      border: '1px solid rgba(59, 130, 246, 0.35)',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(59, 130, 246, 0.15)',
      backdropFilter: 'blur(16px)',
      width: '100%',
      maxWidth: '920px',
      margin: '0 auto',
      position: 'relative'
    }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '16px', marginBottom: '18px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.5rem' }}>🧩</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#60a5fa', fontWeight: 800, letterSpacing: '-0.3px' }}>
                Fix the Bug: Code Slot Challenge
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                {subtitle}
              </span>
            </div>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px 12px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <X size={16} /> Back to Lab
          </button>
        )}
      </div>

      {/* Challenge Mission Brief */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '10px',
        padding: '12px 16px',
        marginBottom: '20px',
        fontSize: '0.88rem',
        color: '#cbd5e1',
        lineHeight: '1.5'
      }}>
        <strong style={{ color: '#fcd34d' }}>Mission Brief: </strong>
        {description}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left Column: Code Snippet with Drop Slot */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Code size={16} color="#60a5fa" /> Target Python Script:
            </span>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Line {slotLineNumber} needs patching
            </span>
          </div>

          <div style={{
            background: '#050914',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '10px',
            padding: '16px',
            fontFamily: 'monospace',
            fontSize: '0.86rem',
            lineHeight: '1.6'
          }}>
            {/* Preceding Lines */}
            {codeLinesBefore.map((line, idx) => (
              <div key={idx} style={{ color: '#94a3b8', display: 'flex', gap: '12px' }}>
                <span style={{ color: '#475569', userSelect: 'none', width: '18px', textAlign: 'right' }}>{idx + 1}</span>
                <span style={{ color: '#cbd5e1' }}>{line}</span>
              </div>
            ))}

            {/* The Interactive Code Drop Slot */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                margin: '8px 0',
                padding: selectedOption ? '8px 12px' : '14px 12px',
                borderRadius: '8px',
                border: isDragOver
                  ? '2px dashed #38bdf8'
                  : selectedOption
                    ? (testResult?.isCorrect ? '2px solid #10b981' : testResult?.isCorrect === false ? '2px solid #ef4444' : '2px solid #3b82f6')
                    : '2px dashed rgba(245, 158, 11, 0.6)',
                background: isDragOver
                  ? 'rgba(56, 189, 248, 0.15)'
                  : selectedOption
                    ? (testResult?.isCorrect ? 'rgba(16, 185, 129, 0.12)' : testResult?.isCorrect === false ? 'rgba(239, 68, 68, 0.12)' : 'rgba(59, 130, 246, 0.15)')
                    : 'rgba(245, 158, 11, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                <span style={{ color: '#f59e0b', fontWeight: 800, width: '18px', textAlign: 'right' }}>{slotLineNumber}</span>
                {selectedOption ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span style={{
                      color: testResult?.isCorrect ? '#34d399' : testResult?.isCorrect === false ? '#f87171' : '#60a5fa',
                      fontWeight: 700,
                      wordBreak: 'break-all'
                    }}>
                      {selectedOption.codeText}
                    </span>
                    <button
                      onClick={handleRemoveOption}
                      title="Remove block from slot"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        color: '#cbd5e1',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        padding: '2px 6px',
                        fontSize: '0.72rem',
                        marginLeft: '8px'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div style={{ color: '#fbbf24', fontStyle: 'italic', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📥</span>
                    <span>Drop replacement block here (or click block below)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Following Lines */}
            {codeLinesAfter.map((line, idx) => (
              <div key={idx} style={{ color: '#94a3b8', display: 'flex', gap: '12px' }}>
                <span style={{ color: '#475569', userSelect: 'none', width: '18px', textAlign: 'right' }}>{slotLineNumber + 1 + idx}</span>
                <span style={{ color: '#cbd5e1' }}>{line}</span>
              </div>
            ))}
          </div>

          {/* Test Button */}
          <div style={{ marginTop: '16px' }}>
            <button
              onClick={handleRunPatch}
              disabled={!selectedOption || isRunning}
              className="btn primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '0.95rem',
                fontWeight: 700,
                opacity: (!selectedOption || isRunning) ? 0.5 : 1,
                cursor: (!selectedOption || isRunning) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isRunning ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  Compiling & Testing in Virtual RAM...
                </>
              ) : (
                <>
                  <Play size={18} /> Test Patched Code
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: 3 Replacement Blocks & Test Results */}
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8' }}>
              Select Replacement Block:
            </span>
            <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b' }}>
              Drag into slot or click to equip
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {replacementOptions.map((opt, i) => {
              const isEquipped = selectedOptionId === opt.id;
              return (
                <div
                  key={opt.id}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, opt.id)}
                  onClick={() => handleSelectOption(opt.id)}
                  style={{
                    background: isEquipped
                      ? 'rgba(59, 130, 246, 0.2)'
                      : 'rgba(30, 41, 59, 0.8)',
                    border: isEquipped
                      ? '2px solid #3b82f6'
                      : '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    cursor: 'grab',
                    transition: 'all 0.18s ease',
                    boxShadow: isEquipped ? '0 0 16px rgba(59, 130, 246, 0.3)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#94a3b8',
                      background: 'rgba(255, 255, 255, 0.08)',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      Option {String.fromCharCode(65 + i)} • {opt.tag}
                    </span>
                    {isEquipped && (
                      <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700 }}>
                        ✓ Equipped in Slot
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: '0.82rem',
                    color: isEquipped ? '#60a5fa' : '#f8fafc',
                    background: 'rgba(0, 0, 0, 0.4)',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                  }}>
                    {opt.shortText}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Test Feedback Area */}
          {testResult && (
            <div style={{
              marginTop: '16px',
              padding: '14px 16px',
              borderRadius: '10px',
              background: testResult.isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${testResult.isCorrect ? '#10b981' : '#ef4444'}`,
              animation: 'popIn 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                {testResult.isCorrect ? (
                  <CheckCircle size={18} color="#10b981" />
                ) : (
                  <AlertTriangle size={18} color="#ef4444" />
                )}
                <strong style={{ fontSize: '0.9rem', color: testResult.isCorrect ? '#34d399' : '#f87171' }}>
                  {testResult.title}
                </strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.45' }}>
                {testResult.message}
              </p>

              {testResult.isCorrect && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
                  {onApplyFix && (
                    <button
                      onClick={onApplyFix}
                      className="btn"
                      style={{
                        background: '#10b981',
                        color: '#000',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        padding: '8px 14px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Zap size={15} /> Apply Fix to Live Simulation
                    </button>
                  )}

                  {onUnlockNextLevel && (
                    <button
                      onClick={onUnlockNextLevel}
                      className="btn primary"
                      style={{
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        padding: '8px 14px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      Unlock Level {levelNumber + 1} <ArrowRight size={15} />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeSlotChallenge;
