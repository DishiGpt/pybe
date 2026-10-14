import React, { useState } from 'react';
import { RefreshCw, Play, ArrowRight, Eye, HelpCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import Quiz from '../components/Quiz';
import StorySlider from '../components/StorySlider';
import { playThud, playPop, unlockAudio } from '../utils/audio';

const Level1 = ({ onCrash, onPass, RamBar }) => {
  const [ram, setRam] = useState(20);
  const [crates, setCrates] = useState([]);
  const [stickyNotes, setStickyNotes] = useState([]);
  const [mode, setMode] = useState('duplicate');
  const [showQuiz, setShowQuiz] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [storyStep, setStoryStep] = useState(0);
  const [hasCrashed, setHasCrashed] = useState(false);
  const [executingLine, setExecutingLine] = useState(0);
  const [selectedLine, setSelectedLine] = useState(null);
  const [explainStep, setExplainStep] = useState(1);
  const [prediction, setPrediction] = useState(null);
  const [showHeapInspector, setShowHeapInspector] = useState(true);


  const selectLine = (lineNum) => {
    setSelectedLine(lineNum);
    setExplainStep(1);
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

  const questions = [
    {
      type: 'mcq',
      question: "When you execute `student_notice = master_announcement`, what physically happens inside RAM?",
      options: [
        { text: "Python creates a lightweight 64-bit reference address pointing to the exact same heap memory object.", isCorrect: true },
        { text: "Python duplicates all list elements into a brand-new physical RAM memory block.", isCorrect: false },
        { text: "Python clears the announcement out of memory and writes it to temporary disk swap.", isCorrect: false }
      ]
    },
    {
      type: 'jumble',
      question: "Jumbled Syntax: Form the expression to verify that two variables point to the exact same memory box in RAM:",
      words: ["student_notice", "is", "master_announcement"],
      correctOrder: ["student_notice", "is", "master_announcement"]
    },
    {
      type: 'debug',
      question: "Fill in the Blank: Which built-in Python function returns the unique integer memory address of an object?",
      codeSnippet: "address = ___(master_announcement)",
      correctWord: "id",
      acceptableWords: ["id", "id()"]
    }
  ];

  const level1CodeChallenge = {
    levelNumber: 1,
    title: "Level 1: Fix the Memory Leak",
    subtitle: "Drag-and-Drop Replacement Block Challenge",
    description: "The current function clones a 20 GB noticeboard 1,000 times using deepcopy(), crashing the server. Drag the correct replacement block into Line 4 to patch the memory leak with zero duplication!",
    codeLinesBefore: [
      "def distribute(announcement):",
      "    students = []",
      "    for i in range(1000):"
    ],
    slotLineNumber: 4,
    buggyCode: "        copy_obj = copy.deepcopy(announcement)",
    codeLinesAfter: [
      "        students.append(student_pointer)",
      "    return students"
    ],
    replacementOptions: [
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
    ]
  };

  const handleDrag = () => {
    unlockAudio();
    if (isBuilding || hasCrashed) return;
    setIsBuilding(true);

    if (mode === 'duplicate') {
      let currentRam = ram;
      let currentCrates = crates;

      const loopIteration = () => {
        setExecutingLine(3); // for loop
        setTimeout(() => {
          setExecutingLine(4); // deepcopy
          playThud();
          currentRam += 20;
          setRam(currentRam);
          currentCrates = [...currentCrates, { id: currentCrates.length }];
          setCrates(currentCrates);

          setTimeout(() => {
            setExecutingLine(5); // append
            setTimeout(() => {
              if (currentRam >= 100) {
                setExecutingLine(0);
                setIsBuilding(false);
                setTimeout(() => {
                  onCrash();
                  setHasCrashed(true);
                }, 400);
              } else {
                setTimeout(loopIteration, 100);
              }
            }, 300);
          }, 300);
        }, 300);
      };

      setExecutingLine(7); // announcement = ...
      setTimeout(() => {
        setExecutingLine(8); // distribute(announcement)
        setTimeout(() => {
          setExecutingLine(1); // def
          setTimeout(() => {
            setExecutingLine(2); // students = []
            setTimeout(loopIteration, 400);
          }, 400);
        }, 400);
      }, 400);

    } else {
      let currentSticky = stickyNotes;

      const loopIteration = () => {
        setExecutingLine(3); // for loop
        setTimeout(() => {
          setExecutingLine(4); // pointer assignment
          playPop();
          setRam(r => r + 0.01);
          currentSticky = [...currentSticky, { id: currentSticky.length }];
          setStickyNotes(currentSticky);

          setTimeout(() => {
            setExecutingLine(5); // append
            setTimeout(() => {
              if (currentSticky.length >= 10) {
                // Done simulating pointers!
                setExecutingLine(6); // return
                setTimeout(() => {
                  setExecutingLine(0);
                  setIsBuilding(false);
                }, 400);
              } else {
                setTimeout(loopIteration, 100);
              }
            }, 200);
          }, 200);
        }, 200);
      };

      setExecutingLine(7); // announcement = ...
      setTimeout(() => {
        setExecutingLine(8); // distribute(announcement)
        setTimeout(() => {
          setExecutingLine(1); // def
          setTimeout(() => {
            setExecutingLine(2); // students = []
            setTimeout(loopIteration, 400);
          }, 400);
        }, 400);
      }, 400);
    }
  };

  const copyLineExplanations = {
    0: {
      code: "import copy",
      part1: {
        title: "Module Loading",
        point1: { icon: "📦", label: "Python Import", text: "Loads the built-in copy module into the global script namespace." },
        point2: { icon: "🧠", label: "In Physical RAM", text: "Allocates copy module functions into memory, including copy() and deepcopy()." }
      },
      part2: {
        title: "Scale & Consequence",
        point1: { icon: "⚠️", label: "Duplicate Hazard", text: "The copy module enables deep duplication, allocating separate memory blocks for each clone." },
        point2: { icon: "🎯", label: "Key Rule", text: "Importing copy is cheap, but invoking deepcopy() in a loop causes explosive RAM consumption." }
      }
    },
    1: {
      code: "def distribute(announcement):",
      part1: {
        title: "Runtime & Memory",
        point1: { icon: "💻", label: "Python Execution", text: "Defines the distribution function in memory, accepting the announcement argument." },
        point2: { icon: "🧠", label: "In Physical RAM", text: "Pushes a new call frame to the stack; parameter binds directly to caller's object reference." }
      },
      part2: {
        title: "Scale & Consequence",
        point1: { icon: "📈", label: "At 1,000x Scale", text: "Prepares a loop that will multiply all memory allocations inside by 1,000 students." },
        point2: { icon: "🎯", label: "Key Takeaway", text: "Function entry boundaries should be lightweight and avoid duplicating input objects." }
      }
    },
    2: {
      code: "    students = []",
      part1: {
        title: "Runtime & Memory",
        point1: { icon: "💻", label: "Python Execution", text: "Initializes an empty list on the heap with dynamic pointer array capacity." },
        point2: { icon: "🧠", label: "In Physical RAM", text: "Consumes only ~56 bytes initially; ready to collect appended student references." }
      },
      part2: {
        title: "Scale & Consequence",
        point1: { icon: "📈", label: "At 1,000x Scale", text: "Will store 1,000 objects sequentially as append() is triggered in each loop cycle." },
        point2: { icon: "🎯", label: "Key Takeaway", text: "List containers hold strong references, keeping whatever is inside alive in memory." }
      }
    },
    3: {
      code: "    for i in range(1000):",
      part1: {
        title: "Runtime & Memory",
        point1: { icon: "💻", label: "Python Execution", text: "Spawns an O(1) range generator iterator to cycle 1,000 times (indices 0 to 999)." },
        point2: { icon: "🧠", label: "In Physical RAM", text: "Only a single 8-byte integer loop counter variable exists on the execution stack." }
      },
      part2: {
        title: "Scale & Consequence",
        point1: { icon: "📈", label: "At 1,000x Scale", text: "Multiplier effect: Any memory allocation inside this loop body runs 1,000 times!" },
        point2: { icon: "🎯", label: "Key Takeaway", text: "Minor allocations in large loops balloon into fatal Out-Of-Memory crashes." }
      }
    },
    4: {
      code: "        copy_obj = copy.deepcopy(announcement)",
      part1: {
        title: "Runtime & Memory",
        point1: { icon: "💥", label: "Critical Hazard", text: "Recursively clones the entire announcement structure into separate physical RAM blocks." },
        point2: { icon: "🧠", label: "In Physical RAM", text: "Forces OS to allocate brand-new memory addresses: id(copy_obj) != id(announcement)." }
      },
      part2: {
        title: "Scale & Consequence",
        point1: { icon: "📈", label: "At 1,000x Scale", text: "1,000 copies × 20 GB duplicate = 20,000 GB attempted RAM allocation!" },
        point2: { icon: "🎯", label: "System Crash", text: "Instantly overloads the 100 GB system RAM ceiling, triggering an unrecoverable crash." }
      }
    },
    5: {
      code: "        students.append(copy_obj)",
      part1: {
        title: "Runtime & Memory",
        point1: { icon: "💻", label: "Python Execution", text: "Appends the 20 GB duplicate object reference into the active students list." },
        point2: { icon: "🧠", label: "In Physical RAM", text: "Binds active pointer references in the list (refcount ≥ 1), locking it into heap RAM." }
      },
      part2: {
        title: "Scale & Consequence",
        point1: { icon: "📈", label: "At 1,000x Scale", text: "Python's Garbage Collector cannot clean up clones because the list keeps them active." },
        point2: { icon: "🎯", label: "Key Takeaway", text: "Compounds the memory crisis by forcing all 1,000 heavy clones to survive at once." }
      }
    },
    6: {
      code: "    return students",
      part1: {
        title: "Runtime & Memory",
        point1: { icon: "💻", label: "Python Execution", text: "Returns the finished 1,000-item array back to caller, unwinding local stack frame." },
        point2: { icon: "🧠", label: "In Physical RAM", text: "Yields pointer reference to the master list container holding all entries." }
      },
      part2: {
        title: "Scale & Consequence",
        point1: { icon: "📈", label: "At 1,000x Scale", text: "Intended to supply each student their verified independent record." },
        point2: { icon: "🎯", label: "Key Takeaway", text: "Never reached in copy mode: Memory overflow crashes the server during the loop!" }
      }
    },
    7: {
      code: 'announcement = ["Exam Date", "Room 101"]',
      part1: {
        title: "Runtime & Memory",
        point1: { icon: "💻", label: "Python Execution", text: "Allocates the master exam notice list in heap memory with 20 GB baseline size." },
        point2: { icon: "🧠", label: "In Physical RAM", text: "Binds the variable name 'announcement' to this master RAM address (e.g. 0x7f9a1b40)." }
      },
      part2: {
        title: "Scale & Consequence",
        point1: { icon: "📈", label: "At 1,000x Scale", text: "Serves as the single authoritative source of truth for the entire institution." },
        point2: { icon: "🎯", label: "Key Takeaway", text: "Read-only shared resources should be pointed to, never duplicated needlessly." }
      }
    },
    8: {
      code: "distribute(announcement)",
      part1: {
        title: "Runtime & Memory",
        point1: { icon: "💻", label: "Python Execution", text: "Invokes distribute() passing the master announcement list reference." },
        point2: { icon: "🧠", label: "In Physical RAM", text: "Passes pointer into the function stack and begins recursive loop execution." }
      },
      part2: {
        title: "Scale & Consequence",
        point1: { icon: "📈", label: "At 1,000x Scale", text: "Triggers the runaway deepcopy loop, skyrocketing RAM from 20 GB straight to 100 GB." },
        point2: { icon: "🎯", label: "Key Takeaway", text: "Always inspect loop operations for unintentional cloning before production deployment!" }
      }
    }
  };

  const pointerLineExplanations = {
    1: {
      code: "def distribute(announcement):",
      part1: {
        title: "Runtime & Memory",
        point1: { icon: "💻", label: "Python Execution", text: "Defines the distribution routine receiving the master announcement notice." },
        point2: { icon: "🧠", label: "In Physical RAM", text: "Parameter receives the existing 8-byte pointer directly to master memory." }
      },
      part2: {
        title: "Scale & Consequence",
        point1: { icon: "⚡", label: "At 1,000x Scale", text: "Runs in milliseconds with zero redundant data allocations across all students." },
        point2: { icon: "🎯", label: "Key Takeaway", text: "Pass-by-Reference shares existing data seamlessly with zero memory waste." }
      }
    },
    2: {
      code: "    students = []",
      part1: {
        title: "Runtime & Memory",
        point1: { icon: "💻", label: "Python Execution", text: "Creates an empty list on the heap to store 1,000 lightweight pointers." },
        point2: { icon: "🧠", label: "In Physical RAM", text: "Allocates standard list container overhead (~56 bytes) without duplicating data." }
      },
      part2: {
        title: "Scale & Consequence",
        point1: { icon: "⚡", label: "At 1,000x Scale", text: "Ready to safely collect 1,000 student pointer entries without memory pressure." },
        point2: { icon: "🎯", label: "Key Takeaway", text: "Pointers allow large collections to remain featherlight in physical RAM." }
      }
    },
    3: {
      code: "    for i in range(1000):",
      part1: {
        title: "Runtime & Memory",
        point1: { icon: "💻", label: "Python Execution", text: "Runs 1,000 loop cycles using Python's O(1) range generator iterator." },
        point2: { icon: "🧠", label: "In Physical RAM", text: "Registers each student with constant execution time per cycle." }
      },
      part2: {
        title: "Scale & Consequence",
        point1: { icon: "⚡", label: "At 1,000x Scale", text: "Because body operations are 8-byte pointer assignments, scale overhead is negligible." },
        point2: { icon: "🎯", label: "Key Takeaway", text: "Loop finishes almost instantaneously without stressing CPU or RAM." }
      }
    },
    4: {
      code: "        student_pointer = announcement",
      part1: {
        title: "Runtime & Memory",
        point1: { icon: "⚡", label: "Smart Pointer", text: "Simple assignment copies ONLY the 8-byte memory address, NOT the data!" },
        point2: { icon: "🧠", label: "In Physical RAM", text: "Zero duplicate in RAM: id(student_pointer) == id(announcement) is True." }
      },
      part2: {
        title: "Scale & Consequence",
        point1: { icon: "⚡", label: "At 1,000x Scale", text: "Allocates 0 extra GB of RAM—all 1,000 students share the single master notice!" },
        point2: { icon: "🎯", label: "Key Takeaway", text: "Pointers give each student instant access with 100% memory efficiency." }
      }
    },
    5: {
      code: "        students.append(student_pointer)",
      part1: {
        title: "Runtime & Memory",
        point1: { icon: "💻", label: "Python Execution", text: "Stores the 8-byte pointer address into the students list container." },
        point2: { icon: "🧠", label: "In Physical RAM", text: "Appends tiny reference markers instead of 20 GB heavy duplicate objects." }
      },
      part2: {
        title: "Scale & Consequence",
        point1: { icon: "⚡", label: "At 1,000x Scale", text: "1,000 references × 8 bytes = only ~8 KB total memory overhead." },
        point2: { icon: "🎯", label: "Key Takeaway", text: "Total RAM stays flat at ~20.01 GB, completely safe from crashing." }
      }
    },
    6: {
      code: "    return students",
      part1: {
        title: "Runtime & Memory",
        point1: { icon: "💻", label: "Python Execution", text: "Returns the completed pointer list to caller, unwinding stack frame." },
        point2: { icon: "🧠", label: "In Physical RAM", text: "Preserves 1,000 pointer records while discarding temporary local variables." }
      },
      part2: {
        title: "Scale & Consequence",
        point1: { icon: "⚡", label: "At 1,000x Scale", text: "Every student in the list can instantly access the master announcement." },
        point2: { icon: "🎯", label: "Key Takeaway", text: "Demonstrates production-grade speed and pristine memory efficiency." }
      }
    },
    7: {
      code: 'announcement = ["Exam Date", "Room 101"]',
      part1: {
        title: "Runtime & Memory",
        point1: { icon: "💻", label: "Python Execution", text: "Allocates master announcement list once in physical RAM (20 GB baseline)." },
        point2: { icon: "🧠", label: "In Physical RAM", text: "Pinned at a fixed memory location (e.g., notice board address 0x7f9a1b40)." }
      },
      part2: {
        title: "Scale & Consequence",
        point1: { icon: "⚡", label: "At 1,000x Scale", text: "Serves as authoritative single source of truth for all 1,000 students." },
        point2: { icon: "🎯", label: "Key Takeaway", text: "Updates to this single master are immediately seen by all pointer holders." }
      }
    },
    8: {
      code: "distribute(announcement)",
      part1: {
        title: "Runtime & Memory",
        point1: { icon: "💻", label: "Python Execution", text: "Invokes distribute() utilizing Pass-by-Reference semantics." },
        point2: { icon: "🧠", label: "In Physical RAM", text: "Passes pointer to master object without copying megabytes or gigabytes." }
      },
      part2: {
        title: "Scale & Consequence",
        point1: { icon: "⚡", label: "At 1,000x Scale", text: "Distributes to 1,000 students safely within hardware constraints." },
        point2: { icon: "🎯", label: "Key Takeaway", text: "Sharing memory references prevents Out-Of-Memory disasters in production!" }
      }
    }
  };

  const storySlides = [
    {
      title: "Scene 1: The 1,000-Copy Crisis",
      image: "/notice_board_intro.jpg",
      text: "The principal has a massive exam announcement that 1,000 students must receive before the morning bell. The school administration faces a dilemma: how can every student access the latest notice without flooding the school with thousands of duplicate copies?",
      buttonText: "See what happens...",
      color: "#60a5fa"
    },
    {
      title: "Scene 2: The Photocopier Apocalypse",
      image: "/notice_board_bad.jpg",
      text: "The panicked staff decides to photocopy the entire announcement for every single student! Memory Bloat: duplicating the 20 GB noticeboard for 1,000 students rapidly consumes 20,000 GB of attempted RAM; Data Desync: students holding detached copies never see last-minute room or schedule corrections; Hardware Crash: cloning heavy nested objects in a tight loop overloads the machine and triggers a fatal OOM crash.",
      buttonText: "Simulate Disaster",
      color: "#ef4444"
    },
    // Index 2 is the actual simulation (no slide)
    null,
    {
      title: "Scene 3: One Master, One Brilliant Idea",
      image: "/notice_board_good.jpg",
      text: "The breakthrough is simple: keep one master announcement on the central noticeboard and let every student reference that same shared board instead of carrying a separate duplicate copy. The announcement is created once, and when updated, everyone sees the change instantly with zero waste.",
      buttonText: "Start Smart Simulation",
      color: "#10b981",
      action: () => {
        setRam(20);
        setCrates([]);
        setStickyNotes([]);
        setMode('pointer');
        setPrediction(null);
        setStoryStep(4);
        setHasCrashed(false);
      }
    }
  ];

  if (storySlides[storyStep] !== null && storyStep < storySlides.length) {
    const steps = [
      { id: 0, label: "1. The Dilemma" },
      { id: 1, label: "2. The Crash" },
      { id: 3, label: "3. The Solution" }
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
    if (selectedLine === null || selectedLine === undefined || !explanations[selectedLine]) {
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

    // Flatten into 4 distinct single points
    const points = [
      {
        step: 1,
        shortTag: "1. Code",
        category: "Python Execution",
        icon: data.part1.point1.icon,
        label: data.part1.point1.label,
        text: data.part1.point1.text,
        color: isDanger ? '#ef4444' : '#38bdf8',
        bg: isDanger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)'
      },
      {
        step: 2,
        shortTag: "2. RAM",
        category: "In Physical RAM",
        icon: data.part1.point2.icon,
        label: data.part1.point2.label,
        text: data.part1.point2.text,
        color: isDanger ? '#f97316' : '#60a5fa',
        bg: isDanger ? 'rgba(249, 115, 22, 0.15)' : 'rgba(96, 165, 250, 0.15)'
      },
      {
        step: 3,
        shortTag: "3. Scale",
        category: "At 1,000x Iterations",
        icon: data.part2.point1.icon,
        label: data.part2.point1.label,
        text: data.part2.point1.text,
        color: isDanger ? '#dc2626' : '#34d399',
        bg: isDanger ? 'rgba(220, 38, 38, 0.15)' : 'rgba(52, 211, 153, 0.15)'
      },
      {
        step: 4,
        shortTag: "4. Rule",
        category: "Key Architecture Rule",
        icon: data.part2.point2.icon,
        label: data.part2.point2.label,
        text: data.part2.point2.text,
        color: isDanger ? '#e11d48' : '#10b981',
        bg: isDanger ? 'rgba(225, 29, 72, 0.15)' : 'rgba(16, 185, 129, 0.15)'
      }
    ];

    const currentIdx = Math.min(Math.max(explainStep - 1, 0), points.length - 1);
    const activePoint = points[currentIdx];

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
            <span>POINT {activePoint.step} OF 4</span>
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
              width: `${(explainStep / 4) * 100}%`,
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
            Point {explainStep} of 4
          </span>

          {explainStep < 4 ? (
            <button
              onClick={() => setExplainStep(s => Math.min(s + 1, 4))}
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
        <h2>Code Execution</h2>

        {/* Mission Objective Banner (Level 1 only) */}
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
                  <strong style={{ color: '#fff' }}>Understand the code:</strong> Click any line of code below to inspect physical RAM impact.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>2.</span>
                <span>
                  <strong style={{ color: '#fff' }}>Give the Pre-Flight test:</strong> Answer the intuition hypothesis question below.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.65 }}>
                <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>3.</span>
                <span>
                  <strong style={{ color: '#cbd5e1' }}>Run the program:</strong> Execute the code to observe RAM behavior live.
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
                  <>💥 <strong style={{ color: '#ef4444' }}>Server Crashed!</strong> The 20 GB duplicates overloaded RAM. Click <strong>"View the Better Approach"</strong> below to switch to lightweight pointers.</>
                ) : (
                  <>Now click the <strong style={{ color: '#38bdf8' }}>"▶ Run Program"</strong> button on the right panel to execute the code and witness physical RAM allocation!</>
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
                {mode === 'duplicate' ? "Pre-Flight Hypothesis 1: Deep Copy" : "Pre-Flight Hypothesis 2: Shared Pointer"}
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
              ? "Before running code: What will happen in RAM when 1,000 students call copy.deepcopy()?"
              : "Before running code: What happens in RAM when students execute 'student = announcement'?"
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
                      setPrediction({ choice: 'optimize', isCorrect: false });
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
                    <span>A. Python automatically reuses the existing list, keeping RAM &lt; 25 GB.</span>
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
                    <span>B. Python allocates 1,000 separate heap clones, triggering an Out-Of-Memory Crash!</span>
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
                    <span>A. All students point to the master object's memory address without cloning data (~0 extra RAM).</span>
                  </button>
                  <button
                    onClick={() => {
                      unlockAudio();
                      playPop();
                      setPrediction({ choice: 'duplicate', isCorrect: false });
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
                    <span>B. Each variable assignment still duplicates the 20 GB list in RAM.</span>
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
                    ? "🎯 Spot-on intuition! Deepcopy creates a brand-new heap object tree for every student. Run the program below to watch physical RAM explode!"
                    : "🎯 Excellent! Variables in Python bind to object references, not duplicate data. Run the program below to observe 100% stable RAM!"
                ) : (
                  mode === 'duplicate'
                    ? "💡 Classic beginner misconception! Python deepcopy does NOT deduplicate identical lists automatically. Run the code below to see physical RAM crash!"
                    : "💡 Common confusion! Unlike C++ value copying, assignment (=) in Python creates references, not copies. Run the code below to verify!"
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
              <strong>Code execution: Deep Copy</strong>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>💡 Click any line to see purpose</span>
            </div>
            <pre style={{ marginTop: '8px', fontFamily: 'monospace', background: '#000', padding: '10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              <div onClick={() => selectLine(0)} style={{ ...getLineStyle(0), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 0 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(0).background }}>import copy</div>
              <div onClick={() => selectLine(1)} style={{ ...getLineStyle(1), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 1 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(1).background }}>def distribute(announcement):</div>
              <div onClick={() => selectLine(2)} style={{ ...getLineStyle(2), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 2 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(2).background }}>    students = []</div>
              <div onClick={() => selectLine(3)} style={{ ...getLineStyle(3), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 3 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(3).background }}>    for i in range(1000):</div>
              <div style={{ color: '#ef4444', padding: '2px 4px' }}>        # DANGER: Creates a massive duplicate in RAM</div>

              <div onClick={() => selectLine(4)} style={{ ...getLineStyle(4), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 4 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(4).background }}>
                {`        copy_obj = copy.deepcopy(announcement)`}
              </div>
              <div onClick={() => selectLine(5)} style={{ ...getLineStyle(5), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 5 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(5).background }}>        students.append(copy_obj)</div>
              <div onClick={() => selectLine(6)} style={{ ...getLineStyle(6), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 6 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(6).background }}>    return students</div>
              <div onClick={() => selectLine(7)} style={{ ...getLineStyle(7), marginTop: '8px', cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 7 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(7).background }}>announcement = ["Exam Date", "Room 101"]</div>
              <div onClick={() => selectLine(8)} style={{ ...getLineStyle(8), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 8 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(8).background }}>distribute(announcement)</div>
            </pre>

            {/* Purpose shows ONLY when clicked on a line */}
            {renderAnimatedExplanation(true, copyLineExplanations)}
          </div>
        ) : (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid var(--success)', padding: '12px', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Optimized execution: Pointers</strong>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>💡 Click any line to see purpose</span>
            </div>
            <pre style={{ marginTop: '8px', fontFamily: 'monospace', background: '#000', padding: '10px', borderRadius: '4px', fontSize: '0.85rem' }}>
              <div onClick={() => selectLine(1)} style={{ ...getLineStyle(1), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 1 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(1).background }}>def distribute(announcement):</div>
              <div onClick={() => selectLine(2)} style={{ ...getLineStyle(2), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 2 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(2).background }}>    students = []</div>
              <div onClick={() => selectLine(3)} style={{ ...getLineStyle(3), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 3 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(3).background }}>    for i in range(1000):</div>
              <div style={{ color: '#10b981', padding: '2px 4px' }}>        # SUCCESS: Creates a lightweight reference</div>

              <div onClick={() => selectLine(4)} style={{ ...getLineStyle(4), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 4 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(4).background }}>
                {`        student_pointer = announcement`}
              </div>
              <div onClick={() => selectLine(5)} style={{ ...getLineStyle(5), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 5 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(5).background }}>        students.append(student_pointer)</div>
              <div onClick={() => selectLine(6)} style={{ ...getLineStyle(6), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 6 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(6).background }}>    return students</div>
              <div onClick={() => selectLine(7)} style={{ ...getLineStyle(7), marginTop: '8px', cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 7 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(7).background }}>announcement = ["Exam Date", "Room 101"]</div>
              <div onClick={() => selectLine(8)} style={{ ...getLineStyle(8), cursor: 'pointer', padding: '2px 4px', borderRadius: '3px', background: selectedLine === 8 ? 'rgba(59, 130, 246, 0.3)' : getLineStyle(8).background }}>distribute(announcement)</div>
            </pre>

            {/* Purpose shows ONLY when clicked on a line */}
            {renderAnimatedExplanation(false, pointerLineExplanations)}
          </div>
        )}

        <div style={{ marginTop: 'auto', display: 'flex', gap: '12px', flexDirection: 'column' }}>
          {hasCrashed && mode === 'duplicate' && (
            <button className="btn warning" style={{ background: '#f59e0b', color: '#000', fontWeight: 'bold' }} onClick={() => setStoryStep(3)}>
              View the Better Approach <ArrowRight size={18} style={{ marginLeft: '8px' }} />
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
            <span>⚡</span> Memory & RAM Allocation Lab
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
            disabled={!prediction?.isCorrect || isBuilding || showQuiz}
            style={{
              opacity: (!prediction?.isCorrect || isBuilding || showQuiz) ? 0.5 : 1,
              cursor: (!prediction?.isCorrect || isBuilding || showQuiz) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isBuilding ? (
              <><div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> Processing...</>
            ) : (
              <><Play size={18} /> Run Program</>
            )}
          </button>
        </div>

        {/* Calculation Bar */}
        <div style={{ background: '#1e293b', padding: '15px', borderRadius: '8px', marginTop: '20px', width: '100%', border: '1px solid #475569', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
            <strong>RAM Capacity: 100 GB</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '1.1rem', fontFamily: 'monospace' }}>
            <span style={{ color: '#3b82f6' }}>20 GB (Original)</span>
            <span>+</span>
            <span style={{ color: mode === 'duplicate' ? '#ef4444' : '#10b981' }}>
              {mode === 'duplicate' ? `${crates.length * 20} GB (Photocopies)` : `${(stickyNotes.length * 0.01).toFixed(2)} GB (References)`}
            </span>
            <span>=</span>
            <span style={{ fontWeight: 'bold', color: ram >= 100 ? '#ef4444' : '#f8fafc' }}>
              {ram.toFixed(2)} GB Total
            </span>
          </div>
        </div>

        {/* Visual RAM Floor */}
        <div style={{ width: '100%', marginTop: '20px', position: 'relative', display: 'flex', border: '2px dashed #475569', borderRadius: '8px', minHeight: '250px', background: 'rgba(0,0,0,0.2)' }}>

          {/* Master Notice Board Zone */}
          <div style={{ width: '30%', borderRight: '2px dashed #475569', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '10px' }}>Original Announcement</p>
            <div style={{ background: '#8B4513', padding: '15px', border: '5px solid #5C4033', borderRadius: '8px', color: '#fff', textAlign: 'center', width: '120px', zIndex: 10 }}>
              <h3 style={{ margin: 0, color: '#fcd34d', fontSize: '0.8rem' }}>NOTICE BOARD</h3>
              <div style={{ background: '#fff', color: '#000', padding: '5px', marginTop: '10px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                [10, 20, 30]
              </div>
            </div>
            <span style={{ marginTop: '10px', background: '#3b82f6', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>Location: 1000</span>
            <span style={{ marginTop: '5px', color: '#94a3b8', fontSize: '0.7rem' }}>Size: 20 GB</span>
          </div>

          {/* New Items Zone */}
          <div style={{ width: '70%', padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignContent: 'flex-start', position: 'relative' }}>
            <p style={{ position: 'absolute', top: 5, left: 10, color: '#94a3b8', fontSize: '0.8rem' }}>Available Memory</p>

            {crates.map((c) => (
              <div key={c.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ background: '#fff', border: '1px solid #ccc', padding: '10px', color: '#000', margin: '5px', borderRadius: '4px', boxShadow: '2px 2px 5px rgba(0,0,0,0.5)', animation: 'popIn 0.3s', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  📄 [10, 20, 30]
                </div>
                <span style={{ marginTop: '5px', background: '#ef4444', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>20 GB</span>
              </div>
            ))}

            {stickyNotes.map((n, index) => (
              <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', animation: 'popIn 0.3s' }}>
                {index === 0 && (
                  <div style={{ width: '40px', height: '2px', background: '#10b981', position: 'relative', animation: 'fadeOutArrow 2s forwards' }}>
                    <div style={{ position: 'absolute', left: 0, top: '-4px', width: '0', height: '0', borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderRight: '10px solid #10b981' }}></div>
                  </div>
                )}
                <div className="sticky-note" style={{ background: '#fef08a', color: '#000', padding: '5px', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <strong>Student {index + 1}</strong>
                  <span>➔ 1000</span>
                  <span style={{ fontSize: '0.5rem', marginTop: '2px' }}>0.01 GB</span>
                </div>
              </div>
            ))}
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
                  See if students share the original memory box or clone duplicate boxes
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
                    announcement
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>[Original Noticeboard]</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Stored in:</span>
                  <span style={{ background: '#000', color: '#38bdf8', padding: '3px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700, border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                    📦 Memory Box #1
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#60a5fa', background: 'rgba(59, 130, 246, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                    20 GB
                  </span>
                </div>
              </div>

              {/* Student Allocations Live Table */}
              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px', paddingRight: '4px' }}>
                {mode === 'duplicate' ? (
                  crates.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '16px', color: '#64748b', fontSize: '0.82rem', fontStyle: 'italic' }}>
                      Click 'Run Program' above to see duplicate boxes get created in RAM.
                    </div>
                  ) : (
                    crates.map((c, i) => (
                      <div key={c.id} style={{
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
                          <span>📄</span>
                          <span style={{ color: '#f8fafc', fontWeight: 600 }}>Student #{i + 1}</span>
                          <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>(deepcopy)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: '#ef4444', fontWeight: 700, fontFamily: 'monospace' }}>📦 New Box #{i + 2}</span>
                          <span style={{ fontSize: '0.72rem', color: '#f87171', background: 'rgba(239, 68, 68, 0.2)', padding: '1px 6px', borderRadius: '4px' }}>
                            Separate Copy (+20 GB) ❌
                          </span>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  stickyNotes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '16px', color: '#64748b', fontSize: '0.82rem', fontStyle: 'italic' }}>
                      Click 'Run Program' above to see how references share the original box.
                    </div>
                  ) : (
                    stickyNotes.map((s, i) => (
                      <div key={s.id} style={{
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
                          <span style={{ color: '#f8fafc', fontWeight: 600 }}>Student #{i + 1}</span>
                          <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>(reference pointer)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: '#10b981', fontWeight: 700, fontFamily: 'monospace' }}>➔ Points to Box #1</span>
                          <span style={{ fontSize: '0.72rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.2)', padding: '1px 6px', borderRadius: '4px' }}>
                            Shared Original (0 extra RAM) ✅
                          </span>
                        </div>
                      </div>
                    ))
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
                  ? `🛑 Memory Bloat: ${crates.length} separate boxes created in RAM (Wasted: ${crates.length * 20} GB)!`
                  : `✅ Zero Memory Waste: All ${stickyNotes.length} students share the single original Memory Box #1!`
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
            <Quiz questions={questions} codeChallenge={level1CodeChallenge} onPass={onPass} onClose={() => setShowQuiz(false)} />
          </div>
        </div>
      )}

    </div>
  );
};

export default Level1;