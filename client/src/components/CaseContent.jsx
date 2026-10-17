import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CircleAlert, RotateCcw, Sparkles } from 'lucide-react';
import EvidenceBoard from './EvidenceBoard';
import { WaxSeal } from './Motifs';
import ConceptVisual from './ConceptVisual';
import { suspectImages } from '../lib/assets';

function fallbackSlides(scenario) {
  return scenario.slides || [{ id: `${scenario._id}-empty`, kind: 'narrative', title: scenario.title, text: 'The case file is empty.' }];
}

export default function CaseContent({ scenario, partIndex, partTotal, stepIndex, result, submitting, caseClosed, onStepChange, onChoiceSubmit, onSealPart, boardHistory, clueCount = 12, clueTrail = [], unlockedClues = 0, clueTotal = 0 }) {
  const slides = fallbackSlides(scenario);
  const slide = slides[Math.min(stepIndex, slides.length - 1)];
  const [choiceState, setChoiceState] = useState({});
  const finalPart = Boolean(!scenario.nextScenarioId);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'ArrowLeft') onStepChange(Math.max(0, stepIndex - 1));
      if (event.key === 'ArrowRight' && slide.kind !== 'question') onStepChange(Math.min(slides.length - 1, stepIndex + 1));
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onStepChange, slide.kind, slides.length, stepIndex]);

  function choose(choice) {
    if (submitting) return;
    const next = { attempts: (choiceState[slide.id]?.attempts || 0) + 1, selected: choice.id, correct: choice.correct, feedback: choice.feedback };
    setChoiceState((state) => ({ ...state, [slide.id]: next }));
    if (choice.correct) {
      onChoiceSubmit(choice, slide, next.attempts);
      window.setTimeout(() => onStepChange(Math.min(slides.length - 1, stepIndex + 1)), 250);
    }
  }

  const isLast = stepIndex >= slides.length - 1;
  return (
    <section className="case-content">
      <header className="part-header">
        <p className="part-eyebrow">{scenario.partLabel} · file {partIndex + 1} of {partTotal}</p>
        <h2 className="part-title">{scenario.partLabel || scenario.title.replace(/^Rosewood Manor: /, '')}</h2>
        <div className="slide-progress" aria-label={`Slide ${stepIndex + 1} of ${slides.length}`}>
          <span>{stepIndex + 1} / {slides.length}</span>
          <div className="slide-dots">{slides.map((item, index) => <i key={item.id} className={index === stepIndex ? 'active' : index < stepIndex ? 'done' : ''} />)}</div>
        </div>
      </header>
      <div className="slide-stage">
        <div className="case-goal-ribbon"><span>Case goal</span><strong>{slide.connectsTo || 'Follow the clue trail to the truth'}</strong>{unlockedClues > 0 && <em>Clue {unlockedClues} of {clueTotal}</em>}</div>
        <SlideBody slide={slide} scenario={scenario} result={result} boardHistory={boardHistory} partIndex={partIndex} clueTrail={clueTrail} />
        {slide.kind === 'question' && <QuestionSlide slide={slide} state={choiceState[slide.id]} onChoose={choose} clueCount={clueCount} />}
      </div>
      <footer className="part-nav">
        <button type="button" className="bar-btn" disabled={stepIndex === 0} onClick={() => onStepChange(stepIndex - 1)}><ArrowLeft size={16} /> Back</button>
        {isLast ? <button type="button" className="primary seal-btn" onClick={onSealPart}>{finalPart ? 'Close the case' : 'Seal this part'} <WaxSeal state="current" label="" size={20} /></button> : <button type="button" className="primary" disabled={slide.kind === 'question' && !choiceState[slide.id]?.correct} onClick={() => onStepChange(stepIndex + 1)}>Next <ArrowRight size={16} /></button>}
      </footer>
      {caseClosed && finalPart && <div className="case-closed-plaque"><WaxSeal state="sealed" label="" size={44} /><strong>Case closed.</strong><p>Rosewood Manor is solved.</p></div>}
    </section>
  );
}

function SlideBody({ slide, scenario, result, boardHistory, partIndex, clueTrail }) {
  if (slide.kind === 'artifact') return <div className="beat"><h3>{slide.title}</h3><EvidenceBoard scenario={{ ...scenario, caseData: slide.caseData }} /></div>;
  if (slide.kind === 'characters') return <div className="beat"><h3>{slide.title}</h3><ConceptVisual scenario={scenario} slide={slide} partIndex={partIndex} /><div className="character-cards">{slide.characters.map((character) => <article key={character.name}><strong>{character.name}</strong><span>{character.role}</span><p>{character.motive}</p></article>)}</div></div>;
  if (slide.kind === 'code') return <div className="beat"><h3>{slide.title}</h3><div className="code-block"><pre>{slide.code}</pre></div>{result && <p className="feedback-line">Your choices were recorded in the local ledger.</p>}</div>;
  if (slide.kind === 'recap') return <div className="beat reveal"><h3>{slide.title}</h3><SuspectRecap history={boardHistory} /><p className="reveal-text">{slide.text}</p></div>;
  if (slide.kind === 'debrief') return <div className="beat debrief"><h3>{slide.title}</h3><div className="debrief-grid">{slide.cards.map((card) => <article className="debrief-card" key={card.name}><p>{card.recap}</p><strong>{card.name}</strong><small>{card.analogy}</small><div className="code-block"><pre>{card.code}</pre></div></article>)}</div></div>;
  if (slide.kind === 'reveal') return <div className="beat reveal"><h3>{slide.title}</h3><p className="reveal-text">{slide.text}</p><ClueReplay clues={clueTrail.length ? clueTrail : scenario.evidenceEvents} /></div>;
  if (slide.kind === 'concept') return <div className="beat primer"><h3>{slide.title}</h3><ConceptVisual scenario={scenario} slide={slide} partIndex={partIndex} /><p className="beat-text">{slide.text}</p>{slide.snippet && <div className="code-block"><pre>{slide.snippet}  # Keep names together for the investigation.</pre></div>}</div>;
  return <div className="beat"><h3>{slide.title}</h3><p className="beat-text">{slide.text}</p></div>;
}

function SuspectRecap({ history = [] }) {
  const series = history.flatMap((entry) => entry.board.active.map((suspect) => ({ id: suspect.id, name: suspect.name, score: suspect.score })));
  const names = [...new Map(series.map((item) => [item.id, item.name])).entries()];
  return <div className="suspect-recap" aria-label="Suspicion score recap">
    <div className="recap-chart">{names.map(([id, name]) => { const points = history.map((entry, index) => { const suspect = entry.board.active.find((item) => item.id === id); return `${index * 48},${Math.max(8, 100 - (suspect?.score || 0))}`; }).join(' '); return <div className="recap-line" key={id}><img src={suspectImages[id]} alt={name} width="32" height="32" loading="lazy" /><svg viewBox={`0 0 ${Math.max(48, history.length * 48)} 108`} role="img" aria-label={`${name} suspicion history`}><polyline points={points} /></svg><span>{name.split(' ')[0]}</span></div>; })}</div>
    <small>Score movement across the clue trail</small>
  </div>;
}

function QuestionSlide({ slide, state, onChoose }) {
  return <div className="question-panel"><p className="so-far"><span>So far</span>{slide.soFar}</p><p className="question-need">We need to find out</p><p className="guided-question">{slide.prompt}</p><div className="choice-list">{slide.choices.map((choice, index) => {
    const picked = state?.selected === choice.id;
    return <button type="button" key={choice.id} className={`choice ${picked && choice.correct ? 'correct' : picked ? 'wrong' : ''}`} onClick={() => onChoose(choice)}><span className="choice-copy"><b className="choice-badge">{String.fromCharCode(65 + index)}</b><span>{choice.text}</span></span>{picked && (choice.correct ? <span className="choice-state"><Check size={17} /> Correct</span> : <span className="choice-state"><CircleAlert size={17} /> Try again</span>)}</button>;
  })}</div>{state && <p className={state.correct ? 'answer-feedback correct-text' : 'answer-feedback hint-text'}>{state.correct ? <Sparkles size={15} /> : <RotateCcw size={15} />} {state.feedback}</p>}{state?.correct && <ClueUnlock scenario={slide} />}</div>;
}

function ClueUnlock({ scenario: slide }) {
  return <div className="clue-unlock"><Sparkles size={18} /><div><strong>Clue unlocked</strong><span>{slide.connectsTo}</span></div></div>;
}

function ClueReplay({ clues: sourceClues = [] }) {
  const clues = sourceClues.filter((event) => event.clueText);
  return <section className="clue-replay" aria-label="How the clues connected"><div className="replay-heading"><span>After the reveal</span><h4>How the clues connected</h4></div><div className="replay-path">{clues.map((clue, index) => <button type="button" className="replay-node" key={clue.id} onClick={(event) => { event.currentTarget.classList.toggle('open'); }}><i>{index + 1}</i><span>{clue.label}</span><small>{clue.clueText}</small></button>)}<div className="replay-finale"><img src={suspectImages.iris} alt="Iris Vale" width="40" height="40" /><span>Iris remains</span></div></div></section>;
}
