'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './FAQCard.module.css';

interface FAQCardProps {
  question: string;
  answer: string;
  index?: number;
}

export function FAQCard({ question, answer }: FAQCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.card}>
      <button
        className={styles.header}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`faq-answer-${question}`}
        type="button"
      >
        <span className={styles.question}>{question}</span>
        <ChevronDown
          className={styles.chevron + (open ? ' ' + styles.open : '')}
          aria-hidden
        />
      </button>
      <div
        className={styles.answerWrapper}
        style={{ maxHeight: open ? 500 : 0 }}
        id={`faq-answer-${question}`}
        aria-hidden={!open}
      >
        <div 
          className={styles.answer}
          dangerouslySetInnerHTML={{ __html: answer.replace(/\n/g, '<br />') }}
        />
      </div>
    </div>
  );
} 