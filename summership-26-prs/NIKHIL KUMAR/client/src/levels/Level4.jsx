import React, { useState, useEffect } from 'react';
import { Play, Info, Trash2, ArrowRight } from 'lucide-react';
import Quiz from '../components/Quiz';
import StorySlider from '../components/StorySlider';
import { playThud, playSweep, playPop, unlockAudio } from '../utils/audio';

const Level4 = ({ onCrash, onPass, RamBar }) => {
  const [ram, setRam] = useState(15);
  const [attendees, setAttendees] = useState([{ id: 1, index: 1, active: true, sweeping: false }]);
  const [mode, setMode] = useState('leak');
  const [showQuiz, setShowQuiz] = useState(false);
  const [storyLog, setStoryLog] = useState("Attendees checking in. Check out sessions when done.");
  const [isSweeping, setIsSweeping] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [hasCrashed, setHasCrashed] = useState(false);
  const [storyStep, setStoryStep] = useState(0);

  const [executingLine, setExecutingLine] = useState(0);
  const [selectedLine, setSelectedLine] = useState(null);
  const [explainStep, setExplainStep] = useState(1);
  const [prediction, setPrediction] = useState(null);
  const [showHeapInspector, setShowHeapInspector] = useState(true);

  const selectLine = (lineNum) => {
    setSelectedLine(lineNum);
    setExplainStep(1);
  };

  const storySlides = [
    {
      title: "Scene 1: The College Fest That Never Forgets",
      image: "/fest_registration_intro.jpg",
      text: "Your college is hosting a massive fest with thousands of students checking in for events, workshops, and competitions. The registration app tracks every student's details, but there's a hidden problem: when students leave the fest, what happens to the data their sessions no longer need?",
      buttonText: "See what happens...",
      color: "#60a5fa"
    },
    {
      title: "Scene 2: The Ghost Attendees Disaster",
      image: "/fest_registration_bad.jpg",
      text: "The developer makes a small but costly mistake: every student's temporary session data is appended to a permanent global list, and nothing is removed when the student leaves. Memory Bloat: thousands of unnecessary records keep consuming RAM; Ghost References: students who have already left still have their data retained in the application's tracking list; GC Blocked: Python cannot reclaim those objects while the list still references them, eventually slowing the registration system or crashing the server.",
      buttonText: "Simulate Disaster",
      color: "#ef4444"
    },
    null,
    {
      title: "Scene 3: Clear the Queue, Free the Memory",
      image: "/fest_registration_good.jpg",
      text: "The smart developer removes completed sessions from the temporary global list and releases any other unnecessary references. When an object's reference count reaches zero in CPython, its memory can be reclaimed automatically; del can remove a reference, but the object is freed only when no references remain. Now the registration system can reuse memory for incoming students instead of holding on to thousands of finished sessions.",
      buttonText: "Start Smart Simulation",
      color: "#10b981",
      action: () => {
        setRam(15);
        setAttendees([
          { id: 1, index: 1, active: true, sweeping: false },
          { id: 2, index: 2, active: true, sweeping: false },
          { id: 3, index: 3, active: true, sweeping: false }
        ]);
        setMode('gc');
        setPrediction(null);
        setSelectedLine(null);
        setHasCrashed(false);
        setStoryLog("Garbage Collector active! Click 'Check Out Attendee' to dereference sessions, then 'Run Garbage Collector' to sweep.");
        setStoryStep(4);
      }
    }
  ];

  const leakLineExplanations = {
    1: {
      code: "sessions = []",
      desc: "• Initializes a global Python list in module scope to store registered student sessions.\n• In RAM: Allocates an expandable pointer array in heap memory with permanent lifecycle.\n• Scale impact: Persists indefinitely across the entire application runtime until process shutdown.\n• Takeaway: Global collections hold strong references to items forever unless actively pruned."
    },
    2: {
      code: "def checkout_student(student):",
      desc: "• Defines the function handling student checkouts, accepting attendee metadata.\n• In RAM: Pushes a temporary local execution frame to the call stack upon invocation.\n• Scale impact: Executes for every arriving student, binding incoming arguments into local variables.\n• Takeaway: Local references normally expire when a function exits—unless leaked globally."
    },
    3: {
      code: "sessions.append(student)",
      desc: "• ⚠️ MEMORY LEAK: Appends departing student data into the permanent global list.\n• In RAM: sys.getrefcount() remains ≥ 1, blocking Python's Garbage Collector from freeing RAM.\n• Scale impact: With thousands of checkouts, accumulated ghost references exhaust physical memory.\n• Takeaway: Unbounded global caches and session logs are the #1 source of Python memory leaks."
    },
    4: {
      code: 'return "Checked out"',
      desc: "• Outputs status confirming that the student has visually departed the check-in desk.\n• In RAM: The session dictionary remains anchored in heap memory via the global list.\n• Scale impact: The UI reports success even while RAM is silently leaking in the background.\n• Takeaway: A successful return statement does not mean memory was freed!"
    },
    5: {
      code: `checkout_student(student_${attendees.length})`,
      desc: "• Calls the checkout routine passing the student session instance.\n• In RAM: Pushes reference pointer into the function stack.\n• Scale impact: Each call traps another finished session permanently in heap RAM.\n• Takeaway: Repeated calls accumulate ghost references until RAM hits 100% capacity."
    }
  };

  const gcLineExplanations = {
    1: {
      code: "def checkout_student(student):",
      desc: "• Defines the optimized checkout routine without persisting state to global scope.\n• In RAM: Creates an isolated local stack frame where variables are scoped strictly to the function.\n• Scale impact: High-throughput execution with no global residual data left behind.\n• Takeaway: Clean variable scoping prevents unintended reference retention across transactions."
    },
    2: {
      code: `del student`,
      desc: "• ⚡ EXPLICIT CLEANUP: Uses Python's 'del' keyword to sever the variable reference.\n• In RAM: Reference count drops to 0 (sys.getrefcount == 0); memory block is queued for instant reclamation.\n• Scale impact: Python's Garbage Collector frees the memory block immediately, keeping RAM low.\n• Takeaway: When an object has zero active references, its physical memory is promptly recycled."
    },
    3: {
      code: 'return "Checked out"',
      desc: "• Returns confirmation status with zero lingering references on the heap.\n• In RAM: Standard function exit unwinding with 0 heap leakage.\n• Scale impact: Constant memory profile regardless of how many thousands of students check out.\n• Takeaway: Demonstrates predictable, production-grade memory safety and lifecycle management."
    },
    4: {
      code: `checkout_student(student_${attendees.length})`,
      desc: "• Calls the clean checkout routine passing the attendee reference.\n• In RAM: Memory is reclaimed automatically as soon as the reference count hits zero.\n• Scale impact: Handles millions of transactions without expanding the memory footprint.\n• Takeaway: Python's automatic GC works efficiently when code doesn't hoard references."
    }
  };

  const getLineStyle = (lineNum) => {
    const isLineActive = executingLine === lineNum;
    return {
      background: isLineActive
        ? (mode === 'leak' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)')
        : 'transparent',
      borderLeft: isLineActive
        ? (mode === 'leak' ? '3px solid #ef4444' : '3px solid #10b981')
        : '3px solid transparent',
      paddingLeft: '5px',
      transition: 'all 0.2s',
      color: isLineActive ? '#fff' : '#cbd5e1'
    };
  };

  const questions = [
    {
      type: 'mcq',
      question: "When does CPython immediately deallocate an object and free its physical memory back to RAM?",
      options: [
        { text: "The exact moment its Reference Count drops to Zero (no active references remain).", isCorrect: true },
        { text: "Only when the entire computer process is restarted.", isCorrect: false },
        { text: "Periodically every 5 minutes regardless of active references.", isCorrect: false }
      ]
    },
    {
      type: 'jumble',
      question: "Jumbled Syntax: Form the code to inspect how many active references currently point to an attendee object in memory:",
      words: ["sys.getrefcount(", "attendee", ")"],
      correctOrder: ["sys.getrefcount(", "attendee", ")"]
    },
    {
      type: 'debug',
      question: "Fill in the Blank: Use the keyword that deletes a variable binding and decrements an object's reference count:",
      codeSnippet: "___ finished_session",
      correctWord: "del",
      acceptableWords: ["del"]
    }
  ];

  const level4CodeChallenge = {
    levelNumber: 4,
    title: "Level 4: Fix the Global Memory Leak",
    subtitle: "Garbage Collection & Dereferencing Challenge",
    description: "The checkout routine appends finished student sessions to a permanent global list. This keeps their reference count ≥ 1, blocking Python's Garbage Collector from freeing their memory. Drag the correct dereferencing block into Line 2 to allow automatic GC cleanup!",
    codeLinesBefore: [
      "def checkout_student(student):"
    ],
    slotLineNumber: 2,
    buggyCode: "    sessions.append(student)",
    codeLinesAfter: [
      "    return \"Checked out\""
    ],
    replacementOptions: [
      {
        id: "append_global",
        codeText: "    sessions.append(student)",
        shortText: "sessions.append(student)",
        label: "sessions.append(student)",
        isCorrect: false,
        tag: "Global Retention",
        feedbackTitle: "⚠️ Memory Leak Persists!",
        feedbackText: "Appending to a permanent global list keeps reference count at 1 forever! Python's Garbage Collector cannot sweep the attendee's memory box."
      },
      {
        id: "del_student",
        codeText: "    del student",
        shortText: "del student",
        label: "del student",
        isCorrect: true,
        tag: "Dereference (GC Trigger)",
        feedbackTitle: "🎉 Reference Count Dropped to Zero!",
        feedbackText: "Masterful! Using 'del student' severs the last active reference to the session object. Its reference count drops to 0, allowing the Garbage Collector to immediately reclaim RAM!"
      },
      {
        id: "pass_noop",
        codeText: "    pass",
        shortText: "pass",
        label: "pass",
        isCorrect: false,
        tag: "No Explicit Cleanup",
        feedbackTitle: "⚠️ Incomplete Lifecycle Management!",
        feedbackText: "Doing nothing doesn't actively manage lifecycle or ensure resources are safely freed when holding external session handles."
      }
    ]
  };

  const handleCheckout = () => {
    unlockAudio();
    if (isExecuting || hasCrashed) return;
    setIsExecuting(true);

    if (mode === 'leak') {
      setExecutingLine(5);
      setTimeout(() => {
        setExecutingLine(1);
        setTimeout(() => {
          setExecutingLine(2);
          setTimeout(() => {
            setExecutingLine(3);
            setTimeout(() => {
              setExecutingLine(4);
              setTimeout(() => {
                setExecutingLine(0);
                playThud();

                let newAttendees = [];
                setAttendees(prev => {
                  const updated = [...prev];
                  const activeItem = updated.find(s => s.active);
                  if (activeItem) {
                    activeItem.active = false;
                  }
                  const newCount = updated.length + 1;
                  updated.push({ id: Date.now(), index: newCount, active: true, sweeping: false });
                  newAttendees = updated;
                  return updated;
                });

                const ghostCount = attendees.filter(s => !s.active).length + 1;
                const newRam = 15 + (ghostCount * 20);
                setRam(newRam);

                if (newRam >= 100) {
                  setTimeout(() => {
                    onCrash();
                    setHasCrashed(true);
                    setIsExecuting(false);
                  }, 400);
                } else {
                  setIsExecuting(false);
                }
              }, 400);
            }, 400);
          }, 400);
        }, 400);
      }, 400);
    } else {
      setExecutingLine(4);
      setTimeout(() => {
        setExecutingLine(1);
        setTimeout(() => {
          setExecutingLine(2);
          setTimeout(() => {
            setExecutingLine(3);
            setTimeout(() => {
              setExecutingLine(0);
              playPop();

              let uncollectedCount = 0;
              let checkedStudentIndex = 1;
              setAttendees(prev => {
                const updated = [...prev];
                const activeIndex = updated.findIndex(s => s.active);
                if (activeIndex !== -1) {
                  // Dereference the active student (del student). Keep on screen awaiting GC!
                  checkedStudentIndex = updated[activeIndex].index || (activeIndex + 1);
                  updated[activeIndex] = { ...updated[activeIndex], active: false };
                } else {
                  // If all existing students are already dereferenced, check out the next one as awaiting GC
                  const maxIndex = updated.length > 0 ? Math.max(...updated.map(s => s.index || 1)) : 0;
                  checkedStudentIndex = maxIndex + 1;
                  updated.push({ id: Date.now(), index: checkedStudentIndex, active: false, sweeping: false });
                }
                uncollectedCount = updated.filter(s => !s.active).length;
                return updated;
              });

              // RAM accumulates uncollected objects until Garbage Collector runs
              setRam(Math.min(15 + (uncollectedCount * 15), 75));
              setStoryLog(`Student #${checkedStudentIndex} session dereferenced ('del student')! Object remains in RAM (Ref=0). Click 'Run Garbage Collector' to sweep.`);
              setIsExecuting(false);
            }, 400);
          }, 400);
        }, 400);
      }, 400);
    }
  };

  const handleGarbageCollect = () => {
    unlockAudio();
    if (isSweeping) return;

    const uncollectedCount = attendees.filter(s => !s.active).length;
    if (uncollectedCount === 0) {
      setStoryLog("RAM is already clean! Check out an attendee first to see GC sweep unreferenced memory.");
      return;
    }

    playSweep();
    setIsSweeping(true);
    setStoryLog(`Garbage Collector deployed! Sweeping ${uncollectedCount} dereferenced student session${uncollectedCount > 1 ? 's' : ''}...`);

    setAttendees(prev => prev.map(s => !s.active ? { ...s, sweeping: true } : s));

    setTimeout(() => {
      // ONLY NOW are the dereferenced students deleted!
      setAttendees(prev => prev.filter(s => s.active));
      setRam(15);
      setIsSweeping(false);
      setHasCrashed(false);
      setStoryLog(`SUCCESS: Garbage Collector purged ${uncollectedCount} dereferenced session${uncollectedCount > 1 ? 's' : ''} from physical RAM!`);
    }, 1200);
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
      { shortTag: "2. RAM", category: "In Physical RAM", color: isDanger ? '#f97316' : '#60a5fa', bg: isDanger ? 'rgba(249, 115, 22, 0.15)' : 'rgba(96, 165, 250, 0.15)', icon: "🧠", label: "Heap & GC Reference" },
      { shortTag: "3. Scale", category: "Scale & Lifecycle", color: isDanger ? '#dc2626' : '#34d399', bg: isDanger ? 'rgba(220, 38, 38, 0.15)' : 'rgba(52, 211, 153, 0.15)', icon: isDanger ? "⚠️" : "⚡", label: "System Scalability" },
      { shortTag: "4. Rule", category: "Memory Rule", color: isDanger ? '#e11d48' : '#10b981', bg: isDanger ? 'rgba(225, 29, 72, 0.15)' : 'rgba(16, 185, 129, 0.15)', icon: "🎯", label: "Key Rule" }
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
      category: "Info",
      color: accentColor,
      bg: 'rgba(255,255,255,0.08)',
      icon: "💡",
      label: "Explanation",
      text: "Click any line above to inspect."
    };

    return (
      <div
        key={`${selectedLine}-${explainStep}`}
        className="line-explain-card"
        style={{
          borderLeft: `4px solid ${activePoint.color}`,
          border: `1px solid ${glowColor}`,
          boxShadow: `0 10px 32px ${glowColor}, 0 2px 10px rgba(0,0,0,0.5)`,
          marginTop: '16px'
        }}
      >
        {/* Top Header & Step Navigation */}
        <div className="explain-top-bar">
          <div className="explain-step-pills">
            {points.map((p) => (
              <button
                key={p.step}
                onClick={() => setExplainStep(p.step)}
                className={`explain-step-pill ${
                  explainStep === p.step 
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

        {/* Code Strip */}
        <div className="explain-code-strip">
          {data.code}
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
              <span>Done ✓</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  if (storySlides[storyStep] !== null && storyStep < storySlides.length) {
    const steps = [
      { id: 0, label: "1. Fest Check-In" },
      { id: 1, label: "2. Ghost Attendees" },
      { id: 3, label: "3. Clean Memory" }
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

  return (
    <div className="level-container">
      <div className="story-panel glass-panel">
        <h2>4. College Fest Registration (Garbage Collection)</h2>

        {/* Mission Objective Banner (Level 4) */}
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
                  <strong style={{ color: '#fff' }}>Understand the code:</strong> Click any line below to inspect attendee session allocations and reference counters.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>2.</span>
                <span>
                  <strong style={{ color: '#fff' }}>Give the Pre-Flight test:</strong> Answer the garbage collector sweep hypothesis question below.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.65 }}>
                <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>3.</span>
                <span>
                  <strong style={{ color: '#cbd5e1' }}>Run the program:</strong> Execute check-ins to observe RAM leaks vs garbage collection live.
                </span>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.82rem', color: '#e2e8f0', lineHeight: '1.45' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ color: '#10b981', fontWeight: 700 }}>✅ Pre-Flight Test Completed!</span>
              </div>
              <p style={{ margin: 0, color: '#cbd5e1' }}>
                {hasCrashed && mode === 'leak' ? (
                  <>💥 <strong style={{ color: '#ef4444' }}>Memory Leak Crash!</strong> Stale global references prevented the Garbage Collector from freeing RAM. Click <strong>"View Clean Solution"</strong> below to learn proper cleanup.</>
                ) : (
                  <>Now click the <strong style={{ color: '#38bdf8' }}>"▶ Run Program"</strong> button on the right panel to execute attendee check-ins and observe Garbage Collector sweeps live!</>
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
                {mode === 'leak' ? "Pre-Flight Hypothesis 1: Global Reference Leak" : "Pre-Flight Hypothesis 2: Garbage Collector Sweep"}
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
            {mode === 'leak'
              ? "Before running code: If a student leaves but remains in the global sessions list, can Python free their RAM?"
              : "Before running code: What condition must be met for Python's Garbage Collector to reclaim an attendee's memory?"
            }
          </p>

          {!prediction ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {mode === 'leak' ? (
                <>
                  <button
                    onClick={() => {
                      unlockAudio();
                      playPop();
                      setPrediction({ choice: 'autofree', isCorrect: false });
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
                    <span>A. Yes, Python detects the student departed and reclaims their memory automatically.</span>
                  </button>
                  <button
                    onClick={() => {
                      unlockAudio();
                      playPop();
                      setPrediction({ choice: 'leak', isCorrect: true });
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
                    <span>B. No, the global list holds a strong reference (refcount &gt; 0), blocking GC and leaking RAM!</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      unlockAudio();
                      playPop();
                      setPrediction({ choice: 'zero_ref', isCorrect: true });
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
                    <span>A. The reference count must drop to exactly 0 (del or removed), allowing the GC sweeper to free RAM.</span>
                  </button>
                  <button
                    onClick={() => {
                      unlockAudio();
                      playPop();
                      setPrediction({ choice: 'timeout', isCorrect: false });
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
                    <span>B. Objects are automatically deleted after 60 seconds regardless of references.</span>
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
                  mode === 'leak'
                    ? "🎯 Spot-on! Python's reference counter sees that 'sessions' still points to the attendee. As long as refcount > 0, GC cannot touch it! Check out students to watch RAM leak!"
                    : "🎯 Correct! CPython relies on reference counting. Calling 'del' or removing the pointer drops refcount to 0, enabling the Garbage Collector to sweep!"
                ) : (
                  mode === 'leak'
                    ? "💡 Classic misconception! Python has no idea real-world events ended. If your code holds a reference in a list, it stays in RAM forever. Check out students to see the leak!"
                    : "💡 Common trap! Python doesn't have a time-based reaper for heap objects; memory is reclaimed strictly based on reference counts reaching 0. Run code to verify!"
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

        {mode === 'leak' ? (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--danger)', padding: '12px', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Code execution: Memory Leak</strong>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>💡 Click any line to see purpose</span>
            </div>
            <pre style={{ marginTop: '8px', fontFamily: 'monospace', background: '#000', padding: '10px', borderRadius: '4px', fontSize: '0.85rem', overflowX: 'auto' }}>
              <div onClick={() => selectLine(1)} style={{ ...getLineStyle(1), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 1 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(1).background }}>sessions = []</div>
              <div onClick={() => selectLine(2)} style={{ ...getLineStyle(2), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 2 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(2).background }}>def checkout_student(student):</div>
              <div style={{ color: '#ef4444', padding: '2px 4px' }}>    # DANGER: Appends departed session to global list!</div>
              <div onClick={() => selectLine(3)} style={{ ...getLineStyle(3), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 3 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(3).background }}>
                {`    sessions.append(student)`}
              </div>
              <div onClick={() => selectLine(4)} style={{ ...getLineStyle(4), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 4 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(4).background }}>    return "Checked out"</div>
              <div onClick={() => selectLine(5)} style={{ ...getLineStyle(5), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 5 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(5).background }}>{`checkout_student(student_${attendees.length})`}</div>
            </pre>

            {/* Purpose shows ONLY when clicked on a line */}
            {renderAnimatedExplanation(true, leakLineExplanations)}
          </div>
        ) : (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid var(--success)', padding: '12px', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Optimized execution: Garbage Collection</strong>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>💡 Click any line to see purpose</span>
            </div>
            <pre style={{ marginTop: '8px', fontFamily: 'monospace', background: '#000', padding: '10px', borderRadius: '4px', fontSize: '0.85rem', overflowX: 'auto' }}>
              <div onClick={() => selectLine(1)} style={{ ...getLineStyle(1), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 1 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(1).background }}>def checkout_student(student):</div>
              <div style={{ color: '#10b981', padding: '2px 4px' }}>    # SUCCESS: Explicitly cuts the variable reference!</div>
              <div onClick={() => selectLine(2)} style={{ ...getLineStyle(2), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 2 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(2).background }}>
                {`    del student`}
              </div>
              <div onClick={() => selectLine(3)} style={{ ...getLineStyle(3), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 3 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(3).background }}>    return "Checked out"</div>
              <div onClick={() => selectLine(4)} style={{ ...getLineStyle(4), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 4 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(4).background }}>{`checkout_student(student_${attendees.length})`}</div>
            </pre>

            {/* Purpose shows ONLY when clicked on a line */}
            {renderAnimatedExplanation(false, gcLineExplanations)}
          </div>
        )}

        <div style={{ marginTop: 'auto', display: 'flex', gap: '12px', flexDirection: 'column' }}>
          {hasCrashed && mode === 'leak' && (
            <button className="btn warning" style={{ background: '#f59e0b', color: '#000', fontWeight: 'bold' }} onClick={() => setStoryStep(3)}>
              View the Smart Solution <ArrowRight size={18} style={{ marginLeft: '8px' }} />
            </button>
          )}
          {mode === 'gc' && (
            <button className="btn" style={{ background: 'var(--accent)', borderColor: 'var(--accent)', color: 'black' }} onClick={() => setShowQuiz(true)}>
              Check Knowledge
            </button>
          )}
        </div>
      </div>

      <div className="interaction-panel glass-panel" style={{ justifyContent: 'flex-start' }}>
        {/* Right Side Heading */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px', marginBottom: '10px' }}>
          <h2 style={{ fontSize: '1.4rem', color: '#60a5fa', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚡</span> Student Sessions & GC Simulation Lab
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '4px' }}>
            Live Simulation
          </span>
        </div>

        <RamBar usage={ram} />

        {/* Calculation Bar */}
        <div style={{ background: '#1e293b', padding: '15px', borderRadius: '8px', marginTop: '10px', width: '100%', border: '1px solid #475569', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
            <strong>RAM Capacity: 100 GB</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '1.1rem', fontFamily: 'monospace' }}>
            <span style={{ color: '#3b82f6' }}>15 GB (Baseline)</span>
            <span>+</span>
            <span style={{ color: attendees.filter(s => !s.active).length > 0 ? (mode === 'leak' ? '#ef4444' : '#f59e0b') : '#10b981' }}>
              {mode === 'leak'
                ? `${attendees.filter(s => !s.active).length * 20} GB (Ghost Sessions)`
                : `${attendees.filter(s => !s.active).length * 15} GB (Uncollected Ref=0)`}
            </span>
            <span>=</span>
            <span style={{ fontWeight: 'bold', color: ram >= 100 ? '#ef4444' : '#f8fafc' }}>
              {ram.toFixed(0)} GB Total
            </span>
          </div>
        </div>

        {/* Story Log Banner */}
        <div style={{ width: '100%', background: mode === 'leak' ? 'rgba(239,68,68,0.2)' : 'rgba(16, 185, 129, 0.2)', padding: '10px 15px', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
          <Info size={20} color={mode === 'leak' ? 'var(--danger)' : 'var(--success)'} />
          <p style={{ fontSize: '0.95rem', fontStyle: 'italic', margin: 0 }}>{storyLog}</p>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', justifyContent: 'center' }}>
          {mode === 'leak' ? (
            <button
              className="btn primary"
              onClick={prediction?.isCorrect ? handleCheckout : undefined}
              disabled={!prediction?.isCorrect || isExecuting || isSweeping || showQuiz}
              style={{
                opacity: (!prediction?.isCorrect || isExecuting || isSweeping || showQuiz) ? 0.5 : 1,
                cursor: (!prediction?.isCorrect || isExecuting || isSweeping || showQuiz) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Play size={18} /> Check Out Attendee
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                className="btn primary"
                onClick={prediction?.isCorrect ? handleCheckout : undefined}
                disabled={!prediction?.isCorrect || isExecuting || isSweeping || showQuiz}
                style={{
                  opacity: (!prediction?.isCorrect || isExecuting || isSweeping || showQuiz) ? 0.5 : 1,
                  cursor: (!prediction?.isCorrect || isExecuting || isSweeping || showQuiz) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Play size={18} /> Check Out Attendee
              </button>
              <button
                className="btn"
                style={{
                  background: 'var(--success)',
                  borderColor: 'var(--success)',
                  color: '#000',
                  fontWeight: 'bold',
                  opacity: (!prediction?.isCorrect || isExecuting || isSweeping || showQuiz) ? 0.5 : 1,
                  cursor: (!prediction?.isCorrect || isExecuting || isSweeping || showQuiz) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onClick={prediction?.isCorrect ? handleGarbageCollect : undefined}
                disabled={!prediction?.isCorrect || isExecuting || isSweeping || showQuiz}
              >
                <Trash2 size={18} /> Run Garbage Collector
              </button>
            </div>
          )}
        </div>

        {/* Visual Registration Bay */}
        <div style={{ width: '100%', marginTop: '20px', padding: '20px', border: '2px dashed #475569', borderRadius: '12px', minHeight: '220px', position: 'relative', overflow: 'hidden', background: 'rgba(15, 23, 42, 0.6)' }}>
          <p style={{ position: 'absolute', top: 8, left: 14, color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>
            Active Fest Registration Sessions (RAM Memory Space)
          </p>

          {isSweeping && (
            <div style={{
              position: 'absolute',
              top: '30%',
              left: '-100px',
              zIndex: 10,
              animation: 'droneSweep 1.5s linear forwards',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              borderRadius: '50px',
              padding: '10px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#000',
              fontWeight: 800,
              boxShadow: '0 0 25px rgba(16, 185, 129, 0.8)'
            }}>
              <span style={{ fontSize: '1.2rem' }}>🧹</span>
              <span>GC Sweeper Active</span>
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '24px' }}>
            {attendees.map((s) => {
              const isGhost = mode === 'leak' && !s.active;
              const isAwaitingGC = mode === 'gc' && !s.active;
              const cardBg = s.active 
                ? 'rgba(30, 41, 59, 0.9)' 
                : isGhost 
                  ? 'rgba(239, 68, 68, 0.15)' 
                  : 'rgba(245, 158, 11, 0.15)';
              const cardBorder = s.active 
                ? '2px solid #38bdf8' 
                : isGhost 
                  ? '2px dashed #ef4444' 
                  : '2px dashed #f59e0b';
              const badgeBg = s.active 
                ? 'rgba(56, 189, 248, 0.2)' 
                : isGhost 
                  ? 'rgba(239, 68, 68, 0.25)' 
                  : 'rgba(245, 158, 11, 0.25)';
              const badgeColor = s.active 
                ? '#38bdf8' 
                : isGhost 
                  ? '#ef4444' 
                  : '#fbbf24';
              const badgeBorder = s.active 
                ? '1px solid rgba(56, 189, 248, 0.4)' 
                : isGhost 
                  ? '1px solid rgba(239, 68, 68, 0.4)' 
                  : '1px solid rgba(245, 158, 11, 0.4)';
              const avatarBg = s.active 
                ? 'linear-gradient(135deg, #0284c7, #38bdf8)' 
                : isGhost 
                  ? 'linear-gradient(135deg, #7f1d1d, #ef4444)' 
                  : 'linear-gradient(135deg, #b45309, #f59e0b)';
              const avatarIcon = s.active ? '🎓' : isGhost ? '👻' : '⏳';
              const badgeLabel = s.active ? 'Active' : isGhost ? 'Ghost Ref' : 'Awaiting GC';

              return (
                <div
                  key={s.id}
                  style={{
                    position: 'relative',
                    animation: s.sweeping ? 'sweepAway 1s forwards' : 'popIn 0.3s',
                    background: cardBg,
                    border: cardBorder,
                    borderRadius: '12px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '125px',
                    boxShadow: s.active 
                      ? '0 4px 15px rgba(56, 189, 248, 0.25)' 
                      : isGhost 
                        ? '0 2px 10px rgba(239, 68, 68, 0.2)' 
                        : '0 2px 10px rgba(245, 158, 11, 0.2)',
                    opacity: s.active ? 1 : 0.85,
                    filter: isGhost ? 'grayscale(40%)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: avatarBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    marginBottom: '8px'
                  }}>
                    {avatarIcon}
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>
                    {`Student #${s.index || 1}`}
                  </span>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    marginTop: '6px',
                    padding: '3px 8px',
                    borderRadius: '10px',
                    background: badgeBg,
                    color: badgeColor,
                    border: badgeBorder
                  }}>
                    {badgeLabel}
                  </span>
                </div>
              );
            })}
          </div>

          {attendees.length === 0 && (
            <div style={{ textAlign: 'center', padding: '36px 20px', color: '#10b981' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✨</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#34d399' }}>RAM Memory Cleared!</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
                All unreferenced attendee sessions have been purged by the Garbage Collector.
              </div>
            </div>
          )}
        </div>

        {/* Simple Memory Box Inspector */}
        <div style={{
          width: '100%',
          marginTop: '16px',
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
          backdropFilter: 'blur(8px)'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>📦</span>
              <div>
                <strong style={{ fontSize: '0.95rem', color: '#38bdf8', letterSpacing: '0.5px' }}>
                  RAM Memory Box Tracker
                </strong>
                <span style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8' }}>
                  See how attendee sessions stay held in memory or get cleared by Garbage Collection
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
              {/* Global Registry Card */}
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
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }} />
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc' }}>
                    sessions = [...]
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>[Global Attendee List]</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Stored in:</span>
                  <span style={{ background: '#000', color: '#38bdf8', padding: '3px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700, border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                    📦 Memory Box #1
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    color: mode === 'leak' ? '#f87171' : '#34d399',
                    background: mode === 'leak' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 600
                  }}>
                    {mode === 'leak' ? "Leak Risk: Sessions Kept Forever" : "Clean: Auto-Removed on Checkout"}
                  </span>
                </div>
              </div>

              {/* Attendee Objects Live Table */}
              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px', paddingRight: '4px' }}>
                {attendees.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '16px', color: '#10b981', fontSize: '0.82rem', fontStyle: 'italic', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '6px', border: '1px dashed rgba(16, 185, 129, 0.3)' }}>
                    ✨ All attendee session memory boxes have been cleared! 0 bytes leaked.
                  </div>
                ) : (
                  attendees.map((s, idx) => {
                    const studentNum = s.index || (idx + 1);
                    const isGhost = mode === 'leak' && !s.active;
                    const isAwaitingGC = mode === 'gc' && !s.active;

                    let statusText;
                    let badgeBg;
                    let badgeColor;
                    let borderCol;

                    if (s.active) {
                      statusText = "Active Session (In Use)";
                      badgeBg = "rgba(56, 189, 248, 0.15)";
                      badgeColor = "#38bdf8";
                      borderCol = "rgba(56, 189, 248, 0.3)";
                    } else if (isGhost) {
                      statusText = "Ghost Leak: Trapped in List 🛑";
                      badgeBg = "rgba(239, 68, 68, 0.15)";
                      badgeColor = "#f87171";
                      borderCol = "rgba(239, 68, 68, 0.35)";
                    } else {
                      statusText = "Awaiting Garbage Collector ⚡";
                      badgeBg = "rgba(245, 158, 11, 0.15)";
                      badgeColor = "#fbbf24";
                      borderCol = "rgba(245, 158, 11, 0.35)";
                    }

                    return (
                      <div key={s.id || idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: isGhost ? 'rgba(239, 68, 68, 0.08)' : (isAwaitingGC ? 'rgba(245, 158, 11, 0.08)' : 'rgba(30, 41, 59, 0.6)'),
                        border: `1px solid ${borderCol}`,
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '0.8rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{s.active ? '👤' : (isGhost ? '👻' : '🧹')}</span>
                          <span style={{ color: '#f8fafc', fontWeight: 600 }}>Student #{studentNum}</span>
                          <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                            ({s.active ? 'Checked-In' : (isGhost ? 'Departed' : 'Checked Out')})
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: '#38bdf8', fontWeight: 700, fontFamily: 'monospace' }}>📦 Box #{studentNum + 1}</span>
                          <span style={{ fontSize: '0.72rem', color: badgeColor, background: badgeBg, padding: '1px 6px', borderRadius: '4px', border: `1px solid ${borderCol}` }}>
                            {statusText}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Verdict Strip */}
              <div style={{
                background: mode === 'leak' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                borderLeft: `4px solid ${mode === 'leak' ? '#ef4444' : '#10b981'}`,
                borderRadius: '0 8px 8px 0',
                padding: '8px 12px',
                fontSize: '0.82rem',
                color: '#e2e8f0',
                lineHeight: '1.45'
              }}>
                {mode === 'leak' ? (
                  <span>
                    🛑 <strong style={{ color: '#f87171' }}>Memory Leak:</strong> Departed students are still kept inside the global list, so Python cannot clear their memory box from RAM!
                  </span>
                ) : (
                  <span>
                    ⚡ <strong style={{ color: '#34d399' }}>Clean Memory Management:</strong> Removing checked-out students allows Python's Garbage Collector to safely empty and reuse their memory boxes!
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quiz Modal Overlay */}
      {showQuiz && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(10px)', padding: '16px' }}>
          <div style={{ width: '920px', maxWidth: '96%', maxHeight: '92vh', overflowY: 'auto' }}>
            <Quiz questions={questions} codeChallenge={level4CodeChallenge} onPass={onPass} onClose={() => setShowQuiz(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Level4;
