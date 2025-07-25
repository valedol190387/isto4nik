'use client';

import { Page } from '@/components/Page';
import { FAQCard } from '@/components/FAQCard';
import styles from './page.module.css';
import { MessageCircle } from 'lucide-react';

const FAQS = [
  {
    question: 'Как записаться на курс?',
    answer: 'Выберите интересующий курс в разделе «Курсы» и нажмите кнопку «Записаться». После оплаты вы получите доступ к материалам и расписанию.'
  },
  {
    question: 'Можно ли вернуть деньги за курс?',
    answer: 'Да, возврат возможен в течение 7 дней после оплаты, если вы не приступили к обучению. Для возврата напишите в поддержку.'
  },
  {
    question: 'Как получить консультацию эксперта?',
    answer: 'В каждом курсе есть чат с экспертами. Вы можете задать вопрос прямо в чате или через форму обратной связи на сайте.'
  },
  {
    question: 'Доступны ли материалы после окончания курса?',
    answer: 'Да, все материалы остаются у вас в личном кабинете даже после завершения курса.'
  },
  {
    question: 'Можно ли учиться с телефона?',
    answer: 'Да, платформа полностью адаптирована для мобильных устройств. Вы можете проходить обучение с любого устройства.'
  },
  {
    question: 'Что делать, если не пришло письмо с доступом?',
    answer: 'Проверьте папку «Спам». Если письма нет — напишите в поддержку, мы быстро решим вопрос.'
  },
  {
    question: 'Как оставить отзыв?',
    answer: 'После прохождения курса в личном кабинете появится кнопка «Оставить отзыв». Также вы можете написать отзыв в разделе «Отзывы».'
  },
  {
    question: 'Есть ли сертификат по окончании?',
    answer: 'Да, после успешного завершения курса вы получите именной сертификат в электронном виде.'
  }
];

export default function FAQPage() {
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
          <div>
            {FAQS.map((faq, i) => (
              <FAQCard key={faq.question} question={faq.question} answer={faq.answer} index={i} />
            ))}
          </div>
        </div>
      </div>
    </Page>
  );
} 