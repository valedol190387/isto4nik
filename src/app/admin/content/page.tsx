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
  section_key: 'workouts',
  tags: [],
  is_active: true,
  display_order: 1,
  is_embedded_video: false,          // По умолчанию обычная ссылка
  video_embed_code: ''               // Пустой код видео
};

// Доступные разделы
const sectionOptions = [
  { value: 'workouts', label: 'Тренировки' },
  { value: 'guides', label: 'Методички' },
  { value: 'motivation', label: 'Мотивация' },
  { value: 'nutrition', label: 'Питание' },
  { value: 'livestreams', label: 'Прямые эфиры' }
];

// Предустановленные теги
const predefinedTags = [
  'утро', 'зарядка', 'энергия', 'йога', 'релакс', 'гибкость',
  'кардио', 'похудение', 'интенсив', 'силовые', 'пресс', 'ноги',
  'руки', 'спина', 'растяжка', 'медитация', 'дыхание', 'мотивация',
  'здоровье', 'красота', 'питание', 'рецепты', 'детокс', 'витамины'
];

export default function AdminContent() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [form, setForm] = useState<MaterialForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['workouts']));
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

  const addTag = (tag: string) => {
    if (tag && !form.tags.includes(tag)) {
      setForm({ ...form, tags: [...form.tags, tag] });
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setForm({ ...form, tags: form.tags.filter(tag => tag !== tagToRemove) });
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
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
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
              onClick={() => {
                setEditingMaterial(null);
                setForm(initialForm);
                setShowForm(true);
              }}
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
                <label>Описание</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Краткое описание материала"
                  rows={3}
                />
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
                    onChange={(e) => setForm({ ...form, section_key: e.target.value })}
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