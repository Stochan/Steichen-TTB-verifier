import React, { useState } from 'react';
import styles from './ApiKeyModal.module.css';

export default function ApiKeyModal({ initialKey = '', onSave }) {
  const [value, setValue] = useState(initialKey);
  const [error, setError] = useState('');

  function handleSave() {
    if (!value.trim()) { setError('Please enter an API key.'); return; }
    onSave(value.trim());
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Enter your Anthropic API key</h2>
        <p className={styles.desc}>
          Your key is used only to contact the Anthropic API directly from your browser.
          It is stored in your browser's <code>localStorage</code> and never sent anywhere else.
        </p>

        <label className={styles.label} htmlFor="apikey">API key</label>
        <input
          id="apikey"
          type="password"
          className={styles.input}
          value={value}
          onChange={e => { setValue(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          placeholder="sk-ant-…"
          autoFocus
        />
        {error && <p className={styles.error}>{error}</p>}

        <a
          href="https://console.anthropic.com/"
          target="_blank"
          rel="noreferrer"
          className={styles.link}
        >
          Get your API key at console.anthropic.com →
        </a>

        <div className={styles.actions}>
          <button className={styles.saveBtn} onClick={handleSave}>Save &amp; continue</button>
        </div>
      </div>
    </div>
  );
}
