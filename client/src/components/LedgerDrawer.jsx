import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../lib/api';

// Below-stairs ledger: the old dashboard (analytics, roadmap, recent
// sessions) restyled and tucked behind the top bar so the three-zone case
// view stays uncluttered. Data loads lazily on first open.

export default function LedgerDrawer({ open, onClose, onReset }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!open || data) return undefined;
    let alive = true;
    Promise.all([api('/sessions'), api('/analytics'), api('/roadmap')])
      .then(([sessions, analytics, roadmap]) => {
        if (alive) setData({ sessions: sessions.slice(0, 6), analytics, roadmap });
      })
      .catch(() => {
        if (alive) setData({ sessions: [], analytics: null, roadmap: [] });
      });
    return () => { alive = false; };
  }, [open, data]);

  if (!open) return null;

  return (
    <div className="ledger-scrim" onClick={onClose} role="presentation">
      <aside
        className="ledger"
        role="dialog"
        aria-label="Learner ledger"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="ledger-head">
          <h3>The Learner's Ledger</h3>
          <button type="button" className="bar-btn" onClick={onClose}><X size={16} /> Close</button>
        </header>

        {!data ? (
          <p className="ledger-empty">Fetching the household records…</p>
        ) : (
          <>
            <section>
              <h4>Case notes</h4>
              <div className="ledger-stats">
                <span><strong>{data.analytics?.scenarioCount ?? 0}</strong> case files</span>
                <span><strong>{data.analytics?.sessionCount ?? 0}</strong> notes saved</span>
              </div>
            </section>

            <section>
              <h4>Recent notes</h4>
              {data.sessions.length ? (
                <ul className="session-log">
                  {data.sessions.map((session) => (
                    <li key={session._id}>
                      <strong>{session.scenario?.partLabel || 'Case note'}</strong>
                      <span>A clue was recorded.</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="ledger-empty">Nothing logged yet tonight.</p>}
            </section>

            {onReset && (
              <footer className="ledger-footer">
                <small>Progress lives only in this browser — nothing syncs to any server.</small>
                <button
                  type="button"
                  className="ghost danger"
                  onClick={() => {
                    if (window.confirm('Burn your trail? All local progress will be lost.')) onReset();
                  }}
                >
                  Burn my trail (reset progress)
                </button>
              </footer>
            )}
          </>
        )}
      </aside>
    </div>
  );
}
