'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, X, ExternalLink, Tag, Folder, ChevronDown, ChevronRight, Video } from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import styles from './page.module.css';

interface Material {
  id: string;
  title: string;
  description: string;
  url: string;
  section_key: string;
  tags: string[];
  is_active: boolean;
  display_order: number;
  is_embedded_video: boolean;        // Новое поле: галочка "встроенное видео"
  video_embed_code: string | null;   // Новое поле: код для вставки видео из Kinescope
  created_at: string;
  updated_at: string;
}

interface MaterialForm {
  title: string;
  description: string;
  url: string;
  section_key: string;
  tags: string[];
  is_active: boolean;
  display_order: number;
  is_embedded_video: boolean;        // Новое поле: галочка "встроенное видео"
  video_embed_code: string;          // Новое поле: код для вставки видео из Kinescope
}

const initialForm: MaterialForm = {
  title: '',
  description: '',
  url: '',
  section_key: 'course_flat_belly',
  tags: [],
  is_active: true,
  display_order: 1,
  is_embedded_video: false,          // По умолчанию обычная ссылка
  video_embed_code: ''               // Пустой код видео
};

// Доступные разделы
const sectionOptions = [
  { value: 'course_flat_belly', label: 'Курс: Плоский живот' },
  { value: 'course_anti_swelling', label: 'Курс: Отёки' },
  { value: 'course_bloom', label: 'Курс: Расцветай' },
  { value: 'useful', label: 'Рельеф и гибкость' },
  { value: 'workouts', label: 'Для лица' },
  { value: 'guides', label: 'Стопы' },
  { value: 'motivation', label: 'BodyFlow' },
  { value: 'nutrition', label: 'Осанка' }
];

// Предустановленные теги
const predefinedTags = [
  'плоский живот', 'пресс', 'похудение', 'отеки', 'лимфодренаж', 'детокс',
  'расцветай', 'красота', 'уверенность', 'здоровье', 'советы',
  'рельеф', 'гибкость', 'тонус', 'укрепление',
  'для лица', 'лицо', 'массаж лица', 'фейсбилдинг', 'омоложение',
  'стопы', 'ноги', 'плоскостопие', 'профилактика', 'здоровье ног',
  'bodyflow', 'мобильность', 'движение', 'плавность', 'поток',
  'осанка', 'спина', 'позвоночник', 'выравнивание', 'правильная осанка',
  'утро', 'зарядка', 'энергия', 'йога', 'релакс', 
  'кардио', 'интенсив', 'силовые', 'руки', 
  'растяжка', 'медитация', 'дыхание'
];

export default function AdminContent() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [form, setForm] = useState<MaterialForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['course_flat_belly']));
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});
  const router = useRouter();

  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    // Проверяем авторизацию
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      router.push('/admin');
      return;
    }

    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/admin/materials');
      const data = await response.json();
      
      if (data.success) {
        setMaterials(data.materials);
      } else {
        console.error('Failed to fetch materials:', data.message);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const method = editingMaterial ? 'PUT' : 'POST';
      const materialData = editingMaterial ? { ...form, id: editingMaterial.id } : form;

      const response = await fetch('/api/admin/materials', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(materialData),
      });

      const data = await response.json();

      if (data.success) {
        await fetchMaterials();
        setShowForm(false);
        setEditingMaterial(null);
        setForm(initialForm);
      } else {
        console.error('Error saving material:', data.message);
        alert(`Ошибка при сохранении материала: ${data.message}`);
      }
    } catch (error) {
      console.error('Error saving material:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setForm({
      title: material.title,
      description: material.description,
      url: material.url,
      section_key: material.section_key,
      tags: material.tags,
      is_active: material.is_active,
      display_order: material.display_order,
      is_embedded_video: material.is_embedded_video,
      video_embed_code: material.video_embed_code || ''
    });
    setShowPreview(false);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот материал?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/materials?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchMaterials();
      } else {
        console.error('Error deleting material:', data.message);
      }
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  };

  const getNextDisplayOrder = (sectionKey: string) => {
    const sectionMaterials = materials.filter(material => material.section_key === sectionKey);
    if (sectionMaterials.length === 0) return 1;
    
    // Получаем все существующие display_order и находим первый свободный номер
    const existingOrders = sectionMaterials
      .map(material => material.display_order)
      .sort((a, b) => a - b);
    
    // Ищем первый пропуск в последовательности
    for (let i = 1; i <= existingOrders.length + 1; i++) {
      if (!existingOrders.includes(i)) {
        return i;
      }
    }
    
    // Если пропусков нет, возвращаем следующий номер
    return Math.max(...existingOrders) + 1;
  };

  const handleAddNew = () => {
    setEditingMaterial(null);
    setForm({
      ...initialForm,
      display_order: getNextDisplayOrder(initialForm.section_key)
    });
    setShowPreview(false);
    setShowForm(true);
  };

  const addTag = (tag: string) => {
    if (tag && !form.tags.includes(tag)) {
      setForm({ ...form, tags: [...form.tags, tag] });
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setForm({ ...form, tags: form.tags.filter(tag => tag !== tagToRemove) });
  };

  // Функция для вставки HTML тегов
  const insertHtmlTag = (tag: string, hasClosingTag: boolean = true) => {
    const textarea = document.querySelector('textarea[placeholder*="HTML форматирование"]') as HTMLTextAreaElement;
    if (!textarea) return;

    // Сохраняем текущую позицию скролла
    const scrollTop = textarea.scrollTop;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = form.description.substring(start, end);
    
    let insertText;
    if (hasClosingTag) {
      const tagName = tag.split(' ')[0]; // Для тегов с атрибутами берем только имя тега
      insertText = selectedText 
        ? `<${tag}>${selectedText}</${tagName}>`
        : `<${tag}></${tagName}>`;
    } else {
      insertText = `<${tag}>`;
    }
    
    const newDescription = form.description.substring(0, start) + insertText + form.description.substring(end);
    setForm({ ...form, description: newDescription });
    
    // Устанавливаем курсор в правильное место без изменения скролла
    requestAnimationFrame(() => {
      textarea.focus({ preventScroll: true });
      
      if (hasClosingTag && !selectedText) {
        const newPosition = start + tag.length + 2; // После открывающего тега
        textarea.setSelectionRange(newPosition, newPosition);
      } else if (selectedText) {
        // Если был выделенный текст, ставим курсор после закрывающего тега
        const newPosition = start + insertText.length;
        textarea.setSelectionRange(newPosition, newPosition);
      }
      
      // Восстанавливаем позицию скролла
      textarea.scrollTop = scrollTop;
    });
  };

  const getSectionName = (sectionKey: string) => {
    const section = sectionOptions.find(s => s.value === sectionKey);
    return section ? section.label : sectionKey;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Группировка материалов по разделам
  const groupedMaterials = sectionOptions.reduce((acc, section) => {
    const sectionMaterials = materials
      .filter(material => material.section_key === section.value)
      .sort((a, b) => a.display_order - b.display_order);
    
    acc[section.value] = {
      section,
      materials: sectionMaterials,
      total: sectionMaterials.length
    };
    
    return acc;
  }, {} as Record<string, { section: typeof sectionOptions[0], materials: Material[], total: number }>);

  // Инициализация видимых элементов
  useEffect(() => {
    const initialCounts: Record<string, number> = {};
    Object.keys(groupedMaterials).forEach(sectionKey => {
      initialCounts[sectionKey] = Math.min(ITEMS_PER_PAGE, groupedMaterials[sectionKey].total);
    });
    setVisibleCounts(initialCounts);
  }, [materials]);

  const toggleSection = (sectionKey: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionKey)) {
      newExpanded.delete(sectionKey);
    } else {
      newExpanded.add(sectionKey);
    }
    setExpandedSections(newExpanded);
  };

  const showMore = (sectionKey: string) => {
    setVisibleCounts(prev => ({
      ...prev,
      [sectionKey]: prev[sectionKey] + ITEMS_PER_PAGE
    }));
  };

  const getTotalMaterials = () => {
    return Object.values(groupedMaterials).reduce((sum, group) => sum + group.total, 0);
  };

  return (
    <div className={styles.adminLayout}>
      <AdminSidebar />
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.title}>Управление контентом</h1>
              <p className={styles.subtitle}>
                {getTotalMaterials()} материалов в {Object.keys(groupedMaterials).filter(key => groupedMaterials[key].total > 0).length} разделах
              </p>
            </div>
            <button
              onClick={handleAddNew}
              className={styles.addBtn}
            >
              <Plus size={20} />
              Добавить материал
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>Загрузка материалов...</div>
          ) : getTotalMaterials() === 0 ? (
            <div className={styles.emptyState}>
              <Folder size={48} />
              <h3>Нет материалов</h3>
              <p>Создайте первый материал для контента</p>
            </div>
          ) : (
            <div className={styles.sectionsContainer}>
              {Object.entries(groupedMaterials).map(([sectionKey, group]) => {
                if (group.total === 0) return null;
                
                const isExpanded = expandedSections.has(sectionKey);
                const visibleCount = visibleCounts[sectionKey] || ITEMS_PER_PAGE;
                const visibleMaterials = group.materials.slice(0, visibleCount);
                const hasMore = visibleCount < group.total;

                return (
                  <div key={sectionKey} className={styles.sectionGroup}>
                    <div 
                      className={styles.sectionHeader}
                      onClick={() => toggleSection(sectionKey)}
                    >
                      <div className={styles.sectionInfo}>
                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        <Folder size={20} />
                        <h3 className={styles.sectionTitle}>{group.section.label}</h3>
                        <span className={styles.sectionCount}>({group.total})</span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className={styles.sectionContent}>
                        <div className={styles.materialsList}>
                          {visibleMaterials.map((material) => (
                            <div key={material.id} className={styles.materialCard}>
                              <div className={styles.materialHeader}>
                                <div className={styles.materialInfo}>
                                  <h3 className={styles.materialTitle}>{material.title}</h3>
                                  <p className={styles.materialDescription}>{material.description}</p>
                                  <div className={styles.materialMeta}>
                                    <div className={styles.materialDate}>
                                      Добавлено {formatDate(material.created_at)}
                                    </div>
                                    {material.is_embedded_video ? (
                                      <div className={styles.materialType}>
                                        <Video size={14} />
                                        Встроенное видео
                                      </div>
                                    ) : material.url && (
                                      <a href={material.url} target="_blank" rel="noopener noreferrer" className={styles.materialLink}>
                                        <ExternalLink size={14} />
                                        Внешняя ссылка
                                      </a>
                                    )}
                                  </div>
                                  <div className={styles.materialTags}>
                                    {material.tags && material.tags.map((tag, index) => (
                                      <span key={index} className={styles.materialTag}>
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className={styles.materialActions}>
                                <button
                                  onClick={() => handleEdit(material)}
                                  className={styles.editBtn}
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(material.id)}
                                  className={styles.deleteBtn}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {hasMore && (
                          <div className={styles.showMoreContainer}>
                            <button
                              onClick={() => showMore(sectionKey)}
                              className={styles.showMoreBtn}
                            >
                              Показать еще ({group.total - visibleCount})
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingMaterial ? 'Редактировать материал' : 'Новый материал'}</h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingMaterial(null);
                  setForm(initialForm);
                }}
                className={styles.closeBtn}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Название</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    placeholder="Введите название материала"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <div className={styles.descriptionHeader}>
                  <label>Описание</label>
                  <div className={styles.previewToggle}>
                    <button 
                      type="button"
                      onClick={() => setShowPreview(false)}
                      className={`${styles.toggleButton} ${!showPreview ? styles.active : ''}`}
                    >
                      Редактирование
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowPreview(true)}
                      className={`${styles.toggleButton} ${showPreview ? styles.active : ''}`}
                    >
                      Предпросмотр
                    </button>
                  </div>
                </div>

                {!showPreview ? (
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Описание материала (поддерживается HTML форматирование)"
                    rows={6}
                  />
                ) : (
                  <div className={styles.preview}>
                    <div 
                      className={styles.previewContent}
                      dangerouslySetInnerHTML={{ __html: form.description.replace(/\n/g, '<br />') }}
                    />
                  </div>
                )}

                <div className={styles.htmlHint}>
                  <p className={styles.hintTitle}>Быстрая вставка HTML тегов:</p>
                  <div className={styles.htmlButtons}>
                    <button 
                      type="button" 
                      onClick={(e) => { e.preventDefault(); insertHtmlTag('b'); }} 
                      className={styles.htmlButton}
                    >
                      <strong>B</strong>
                    </button>
                    <button 
                      type="button" 
                      onClick={(e) => { e.preventDefault(); insertHtmlTag('i'); }} 
                      className={styles.htmlButton}
                    >
                      <em>I</em>
                    </button>
                    <button 
                      type="button" 
                      onClick={(e) => { e.preventDefault(); insertHtmlTag('u'); }} 
                      className={styles.htmlButton}
                    >
                      <u>U</u>
                    </button>
                    <button 
                      type="button" 
                      onClick={(e) => { e.preventDefault(); insertHtmlTag('h3'); }} 
                      className={styles.htmlButton}
                    >
                      H3
                    </button>
                    <button 
                      type="button" 
                      onClick={(e) => { e.preventDefault(); insertHtmlTag('p'); }} 
                      className={styles.htmlButton}
                    >
                      ¶
                    </button>
                    <button 
                      type="button" 
                      onClick={(e) => { e.preventDefault(); insertHtmlTag('br', false); }} 
                      className={styles.htmlButton}
                    >
                      ↵
                    </button>
                  </div>
                  <div className={styles.htmlTags}>
                    <span className={styles.htmlTag}>&lt;b&gt;жирный&lt;/b&gt;</span>
                    <span className={styles.htmlTag}>&lt;i&gt;курсив&lt;/i&gt;</span>
                    <span className={styles.htmlTag}>&lt;u&gt;подчеркнутый&lt;/u&gt;</span>
                    <span className={styles.htmlTag}>&lt;h3&gt;заголовок&lt;/h3&gt;</span>
                    <span className={styles.htmlTag}>&lt;p&gt;абзац&lt;/p&gt;</span>
                    <span className={styles.htmlTag}>&lt;br&gt; - перенос</span>
                    <span className={styles.htmlTag}>&lt;ul&gt;&lt;li&gt;список&lt;/li&gt;&lt;/ul&gt;</span>
                    <span className={styles.htmlTag}>&lt;a href=""&gt;ссылка&lt;/a&gt;</span>
                  </div>
                </div>
              </div>

              {/* Галочка для встроенного видео */}
              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.is_embedded_video}
                    onChange={(e) => setForm({ 
                      ...form, 
                      is_embedded_video: e.target.checked,
                      // Очищаем поля при переключении типа
                      url: e.target.checked ? '' : form.url,
                      video_embed_code: e.target.checked ? form.video_embed_code : ''
                    })}
                  />
                  <span className={styles.checkboxText}>Встроенное видео (Kinescope)</span>
                </label>
                <p className={styles.fieldHint}>
                  Если включено, материал будет открываться на отдельной странице с встроенным видео
                </p>
              </div>

              <div className={styles.formRow}>
                {/* Поле для ссылки ИЛИ кода видео в зависимости от типа */}
                {!form.is_embedded_video ? (
                  <div className={styles.formGroup}>
                    <label>Ссылка</label>
                    <input
                      type="url"
                      value={form.url}
                      onChange={(e) => setForm({ ...form, url: e.target.value })}
                      placeholder="https://example.com"
                      required
                    />
                  </div>
                ) : (
                  <div className={styles.formGroup}>
                    <label>Код видео Kinescope</label>
                    <textarea
                      value={form.video_embed_code}
                      onChange={(e) => setForm({ ...form, video_embed_code: e.target.value })}
                      placeholder='<div style="position: relative; padding-top: 56.25%; width: 100%"><iframe src="https://kinescope.io/embed/m5TDJj9zPbifV2HQfY8Kxc" allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; screen-wake-lock;" frameborder="0" allowfullscreen style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;"></iframe></div>'
                      rows={6}
                      required
                    />
                    <p className={styles.fieldHint}>
                      Вставьте полный HTML код для встраивания видео из Kinescope
                    </p>
                  </div>
                )}
                
                <div className={styles.formGroup}>
                  <label>Раздел</label>
                  <select
                    value={form.section_key}
                    onChange={(e) => {
                      const newSectionKey = e.target.value;
                      setForm({ 
                        ...form, 
                        section_key: newSectionKey,
                        display_order: editingMaterial ? form.display_order : getNextDisplayOrder(newSectionKey)
                      });
                    }}
                    required
                  >
                    {sectionOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Теги</label>
                <div className={styles.tagsContainer}>
                  <div className={styles.selectedTags}>
                    {form.tags.map((tag, index) => (
                      <span key={index} className={styles.selectedTag}>
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className={styles.removeTagBtn}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  
                  <div className={styles.tagInput}>
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Добавить тег"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag(newTag);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => addTag(newTag)}
                      className={styles.addTagBtn}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className={styles.predefinedTags}>
                    {predefinedTags.filter(tag => !form.tags.includes(tag)).slice(0, 8).map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        className={styles.tagButton}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Порядок отображения</label>
                  <input
                    type="number"
                    min="1"
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    />
                    Активный материал
                  </label>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingMaterial(null);
                    setForm(initialForm);
                  }}
                  className={styles.cancelBtn}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={styles.saveBtn}
                >
                  {saving ? 'Сохранение...' : editingMaterial ? 'Обновить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 