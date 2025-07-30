import { 
  Calendar,
  Play,
  Users,
  BookOpen,
  Heart,
  Target,
  Zap,
  Award,
  Coffee,
  MessageCircle,
  Video,
  Headphones,
  CheckCircle,
  Star,
  Activity,
  Dumbbell
} from 'lucide-react';

export const iconMapping = {
  'Calendar': Calendar,
  'Play': Play,
  'Users': Users,
  'BookOpen': BookOpen,
  'Heart': Heart,
  'Target': Target,
  'Zap': Zap,
  'Award': Award,
  'Coffee': Coffee,
  'MessageCircle': MessageCircle,
  'Video': Video,
  'Headphones': Headphones,
  'CheckCircle': CheckCircle,
  'Star': Star,
  'Activity': Activity,
  'Dumbbell': Dumbbell
};

export const iconOptions = [
  { value: 'Calendar', label: 'Календарь', component: Calendar },
  { value: 'Play', label: 'Воспроизведение', component: Play },
  { value: 'Users', label: 'Группа', component: Users },
  { value: 'BookOpen', label: 'Обучение', component: BookOpen },
  { value: 'Heart', label: 'Здоровье', component: Heart },
  { value: 'Target', label: 'Цель', component: Target },
  { value: 'Zap', label: 'Энергия', component: Zap },
  { value: 'Award', label: 'Достижение', component: Award },
  { value: 'Coffee', label: 'Кофе-брейк', component: Coffee },
  { value: 'MessageCircle', label: 'Консультация', component: MessageCircle },
  { value: 'Video', label: 'Видео', component: Video },
  { value: 'Headphones', label: 'Аудио', component: Headphones },
  { value: 'CheckCircle', label: 'Выполнено', component: CheckCircle },
  { value: 'Star', label: 'Избранное', component: Star },
  { value: 'Activity', label: 'Активность', component: Activity },
  { value: 'Dumbbell', label: 'Тренажёры', component: Dumbbell }
];

export const renderIcon = (iconName: string | null, size: number = 20) => {
  const IconComponent = iconName ? iconMapping[iconName as keyof typeof iconMapping] : Star;
  const Component = IconComponent || Star;
  return <Component size={size} />;
}; 