import React, { useState, useEffect } from 'react';
import { playSlideTransition, unlockAudio } from '../utils/audio';

const StorySlider = ({ slides, storyStep, setStoryStep, steps }) => {
  const [slideDirection, setSlideDirection] = useState('next');
  const slide = slides[storyStep];

  // Only unlock slides up to what the user has reached (at start: scenes 0 & 1; scene 3 unlocks after crash)
  const maxUnlockedStep = Math.max(storyStep, 1);
  const validStepIds = steps
    .map(s => s.id)
    .filter(id => slides[id] != null && id <= maxUnlockedStep);
  const currentIndex = validStepIds.indexOf(storyStep);

  const hasPrev = currentIndex > 0;
  const hasNextSlide = currentIndex !== -1 && currentIndex < validStepIds.length - 1;

  const goToStep = (targetStep, direction = 'next') => {
    unlockAudio();
    playSlideTransition(direction);
    setSlideDirection(direction);
    setStoryStep(targetStep);
  };

  const handlePrev = () => {
    if (hasPrev) {
      goToStep(validStepIds[currentIndex - 1], 'prev');
    }
  };

  const handleNext = () => {
    if (slide.action) {
      unlockAudio();
      playSlideTransition('next');
      slide.action();
    } else if (hasNextSlide) {
      goToStep(validStepIds[currentIndex + 1], 'next');
    } else {
      unlockAudio();
      playSlideTransition('next');
      setSlideDirection('next');
      setStoryStep(storyStep + 1);
    }
  };

  // Keyboard navigation for arrow keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' && hasPrev) {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasPrev, currentIndex, validStepIds, slide]);

  if (!slide) return null;

  // Formats text containing bullet/semicolon points into structured cards
  const renderFormattedText = (text, color) => {
    if (!text) return null;

    if (text.includes(';') && text.includes(':')) {
      const firstColonIdx = text.indexOf(':');
      const textBeforeColon = text.substring(0, firstColonIdx);

      // Look for the end of the intro sentence before the colon (ends with ! or . or ?)
      const matchBoundary = textBeforeColon.match(/^(.*?[.!?])\s+([^.!?]+)$/s);

      let intro = '';
      let pointsBlock = '';

      if (matchBoundary) {
        intro = matchBoundary[1].trim();
        pointsBlock = matchBoundary[2] + text.substring(firstColonIdx);
      } else {
        pointsBlock = text;
      }

      const rawPoints = pointsBlock.split(';').map(p => p.trim()).filter(Boolean);
      const points = rawPoints.map(p => {
        const cIdx = p.indexOf(':');
        if (cIdx !== -1) {
          return {
            title: p.substring(0, cIdx).trim(),
            desc: p.substring(cIdx + 1).trim().replace(/\.$/, '')
          };
        }
        return { title: '', desc: p.trim().replace(/\.$/, '') };
      });

      const getIcon = (title) => {
        const lower = title.toLowerCase();
        if (lower.includes('memory') || lower.includes('bloat') || lower.includes('leak')) return '💥';
        if (lower.includes('sync') || lower.includes('desync') || lower.includes('ghost')) return '🔄';
        if (lower.includes('cpu') || lower.includes('lag') || lower.includes('stack') || lower.includes('overhead')) return '⏳';
        if (lower.includes('redundant') || lower.includes('blocked')) return '🛑';
        return '⚠️';
      };

      return (
        <div className="slide-formatted-body">
          {intro && <p className="slide-intro-paragraph">{intro}</p>}
          <div className="slide-points-grid">
            {points.map((pt, i) => (
              <div key={i} className="slide-point-card" style={{ borderLeft: `3px solid ${color}` }}>
                <span className="slide-point-icon">{getIcon(pt.title)}</span>
                <div className="slide-point-text-block">
                  {pt.title && (
                    <strong className="slide-point-title" style={{ color: '#fff' }}>
                      {pt.title}:
                    </strong>
                  )}
                  <span className="slide-point-desc">{pt.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <p className="slide-default-paragraph">
        {text}
      </p>
    );
  };

  return (
    <div className="scene-overlay">
      <div className="scene-slider-wrapper">
        {/* Animated Slide Card with Directional Horizontal Animation */}
        <div
          key={`${storyStep}-${slideDirection}`}
          className={`scene-card-animated ${slideDirection === 'prev' ? 'slide-from-left' : 'slide-from-right'}`}
          style={{
            border: `2px solid ${slide.color}`,
            boxShadow: `0 0 50px ${slide.color}35, 0 20px 40px rgba(0,0,0,0.6)`
          }}
        >
          {/* Top Slide Progress Strip */}
          <div className="story-progress-strip">
            <div
              className="story-progress-fill"
              style={{
                width: `${((currentIndex + 1) / validStepIds.length) * 100}%`,
                backgroundColor: slide.color
              }}
            />
          </div>

          {/* Top Story Timeline Tabs / Pills */}
          <div className="scene-step-bar">
            {steps.map((s) => {
              const isActive = storyStep === s.id;
              const isPast = storyStep > s.id;
              const isAvailable = validStepIds.includes(s.id);

              return (
                <button
                  key={s.id}
                  onClick={() => {
                    if (isAvailable && s.id !== storyStep) {
                      goToStep(s.id, s.id > storyStep ? 'next' : 'prev');
                    }
                  }}
                  disabled={!isAvailable}
                  className="scene-step-pill"
                  style={{
                    background: isActive
                      ? slide.color
                      : isPast
                        ? 'rgba(255,255,255,0.12)'
                        : 'rgba(255,255,255,0.04)',
                    color: isActive ? '#000' : isPast ? '#94a3b8' : '#475569',
                    border: isActive
                      ? `1px solid ${slide.color}`
                      : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: isActive ? `0 0 16px ${slide.color}80` : 'none',
                    cursor: isAvailable ? 'pointer' : 'default',
                    opacity: isAvailable ? 1 : 0.4
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* Scene Title */}
          <h2
            style={{
              fontSize: '2.5rem',
              color: slide.color,
              marginBottom: '20px',
              textShadow: `0 0 25px ${slide.color}50`,
              fontWeight: 800
            }}
          >
            {slide.title}
          </h2>

          {/* Slider Content Grid */}
          <div className="slide-content-grid" style={{ display: 'flex', flexDirection: 'row', gap: '36px', alignItems: 'center', width: '100%' }}>
            {/* Left: Illustrated Concept Art */}
            <div className="slide-image-pane" style={{ flex: '1', display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <div
                className="scene-image-glow-aura"
                style={{ background: slide.color }}
              />

              <div
                className="scene-image-container"
                style={{
                  border: `2px solid ${slide.color}80`,
                  boxShadow: `0 12px 35px rgba(0,0,0,0.6), 0 0 25px ${slide.color}40`,
                  background: 'rgba(15, 23, 42, 0.9)'
                }}
              >
                <div className="scene-light-sweep-effect">
                  <div className="scene-light-sweep-bar" />
                </div>

                <img
                  src={slide.image}
                  alt={slide.title}
                  style={{
                    width: '100%',
                    maxHeight: '42vh',
                    objectFit: 'contain',
                    borderRadius: '16px',
                    display: 'block'
                  }}
                />

                {/* Floating Status Badge on the Image */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '12px',
                    right: '12px',
                    background: 'rgba(15, 23, 42, 0.92)',
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${slide.color}60`,
                    borderRadius: '8px',
                    padding: '6px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    color: slide.color,
                    fontWeight: 700,
                    zIndex: 3
                  }}
                >
                  <span>
                    {slide.badge || (storyStep === 0 ? "📖 Dilemma Overview" : storyStep === 1 ? "⚠️ Problem & Memory Bloat" : "⚡ Solution & Optimization")}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Narrative Description & Action Flow */}
            <div className="slide-content-pane" style={{ flex: '1.15', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
              {renderFormattedText(slide.text, slide.color)}

              {/* Slider Bottom Action Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', flexWrap: 'wrap', marginTop: 'auto' }}>
                {hasPrev && (
                  <button
                    className="scene-prev-btn"
                    onClick={handlePrev}
                    style={{
                      padding: '12px 22px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#cbd5e1',
                      borderRadius: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.color = '#cbd5e1';
                    }}
                  >
                    <span>←</span>
                    <span>Previous</span>
                  </button>
                )}

                <button
                  className="scene-next-btn"
                  style={{
                    background: slide.color,
                    boxShadow: `0 8px 24px ${slide.color}60`
                  }}
                  onClick={handleNext}
                >
                  <span>{slide.buttonText}</span>
                  <span className="arrow-slide-anim">➔</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Slider Dots Pagination */}
          <div className="scene-slider-dots">
            {validStepIds.map((stepId, idx) => {
              const isCurrent = storyStep === stepId;
              const targetSlide = slides[stepId];
              return (
                <button
                  key={stepId}
                  onClick={() => goToStep(stepId, stepId > storyStep ? 'next' : 'prev')}
                  className={`scene-slider-dot ${isCurrent ? 'active' : ''}`}
                  style={{
                    background: isCurrent ? (targetSlide?.color || slide.color) : 'rgba(255, 255, 255, 0.25)',
                    color: targetSlide?.color || slide.color
                  }}
                  title={`Go to Slide ${idx + 1}`}
                  aria-label={`Go to Slide ${idx + 1}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorySlider;
