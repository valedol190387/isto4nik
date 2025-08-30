'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, X, ExternalLink, Tag, Folder, ChevronDown, ChevronRight, Video, Link, Copy } from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { createMaterialShareLink, copyLinkToClipboard } from '@/lib/adminLinks';
import styles from './page.module.css';

interface Material {
  id: string;
  title: string;
  description: string;
  url: string;
  group: string;                     // Обязательное поле: группа материала  
  section_key: string;
  tags: string[];
  is_active: boolean;
  display_order: number;
  is_embedded_video: boolean;        // Новое поле: галочка "встроенное видео"
  video_embed_code: string | null;   // Новое поле: код для вставки видео из Kinescope
  pic_url: string | null;            // Новое поле: URL изображения для превью  
  created_at: string;
  updated_at: string;
}

interface MaterialForm {
  title: string;
  description: string;
  url: string;
  group: string;                     // Обязательное поле: группа материала
  section_key: string;
  tags: string[];
  is_active: boolean;
  display_order: number;
  is_embedded_video: boolean;        // Новое поле: галочка "встроенное видео"
  video_embed_code: string;          // Новое поле: код для вставки видео из Kinescope
  pic_url: string;                   // Новое поле: URL изображения для превью
}

const initialForm: MaterialForm = {
  title: '',
  description: '',
  url: '',
  group: 'Общие материалы',          // Дефолтная группа
  section_key: 'materials',
  tags: [],
  is_active: true,
  display_order: 1,
  is_embedded_video: false,          // По умолчанию обычная ссылка
  video_embed_code: '',              // Пустой код видео
  pic_url: ''                        // URL изображения для превью
};

// Доступные разделы - ОБНОВЛЕННЫЕ под новую структуру
const sectionOptions = [
  { value: 'materials', label: 'Мини-курсы' },
  { value: 'dialogs', label: 'Диалоги' },
  { value: 'questions', label: 'Решаем запросы' },
  { value: 'speeches', label: 'Разговор у источника' },
  { value: 'opinion', label: 'Мнение' }
];

// Предустановленные теги - ВРЕМЕННО ОБНОВЛЕННЫЕ
const predefinedTags = [
  'Терапия души',
  'Диагностика',
  'Мировоззрение',
  'Гештальт',
  'Супервизия',
  'Групповая терапия',
  'Семинары',
  'Вебинары',
  'Самотерапия',
  'Эффективность'
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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['materials']));
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});
  const [linkCopiedFor, setLinkCopiedFor] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
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
      const materialData = editingMaterial 
        ? { 
            ...form, 
            id: editingMaterial.id,
            oldPicUrl: editingMaterial.pic_url // Для удаления старого изображения
          } 
        : form;

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
      group: material.group,
      section_key: material.section_key,
      tags: material.tags,
      is_active: material.is_active,
      display_order: material.display_order,
      is_embedded_video: material.is_embedded_video,
      video_embed_code: material.video_embed_code || '',
      pic_url: material.pic_url || ''
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('promopic', file);

      const response = await fetch('/api/upload/promopic', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setForm({ ...form, pic_url: data.imageUrl });
      } else {
        alert(`Ошибка загрузки: ${data.message}`);
      }
    } catch (error) {
      console.error('Error uploading promo image:', error);
      alert('Ошибка загрузки файла');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCopyLink = async (materialId: string, title: string) => {
    try {
      const link = createMaterialShareLink(materialId);
      const success = await copyLinkToClipboard(link);
      
      if (success) {
        setLinkCopiedFor(materialId);
        console.log(`✅ Ссылка на материал "${title}" скопирована:`, link);
        
        // Скрываем уведомление через 2 секунды
        setTimeout(() => {
          setLinkCopiedFor(null);
        }, 2000);
      } else {
        // Показываем ссылку в alert если копирование не удалось
        alert(`Ссылка на материал:\n${link}\n\nСкопируйте вручную.`);
      }
    } catch (error) {
      console.error('Error copying material link:', error);
      alert('Ошибка при создании ссылки');
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
                                  {material.pic_url && (
                                    <div className={styles.materialImage}>
                                      <img 
                                        src={material.pic_url} 
                                        alt={material.title}
                                        className={styles.materialPreviewImage}
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  )}
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
                                  onClick={() => handleCopyLink(material.id, material.title)}
                                  className={`${styles.linkBtn} ${linkCopiedFor === material.id ? styles.linkBtnSuccess : ''}`}
                                  title={linkCopiedFor === material.id ? 'Ссылка скопирована!' : 'Скопировать ссылку на материал'}
                                >
                                  {linkCopiedFor === material.id ? <Copy size={16} /> : <Link size={16} />}
                                </button>
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
                      // Не очищаем поля - позволяем иметь и видео, и ссылку
                      video_embed_code: e.target.checked ? form.video_embed_code : ''
                    })}
                  />
                  <span className={styles.checkboxText}>Встроенное видео (Kinescope)</span>
                </label>
                <p className={styles.fieldHint}>
                  Если включено, на странице материала будет отображаться встроенное видео дополнительно к ссылке
                </p>
              </div>

              <div className={styles.formRow}>
                {/* Поле для ссылки - показывается всегда */}
                <div className={styles.formGroup}>
                  <label>Ссылка на материал</label>
                  <input
                    type="url"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="https://example.com"
                    required
                  />
                  <p className={styles.fieldHint}>
                    Ссылка для кнопки "Перейти к материалу"
                  </p>
                </div>
              </div>

              {/* Поле для кода видео - показывается только при включенной галочке */}
              {form.is_embedded_video && (
                <div className={styles.formRow}>
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
                </div>
              )}

              <div className={styles.formGroup}>
                <label>Изображение для превью</label>
                <div className={styles.imageUploadContainer}>
                  {form.pic_url && (
                    <div className={styles.currentImage}>
                      <img 
                        src={form.pic_url} 
                        alt="Текущее изображение"
                        className={styles.currentImagePreview}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, pic_url: '' })}
                        className={styles.removeImageBtn}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className={styles.fileInput}
                  />
                  {uploadingImage && (
                    <p className={styles.uploadingText}>Загрузка изображения...</p>
                  )}
                </div>
                <p className={styles.fieldHint}>
                  Загрузите изображение для превью материала (соотношение 2:1). Форматы: JPEG, PNG, WebP. Максимум 5MB.
                </p>
              </div>

              <div className={styles.formRow}>
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