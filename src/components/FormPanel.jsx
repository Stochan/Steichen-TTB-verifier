import React, { useRef } from 'react';
import styles from './FormPanel.module.css';

export default function FormPanel({ imagePreview, fields, onChange, onImageSelect, onRun, running }) {
  const fileRef = useRef();

  function handleFile(e) {
    const file = e.target.files[0];
    if (file) onImageSelect(file);
    e.target.value = '';
  }

  const canRun = !!imagePreview && !running;

  return (
    <aside className={styles.panel}>
      {/* Image upload */}
      <p className={styles.sectionLabel}>Label image</p>
      <div
        className={`${styles.uploadZone} ${imagePreview ? styles.hasImage : ''}`}
        onClick={() => fileRef.current.click()}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && fileRef.current.click()}
        aria-label="Upload label image"
      >
        {imagePreview ? (
          <>
            <img src={imagePreview} alt="Label preview" className={styles.preview} />
            <div className={styles.replaceOverlay}>Replace image</div>
          </>
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.uploadIcon}>↑</span>
            <span className={styles.uploadText}>Click to upload label</span>
            <span className={styles.uploadSub}>JPG · PNG · WEBP</span>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />

      {/* Application data */}
      <p className={styles.sectionLabel} style={{ marginTop: 20 }}>Application data</p>

      {[
        { key: 'brand',     label: 'Brand name',         placeholder: 'e.g. OLD TOM DISTILLERY' },
        { key: 'classType', label: 'Class / type',       placeholder: 'e.g. Kentucky Straight Bourbon Whiskey' },
        { key: 'abv',       label: 'Alcohol content',    placeholder: 'e.g. 45% Alc./Vol. (90 Proof)' },
        { key: 'net',       label: 'Net contents',       placeholder: 'e.g. 750 mL' },
        { key: 'producer',  label: 'Bottler / producer', placeholder: 'e.g. Old Tom Distillery, Bardstown, KY' },
      ].map(({ key, label, placeholder }) => (
        <div key={key} className={styles.fieldRow}>
          <label className={styles.fieldLabel} htmlFor={`field-${key}`}>{label}</label>
          <input
            id={`field-${key}`}
            className={styles.fieldInput}
            value={fields[key]}
            onChange={e => onChange(key, e.target.value)}
            placeholder={placeholder}
          />
        </div>
      ))}

      <button className={styles.runBtn} onClick={onRun} disabled={!canRun}>
        {running ? (
          <><span className={styles.spinner} aria-hidden="true" /> Reviewing label…</>
        ) : (
          '▶  Run compliance check'
        )}
      </button>
    </aside>
  );
}
