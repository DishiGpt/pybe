import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Play, Info, ArrowRight, Layers, Cpu } from 'lucide-react';
import Quiz from '../components/Quiz';
import StorySlider from '../components/StorySlider';
import { playThud, playPop, unlockAudio } from '../utils/audio';

const StackBar = ({ usage }) => (
  <div className="glass-panel" style={{ padding: '16px', marginBottom: '20px', borderLeft: '4px solid #8b5cf6' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Layers size={20} color="#8b5cf6" />
        <span style={{ fontWeight: 600 }}>Call Stack Depth</span>
      </div>
      <span style={{ color: usage > 80 ? 'var(--danger)' : usage > 50 ? '#eab308' : '#8b5cf6', fontWeight: 'bold' }}>
        {usage.toFixed(0)}%
      </span>
    </div>
    <div className={`ram-bar-container ${usage > 80 ? 'ram-bar-danger' : ''}`}>
      <div className="ram-bar-fill" style={{ width: `${usage}%`, background: '#8b5cf6' }}></div>
    </div>
  </div>
);

const Level3 = ({ onCrash, onPass, RamBar }) => {
  const [ram, setRam] = useState(35);
  const [stack, setStack] = useState(0);
  const [mode, setMode] = useState('copy');
  const [showQuiz, setShowQuiz] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [storyStep, setStoryStep] = useState(0);
  const [hasCrashed, setHasCrashed] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);
  const [explainStep, setExplainStep] = useState(1);
  const [executingLine, setExecutingLine] = useState(0);
  const [conditionMet, setConditionMet] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [showHeapInspector, setShowHeapInspector] = useState(true);

  const selectLine = (lineNum) => {
    setSelectedLine(lineNum);
    setExplainStep(1);
  };

  const [ramObjects, setRamObjects] = useState([[1, 2, 3, 4, 5]]);
  const [stackFrames, setStackFrames] = useState([]);

  const getLineStyle = (lineNum) => {
    const isLineActive = executingLine === lineNum;
    return {
      background: isLineActive ? (mode === 'copy' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)') : 'transparent',
      borderLeft: isLineActive ? (mode === 'copy' ? '3px solid #ef4444' : '3px solid #10b981') : '3px solid transparent',
      paddingLeft: '5px',
      transition: 'all 0.2s',
      color: isLineActive ? '#fff' : '#cbd5e1'
    };
  };

  const questions = [
    {
      type: 'mcq',
      question: "In recursive algorithms, why do intermediate copies created via `items.copy()` explode memory so quickly?",
      options: [
        { text: "All caller stack frames remain active until the base case returns, forcing all intermediate copies to stay alive in RAM at the same time.", isCorrect: true },
        { text: "Recursion automatically disables Python's heap memory management.", isCorrect: false },
        { text: "The call stack can only hold up to 3 objects simultaneously.", isCorrect: false }
      ]
    },
    {
      type: 'jumble',
      question: "Jumbled Syntax: Form the base-case condition to safely terminate recursion when the orders list is empty:",
      words: ["if", "not", "orders:", "return"],
      correctOrder: ["if", "not", "orders:", "return"]
    },
    {
      type: 'debug',
      question: "Fill in the Blank: Which method removes and returns the first element in-place from the shared list without copying?",
      codeSnippet: "current_order = orders.___(0)",
      correctWord: "pop",
      acceptableWords: ["pop", "pop()"]
    }
  ];

  const level3CodeChallenge = {
    levelNumber: 3,
    title: "Level 3: Fix Recursive Memory Accumulation",
    subtitle: "In-Place Recursive List Mutation Challenge",
    description: "The recursive removal function calls items.copy() at every level of the call stack. Because all stack frames remain alive until the base case, memory bloats exponentially! Drag the in-place pruning block into Line 3 to share one single list across all stack frames.",
    codeLinesBefore: [
      "def remove_order(items):",
      "    if not items: return"
    ],
    slotLineNumber: 3,
    buggyCode: "    new_list = items.copy()",
    codeLinesAfter: [
      "    remove_order(items)"
    ],
    replacementOptions: [
      {
        id: "slice_copy",
        codeText: "    new_list = items[:]",
        shortText: "new_list = items[:]",
        label: "items[:]",
        isCorrect: false,
        tag: "Slice Copy",
        feedbackTitle: "⚠️ Slice Still Clones Memory!",
        feedbackText: "List slicing items[:] still creates a brand-new list object in RAM on each recursive call. Compounding stack copies will still crash the server."
      },
      {
        id: "pop_inplace",
        codeText: "    items.pop(0)",
        shortText: "items.pop(0)",
        label: "items.pop(0)",
        isCorrect: true,
        tag: "In-Place Mutation",
        feedbackTitle: "🎉 Zero-Copy Recursion Fix Confirmed!",
        feedbackText: "Outstanding! Pruning the single shared list in-place means every recursive frame operates on the exact same Memory Box #1. Physical RAM stays 100% green and stable!"
      },
      {
        id: "list_constructor_l3",
        codeText: "    new_list = list(items)",
        shortText: "new_list = list(items)",
        label: "list(items)",
        isCorrect: false,
        tag: "List Constructor",
        feedbackTitle: "⚠️ Heap Object Duplication!",
        feedbackText: "list(items) duplicates the array on every call, retaining multiple heavy copies in active heap memory."
      }
    ]
  };

  const handleDrag = () => {
    unlockAudio();
    if (isBuilding || hasCrashed) return;
    setIsBuilding(true);

    if (mode === 'copy') {
      playThud(); // Unlock audio context on click
      let currentRam = ram;
      let currentStack = stack;

      const recurseExecute = () => {
        playThud(); // Sync sound with each recursive allocation
        setExecutingLine(1); // def
        setTimeout(() => {
          setExecutingLine(3); // copy
          setTimeout(() => {
            setExecutingLine(4); // pop
            setTimeout(() => {
              setExecutingLine(5); // recurse
              setTimeout(() => {
                setExecutingLine(0);

                let nextLength = 0;
                setRamObjects(prev => {
                  const lastList = prev[prev.length - 1];
                  const newList = lastList.slice(1);
                  nextLength = newList.length;
                  return [...prev, newList];
                });

                setTimeout(() => {
                  currentRam += (nextLength * 7);
                  currentStack += 5;
                  setRam(currentRam);
                  setStack(currentStack);
                  setStackFrames(prev => [...prev, 1]);

                  if (nextLength === 1 || currentRam >= 100) {
                    setTimeout(() => {
                      onCrash();
                      setIsBuilding(false);
                      setHasCrashed(true);
                    }, 400);
                  } else {
                    setTimeout(recurseExecute, 100);
                  }
                }, 50); // slight delay to allow state update
              }, 400);
            }, 400);
          }, 400);
        }, 400);
      };

      // Start by highlighting the caller
      setExecutingLine(6);
      setTimeout(recurseExecute, 600);

    } else {
      playPop(); // Unlock audio context on click
      let currentStack = stack;

      const recurseExecute = (currentListLength) => {
        if (currentListLength === 0) {
          setExecutingLine(1); // def
          setTimeout(() => {
            setExecutingLine(2); // if not items: return
            setTimeout(() => {
              setExecutingLine(0);
              setIsBuilding(false);
              setConditionMet(true);
            }, 800);
          }, 400);
          return;
        }

        playPop(); // Sync sound with each recursive call
        setExecutingLine(1); // def
        setTimeout(() => {
          setExecutingLine(3); // pop
          setTimeout(() => {
            setExecutingLine(5); // recurse
            setTimeout(() => {
              setExecutingLine(0);
              currentStack += 5;

              setStack(currentStack);
              const nextLength = currentListLength > 0 ? currentListLength - 1 : 0;

              setRamObjects(prev => {
                const lastList = prev[0];
                return [lastList.slice(0, -1)];
              });
              setRam(nextLength * 7);
              setStackFrames(prev => [...prev, 1]);

              setTimeout(() => recurseExecute(nextLength), 100);
            }, 400);
          }, 400);
        }, 400);
      };

      // Start by highlighting the caller
      setExecutingLine(6);
      setTimeout(() => recurseExecute(5), 600);
    }
  };

  // No more pop-ups!

  const storySlides = [
    {
      title: "Scene 1: 10,000 Orders, One Master Tray",
      image: "/orders_tray_intro.jpg",
      text: "The campus delivery desk must process 10,000 order slips, one at a time, using a single master tray. The dispatcher removes the top slip with items.pop(), calls the same procedure to process the remaining orders, and leaves a small return note on the call stack while waiting for the next call to finish.",
      buttonText: "See what happens...",
      color: "#60a5fa"
    },
    {
      title: "Scene 2: The Photocopied Order Nightmare",
      image: "/orders_tray_bad.jpg",
      text: "The naive dispatcher photocopies the entire remaining order tray before handling each order and calling the next recursive step. Memory Bloat: each active call retains another list copy, potentially producing quadratic total list storage and exhausting memory; Data Desync: separate copies can disagree about which orders remain; CPU Lag: repeatedly copying shrinking lists creates quadratic copying work and makes processing painfully slow.",
      buttonText: "Simulate Disaster",
      color: "#ef4444"
    },
    null,
    {
      title: "Scene 3: One Tray, Many References",
      image: "/orders_tray_good.jpg",
      text: "The breakthrough is to pass the same list reference into every recursive call and remove each order directly from that one master tray using items.pop(). Each active call refers to the same list, so no full list copy is allocated per call; when the tray becomes empty, the base case returns and the waiting calls unwind in reverse order, just like the return notes being removed from a stack.",
      buttonText: "Start Smart Simulation",
      color: "#10b981",
      action: () => {
        setRam(35);
        setStack(0);
        setRamObjects([[1, 2, 3, 4, 5]]);
        setStackFrames([]);
        setMode('pointer');
        setPrediction(null);
        setHasCrashed(false);
        setConditionMet(false);
        setStoryStep(4);
      }
    }
  ];

  if (storySlides[storyStep] !== null && storyStep < storySlides.length) {
    const steps = [
      { id: 0, label: "1. The Master Tray" },
      { id: 1, label: "2. Copy Nightmare" },
      { id: 3, label: "3. Shared References" }
    ];

    return (
      <StorySlider
        slides={storySlides}
        storyStep={storyStep}
        setStoryStep={setStoryStep}
        steps={steps}
      />
    );
  }

  const copyLineExplanations = {
    1: {
      code: "def remove_order(items):",
      desc: "• Defines the recursive order cancellation function taking the remaining orders list.\n• Pushes a new execution stack frame into the Call Stack for every recursive invocation.\n• Expects to chip away items step-by-step until the list reaches the base case.\n• Without careful memory control, recursive chains can easily multiply data allocations."
    },
    2: {
      code: "    if not items: return",
      desc: "• 🛑 BASE CONDITION: Checks if the items list is empty, stopping the recursion.\n• Critical guard condition to prevent infinite recursion and stack overflow errors.\n• When the condition evaluates to True, Python begins unwinding the call stack.\n• Without this guard, the function would run indefinitely until system exhaustion."
    },
    3: {
      code: "    new_list = items.copy()",
      desc: "• ⚠️ RECURSIVE DISASTER: Calls .copy() to duplicate the entire order list on every call!\n• With 10,000 items, creates 10,000 separate lists in RAM, causing O(N²) memory allocation.\n• Every single step clones megabytes of existing data instead of operating on the original.\n• System RAM rapidly skyrockets toward 100 GB, crashing the recursive waiter!"
    },
    4: {
      code: "    new_list.pop(0)",
      desc: "• Removes the first item from the newly cloned list at index 0.\n• In Python lists, popping from index 0 forces every subsequent item to shift left in RAM.\n• Wastes O(N) CPU operations in addition to the memory waste from the prior .copy().\n• Modifies only the temporary duplicate, leaving the previous list versions in RAM."
    },
    5: {
      code: "    remove_order(new_list)",
      desc: "• Makes a recursive call by passing the newly cloned list into the next frame.\n• Creates a nested chain of call frames where each frame locks its own duplicate list in RAM.\n• Prevents Python's Garbage Collector from reclaiming previous lists while recursion is active.\n• Leads directly to an Out-Of-Memory system crash before the orders can finish."
    },
    6: {
      code: "remove_order(orders)",
      desc: "• Main entry point: Starts recursive processing on the original 10,000 orders list.\n• Initializes the recursive call sequence and triggers the initial memory allocation.\n• If the function creates copies recursively, memory usage balloons exponentially.\n• Shows why recursive algorithms in production must use Pass-by-Reference in-place operations."
    }
  };

  const pointerLineExplanations = {
    1: {
      code: "def remove_order(items):",
      desc: "• Defines the in-place recursive function processing orders by shared reference.\n• Receives the pointer to the master orders list directly without duplicating elements.\n• Pushes lightweight call frames on the stack that all reference the exact same memory block.\n• Keeps heap memory allocation strictly at O(1) throughout all recursive steps."
    },
    2: {
      code: "    if not items: return",
      desc: "• 🛑 BASE CONDITION: Successfully halts the recursive unwinding when the list is empty.\n• Protects against IndexError and terminates the recursive call chain safely.\n• Each completed frame is popped from the stack, recovering call stack memory.\n• Ensures that the recursion exits cleanly as soon as all orders are processed."
    },
    3: {
      code: "    items.pop()",
      desc: "• ⚡ IN-PLACE POP: Directly removes the last item from the existing list in RAM!\n• Shrinks the list buffer in-place with O(1) time complexity and 0 extra memory allocated.\n• Mutates the single master object directly; id(items) never changes across calls.\n• Physical RAM footprint steadily DECREASES instead of blowing up the machine!"
    },
    5: {
      code: "    remove_order(items)",
      desc: "• Re-invokes remove_order() passing the exact same list reference to the next frame.\n• Adds only a lightweight Call Stack pointer (~80 bytes), leaving Heap RAM completely flat.\n• Allows deep recursion without creating orphan duplicate lists in physical memory.\n• Processes all 10,000 orders smoothly and completes safely in milliseconds."
    },
    6: {
      code: "remove_order(orders)",
      desc: "• Main function call starting the in-place recursive order processing.\n• Passes the master list by reference, proving scalable recursion in Python.\n• Demonstrates how in-place mutation turns dangerous O(N²) memory explosions into O(1) safety.\n• Successfully completes processing with 100% memory efficiency and zero crashes!"
    }
  };

  const renderAnimatedExplanation = (isDanger, explanations) => {
    if (!selectedLine || !explanations[selectedLine]) {
      return (
        <div style={{
          marginTop: '8px',
          padding: '10px 14px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '8px',
          fontSize: '0.82rem',
          color: '#94a3b8',
          textAlign: 'center',
          border: '1px dashed rgba(255, 255, 255, 0.12)'
        }}>
          💡 <em>Click any line of code above to inspect what happens in RAM!</em>
        </div>
      );
    }

    const data = explanations[selectedLine];
    const accentColor = isDanger ? '#ef4444' : '#10b981';
    const glowColor = isDanger ? 'rgba(239, 68, 68, 0.28)' : 'rgba(16, 185, 129, 0.28)';
    const nextBtnBg = isDanger
      ? 'linear-gradient(135deg, #ef4444, #f97316)'
      : 'linear-gradient(135deg, #10b981, #06b6d4)';

    const rawLines = data.desc ? data.desc.split('\n').map(l => l.replace(/^[•\s*-]+/, '').trim()).filter(Boolean) : [];
    const meta = [
      { shortTag: "1. Code", category: "Python Action", color: isDanger ? '#ef4444' : '#38bdf8', bg: isDanger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)', icon: "💻", label: "Execution Logic" },
      { shortTag: "2. RAM", category: "In Physical RAM", color: isDanger ? '#f97316' : '#60a5fa', bg: isDanger ? 'rgba(249, 115, 22, 0.15)' : 'rgba(96, 165, 250, 0.15)', icon: "🧠", label: "Physical Memory" },
      { shortTag: "3. Scale", category: "Scale & Recursion", color: isDanger ? '#dc2626' : '#34d399', bg: isDanger ? 'rgba(220, 38, 38, 0.15)' : 'rgba(52, 211, 153, 0.15)', icon: isDanger ? "⚠️" : "⚡", label: "Recursion Scale" },
      { shortTag: "4. Rule", category: "Architecture Rule", color: isDanger ? '#e11d48' : '#10b981', bg: isDanger ? 'rgba(225, 29, 72, 0.15)' : 'rgba(16, 185, 129, 0.15)', icon: "🎯", label: "Key Rule" }
    ];

    const points = rawLines.map((text, idx) => ({
      step: idx + 1,
      shortTag: meta[idx]?.shortTag || `${idx + 1}. Point`,
      category: meta[idx]?.category || "Detail",
      color: meta[idx]?.color || (isDanger ? '#ef4444' : '#10b981'),
      bg: meta[idx]?.bg || 'rgba(255,255,255,0.08)',
      icon: meta[idx]?.icon || "💡",
      label: meta[idx]?.label || "Explanation",
      text
    }));

    const currentIdx = Math.min(Math.max(explainStep - 1, 0), Math.max(points.length - 1, 0));
    const activePoint = points[currentIdx] || {
      step: 1,
      shortTag: "1. Info",
      category: "Explanation",
      color: accentColor,
      bg: 'rgba(255,255,255,0.08)',
      icon: "💡",
      label: "Information",
      text: data.desc || ""
    };

    return (
      <div
        key={`${selectedLine}-${explainStep}`}
        className="line-explain-card"
        style={{
          borderLeft: `4px solid ${activePoint.color}`,
          border: `1px solid ${glowColor}`,
          boxShadow: `0 10px 32px ${glowColor}, 0 2px 10px rgba(0,0,0,0.5)`
        }}
      >
        {/* Top Header & Step Navigation */}
        <div className="explain-top-bar">
          <div className="explain-step-pills">
            {points.map((p) => (
              <button
                key={p.step}
                onClick={() => setExplainStep(p.step)}
                className={`explain-step-pill ${explainStep === p.step
                    ? (isDanger ? 'active-danger' : 'active-success')
                    : ''
                  }`}
              >
                {p.shortTag}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSelectedLine(null)}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.75rem',
              padding: '3px 8px',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; }}
          >
            ✕ Close
          </button>
        </div>

        {/* The 1 Active Focus Point Card */}
        <div className="single-point-hero" style={{ borderLeft: `3px solid ${activePoint.color}` }}>
          <div
            className="single-point-top-badge"
            style={{ background: activePoint.bg, color: activePoint.color }}
          >
            <span>POINT {activePoint.step} OF {points.length}</span>
            <span>•</span>
            <span>{activePoint.category}</span>
          </div>

          <div className="single-point-body">
            <div className="single-point-icon-bubble">
              {activePoint.icon}
            </div>
            <div className="single-point-content">
              <span className="single-point-title" style={{ color: activePoint.color }}>
                {activePoint.label}
              </span>
              <p className="single-point-desc">
                {activePoint.text}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="explain-progress-bar">
          <div
            className="explain-progress-fill"
            style={{
              width: `${(explainStep / Math.max(points.length, 1)) * 100}%`,
              background: isDanger
                ? 'linear-gradient(90deg, #ef4444, #f97316)'
                : 'linear-gradient(90deg, #38bdf8, #10b981)'
            }}
          />
        </div>

        {/* Bottom Interactive Flow Bar */}
        <div className="explain-bottom-bar">
          <button
            onClick={() => setExplainStep(s => Math.max(s - 1, 1))}
            disabled={explainStep === 1}
            className="explain-nav-btn prev"
          >
            <span>← Prev</span>
          </button>

          <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: '600' }}>
            Point {explainStep} of {points.length}
          </span>

          {explainStep < points.length ? (
            <button
              onClick={() => setExplainStep(s => Math.min(s + 1, points.length))}
              className="explain-nav-btn next"
              style={{
                background: nextBtnBg,
                color: '#fff'
              }}
            >
              <span>Next Point</span>
              <span className="arrow-slide-anim" style={{ display: 'flex' }}>
                <ArrowRight size={15} strokeWidth={2.8} />
              </span>
            </button>
          ) : (
            <button
              onClick={() => setSelectedLine(null)}
              className="explain-nav-btn next"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff'
              }}
            >
              <span>Got it! ✓</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="level-container">
      <div className="story-panel glass-panel">
        <h2>Recursion: RAM vs Call Stack</h2>

        {/* Mission Objective Banner (Level 3) */}
        <div style={{
          marginTop: '12px',
          background: prediction?.isCorrect
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.08))'
            : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.08))',
          border: prediction?.isCorrect
            ? '1px solid rgba(16, 185, 129, 0.45)'
            : '1px solid rgba(59, 130, 246, 0.35)',
          borderRadius: '10px',
          padding: '12px 14px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.1rem' }}>{prediction?.isCorrect ? '🚀' : '🎯'}</span>
              <strong style={{ fontSize: '0.9rem', color: prediction?.isCorrect ? '#34d399' : '#60a5fa', letterSpacing: '0.4px' }}>
                {prediction?.isCorrect ? 'Mission: Ready to Run' : 'Mission Objective'}
              </strong>
            </div>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '12px',
              background: prediction?.isCorrect ? 'rgba(16, 185, 129, 0.25)' : 'rgba(59, 130, 246, 0.2)',
              color: prediction?.isCorrect ? '#34d399' : '#93c5fd',
              border: `1px solid ${prediction?.isCorrect ? '#10b981' : '#3b82f6'}`
            }}>
              {prediction?.isCorrect ? 'Step 3 Unlocked 🔓' : 'Steps 1 & 2 Active ⏳'}
            </span>
          </div>

          {!prediction?.isCorrect ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: '#cbd5e1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: selectedLine !== null ? '#10b981' : '#60a5fa', fontWeight: 'bold' }}>
                  {selectedLine !== null ? '✓ 1.' : '1.'}
                </span>
                <span>
                  <strong style={{ color: '#fff' }}>Understand the code:</strong> Click any recursive line below to inspect Call Stack frames and heap memory.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>2.</span>
                <span>
                  <strong style={{ color: '#fff' }}>Give the Pre-Flight test:</strong> Answer the recursion call stack hypothesis question below.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.65 }}>
                <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>3.</span>
                <span>
                  <strong style={{ color: '#cbd5e1' }}>Run the program:</strong> Execute recursion to observe call stack depth and RAM usage live.
                </span>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.82rem', color: '#e2e8f0', lineHeight: '1.45' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ color: '#10b981', fontWeight: 700 }}>✅ Pre-Flight Test Completed!</span>
              </div>
              <p style={{ margin: 0, color: '#cbd5e1' }}>
                {hasCrashed && mode === 'copy' ? (
                  <>💥 <strong style={{ color: '#ef4444' }}>Call Stack & RAM Overflow!</strong> Recursive copying bloated memory. Click <strong>"View the Smart Approach"</strong> below to switch to in-place pop.</>
                ) : (
                  <>Now click the <strong style={{ color: '#38bdf8' }}>"▶ Run Program"</strong> button on the right panel to execute recursion and witness Call Stack & RAM allocation live!</>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Pre-Flight Hypothesis Prediction Card */}
        {!prediction?.isCorrect && (
        <div style={{
          marginTop: '12px',
          background: 'rgba(15, 23, 42, 0.75)',
          border: prediction
            ? (prediction.isCorrect ? '1px solid #10b981' : '1px solid #f59e0b')
            : '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          padding: '12px 14px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.1rem' }}>🎯</span>
              <strong style={{ fontSize: '0.85rem', color: '#f8fafc', letterSpacing: '0.4px' }}>
                {mode === 'copy' ? "Pre-Flight Hypothesis 1: Recursion + Copies" : "Pre-Flight Hypothesis 2: Shared In-Place Pop"}
              </strong>
            </div>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '12px',
              background: prediction ? (prediction.isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)') : 'rgba(255, 255, 255, 0.08)',
              color: prediction ? (prediction.isCorrect ? '#34d399' : '#fbbf24') : '#94a3b8',
              border: `1px solid ${prediction ? (prediction.isCorrect ? '#10b981' : '#f59e0b') : 'rgba(255,255,255,0.1)'}`
            }}>
              {prediction ? (prediction.isCorrect ? "Prediction Tested ✓" : "Misconception Tested ⚠️") : "Test Intuition"}
            </span>
          </div>

          <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '0 0 10px 0', lineHeight: '1.4' }}>
            {mode === 'copy'
              ? "Before running recursion: If every recursive frame allocates a list copy, what happens to physical RAM?"
              : "Before running recursion: If every frame calls items.pop() on the shared list, what happens to memory?"
            }
          </p>

          {!prediction ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {mode === 'copy' ? (
                <>
                  <button
                    onClick={() => {
                      unlockAudio();
                      playPop();
                      setPrediction({ choice: 'linear', isCorrect: false });
                    }}
                    className="btn"
                    style={{
                      fontSize: '0.78rem',
                      textAlign: 'left',
                      padding: '7px 10px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#e2e8f0',
                      lineHeight: '1.35'
                    }}
                  >
                    <span>A. Since the list shrinks each step, total memory usage also rapidly decreases.</span>
                  </button>
                  <button
                    onClick={() => {
                      unlockAudio();
                      playPop();
                      setPrediction({ choice: 'quadratic', isCorrect: true });
                    }}
                    className="btn"
                    style={{
                      fontSize: '0.78rem',
                      textAlign: 'left',
                      padding: '7px 10px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#e2e8f0',
                      lineHeight: '1.35'
                    }}
                  >
                    <span>B. All waiting stack frames retain their separate copies simultaneously, causing cumulative RAM explosion!</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      unlockAudio();
                      playPop();
                      setPrediction({ choice: 'shared', isCorrect: true });
                    }}
                    className="btn"
                    style={{
                      fontSize: '0.78rem',
                      textAlign: 'left',
                      padding: '7px 10px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#e2e8f0',
                      lineHeight: '1.35'
                    }}
                  >
                    <span>A. All stack frames point to the single master list, allocating 0 extra list copies in heap RAM.</span>
                  </button>
                  <button
                    onClick={() => {
                      unlockAudio();
                      playPop();
                      setPrediction({ choice: 'copy', isCorrect: false });
                    }}
                    className="btn"
                    style={{
                      fontSize: '0.78rem',
                      textAlign: 'left',
                      padding: '7px 10px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#e2e8f0',
                      lineHeight: '1.35'
                    }}
                  >
                    <span>B. items.pop() creates a new backup array on every recursive call frame.</span>
                  </button>
                </>
              )}
            </div>
          ) : (
            <div style={{
              background: prediction.isCorrect ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              borderLeft: `3px solid ${prediction.isCorrect ? '#10b981' : '#f59e0b'}`,
              padding: '8px 10px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              lineHeight: '1.45',
              color: '#f1f5f9'
            }}>
              <p style={{ margin: 0 }}>
                {prediction.isCorrect ? (
                  mode === 'copy'
                    ? "🎯 Brilliant observation! Because stack frames remain active until the base case, every intermediate list copy stays alive simultaneously in RAM. Run to witness the explosion!"
                    : "🎯 Spot-on! Passing the list by reference allows items.pop() to prune the single heap object in-place. Run to watch RAM stay completely safe!"
                ) : (
                  mode === 'copy'
                    ? "💡 Classic trap! While each copy is smaller, none are freed until recursion unwinds. That cumulative O(N²) retention crashes memory. Run code to verify!"
                    : "💡 Misconception alert! items.pop() mutates the array in-place without generating copies. Run code to watch Call Stack frames process the shared list!"
                )}
              </p>
              {!prediction.isCorrect && (
                <button
                  onClick={() => {
                    unlockAudio();
                    playPop();
                    setPrediction(null);
                  }}
                  style={{
                    marginTop: '8px',
                    background: 'rgba(245, 158, 11, 0.2)',
                    border: '1px solid #f59e0b',
                    color: '#fbbf24',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>🔄</span> Revise Hypothesis
                </button>
              )}
            </div>
          )}
        </div>
        )}

        <p style={{ fontSize: '0.95rem', color: '#cbd5e1', marginTop: '14px', marginBottom: '10px' }}>
          <strong>The Scenario:</strong> A waiter has a massive list of 10,000 orders to process. He decides to use Recursion to process them one by one. But how he passes the remaining orders to the next step makes a huge difference!
        </p>

        {mode === 'copy' ? (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--danger)', padding: '12px', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Code execution: Full Copy</strong>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>💡 Click any line to see purpose</span>
            </div>
            <pre style={{ marginTop: '8px', fontFamily: 'monospace', background: '#000', padding: '10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              <div onClick={() => selectLine(1)} style={{ ...getLineStyle(1), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 1 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(1).background }}>def remove_order(items):</div>
              <div onClick={() => selectLine(2)} style={{ ...getLineStyle(2), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 2 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(2).background }}>    if not items: return</div>
              <div style={{ color: '#ef4444', padding: '2px 4px' }}>    # DANGER: Creates a massive new copy!</div>

              <div onClick={() => selectLine(3)} style={{ ...getLineStyle(3), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 3 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(3).background }}>
                {`    new_list = items.copy()`}
              </div>
              <div onClick={() => selectLine(4)} style={{ ...getLineStyle(4), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 4 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(4).background }}>    new_list.pop(0)</div>
              <div onClick={() => selectLine(5)} style={{ ...getLineStyle(5), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 5 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(5).background }}>    remove_order(new_list)</div>
              <div style={{ color: '#94a3b8', marginTop: '10px', padding: '2px 4px' }}>orders = [1, 2, 3, 4, 5]</div>
              <div onClick={() => selectLine(6)} style={{ ...getLineStyle(6), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 6 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(6).background }}>remove_order(orders)</div>
            </pre>

            {/* Purpose shows ONLY when clicked on a line */}
            {renderAnimatedExplanation(true, copyLineExplanations)}
          </div>
        ) : (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid var(--success)', padding: '12px', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Optimized execution: In-Place Pop</strong>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>💡 Click any line to see purpose</span>
            </div>
            <pre style={{ marginTop: '8px', fontFamily: 'monospace', background: '#000', padding: '10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              <div onClick={() => selectLine(1)} style={{ ...getLineStyle(1), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 1 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(1).background }}>def remove_order(items):</div>
              <div onClick={() => selectLine(2)} style={{ ...getLineStyle(2), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 2 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(2).background }}>    if not items: return</div>
              <div style={{ color: '#10b981', padding: '2px 4px' }}>    # SUCCESS: Mutates same list in-place</div>

              <div onClick={() => selectLine(3)} style={{ ...getLineStyle(3), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 3 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(3).background }}>
                {`    items.pop()`}
              </div>

              <div onClick={() => selectLine(5)} style={{ ...getLineStyle(5), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 5 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(5).background }}>    remove_order(items)</div>
              <div style={{ color: '#94a3b8', marginTop: '10px', padding: '2px 4px' }}>orders = [1, 2, 3, 4, 5]</div>
              <div onClick={() => selectLine(6)} style={{ ...getLineStyle(6), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 6 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(6).background }}>remove_order(orders)</div>
            </pre>

            {/* Purpose shows ONLY when clicked on a line */}
            {renderAnimatedExplanation(false, pointerLineExplanations)}
          </div>
        )}

        <div style={{ marginTop: 'auto', display: 'flex', gap: '12px', flexDirection: 'column' }}>
          {mode === 'pointer' && !showQuiz && conditionMet && (
            <button className="btn" style={{ background: 'var(--accent)', borderColor: 'var(--accent)', color: 'black' }} onClick={() => setShowQuiz(true)}>
              Check Knowledge
            </button>
          )}
          {hasCrashed && mode === 'copy' && (
            <button className="btn warning" style={{ background: '#f59e0b', color: '#000', fontWeight: 'bold' }} onClick={() => {
              setStoryStep(3);
            }}>
              View the Better Approach <ArrowRight size={18} style={{ marginLeft: '8px' }} />
            </button>
          )}
        </div>
      </div>

      <div className="interaction-panel glass-panel" style={{ justifyContent: 'flex-start' }}>
        {/* Right Side Heading */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px', marginBottom: '10px' }}>
          <h2 style={{ fontSize: '1.4rem', color: '#60a5fa', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚡</span> Call Stack & Memory Simulation Lab
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '4px' }}>
            Live Simulation
          </span>
        </div>
        <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
          <div style={{ flex: 1 }}><RamBar usage={ram} /></div>
          <div style={{ flex: 1 }}><StackBar usage={stack} /></div>
        </div>

        <div style={{ display: 'flex', gap: '30px', marginTop: '10px', justifyContent: 'center' }}>
          <button
            className="btn primary"
            onClick={prediction?.isCorrect ? handleDrag : undefined}
            disabled={!prediction?.isCorrect || isBuilding || showQuiz || hasCrashed}
            style={{
              opacity: (!prediction?.isCorrect || isBuilding || showQuiz || hasCrashed) ? 0.5 : 1,
              cursor: (!prediction?.isCorrect || isBuilding || showQuiz || hasCrashed) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isBuilding ? (
              <><div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> Recursion Running...</>
            ) : (
              <><Play size={18} /> remove_order(items)</>
            )}
          </button>
        </div>

        {/* Calculation Bar */}
        <div style={{ background: '#1e293b', padding: '15px', borderRadius: '8px', marginTop: '20px', width: '100%', border: '1px solid #475569', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '10px', display: 'flex', gap: '30px' }}>
            <strong>RAM Capacity: 100 MB</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '1.1rem', fontFamily: 'monospace' }}>
            <span style={{ color: '#3b82f6' }}>35 MB (Original)</span>
            <span>+</span>
            <span style={{ color: mode === 'copy' ? '#ef4444' : '#10b981' }}>
              {mode === 'copy' ? `${ramObjects.slice(1).map(l => l.length * 7).join(' + ') || '0'} MB (Copies)` : `0 MB (In-Place)`}
            </span>
            <span>=</span>
            <span style={{ fontWeight: 'bold', color: ram >= 100 ? '#ef4444' : '#f8fafc' }}>
              {ram.toFixed(0)} MB Total RAM
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '1.1rem', fontFamily: 'monospace', marginTop: '10px' }}>
            <span style={{ color: '#8b5cf6' }}>{stackFrames.length} Stack Frames</span>
            <span>=</span>
            <span style={{ fontWeight: 'bold', color: stack >= 80 ? '#eab308' : '#f8fafc' }}>
              {stack.toFixed(0)}% Stack Usage
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginTop: '20px', width: '100%', height: '250px' }}>

          {/* Visual RAM Floor */}
          <div style={{ flex: 2, border: '2px dashed #3b82f6', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', padding: '10px', display: 'flex', flexDirection: 'column' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '10px', textAlign: 'center' }}>Physical RAM (Heap)</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', overflowY: 'auto', alignContent: 'flex-start' }}>
              {ramObjects.map((list, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ background: '#fff', border: mode === 'copy' ? '2px solid #ef4444' : '2px solid #10b981', padding: '8px', color: '#000', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold', animation: 'popIn 0.2s', boxShadow: '2px 2px 5px rgba(0,0,0,0.5)' }}>
                    📄 [{list.join(', ')}]
                  </div>
                  <span style={{ marginTop: '5px', background: mode === 'copy' && i > 0 ? '#ef4444' : '#3b82f6', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                    {list.length * 7} MB
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Call Stack */}
          <div style={{ flex: 1, border: '2px dashed #8b5cf6', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.1)', padding: '10px', display: 'flex', flexDirection: 'column-reverse', position: 'relative' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '10px', textAlign: 'center' }}>Call Stack</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
              {conditionMet && (
                <div style={{ background: '#10b981', color: '#fff', padding: '5px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', textAlign: 'center', animation: 'bounceIn 0.5s', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(16, 185, 129, 0.8)' }}>
                  ✅ BASE CASE REACHED
                </div>
              )}
              {stackFrames.map((_, i) => (
                <div key={i} style={{ background: '#8b5cf6', color: '#fff', padding: '5px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', textAlign: 'center', animation: 'slideInRight 0.2s', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  remove_order() Frame
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Simple Memory Box Inspector */}
        <div style={{
          width: '100%',
          marginTop: '18px',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          position: 'relative'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>📦</span>
              <div>
                <strong style={{ fontSize: '0.95rem', color: '#c084fc', letterSpacing: '0.5px' }}>
                  RAM Memory Box Tracker
                </strong>
                <span style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8' }}>
                  See whether recursive calls share the same tray box or duplicate new boxes
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowHeapInspector(!showHeapInspector)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#cbd5e1',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {showHeapInspector ? "Hide Tracker ▲" : "Show Tracker ▼"}
            </button>
          </div>

          {showHeapInspector && (
            <>
              {/* Master Tray Object Card */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#8b5cf6', boxShadow: '0 0 8px #8b5cf6' }} />
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc' }}>
                    orders = [1, 2, 3, 4, 5]
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>[Original Cafeteria Tray]</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Stored in:</span>
                  <span style={{ background: '#000', color: '#c084fc', padding: '3px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700, border: '1px solid rgba(192, 132, 252, 0.3)' }}>
                    📦 Memory Box #1
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#c084fc', background: 'rgba(139, 92, 246, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                    35 MB
                  </span>
                </div>
              </div>

              {/* Call Stack Frame Allocations Live Table */}
              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px', paddingRight: '4px' }}>
                {mode === 'copy' ? (
                  ramObjects.length <= 1 ? (
                    <div style={{ textAlign: 'center', padding: '16px', color: '#64748b', fontSize: '0.82rem', fontStyle: 'italic' }}>
                      Click 'remove_order(items)' above to see recursive calls duplicate boxes in RAM.
                    </div>
                  ) : (
                    ramObjects.slice(1).map((list, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '0.8rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>📦</span>
                          <span style={{ color: '#f8fafc', fontWeight: 600 }}>Recursion Frame #{i + 1}</span>
                          <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>(items.copy() = [{list.join(', ')}])</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: '#ef4444', fontWeight: 700, fontFamily: 'monospace' }}>📦 New Box #{i + 2}</span>
                          <span style={{ fontSize: '0.72rem', color: '#f87171', background: 'rgba(239, 68, 68, 0.2)', padding: '1px 6px', borderRadius: '4px' }}>
                            Duplicate Tray Copy ❌
                          </span>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  stackFrames.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '16px', color: '#64748b', fontSize: '0.82rem', fontStyle: 'italic' }}>
                      Click 'remove_order(items)' above to see recursive frames popping directly from the single shared tray.
                    </div>
                  ) : (
                    stackFrames.map((_, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '0.8rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>⚡</span>
                          <span style={{ color: '#f8fafc', fontWeight: 600 }}>Recursion Frame #{i + 1}</span>
                          <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>(mutating in-place)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: '#10b981', fontWeight: 700, fontFamily: 'monospace' }}>➔ Uses Box #1</span>
                          <span style={{ fontSize: '0.72rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.2)', padding: '1px 6px', borderRadius: '4px' }}>
                            Shared Original Tray (0 Copies) ✅
                          </span>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>

              {/* Memory Verdict Strip */}
              <div style={{
                background: mode === 'copy' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                border: `1px solid ${mode === 'copy' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.82rem',
                color: mode === 'copy' ? '#fca5a5' : '#86efac',
                fontWeight: 600
              }}>
                {mode === 'copy'
                  ? `🛑 Compounding Copies: Every recursive call duplicates the tray box, hoarding multiple copies in RAM simultaneously!`
                  : `✅ Single Shared Tray: All recursive call frames pop items directly from Memory Box #1 without making duplicates!`
                }
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quiz Modal Overlay */}
      {showQuiz && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(10px)', padding: '16px' }}>
          <div style={{ width: '920px', maxWidth: '96%', maxHeight: '92vh', overflowY: 'auto' }}>
            <Quiz questions={questions} codeChallenge={level3CodeChallenge} onPass={onPass} onClose={() => setShowQuiz(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Level3;
