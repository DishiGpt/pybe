import React, { useState } from 'react';
import Quiz from '../components/Quiz';
import { Award, BookOpen, CheckCircle, Sparkles } from 'lucide-react';

const Level5 = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  const questions = [
    // 1. Level 1 - Shared References (MCQ)
    {
      type: 'mcq',
      question: "Q1 [MCQ]: When you write 'student_notice = master_notice' where master_notice is a 500 MB announcement list, what does Python create in physical RAM?",
      options: [
        { text: "Python creates a lightweight reference (pointer) holding the memory address of master_notice without copying data.", isCorrect: true },
        { text: "Python allocates another 500 MB block of RAM duplicating all elements.", isCorrect: false },
        { text: "Python deletes master_notice from RAM.", isCorrect: false },
        { text: "Python converts the list into a string.", isCorrect: false }
      ]
    },

    // 2. Level 1 - Deepcopy Danger (Fill in the Blanks)
    {
      type: 'fill',
      question: "Q2 [Fill in the Blanks]: Which function from Python's 'copy' module recursively duplicates every nested item into new memory addresses, causing memory bloat when called repeatedly?",
      codeSnippet: "import copy\nnew_copy = copy.___(announcement)",
      correctWord: "deepcopy",
      acceptableWords: ["deepcopy", "copy.deepcopy"]
    },

    // 3. Level 2 - In-Place Mutation (Debugging)
    {
      type: 'debug',
      question: "Q3 [Debugging]: The canteen recharge function below needs to mutate the existing wallet in-place instead of creating duplicate dictionary copies. Complete the in-place operator:",
      codeSnippet: "wallet['balance'] ___ 20  # Mutates existing balance without reallocating",
      correctWord: "+=",
      acceptableWords: ["+="]
    },

    // 4. Level 2 - In-Place Syntax (Jumbled)
    {
      type: 'jumble',
      question: "Q4 [Jumbled Code]: Arrange the code tokens to form a statement that increments the balance key of the 'wallet' dictionary in-place by 20.",
      words: ["+=", "20", "wallet['balance']"],
      correctOrder: ["wallet['balance']", "+=", "20"]
    },

    // 5. Level 2 - Memory Address Identity (MCQ)
    {
      type: 'mcq',
      question: "Q5 [MCQ]: How do you verify in Python if two variables 'wallet_a' and 'wallet_b' point to the exact same physical heap memory address?",
      options: [
        { text: "id(wallet_a) == id(wallet_b) or wallet_a is wallet_b", isCorrect: true },
        { text: "wallet_a == wallet_b (this checks value equality, not physical memory identity)", isCorrect: false },
        { text: "len(wallet_a) == len(wallet_b)", isCorrect: false },
        { text: "type(wallet_a) == type(wallet_b)", isCorrect: false }
      ]
    },

    // 6. Level 3 - Recursion Base Condition (Debugging)
    {
      type: 'debug',
      question: "Q6 [Debugging]: This recursive order cancellation function is missing its base condition and causes a Call Stack Overflow crash. Complete the return guard:",
      codeSnippet: "def cancel_orders(items):\n    if not items: ___\n    items.pop()\n    cancel_orders(items)",
      correctWord: "return",
      acceptableWords: ["return"]
    },

    // 7. Level 3 - Call Stack Structure (Fill in the Blanks)
    {
      type: 'fill',
      question: "Q7 [Fill in the Blanks]: Every time a function is called, what runtime memory structure pushes a new execution frame holding local variables and execution pointers?",
      codeSnippet: "Each recursive call pushes a frame onto the Call ___",
      correctWord: "Stack",
      acceptableWords: ["Stack", "stack"]
    },

    // 8. Level 3 - Slicing vs In-Place in Recursion (MCQ)
    {
      type: 'mcq',
      question: "Q8 [MCQ]: Why does slicing 'tray[1:]' inside recursive functions exhaust memory compared to modifying a shared list with 'tray.pop()'?",
      options: [
        { text: "Slicing tray[1:] allocates a brand-new list copy on every single call frame, creating quadratic O(N²) cumulative memory usage.", isCorrect: true },
        { text: "Python completely forbids list slicing inside recursive functions.", isCorrect: false },
        { text: "Slicing tray[1:] deletes all elements in global scope.", isCorrect: false },
        { text: "Slicing automatically crashes Python's bytecode interpreter.", isCorrect: false }
      ]
    },

    // 9. Level 4 - Releasing References (Jumbled)
    {
      type: 'jumble',
      question: "Q9 [Jumbled Code]: Arrange the tokens to delete the first element of 'sessions' so its reference count drops toward zero:",
      words: ["del", "sessions[0]"],
      correctOrder: ["del", "sessions[0]"]
    },

    // 10. Level 4 - Garbage Collection & Dereferencing (Debugging)
    {
      type: 'debug',
      question: "Q10 [Debugging]: When an attendee checks out of the college fest, which list method should you call to remove the student reference from the global sessions list so the Garbage Collector can reclaim its memory?",
      codeSnippet: "sessions.___(student)  # Removes reference so reference count drops to 0",
      correctWord: "remove",
      acceptableWords: ["remove"]
    }
  ];

  return (
    <div className="level-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '36px 20px', maxWidth: '980px', margin: '0 auto' }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        background: 'rgba(16, 185, 129, 0.15)',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        padding: '6px 18px',
        borderRadius: '30px',
        color: '#34d399',
        fontSize: '0.88rem',
        fontWeight: 700,
        marginBottom: '16px',
        letterSpacing: '1px'
      }}>
        <Award size={18} /> FINAL COMPREHENSIVE CERTIFICATION EXAM
      </div>

      <h1 style={{ fontSize: '2.8rem', color: '#f8fafc', fontWeight: 800, textShadow: '0 0 25px rgba(16, 185, 129, 0.4)', marginBottom: '14px' }}>
        Master Python Memory Architect
      </h1>

      <p style={{ maxWidth: '820px', fontSize: '1.15rem', lineHeight: '1.75', margin: '0 auto 28px auto', color: '#cbd5e1' }}>
        You have tackled all 4 foundational memory optimization levels: <strong>Shared References</strong>, <strong>In-Place Mutation</strong>, <strong>Call Stack & Recursion Depth</strong>, and <strong>Garbage Collection & Dereferencing</strong>.
        Test your expertise across 10 multi-format challenges: <em>MCQ, Debugging, Fill in the Blanks, and Jumbled Code</em>.
      </p>

      {/* Feature Topic Badges */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
        <span style={{ padding: '6px 14px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa', fontSize: '0.85rem', fontWeight: 600 }}>
          📄 Level 1: Shared References
        </span>
        <span style={{ padding: '6px 14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>
          💳 Level 2: In-Place Mutation
        </span>
        <span style={{ padding: '6px 14px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', color: '#c084fc', fontSize: '0.85rem', fontWeight: 600 }}>
          📦 Level 3: Call Stack Depth
        </span>
        <span style={{ padding: '6px 14px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 600 }}>
          🧹 Level 4: Garbage Collection
        </span>
      </div>

      {!showQuiz ? (
        <button
          className="btn primary"
          onClick={() => setShowQuiz(true)}
          style={{
            fontSize: '1.25rem',
            padding: '16px 36px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <Sparkles size={22} />
          <span>Begin Final 10-Question Exam</span>
        </button>
      ) : (
        <div style={{ width: '100%', maxWidth: '820px' }}>
          <Quiz
            questions={questions}
            onPass={() => setHasCompleted(true)}
            onComplete={() => setHasCompleted(true)}
          />
        </div>
      )}

      {hasCompleted && (
        <div style={{ marginTop: '28px', padding: '20px 28px', background: 'rgba(16, 185, 129, 0.18)', border: '2px solid #10b981', borderRadius: '14px', maxWidth: '820px', width: '100%' }}>
          <h2 style={{ color: '#34d399', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <CheckCircle size={28} /> Certified Python Memory Master
          </h2>
          <p style={{ margin: 0, color: '#e2e8f0', fontSize: '1.05rem', lineHeight: '1.6' }}>
            You have successfully mastered memory pointers, mutation semantics, recursion call frames, and garbage collection in Python. You are ready to build ultra-scalable, crash-proof production software!
          </p>
        </div>
      )}
    </div>
  );
};

export default Level5;
