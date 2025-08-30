'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  X,
  LogOut
} from 'lucide-react';
import styles from './page.module.css';
import { AdminSidebar } from '@/components/AdminSidebar';

// Предустановленные значения для быстрого выбора
const presetValues = {
  utm_source: [
    { value: 'google', label: 'Google Ads' },
    { value: 'yandex', label: 'Яндекс.Директ' },
    { value: 'vk', label: 'ВКонтакте' },
    { value: 'telegram', label: 'Telegram' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'email', label: 'Email рассылка' },
    { value: 'sms', label: 'SMS рассылка' },
    { value: 'offline', label: 'Офлайн реклама' }
  ],
  utm_medium: [
    { value: 'cpc', label: 'CPC (cost per click)' },
    { value: 'cpm', label: 'CPM (cost per mille)' },
    { value: 'email', label: 'Email рассылка' },
    { value: 'social', label: 'Социальные сети' },
    { value: 'banner', label: 'Медийная реклама' },
    { value: 'organic', label: 'Органический трафик' },
    { value: 'referral', label: 'Переходы с сайтов' },
    { value: 'direct', label: 'Прямые переходы' },
    { value: 'affiliate', label: 'Партнерская программа' },
    { value: 'sms', label: 'SMS рассылка' }
  ],
  utm_campaign: [
    { value: 'summer-sale', label: 'Летняя распродажа' },
    { value: 'new-year', label: 'Новогодняя акция' },
    { value: 'black-friday', label: 'Черная пятница' },
    { value: 'welcome-series', label: 'Приветственная серия' },
    { value: 'retargeting', label: 'Ретаргетинг' },
    { value: 'lookalike', label: 'Похожая аудитория' },
    { value: 'brand-awareness', label: 'Узнаваемость бренда' },
    { value: 'lead-generation', label: 'Генерация лидов' },
    { value: 'course-promo', label: 'Продвижение курса' },
    { value: 'free-trial', label: 'Бесплатный пробный период' }
  ],
  utm_content: [
    { value: 'banner-top', label: 'Верхний баннер' },
    { value: 'banner-side', label: 'Боковой баннер' },
    { value: 'text-ad', label: 'Текстовое объявление' },
    { value: 'video-ad', label: 'Видео объявление' },
    { value: 'carousel', label: 'Карусель' },
    { value: 'story', label: 'Сторис' },
    { value: 'post', label: 'Пост в ленте' },
    { value: 'button-cta', label: 'CTA кнопка' },
    { value: 'newsletter-top', label: 'Верх рассылки' },
    { value: 'newsletter-bottom', label: 'Низ рассылки' }
  ],
  utm_term: [
    { value: 'istochnik', label: 'источник' },
    { value: 'kurs', label: 'курс' },
    { value: 'obuchenie', label: 'обучение' },
    { value: 'besplatno', label: 'бесплатно' },
    { value: 'skidka', label: 'скидка' },
    { value: 'aktsiya', label: 'акция' },
    { value: 'novichok', label: 'новичок' },
    { value: 'professionalny', label: 'профессиональный' },
    { value: 'intensiv', label: 'интенсив' },
    { value: 'marathon', label: 'марафон' }
  ]
};

interface UTMParams {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
}

type LinkType = 'webapp' | 'bot';

export default function UTMGenerator() {
  const [params, setParams] = useState<UTMParams>({
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_content: '',
    utm_term: ''
  });
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<LinkType>('webapp');
  const router = useRouter();

  const baseUrls = {
    webapp: 'https://t.me/istochnik_clubbot/app',
    bot: 'https://sbsite.pro/startupclub_1'
  };

  useEffect(() => {
    // Проверяем авторизацию
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      router.push('/admin');
      return;
    }
  }, [router]);

  useEffect(() => {
    generateUrl();
  }, [params, activeTab]);

  const generateUrl = () => {
    const baseUrl = baseUrls[activeTab];
    
    // Проверяем наличие всех параметров (теперь все обязательные)
    if (!params.utm_source || !params.utm_medium || !params.utm_campaign || !params.utm_content || !params.utm_term) {
      setGeneratedUrl(baseUrl);
      return;
    }

    if (activeTab === 'webapp') {
      // Формируем строку UTM параметров через подчеркивания для WebApp
      const utmParts = [
        params.utm_source,
        params.utm_medium,
        params.utm_campaign,
        params.utm_content,
        params.utm_term
      ];

      const utmString = utmParts.join('_');
      setGeneratedUrl(`${baseUrl}?startapp=${utmString}`);
    } else {
      // Формируем стандартные UTM параметры для BOT
      const urlParams = new URLSearchParams();
      urlParams.append('utm_source', params.utm_source);
      urlParams.append('utm_medium', params.utm_medium);
      urlParams.append('utm_campaign', params.utm_campaign);
      urlParams.append('utm_content', params.utm_content);
      urlParams.append('utm_term', params.utm_term);

      setGeneratedUrl(`${baseUrl}?${urlParams.toString()}`);
    }
  };

  const handleInputChange = (field: keyof UTMParams, value: string) => {
    // Запрещаем подчеркивания в UTM параметрах, так как они используются как разделители
    const cleanValue = value.replace(/_/g, '-');
    setParams(prev => ({ ...prev, [field]: cleanValue }));
  };

  const handlePresetClick = (field: keyof UTMParams, value: string) => {
    handleInputChange(field, value);
  };

  const clearField = (field: keyof UTMParams) => {
    handleInputChange(field, '');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Ошибка копирования:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    router.push('/admin');
  };

  const isValidUrl = params.utm_source && params.utm_medium && params.utm_campaign && params.utm_content && params.utm_term;

  return (
    <div className={styles.utmGenerator}>
      <AdminSidebar />
      
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>UTM-генератор ссылок</h1>
            <p className={styles.subtitle}>Создание ссылок с UTM-метками для Telegram Mini App в формате startapp</p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.baseUrl}>
              <ExternalLink size={16} />
              <span>Базовый URL: {baseUrls[activeTab]}</span>
            </div>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <LogOut size={20} />
              Выйти
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Tabs */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabs}>
            <button
              onClick={() => setActiveTab('webapp')}
              className={`${styles.tab} ${activeTab === 'webapp' ? styles.activeTab : ''}`}
            >
              WebApp
            </button>
            <button
              onClick={() => setActiveTab('bot')}
              className={`${styles.tab} ${activeTab === 'bot' ? styles.activeTab : ''}`}
            >
              BOT
            </button>
          </div>
        </div>

        {/* UTM Parameters Form */}
        <div className={styles.formSection}>
          {/* Все параметры */}
          <div className={styles.parameterGroup}>
            
            {/* UTM Source */}
            <div className={styles.parameterField}>
              <label className={styles.fieldLabel}>
                <span className={styles.labelText}>Источник кампании (utm_source)</span>
                <span className={styles.fieldDescription}>Название рекламной площадки (например: google, vk, telegram)</span>
              </label>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  value={params.utm_source}
                  onChange={(e) => handleInputChange('utm_source', e.target.value)}
                  placeholder="Введите источник или выберите из готовых"
                  className={styles.textInput}
                />
                {params.utm_source && (
                  <button onClick={() => clearField('utm_source')} className={styles.clearBtn}>
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className={styles.presetTags}>
                {presetValues.utm_source.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => handlePresetClick('utm_source', preset.value)}
                    className={`${styles.presetTag} ${params.utm_source === preset.value ? styles.active : ''}`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* UTM Medium */}
            <div className={styles.parameterField}>
              <label className={styles.fieldLabel}>
                <span className={styles.labelText}>Тип трафика (utm_medium)</span>
                <span className={styles.fieldDescription}>Тип рекламы или канала привлечения (например: cpc, email, social)</span>
              </label>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  value={params.utm_medium}
                  onChange={(e) => handleInputChange('utm_medium', e.target.value)}
                  placeholder="Введите тип трафика или выберите из готовых"
                  className={styles.textInput}
                />
                {params.utm_medium && (
                  <button onClick={() => clearField('utm_medium')} className={styles.clearBtn}>
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className={styles.presetTags}>
                {presetValues.utm_medium.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => handlePresetClick('utm_medium', preset.value)}
                    className={`${styles.presetTag} ${params.utm_medium === preset.value ? styles.active : ''}`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* UTM Campaign */}
            <div className={styles.parameterField}>
              <label className={styles.fieldLabel}>
                <span className={styles.labelText}>Название кампании (utm_campaign)</span>
                <span className={styles.fieldDescription}>Уникальное название для идентификации кампании</span>
              </label>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  value={params.utm_campaign}
                  onChange={(e) => handleInputChange('utm_campaign', e.target.value)}
                  placeholder="Введите название кампании или выберите из готовых"
                  className={styles.textInput}
                />
                {params.utm_campaign && (
                  <button onClick={() => clearField('utm_campaign')} className={styles.clearBtn}>
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className={styles.presetTags}>
                {presetValues.utm_campaign.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => handlePresetClick('utm_campaign', preset.value)}
                    className={`${styles.presetTag} ${params.utm_campaign === preset.value ? styles.active : ''}`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* UTM Content */}
            <div className={styles.parameterField}>
              <label className={styles.fieldLabel}>
                <span className={styles.labelText}>Идентификатор объявления (utm_content)</span>
                <span className={styles.fieldDescription}>Дополнительная информация об объявлении или его варианте</span>
              </label>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  value={params.utm_content}
                  onChange={(e) => handleInputChange('utm_content', e.target.value)}
                  placeholder="Введите идентификатор или выберите из готовых"
                  className={styles.textInput}
                />
                {params.utm_content && (
                  <button onClick={() => clearField('utm_content')} className={styles.clearBtn}>
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className={styles.presetTags}>
                {presetValues.utm_content.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => handlePresetClick('utm_content', preset.value)}
                    className={`${styles.presetTag} ${params.utm_content === preset.value ? styles.active : ''}`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* UTM Term */}
            <div className={styles.parameterField}>
              <label className={styles.fieldLabel}>
                <span className={styles.labelText}>Ключевое слово (utm_term)</span>
                <span className={styles.fieldDescription}>Ключевые слова или термины, связанные с рекламой</span>
              </label>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  value={params.utm_term}
                  onChange={(e) => handleInputChange('utm_term', e.target.value)}
                  placeholder="Введите ключевое слово или выберите из готовых"
                  className={styles.textInput}
                />
                {params.utm_term && (
                  <button onClick={() => clearField('utm_term')} className={styles.clearBtn}>
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className={styles.presetTags}>
                {presetValues.utm_term.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => handlePresetClick('utm_term', preset.value)}
                    className={`${styles.presetTag} ${params.utm_term === preset.value ? styles.active : ''}`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Generated URL Section */}
        <div className={styles.resultSection}>
          <div className={styles.sectionHeader}>
            <h2>Сгенерированная ссылка</h2>
            <p>
              {activeTab === 'webapp' 
                ? 'Формат WebApp: https://t.me/istochnik_clubbot/app?startapp=telegram_social_summer-sale_banner-top_kurs'
                : 'Формат BOT: https://sbsite.pro/startupclub_1?utm_source=telegram&utm_medium=social&utm_campaign=summer-sale&utm_content=banner-top&utm_term=kurs'
              }
            </p>
            {!isValidUrl && (
              <p className={styles.warning}>Заполните все поля для генерации ссылки</p>
            )}
          </div>

          <div className={styles.urlContainer}>
            <div className={styles.urlBox}>
              <div className={styles.urlText}>
                {isValidUrl ? generatedUrl : 'Заполните все параметры для генерации ссылки'}
              </div>
              {isValidUrl && (
                <button onClick={copyToClipboard} className={styles.copyBtn}>
                  {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                  {copied ? 'Скопировано!' : 'Копировать'}
                </button>
              )}
            </div>

            {isValidUrl && (
              <div className={styles.urlInfo}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Длина URL:</span>
                  <span className={styles.infoValue}>{generatedUrl.length} символов</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Параметров:</span>
                  <span className={styles.infoValue}>
                    {Object.values(params).filter(value => value.length > 0).length} из 5
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tips Section */}
        <div className={styles.tipsSection}>
          <h3>Советы по использованию UTM-меток</h3>
          <div className={styles.tipsList}>
            <div className={styles.tip}>
              <div className={styles.tipNumber}>1</div>
              <div className={styles.tipContent}>
                <strong>Будьте последовательны:</strong> Используйте одинаковые названия для одних и тех же источников и кампаний
              </div>
            </div>
            <div className={styles.tip}>
              <div className={styles.tipNumber}>2</div>
              <div className={styles.tipContent}>
                <strong>Используйте понятные названия:</strong> Выбирайте названия, которые будут понятны через несколько месяцев
              </div>
            </div>
            <div className={styles.tip}>
              <div className={styles.tipNumber}>3</div>
              <div className={styles.tipContent}>
                <strong>Никаких подчеркиваний:</strong> Подчеркивания запрещены в значениях, так как используются как разделители. Используйте дефисы вместо пробелов
              </div>
            </div>
            <div className={styles.tip}>
              <div className={styles.tipNumber}>4</div>
              <div className={styles.tipContent}>
                <strong>Формат startapp:</strong> UTM-параметры передаются через подчеркивания в порядке: source_medium_campaign_content_term
              </div>
            </div>
            <div className={styles.tip}>
              <div className={styles.tipNumber}>5</div>
              <div className={styles.tipContent}>
                <strong>Отслеживайте результаты:</strong> Регулярно анализируйте эффективность разных источников трафика в вашей аналитике
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
