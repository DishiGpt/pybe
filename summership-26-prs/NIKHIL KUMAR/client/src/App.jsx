import React, { useState, useEffect } from 'react';
import { Cpu, Database, FolderTree, Box, Activity, Scissors, Zap, Trash2, Lock, Trophy } from 'lucide-react';
import './App.css';

import Level1 from './levels/Level1';
import Level2 from './levels/Level2';
import Level3 from './levels/Level3';
import Level4 from './levels/Level4';
import Level5 from './levels/Level5';
import { playCrash } from './utils/audio';

// The Memory Crash Overlay
const CrashScreen = ({ onRestart }) => (
  <div className="crash-overlay">
    <h1>ERROR</h1>
    <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>FATAL ERROR: HEAP OUT OF MEMORY</p>
    <div style={{ maxWidth: '600px', textAlign: 'left', marginBottom: '40px' }}>
      <p>A fatal exception 0E has occurred at 0028:C0011E36 in VXD VMM(01).</p>
      <p>The current application will be terminated.</p>
      <br/>
      <p>* Press any key to terminate the current application.</p>
      <p>* You allocated too many physical objects into RAM.</p>
      <p>* The machine physically ran out of space.</p>
    </div>
    <button className="btn" onClick={onRestart} style={{ background: 'white', color: '#0000aa' }}>
      Reboot System
    </button>
  </div>
);

// The Welcome / Starting Screen
const WelcomeScreen = ({ onStart }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    maxWidth: '1440px',
    margin: '0 auto',
    width: '100%',
    padding: '20px 10px 40px'
  }}>
    {/* Top Header - Spanning above both Image and Content with generous gap */}
    <div style={{ width: '100%', textAlign: 'left', marginBottom: '50px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '3rem', margin: 0, color: '#60a5fa', fontWeight: 800, letterSpacing: '-0.5px' }}>
          PyBE: Machine Constraints
        </h1>
        <span style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.35)', color: '#38bdf8', fontSize: '0.85rem', padding: '4px 14px', borderRadius: '20px', fontWeight: 600 }}>
          Interactive Lab
        </span>
      </div>
      <p style={{ margin: 0, color: '#94a3b8', fontSize: '1.2rem' }}>
        Programming is not just math. Your code occupies physical space in RAM.
      </p>
    </div>

    {/* Two-Column Widespread Layout */}
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      gap: '60px',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%'
    }}>
      {/* Left: Physical RAM Hardware Image */}
      <div style={{ flex: '1', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '2px solid rgba(96, 165, 250, 0.4)',
          boxShadow: '0 20px 50px rgba(56, 189, 248, 0.22), 0 0 30px rgba(96, 165, 250, 0.15)',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95))',
          width: '100%',
          maxWidth: '620px',
          height: '420px'
        }}>
          <img 
            src="/ram_storage_hero.jpg" 
            alt="Physical RAM & Memory Architecture" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              objectPosition: 'center 40%',
              display: 'block'
            }} 
          />
          <div style={{
            position: 'absolute',
            bottom: '14px',
            left: '16px',
            right: '16px',
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '12px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.88rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 600 }}>
              <span>⚡</span>
              <span>Physical RAM & System Bus</span>
            </div>
            <span style={{ color: '#10b981', fontSize: '0.82rem', background: 'rgba(16, 185, 129, 0.18)', padding: '3px 10px', borderRadius: '6px', fontWeight: 700 }}>
              32 GB 8200 MHz
            </span>
          </div>
        </div>
      </div>

      {/* Right: Overview & Modules */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', textAlign: 'left' }}>
        <p style={{ fontSize: '1.18rem', lineHeight: '1.65', marginBottom: '24px', color: '#cbd5e1' }}>
          In this interactive learning experience, you will discover what happens when you write inefficient code, and learn how to optimize memory usage through visual simulations.
        </p>

        {/* Topics Upper Heading */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <span style={{ color: '#60a5fa', fontSize: '1.1rem' }}>📌</span>
          <h3 style={{ fontSize: '1rem', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, margin: 0 }}>
            Study Topics & Modules
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', marginBottom: '32px' }}>
          <div className="glass-panel" style={{ padding: '16px 20px', width: '230px', borderLeft: '3px solid #fcd34d' }}>
            <h4 style={{ color: '#fcd34d', margin: '0 0 4px 0', fontSize: '1rem' }}>Level 1 & 2</h4>
            <p style={{ margin: 0, fontSize: '0.92rem', color: '#cbd5e1' }}>Pointers & Mutability</p>
          </div>
          <div className="glass-panel" style={{ padding: '16px 20px', width: '230px', borderLeft: '3px solid #10b981' }}>
            <h4 style={{ color: '#10b981', margin: '0 0 4px 0', fontSize: '1rem' }}>Level 3 & 4</h4>
            <p style={{ margin: 0, fontSize: '0.92rem', color: '#cbd5e1' }}>Recursion & Garbage Collection</p>
          </div>
        </div>

        <button className="btn primary" style={{ fontSize: '1.3rem', padding: '14px 42px', borderRadius: '8px', background: '#60a5fa', color: '#000', fontWeight: 'bold' }} onClick={onStart}>
          Start Learning
        </button>
      </div>
    </div>
  </div>
);

// The Global RAM Bar
const RamBar = ({ usage }) => (
  <div className="glass-panel" style={{ padding: '16px', marginBottom: '20px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Cpu size={20} color="#3b82f6" />
        <span style={{ fontWeight: 600 }}>System RAM Allocation</span>
      </div>
      <span style={{ color: usage > 80 ? 'var(--danger)' : usage > 50 ? '#eab308' : 'var(--success)', fontWeight: 'bold' }}>
        {usage.toFixed(0)}%
      </span>
    </div>
    <div className={`ram-bar-container ${usage > 80 ? 'ram-bar-danger' : ''}`}>
      <div className="ram-bar-fill" style={{ width: `${usage}%` }}></div>
    </div>
  </div>
);

// Main App Component
function App() {
  const [crashed, setCrashed] = useState(false);
  const [activeLevel, setActiveLevel] = useState(0);
  const [unlockedLevels, setUnlockedLevels] = useState([1, 2, 3, 4, 5]); // All levels unlocked

  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (crashed) {
      playCrash();
      setShake(true);
      const t = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(t);
    }
  }, [crashed]);

  const triggerCrash = () => setCrashed(true);
  const handleRestart = () => setCrashed(false);

  const handlePassLevel = (levelId) => {
    if (!unlockedLevels.includes(levelId + 1)) {
      setUnlockedLevels([...unlockedLevels, levelId + 1]);
    }
    // Optionally auto-advance after a short delay
    setTimeout(() => setActiveLevel(levelId + 1), 2000);
  };

  const navItemClass = (id) => {
    if (activeLevel === id) return "nav-item active";
    return "nav-item";
  };

  const navigateTo = (id) => {
    setActiveLevel(id);
    setCrashed(false);
  };

  return (
    <div className={`app-container ${shake ? 'crash-shake' : ''}`}>
      {crashed && <CrashScreen onRestart={handleRestart} />}
      
      {/* File Explorer Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2><FolderTree size={20} /> Memory Modules</h2>
        </div>
        
        <div className={navItemClass(1)} onClick={() => navigateTo(1)}>
          <Box size={18} /> 1. Variables as References
        </div>
        
        <div className={navItemClass(2) + (!unlockedLevels.includes(2) ? " locked" : "")} onClick={() => unlockedLevels.includes(2) && navigateTo(2)}>
          {!unlockedLevels.includes(2) ? <Lock size={18} /> : <Activity size={18} />} 2. Mutable Objects
        </div>
        
        <div className={navItemClass(3) + (!unlockedLevels.includes(3) ? " locked" : "")} onClick={() => unlockedLevels.includes(3) && navigateTo(3)}>
          {!unlockedLevels.includes(3) ? <Lock size={18} /> : <Zap size={18} />} 3. Recursion Memory
        </div>
        
        <div className={navItemClass(4) + (!unlockedLevels.includes(4) ? " locked" : "")} onClick={() => unlockedLevels.includes(4) && navigateTo(4)}>
          {!unlockedLevels.includes(4) ? <Lock size={18} /> : <Trash2 size={18} />} 4. Garbage Collection
        </div>
        
        <div className={navItemClass(5) + (!unlockedLevels.includes(5) ? " locked" : "")} onClick={() => unlockedLevels.includes(5) && navigateTo(5)}>
          {!unlockedLevels.includes(5) ? <Lock size={18} /> : <Trophy size={18} />} 5. Final Exam
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">

        {activeLevel === 0 && <WelcomeScreen onStart={() => setActiveLevel(1)} />}
        {activeLevel === 1 && <Level1 onCrash={triggerCrash} onPass={() => handlePassLevel(1)} RamBar={RamBar} />}
        {activeLevel === 2 && <Level2 onCrash={triggerCrash} onPass={() => handlePassLevel(2)} RamBar={RamBar} />}
        {activeLevel === 3 && <Level3 onCrash={triggerCrash} onPass={() => handlePassLevel(3)} RamBar={RamBar} />}
        {activeLevel === 4 && <Level4 onCrash={triggerCrash} onPass={() => handlePassLevel(4)} RamBar={RamBar} />}
        {activeLevel === 5 && <Level5 />}
      </div>
    </div>
  );
}

export default App;
