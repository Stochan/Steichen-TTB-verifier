import React from 'react';
import styles from './ResultsPanel.module.css';

const STATUS_CONFIG = {
  pass: { icon: '✓', label: 'APPROVED',     cls: styles.pass },
  fail: { icon: '✗', label: 'REJECTED',     cls: styles.fail },
  warn: { icon: '!', label: 'NEEDS REVIEW', cls: styles.warn },
};

export default function ResultsPanel({ state, result }) {
  if (state === 'empty')   return <EmptyState />;
  if (state === 'loading') return <LoadingState />;
  if (state === 'error')   return <ErrorState message={result?.message} />;
  return <Results result={result} />;
}

function EmptyState() {
  return (
    <div className={styles.centered}>
      <div className={styles.emptyIcon}>⊙</div>
      <p className={styles.emptyTitle}>No review in progress</p>
      <p className={styles.emptySub}>Upload a label image and fill in the application data to begin.</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className={styles.centered}>
      <div className={styles.loadingBar} role="progressbar" aria-label="Reviewing label" />
      <p className={styles.emptyTitle}>Analyzing label with Claude Vision…</p>
      <p className={styles.emptySub}>This usually takes 2–5 seconds.</p>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className={styles.centered}>
      <div className={`${styles.emptyIcon} ${styles.errorIcon}`}>✗</div>
      <p className={styles.emptyTitle}>Verification failed</p>
      <p className={styles.emptySub}>{message || 'An unknown error occurred. Please try again.'}</p>
    </div>
  );
}

function Results({ result }) {
  const overall = result?.overall || 'warn';
  const cfg     = STATUS_CONFIG[overall] || STATUS_CONFIG.warn;
  const checks  = result?.checks || [];
  const time    = new Date().toLocaleTimeString();

  return (
    <div className={styles.results}>
      <div className={`${styles.banner} ${cfg.cls}`}>
        <span className={styles.bannerIcon} aria-hidden="true">{cfg.icon}</span>
        <div className={styles.bannerText}>
          <p className={styles.bannerTitle}>{result?.summary || 'Review complete'}</p>
          <p className={styles.bannerSub}>{checks.length} field{checks.length !== 1 ? 's' : ''} checked · {time}</p>
        </div>
        <span className={styles.stamp}>{cfg.label}</span>
      </div>

      <div className={styles.checkList}>
        {checks.map((check, i) => {
          const c = STATUS_CONFIG[check.status] || STATUS_CONFIG.warn;
          return (
            <div key={i} className={`${styles.checkRow} ${c.cls}`} style={{ animationDelay: `${i * 0.05}s` }}>
              <span className={styles.checkIcon} aria-hidden="true">{c.icon}</span>
              <div>
                <p className={styles.checkField}>{check.field}</p>
                <p className={styles.checkDetail}>{check.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
