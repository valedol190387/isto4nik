export interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: 'material' | 'review' | 'faq' | 'page';
  route: string;
  matchedText?: string;
}

export interface SearchIndex {
  materials: SearchResult[];
  reviews: SearchResult[];
  faq: SearchResult[];
  pages: SearchResult[];
}

class SearchService {
  private index: SearchIndex = {
    materials: [],
    reviews: [],
    faq: [],
    pages: []
  };
  
  private isIndexed = false;

  // FAQ данные (статичные)
  private faqData = [
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

  // Статичные страницы
  private pagesData = [
    {
      title: 'Начни здесь',
      content: 'Добро пожаловать в программу красоты и здоровья. Пошаговое руководство для начинающих.',
      route: '/start-here'
    },
    {
      title: 'О программе',
      content: 'Комплексная программа красоты и здоровья от экспертов. Эффективные методики и проверенные техники.',
      route: '/about'
    },
    {
      title: 'Автор программы',
      content: 'Познакомьтесь с создателем программы. Опытный специалист по красоте и здоровью.',
      route: '/author'
    },
    {
      title: 'Вводная тренировка',
      content: 'Базовые упражнения и техники для начала пути к красоте и здоровью.',
      route: '/courses/intro-training'
    },
    {
      title: 'Плоский живот',
      content: 'Эффективная программа для достижения плоского живота. Упражнения и советы по питанию.',
      route: '/courses/flat-belly'
    },
    {
      title: 'Против отеков',
      content: 'Борьба с отеками и задержкой жидкости. Специальные техники и упражнения.',
      route: '/courses/anti-swelling'
    },
    {
      title: 'Материалы',
      content: 'Полезные материалы, видео, методички и руководства по красоте и здоровью.',
      route: '/materials'
    },
    {
      title: 'Избранное',
      content: 'Ваши избранные материалы и курсы для быстрого доступа.',
      route: '/favorites'
    },
    {
      title: 'Профиль',
      content: 'Личный кабинет пользователя. Настройки и персональная информация.',
      route: '/profile'
    },
    {
      title: 'Календарь',
      content: 'Расписание занятий и планирование тренировок.',
      route: '/calendar'
    }
  ];

  // Индексация всего контента
  async buildIndex(): Promise<void> {
    if (this.isIndexed) return;

    try {
      // Очищаем индекс перед повторной индексацией
      this.clearIndex();
      
      // Индексируем FAQ
      this.indexFAQ();
      
      // Индексируем статичные страницы
      this.indexPages();
      
      // Индексируем материалы
      await this.indexMaterials();
      
      // Индексируем отзывы
      await this.indexReviews();
      
      this.isIndexed = true;
      console.log('Search index built successfully', this.getIndexStats());
    } catch (error) {
      console.error('Error building search index:', error);
    }
  }

  // Очистка индекса
  private clearIndex(): void {
    this.index = {
      materials: [],
      reviews: [],
      faq: [],
      pages: []
    };
  }

  // Получить статистику индекса
  private getIndexStats(): any {
    return {
      materials: this.index.materials.length,
      reviews: this.index.reviews.length,
      faq: this.index.faq.length,
      pages: this.index.pages.length,
      total: Object.values(this.index).flat().length
    };
  }

  // Индексация FAQ
  private indexFAQ(): void {
    this.faqData.forEach((faq, index) => {
      this.index.faq.push({
        id: `faq-${index}`,
        title: faq.question,
        content: `${faq.question} ${faq.answer}`,
        type: 'faq',
        route: '/faq'
      });
    });
  }

  // Индексация статичных страниц
  private indexPages(): void {
    this.pagesData.forEach((page, index) => {
      this.index.pages.push({
        id: `page-${index}`,
        title: page.title,
        content: `${page.title} ${page.content}`,
        type: 'page',
        route: page.route
      });
    });
  }

  // Индексация материалов
  private async indexMaterials(): Promise<void> {
    try {
      const response = await fetch('/api/materials');
      if (!response.ok) {
        console.log('Materials API not available, using mock data');
        // Добавляем мок данные только если API недоступен
        this.addMockMaterials();
        return;
      }
      
      const materials = await response.json();
      
      if (Array.isArray(materials) && materials.length > 0) {
        materials.forEach((material: any) => {
          this.index.materials.push({
            id: `material-${material.id}`,
            title: material.title,
            content: `${material.title} ${material.description || ''} ${material.tags ? material.tags.join(' ') : ''}`,
            type: 'material',
            route: '/materials'
          });
        });
      } else {
        // Если материалы пустые, добавляем мок данные
        this.addMockMaterials();
      }
    } catch (error) {
      console.error('Error indexing materials:', error);
      // При ошибке добавляем мок данные
      this.addMockMaterials();
    }
  }

  // Мок данные материалов (только когда API недоступен)
  private addMockMaterials(): void {
    const mockMaterials = [
      {
        id: 'yoga-beginners',
        title: 'Йога для начинающих',
        description: 'Базовые асаны и дыхательные упражнения для новичков в йоге',
        tags: ['йога', 'начинающие', 'асаны', 'дыхание']
      },
      {
        id: 'pilates-core',
        title: 'Пилатес для укрепления кора',
        description: 'Упражнения пилатес для развития силы и стабильности центра тела',
        tags: ['пилатес', 'кор', 'сила', 'стабильность']
      },
      {
        id: 'stretching-evening',
        title: 'Вечерняя растяжка',
        description: 'Мягкие упражнения на растяжку для расслабления перед сном',
        tags: ['растяжка', 'вечер', 'расслабление', 'сон']
      }
    ];

    mockMaterials.forEach((material) => {
      this.index.materials.push({
        id: `material-${material.id}`,
        title: material.title,
        content: `${material.title} ${material.description} ${material.tags.join(' ')}`,
        type: 'material',
        route: '/materials'
      });
    });
  }

  // Индексация отзывов
  private async indexReviews(): Promise<void> {
    try {
      const response = await fetch('/api/reviews');
      if (response.ok) {
        const reviews = await response.json();
        
        reviews.forEach((review: any) => {
          this.index.reviews.push({
            id: `review-${review.id}`,
            title: `Отзыв от ${review.customer_name}`,
            content: `${review.customer_name} ${review.review_text} ${review.description || ''}`,
            type: 'review',
            route: '/reviews'
          });
        });
      }
    } catch (error) {
      console.error('Error indexing reviews:', error);
    }
  }

  // Поиск по всему индексу
  search(query: string, limit: number = 10): SearchResult[] {
    if (!query.trim() || query.length < 2) return [];

    const normalizedQuery = query.toLowerCase().trim();
    const results: (SearchResult & { score: number })[] = [];
    const seenIds = new Set<string>(); // Для предотвращения дублей

    // Поиск по всем категориям
    Object.values(this.index).flat().forEach(item => {
      // Проверяем на дубли
      if (seenIds.has(item.id)) {
        return;
      }
      seenIds.add(item.id);

      const normalizedContent = item.content.toLowerCase();
      const normalizedTitle = item.title.toLowerCase();
      
      let score = 0;
      
      // Точное совпадение в заголовке (высший приоритет)
      if (normalizedTitle.includes(normalizedQuery)) {
        score += 100;
      }
      
      // Совпадение в контенте
      if (normalizedContent.includes(normalizedQuery)) {
        score += 50;
      }
      
      // Частичное совпадение слов
      const queryWords = normalizedQuery.split(' ');
      queryWords.forEach(word => {
        if (word.length > 2) {
          if (normalizedTitle.includes(word)) score += 20;
          if (normalizedContent.includes(word)) score += 10;
        }
      });
      
      if (score > 0) {
        // Находим подходящий фрагмент текста для превью
        const matchIndex = normalizedContent.indexOf(normalizedQuery);
        let matchedText = '';
        
        if (matchIndex !== -1) {
          const start = Math.max(0, matchIndex - 50);
          const end = Math.min(normalizedContent.length, matchIndex + normalizedQuery.length + 50);
          matchedText = item.content.substring(start, end);
          if (start > 0) matchedText = '...' + matchedText;
          if (end < item.content.length) matchedText = matchedText + '...';
        }
        
        results.push({
          ...item,
          score,
          matchedText: matchedText || item.content.substring(0, 100) + '...'
        });
      }
    });

    // Сортируем по релевантности и ограничиваем количество
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ score, ...item }) => item);
  }

  // Получить результаты по типу
  getResultsByType(results: SearchResult[]): Record<string, SearchResult[]> {
    const grouped: Record<string, SearchResult[]> = {
      material: [],
      review: [],
      faq: [],
      page: []
    };

    results.forEach(result => {
      grouped[result.type].push(result);
    });

    return grouped;
  }

  // Проверка готовности индекса
  isReady(): boolean {
    return this.isIndexed;
  }
}

// Singleton экземпляр
export const searchService = new SearchService(); 