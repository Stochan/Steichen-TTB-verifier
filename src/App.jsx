import React, { useState, useEffect } from 'react';
import styles from './App.module.css';
import Header       from './components/Header';
import FormPanel    from './components/FormPanel';
import ResultsPanel from './components/ResultsPanel';
import BatchModal   from './components/BatchModal';
import ApiKeyModal  from './components/ApiKeyModal';
import { buildPrompt, verifyLabel, readFileAsBase64 } from './anthropicClient';

const STORAGE_KEY = 'steichen_ttb_anthropic_api_key';

export default function App() {
  const [apiKey,       setApiKey]       = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showBatch,    setShowBatch]    = useState(false);

  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [fields, setFields] = useState({
    brand: '', classType: '', abv: '', net: '', producer: '',
  });

  const [reviewState, setReviewState] = useState('empty'); // empty | loading | done | error
  const [result,      setResult]      = useState(null);

  useEffect(() => {
    if (!apiKey) setShowKeyModal(true);
  }, [apiKey]);

  function handleSaveKey(key) {
    localStorage.setItem(STORAGE_KEY, key);
    setApiKey(key);
    setShowKeyModal(false);
  }

  function handleFieldChange(key, value) {
    setFields(prev => ({ ...prev, [key]: value }));
  }

  function handleImageSelect(file) {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleRun() {
    if (!imageFile || !apiKey) return;
    setReviewState('loading');
    setResult(null);

    try {
      const { base64, mimeType } = await readFileAsBase64(imageFile);
      const prompt = buildPrompt(fields);
      const data   = await verifyLabel(apiKey, base64, mimeType, prompt);
      setResult(data);
      setReviewState('done');
    } catch (err) {
      setResult({ message: err.message });
      setReviewState('error');
    }
  }

  return (
    <div className={styles.app}>
      {showKeyModal && (
        <ApiKeyModal initialKey={apiKey} onSave={handleSaveKey} />
      )}

      {showBatch && (
        <BatchModal
          apiKey={apiKey}
          fields={fields}
          onClose={() => setShowBatch(false)}
        />
      )}

      <Header onChangeKey={() => setShowKeyModal(true)} />

      <div className={styles.body}>
        <FormPanel
          imagePreview={imagePreview}
          fields={fields}
          onChange={handleFieldChange}
          onImageSelect={handleImageSelect}
          onRun={handleRun}
          running={reviewState === 'loading'}
        />
        <main className={styles.main}>
          <ResultsPanel state={reviewState} result={result} />
        </main>
      </div>

      <footer className={styles.footer}>
        <span className={styles.footerLabel}>Batch processing</span>
        <button className={styles.batchBtn} onClick={() => setShowBatch(true)}>
          Upload multiple labels…
        </button>
      </footer>
    </div>
  );
}
