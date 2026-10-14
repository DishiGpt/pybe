import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Play, Info, ArrowRight } from 'lucide-react';
import Quiz from '../components/Quiz';
import StorySlider from '../components/StorySlider';
import { playThud, playPop, unlockAudio } from '../utils/audio';

const Level2 = ({ onCrash, onPass, RamBar }) => {
  const [ram, setRam] = useState(20); // 20MB for base wallet system
  const [wallets, setWallets] = useState([]);
  const [mode, setMode] = useState('duplicate');
  const [showQuiz, setShowQuiz] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [storyStep, setStoryStep] = useState(0);
  const [balance, setBalance] = useState(100);
  const [executingLine, setExecutingLine] = useState(0);
  const [hasCrashed, setHasCrashed] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);
  const [explainStep, setExplainStep] = useState(1);
  const [prediction, setPrediction] = useState(null);
  const [showHeapInspector, setShowHeapInspector] = useState(true);

  const selectLine = (lineNum) => {
    setSelectedLine(lineNum);
    setExplainStep(1);
  };

  const questions = [
    {
      type: 'mcq',
      question: "Why does calling `wallet.copy()` on every recharge waste memory compared to modifying in-place?",
      options: [
        { text: "copy() allocates a brand-new dictionary hash table in RAM every time, whereas in-place updates mutate existing memory.", isCorrect: true },
        { text: "copy() encrypts the dictionary and compresses it on the call stack.", isCorrect: false },
        { text: "Dictionaries cannot store integers without creating new heap boxes.", isCorrect: false }
      ]
    },
    {
      type: 'jumble',
      question: "Jumbled Syntax: Compare memory addresses before and after an in-place update to verify zero reallocation:",
      words: ["id(before)", "==", "id(after)"],
      correctOrder: ["id(before)", "==", "id(after)"]
    },
    {
      type: 'debug',
      question: "Fill in the Blank: Which operator updates a dictionary numeric key in-place without creating a new dictionary copy?",
      codeSnippet: "wallet['balance'] ___ 20",
      correctWord: "+=",
      acceptableWords: ["+=", "+ ="]
    }
  ];

  const level2CodeChallenge = {
    levelNumber: 2,
    title: "Level 2: Fix the Wallet Reallocation",
    subtitle: "In-Place Dictionary Mutation Challenge",
    description: "The current recharge function calls wallet.copy(), cloning the dictionary into brand-new heap memory on every single transaction. Drag the correct replacement block into Line 2 to mutate the balance in-place with zero memory reallocation!",
    codeLinesBefore: [
      "def update_wallet(wallet):"
    ],
    slotLineNumber: 2,
    buggyCode: "    new_wallet = wallet.copy()",
    codeLinesAfter: [
      "    return wallet"
    ],
    replacementOptions: [
      {
        id: "dict_copy",
        codeText: "    new_wallet = dict(wallet)",
        shortText: "new_wallet = dict(wallet)",
        label: "dict(wallet)",
        isCorrect: false,
        tag: "Dict Constructor",
        feedbackTitle: "⚠️ Still Reallocating!",
        feedbackText: "Calling dict(wallet) instantiates a completely separate dictionary hash table on the heap, still wasting 20 MB on every recharge."
      },
      {
        id: "mutate_inplace",
        codeText: "    wallet['balance'] += 20",
        shortText: "wallet['balance'] += 20",
        label: "wallet['balance'] += 20",
        isCorrect: true,
        tag: "In-Place Mutation",
        feedbackTitle: "🎉 Zero-Reallocation Fix Confirmed!",
        feedbackText: "Brilliant! Python dictionaries are mutable in-place. Updating the existing key modifies the memory box directly without allocating any new objects!"
      },
      {
        id: "deepcopy_wallet",
        codeText: "    new_wallet = copy.deepcopy(wallet)",
        shortText: "new_wallet = copy.deepcopy(wallet)",
        label: "copy.deepcopy(wallet)",
        isCorrect: false,
        tag: "Deep Copy",
        feedbackTitle: "⚠️ Severe Memory Overhead!",
        feedbackText: "deepcopy() recursively copies every key-value object, causing even worse memory fragmentation and triggering early crashes."
      }
    ]
  };

  const handleDrag = () => {
    unlockAudio();
    if (isBuilding || hasCrashed) return;
    setIsBuilding(true);

    if (mode === 'duplicate') {
      setExecutingLine(1); // call
      setTimeout(() => {
        setExecutingLine(2); // def
        setTimeout(() => {
          setExecutingLine(3); // copy
          setTimeout(() => {
            setExecutingLine(4); // balance += 20
            setTimeout(() => {
              setExecutingLine(5); // return
              setTimeout(() => {
                setExecutingLine(0);
                let count = wallets.length + 1;
                let currentRam = ram + 20;

                playThud();
                setRam(currentRam);
                setWallets(prev => [...prev, { id: count, balance: 100 + (count * 20) }]);

                if (currentRam >= 100) {
                  setTimeout(() => {
                    onCrash();
                    setIsBuilding(false);
                    setHasCrashed(true);
                  }, 400);
                } else {
                  setIsBuilding(false);
                }
              }, 600);
            }, 600);
          }, 600);
        }, 600);
      }, 600);
    } else {
      setExecutingLine(1); // call
      setTimeout(() => {
        setExecutingLine(2); // def
        setTimeout(() => {
          setExecutingLine(3); // balance += 20
          setTimeout(() => {
            setExecutingLine(5); // return
            setTimeout(() => {
              setExecutingLine(0);
              playPop();
              setBalance(b => b + 20);
              setIsBuilding(false);
            }, 600);
          }, 600);
        }, 600);
      }, 600);
    }
  };

  const getLineStyle = (lineNum) => {
    const isLineActive = executingLine === lineNum;
    return {
      background: isLineActive ? (mode === 'duplicate' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)') : 'transparent',
      borderLeft: isLineActive ? (mode === 'duplicate' ? '3px solid #ef4444' : '3px solid #10b981') : '3px solid transparent',
      paddingLeft: '5px',
      transition: 'all 0.2s',
      color: isLineActive ? '#fff' : '#cbd5e1'
    };
  };

  const storySlides = [
    {
      title: "Scene 1: The ₹20 Recharge Rush",
      image: "/canteen_wallet_intro.jpg",
      text: "It's lunchtime, and thousands of students are recharging their digital canteen wallets with ₹20 while the checkout screen and receipt generator need the correct balance. Every transaction must update the student's wallet quickly and consistently, without creating unnecessary objects every time money is added.",
      buttonText: "See what happens...",
      color: "#60a5fa"
    },
    {
      title: "Scene 2: The Wallet Copycat Disaster",
      image: "/canteen_wallet_bad.jpg",
      text: "The naive approach copies the entire wallet dictionary for every recharge, adds ₹20 to the copy, and returns the new wallet. Memory Bloat: repeated dictionary allocations waste memory at scale; Data Desync: components still referring to the original wallet may show the old balance while another uses the updated copy; CPU Lag: unnecessary copying and object allocation add avoidable work to every transaction.",
      buttonText: "Simulate Disaster",
      color: "#ef4444"
    },
    null,
    {
      title: "Scene 3: Recharge the Original",
      image: "/canteen_wallet_intro.jpg",
      text: "The smart solution is to modify the existing wallet directly with wallet[\"balance\"] += 20 instead of creating a replacement dictionary. The wallet's identity, checked using id(wallet), remains unchanged; every component holding a reference to that same wallet sees its updated balance, and no new wallet dictionary is needed for the recharge.",
      buttonText: "Start Smart Simulation",
      color: "#10b981",
      action: () => {
        setRam(20);
        setWallets([]);
        setBalance(100);
        setMode('pointer');
        setPrediction(null);
        setHasCrashed(false);
        setStoryStep(4);
      }
    }
  ];

  const copyLineExplanations = {
    1: {
      code: "wallet = update_wallet(wallet)",
      desc: "• Invokes update_wallet() and reassigns the global 'wallet' variable to the returned clone.\n• Discards the reference to the original dictionary, forcing the variable to point to new RAM.\n• Causes constant pointer rebinding on every transaction instead of updating data in-place.\n• When called thousands of times across students, it rapidly floods server RAM with orphan objects."
    },
    2: {
      code: "def update_wallet(wallet):",
      desc: "• Defines the wallet updating function that accepts a dictionary as an input argument.\n• Pushes a new execution stack frame into memory when called by the transaction system.\n• The parameter 'wallet' receives the memory address of the caller's dictionary.\n• Establishes local variable scope to process student canteen balance recharges."
    },
    3: {
      code: "    new_wallet = wallet.copy()",
      desc: "• ⚠️ CRITICAL DANGER: Calls .copy() to generate a brand new duplicate dictionary in RAM.\n• Allocates a fresh hash table and key-value pair memory cells for every single ₹20 recharge.\n• Consumes +20 MB of physical memory per transaction instead of reusing existing storage.\n• Quickly exhausts server memory as hundreds of students recharge simultaneously!"
    },
    4: {
      code: "    new_wallet['balance'] += 20",
      desc: "• Modifies the 'balance' key by adding ₹20 ONLY on the newly cloned dictionary.\n• The original dictionary in memory remains completely untouched and out of sync.\n• Demonstrates how unintended copies can cause data divergence and state synchronization bugs.\n• Extra CPU cycles and RAM are wasted writing to a temporary detached clone."
    },
    5: {
      code: "    return new_wallet",
      desc: "• Returns the newly duplicated dictionary reference back to the calling function.\n• Hands over the memory pointer to the cloned object before popping the stack frame.\n• The caller must capture this new address, otherwise the clone becomes unreachable garbage.\n• In copy mode, recurring duplication crashes the server before transactions complete."
    }
  };

  const pointerLineExplanations = {
    1: {
      code: "update_wallet(wallet)",
      desc: "• Calls the update_wallet() function, passing the original dictionary by reference.\n• Passes only the lightweight memory pointer (8 bytes) without duplicating any key-value data.\n• No reassignment needed since the function directly modifies the target object in-place.\n• Scales effortlessly to millions of transactions with constant, zero-overhead memory consumption."
    },
    2: {
      code: "def update_wallet(wallet):",
      desc: "• Defines the in-place updating function receiving the active canteen wallet reference.\n• The parameter 'wallet' directly aliases the master dictionary in heap memory.\n• Python dictionaries are mutable: changes made inside this function affect the original object.\n• Prevents unnecessary memory allocations across the entire transaction pipeline."
    },
    3: {
      code: "    wallet['balance'] += 20",
      desc: "• ⚡ IN-PLACE MUTATION: Directly updates the existing 'balance' integer in physical RAM.\n• Changes the value at the original memory address; id(wallet) remains completely identical!\n• Allocates exactly 0 extra MB of memory—the wallet mutates cleanly in place.\n• All parts of the canteen application instantly see the updated ₹120 balance!"
    },
    5: {
      code: "    return wallet",
      desc: "• Returns the reference to the exact same updated dictionary object.\n• Allows method chaining while confirming that the single master object was updated.\n• No redundant objects are created or left behind for Python's Garbage Collector to clean up.\n• The server runs at lightning speed with 100% memory safety and zero lag."
    }
  };

  if (storySlides[storyStep] !== null && storyStep < storySlides.length) {
    const steps = [
      { id: 0, label: "1. The ₹20 Rush" },
      { id: 1, label: "2. The Copycat Disaster" },
      { id: 3, label: "3. Recharge Original" }
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

  const renderAnimatedExplanation = (isDanger, explanations) => {
    if (!selectedLine || !explanations[selectedLine]) {
      return (
        <div style={{
          marginTop: '12px',
          padding: '12px 16px',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '10px',
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
      { shortTag: "3. Scale", category: "Scale & Transactions", color: isDanger ? '#dc2626' : '#34d399', bg: isDanger ? 'rgba(220, 38, 38, 0.15)' : 'rgba(52, 211, 153, 0.15)', icon: isDanger ? "⚠️" : "⚡", label: "Transaction Impact" },
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
              <span>Done ✓</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="level-container">
      <div className="story-panel glass-panel">
        <h2>Mutable Objects & In-Place Updates</h2>

        {/* Mission Objective Banner (Level 2) */}
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
                  <strong style={{ color: '#fff' }}>Understand the code:</strong> Click any line of code below to inspect in-place mutations vs clone allocations.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>2.</span>
                <span>
                  <strong style={{ color: '#fff' }}>Give the Pre-Flight test:</strong> Answer the wallet mutation hypothesis question below.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.65 }}>
                <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>3.</span>
                <span>
                  <strong style={{ color: '#cbd5e1' }}>Run the program:</strong> Execute canteen transactions to observe RAM allocation live.
                </span>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.82rem', color: '#e2e8f0', lineHeight: '1.45' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ color: '#10b981', fontWeight: 700 }}>✅ Pre-Flight Test Completed!</span>
              </div>
              <p style={{ margin: 0, color: '#cbd5e1' }}>
                {hasCrashed && mode === 'duplicate' ? (
                  <>💥 <strong style={{ color: '#ef4444' }}>Server Crashed!</strong> Cloning dictionaries repeatedly overwhelmed RAM. Click <strong>"View the Smart Approach"</strong> below to switch to in-place mutation.</>
                ) : (
                  <>Now click the <strong style={{ color: '#38bdf8' }}>"▶ Run Program"</strong> button on the right panel to execute wallet recharges and witness physical RAM allocation!</>
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
                {mode === 'duplicate' ? "Pre-Flight Hypothesis 1: Dict Reallocation" : "Pre-Flight Hypothesis 2: In-Place Mutation"}
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
            {mode === 'duplicate'
              ? "Before running code: If update_wallet() clones the dictionary on every ₹20 recharge, what happens to memory?"
              : "Before running code: If update_wallet() executes wallet['balance'] += 20 directly, what happens in RAM?"
            }
          </p>

          {!prediction ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {mode === 'duplicate' ? (
                <>
                  <button
                    onClick={() => {
                      unlockAudio();
                      playPop();
                      setPrediction({ choice: 'safe', isCorrect: false });
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
                    <span>A. Python automatically overwrites the original dictionary in heap memory, using 0 extra MB.</span>
                  </button>
                  <button
                    onClick={() => {
                      unlockAudio();
                      playPop();
                      setPrediction({ choice: 'crash', isCorrect: true });
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
                    <span>B. Each recharge creates an orphan dictionary at a new memory address, exhausting server RAM!</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      unlockAudio();
                      playPop();
                      setPrediction({ choice: 'inplace', isCorrect: true });
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
                    <span>A. The balance integer key updates in-place at the exact same heap memory address (0 extra MB).</span>
                  </button>
                  <button
                    onClick={() => {
                      unlockAudio();
                      playPop();
                      setPrediction({ choice: 'realloc', isCorrect: false });
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
                    <span>B. Modifying a dictionary always re-allocates all keys into fresh memory blocks.</span>
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
                  mode === 'duplicate'
                    ? "🎯 Spot-on! Calling .copy() forces a separate dictionary hash table allocation on each transaction. Run the code below to watch RAM overflow!"
                    : "🎯 Correct! Dictionaries in Python are mutable in-place. Updating keys modifies existing memory blocks without reallocating objects!"
                ) : (
                  mode === 'duplicate'
                    ? "💡 Common trap! Calling wallet.copy() guarantees a separate physical memory allocation (id(copy) != id(wallet)). Run the code below to see RAM crash!"
                    : "💡 Misconception alert! Python dictionaries are mutable containers; modifying an existing key does NOT allocate a new dictionary. Run code to verify!"
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

        {mode === 'duplicate' ? (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--danger)', padding: '12px', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Code execution: Copy Approach</strong>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>💡 Click any line to see purpose</span>
            </div>
            <pre style={{ marginTop: '8px', fontFamily: 'monospace', background: '#000', padding: '10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              <div onClick={() => selectLine(2)} style={{ ...getLineStyle(2), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 2 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(2).background }}>def update_wallet(wallet):</div>
              <div style={{ color: '#ef4444', padding: '2px 4px' }}>    # DANGER: Allocating new memory for every update</div>

              <div onClick={() => selectLine(3)} style={{ ...getLineStyle(3), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 3 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(3).background }}>
                {`    new_wallet = wallet.copy()`}
              </div>
              <div onClick={() => selectLine(4)} style={{ ...getLineStyle(4), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 4 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(4).background }}>    new_wallet["balance"] += 20</div>
              <div onClick={() => selectLine(5)} style={{ ...getLineStyle(5), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 5 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(5).background }}>    return new_wallet</div>
              <div onClick={() => selectLine(1)} style={{ ...getLineStyle(1), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 1 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(1).background }}>wallet = update_wallet(wallet)</div>
            </pre>

            {/* Purpose shows ONLY when clicked on a line */}
            {renderAnimatedExplanation(true, copyLineExplanations)}
          </div>
        ) : (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid var(--success)', padding: '12px', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Optimized execution: Shared Reference</strong>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>💡 Click any line to see purpose</span>
            </div>
            <pre style={{ marginTop: '8px', fontFamily: 'monospace', background: '#000', padding: '10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              <div onClick={() => selectLine(2)} style={{ ...getLineStyle(2), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 2 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(2).background }}>def update_wallet(wallet):</div>
              <div style={{ color: '#10b981', padding: '2px 4px' }}>    # SUCCESS: Updates existing object in-place</div>

              <div onClick={() => selectLine(3)} style={{ ...getLineStyle(3), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 3 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(3).background }}>
                {`    wallet["balance"] += 20`}
              </div>

              <div onClick={() => selectLine(5)} style={{ ...getLineStyle(5), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 5 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(5).background }}>    return wallet</div>
              <div onClick={() => selectLine(1)} style={{ ...getLineStyle(1), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 1 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(1).background }}>update_wallet(wallet)</div>
            </pre>

            {/* Purpose shows ONLY when clicked on a line */}
            {renderAnimatedExplanation(false, pointerLineExplanations)}
          </div>
        )}

        <div style={{ marginTop: 'auto', display: 'flex', gap: '12px', flexDirection: 'column' }}>
          {hasCrashed && (
            <button className="btn warning" style={{ background: '#f59e0b', color: '#000', fontWeight: 'bold' }} onClick={() => setStoryStep(3)}>
              View the Smart Approach <ArrowRight size={18} style={{ marginLeft: '8px' }} />
            </button>
          )}
          {mode === 'pointer' && (
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
            <span>⚡</span> Wallet Memory & Mutation Lab
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '4px' }}>
            Live Simulation
          </span>
        </div>

        <RamBar usage={ram} />

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
              <><div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> Processing...</>
            ) : (
              <><Play size={18} /> Add Funds (₹20)</>
            )}
          </button>
        </div>


        {/* Calculation Bar */}
        <div style={{ background: '#1e293b', padding: '15px', borderRadius: '8px', marginTop: '20px', width: '100%', border: '1px solid #475569', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
            <strong>RAM Capacity: 100 MB</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '1.1rem', fontFamily: 'monospace' }}>
            <span style={{ color: '#3b82f6' }}>20 MB (System)</span>
            <span>+</span>
            <span style={{ color: mode === 'duplicate' ? '#ef4444' : '#10b981' }}>
              {mode === 'duplicate' ? `${wallets.length * 20} MB (Copies)` : `0 MB (In-Place)`}
            </span>
            <span>=</span>
            <span style={{ fontWeight: 'bold', color: ram >= 100 ? '#ef4444' : '#f8fafc' }}>
              {ram.toFixed(2)} MB Total
            </span>
          </div>
        </div>

        {/* Visual RAM Floor */}
        <div style={{ width: '100%', marginTop: '20px', position: 'relative', display: 'flex', border: '2px dashed #475569', borderRadius: '8px', minHeight: '250px', background: 'rgba(0,0,0,0.2)' }}>

          {/* Master Central Wallet Zone */}
          <div style={{ width: '30%', borderRight: '2px dashed #475569', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '10px' }}>Central Canteen Database</p>
            <div style={{ background: '#1e293b', padding: '15px', border: '2px solid #3b82f6', borderRadius: '8px', color: '#fff', textAlign: 'center', width: '140px', zIndex: 10 }}>
              <h3 style={{ margin: 0, color: '#60a5fa', fontSize: '0.8rem' }}>Rahul's Wallet</h3>
              <div style={{ background: '#fff', color: '#000', padding: '5px', marginTop: '10px', fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '4px' }}>
                ₹{mode === 'duplicate' ? 100 : balance}
              </div>
            </div>
          </div>

          {/* New Items Zone */}
          <div style={{ width: '70%', padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignContent: 'flex-start', position: 'relative' }}>
            <p style={{ position: 'absolute', top: 5, left: 10, color: '#94a3b8', fontSize: '0.8rem' }}>Server RAM (New Allocations)</p>

            {mode === 'duplicate' && wallets.map((w) => (
              <div key={w.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ background: '#fff', border: '2px solid #ef4444', padding: '10px', color: '#000', margin: '5px', borderRadius: '4px', boxShadow: '2px 2px 5px rgba(0,0,0,0.5)', animation: 'popIn 0.3s', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  💳 ₹{w.balance}
                </div>
                <span style={{ marginTop: '5px', background: '#ef4444', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>20 MB</span>
              </div>
            ))}

            {mode === 'pointer' && balance > 100 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                <p style={{ color: '#10b981', fontSize: '1.2rem', fontWeight: 'bold', animation: 'popIn 0.3s' }}>
                  ✅ Database Updated In-Place!
                </p>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '5px' }}>Zero new memory allocated.</p>
              </div>
            )}
          </div>
        </div>

        {/* Simple Memory Box Inspector */}
        <div style={{
          width: '100%',
          marginTop: '18px',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
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
                <strong style={{ fontSize: '0.95rem', color: '#60a5fa', letterSpacing: '0.5px' }}>
                  RAM Memory Box Tracker
                </strong>
                <span style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8' }}>
                  See whether balance updates modify the same wallet box or create duplicate boxes
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
              {/* Master Object Card */}
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
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 8px #3b82f6' }} />
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc' }}>
                    wallet
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>[Original Wallet]</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Stored in:</span>
                  <span style={{ background: '#000', color: '#38bdf8', padding: '3px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700, border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                    📦 Memory Box #1
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#60a5fa', background: 'rgba(59, 130, 246, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                    balance: ₹{mode === 'duplicate' ? 100 : balance}
                  </span>
                </div>
              </div>

              {/* Transaction Allocations Live Table */}
              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px', paddingRight: '4px' }}>
                {mode === 'duplicate' ? (
                  wallets.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '16px', color: '#64748b', fontSize: '0.82rem', fontStyle: 'italic' }}>
                      Click 'Add Funds' above to observe wallet.copy() creating new boxes in RAM.
                    </div>
                  ) : (
                    wallets.map((w, i) => (
                      <div key={w.id} style={{
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
                          <span>💳</span>
                          <span style={{ color: '#f8fafc', fontWeight: 600 }}>Recharge #{i + 1}</span>
                          <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>(wallet.copy())</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: '#ef4444', fontWeight: 700, fontFamily: 'monospace' }}>📦 New Box #{i + 2}</span>
                          <span style={{ fontSize: '0.72rem', color: '#f87171', background: 'rgba(239, 68, 68, 0.2)', padding: '1px 6px', borderRadius: '4px' }}>
                            Duplicate Wallet (+20 MB) ❌
                          </span>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  balance === 100 ? (
                    <div style={{ textAlign: 'center', padding: '16px', color: '#64748b', fontSize: '0.82rem', fontStyle: 'italic' }}>
                      Click 'Add Funds' above to observe in-place updates reusing the same wallet box.
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '0.8rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>⚡</span>
                        <span style={{ color: '#f8fafc', fontWeight: 600 }}>wallet['balance'] += 20</span>
                        <span style={{ color: '#34d399', fontSize: '0.75rem' }}>(In-Place Mutation)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#10b981', fontWeight: 700, fontFamily: 'monospace' }}>➔ Reusing Box #1</span>
                        <span style={{ fontSize: '0.72rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.2)', padding: '1px 6px', borderRadius: '4px' }}>
                          0 Extra RAM Wasted ✅
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Memory Verdict Strip */}
              <div style={{
                background: mode === 'duplicate' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                border: `1px solid ${mode === 'duplicate' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.82rem',
                color: mode === 'duplicate' ? '#fca5a5' : '#86efac',
                fontWeight: 600
              }}>
                {mode === 'duplicate'
                  ? `🛑 Memory Bloat: Each recharge creates a new duplicate box (Wasted: ${wallets.length * 20} MB)!`
                  : `✅ Efficient In-Place Update: Balance updated directly inside Memory Box #1 with zero memory copies!`
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
            <Quiz questions={questions} codeChallenge={level2CodeChallenge} onPass={onPass} onClose={() => setShowQuiz(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Level2;
