'use client';

import { useState, useEffect } from 'react';
import { Page } from '@/components/Page';
import { FAQCard } from '@/components/FAQCard';
import { FAQ } from '@/types/database';
import styles from './page.module.css';
import { MessageCircle, Loader2 } from 'lucide-react';

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFAQ();
  }, []);

  const loadFAQ = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/faq');
      const data = await response.json();
      
      if (data.success) {
        setFaqs(data.data || []);
      }
    } catch (error) {
      console.error('Error loading FAQ:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Page>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <MessageCircle className={styles.headerIcon} />
            <h1 className={styles.headerTitle}>FAQ — Часто задаваемые вопросы</h1>
          </div>
        </div>
        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>
              <Loader2 className={styles.loadingIcon} />
              <p>Загружаем вопросы и ответы...</p>
            </div>
          ) : (
            <div>
              {faqs.map((faq, i) => (
                <FAQCard 
                  key={faq.id} 
                  question={faq.question} 
                  answer={faq.answer} 
                  index={i} 
                />
              ))}
              {faqs.length === 0 && (
                <div className={styles.emptyState}>
                  <MessageCircle size={48} />
                  <h3>Пока нет вопросов</h3>
                  <p>FAQ будут добавлены в ближайшее время</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Page>
  );
} 