import React from 'react';
import styles from './Header.module.css';

export default function Header({ onChangeKey }) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.seal}>TTB</div>
        <div>
          <div className={styles.title}>Steichen Label Verifier</div>
          <div className={styles.sub}>Alcohol and Tobacco Tax and Trade Bureau · COLA Compliance</div>
        </div>
      </div>
      <div className={styles.right}>
        <span className={styles.badge}>PROTOTYPE</span>
        <button className={styles.keyBtn} onClick={onChangeKey}>Change API key</button>
      </div>
    </header>
  );
}
