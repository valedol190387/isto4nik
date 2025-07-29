import { NextResponse } from 'next/server';

// Мок данные отзывов для поиска
const MOCK_REVIEWS = [
  {
    id: 1,
    customer_name: 'Анна Петрова',
    review_text: 'Отличная программа! Постоянно использую рекомендации, результат виден уже через неделю. Особенно помогают упражнения для плоского живота.',
    rating: 5.0,
    description: 'Участница программы красоты',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    customer_name: 'Мария Иванова',
    review_text: 'Программа против отеков просто супер! Больше не мучают постоянные отеки ног. Очень благодарна автору за такие эффективные методики.',
    rating: 4.8,
    description: 'Довольная клиентка',
    created_at: '2024-01-20T14:30:00Z'
  },
  {
    id: 3,
    customer_name: 'Елена Сидорова',
    review_text: 'Материалы очень полезные, постоянно пересматриваю видео. Мотивация на высоте! Советую всем девочкам.',
    rating: 4.9,
    description: 'Активная участница',
    created_at: '2024-01-25T09:15:00Z'
  },
  {
    id: 4,
    customer_name: 'Ольга Козлова',
    review_text: 'Курс по питанию изменил мою жизнь. Постоянно придерживаюсь рекомендаций. Тело стало более подтянутым и здоровым.',
    rating: 4.7,
    description: 'Любительница здорового образа жизни',
    created_at: '2024-02-01T16:45:00Z'
  },
  {
    id: 5,
    customer_name: 'Татьяна Смирнова',
    review_text: 'Прекрасный опыт! Тренировки эффективные, постоянная поддержка от экспертов. FAQ очень помогает в начале пути.',
    rating: 4.6,
    description: 'Новичок в фитнесе',
    created_at: '2024-02-05T11:20:00Z'
  }
];

export async function GET() {
  try {
    // В реальном приложении здесь был бы запрос к базе данных
    return NextResponse.json(MOCK_REVIEWS);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
} 