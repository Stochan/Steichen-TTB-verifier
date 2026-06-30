import React, { useRef, useState } from 'react';
import styles from './BatchModal.module.css';
import { buildPrompt, verifyLabel, readFileAsBase64 } from '../anthropicClient';

const STATUS_LABELS = {
  pending: 'Pending',
  running: 'Reviewing…',
  pass:    'Approved',
  fail:    'Rejected',
  warn:    'Needs review',
  error:   'Error',
};

export default function BatchModal({ apiKey, fields, onClose }) {
  const [items,    setItems]    = useState([]);
  const [running,  setRunning]  = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef();

  function addFiles(e) {
    const files = Array.from(e.target.files);
    setItems(prev => {
      const existing = new Set(prev.map(i => i.name));
      const added = files
        .filter(f => !existing.has(f.name))
        .map(f => ({ file: f, name: f.name, status: 'pending', detail: null }));
      return [...prev, ...added];
    });
    e.target.value = '';
  }

  function clearAll() {
    if (!running) setItems([]);
  }

  async function runBatch() {
    if (!items.length || running) return;
    setRunning(true);
    setProgress(0);
    const prompt = buildPrompt(fields);

    for (let i = 0; i < items.length; i++) {
      setItems(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'running' } : it));
      try {
        const { base64, mimeType } = await readFileAsBase64(items[i].file);
        const result = await verifyLabel(apiKey, base64, mimeType, prompt);
        setItems(prev => prev.map((it, idx) =>
          idx === i ? { ...it, status: result.overall || 'warn', detail: result.summary } : it
        ));
      } catch (err) {
        setItems(prev => prev.map((it, idx) =>
          idx === i ? { ...it, status: 'error', detail: err.message } : it
        ));
      }
      setProgress(Math.round(((i + 1) / items.length) * 100));
    }
    setRunning(false);
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && !running && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>Batch label review</span>
          <button className={styles.closeBtn} onClick={onClose} disabled={running} aria-label="Close">×</button>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.desc}>
            Add multiple label images. Each will be reviewed sequentially using the application
            data from the main form.
          </p>

          <button className={styles.addBtn} onClick={() => fileRef.current.click()} disabled={running}>
            + Add label images
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={addFiles} />

          {items.length > 0 && (
            <table className={styles.table}>
              <thead>
                <tr><th>File</th><th>Status</th></tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i}>
                    <td className={styles.fileName}>{item.name}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[item.status]}`}>
                        {STATUS_LABELS[item.status] || item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {running && (
            <div className={styles.progressWrap}>
              <div className={styles.progressBar} style={{ width: `${progress}%` }} />
              <span className={styles.progressLabel}>{progress}%</span>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.clearBtn} onClick={clearAll} disabled={running}>Clear all</button>
          <button className={styles.runBtn} onClick={runBatch} disabled={!items.length || running}>
            {running ? 'Running…' : 'Run batch review'}
          </button>
        </div>
      </div>
    </div>
  );
}
