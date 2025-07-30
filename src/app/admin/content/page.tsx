'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, X, ExternalLink, Tag, Folder } from 'lucide-react';
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
}

const initialForm: MaterialForm = {
  title: '',
  description: '',
  url: '',
  section_key: 'workouts',
  tags: [],
  is_active: true,
  display_order: 1
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
  const router = useRouter();

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
      display_order: material.display_order
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

  return (
    <div className={styles.adminLayout}>
      <AdminSidebar />
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.title}>Управление контентом</h1>
              <p className={styles.subtitle}>Материалы, методички и обучающие ресурсы</p>
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
          ) : materials.length === 0 ? (
            <div className={styles.emptyState}>
              <Folder size={48} />
              <h3>Нет материалов</h3>
              <p>Создайте первый материал для контента</p>
            </div>
          ) : (
            <div className={styles.materialsList}>
              {materials.map((material) => (
                <div key={material.id} className={styles.materialCard}>
                  <div className={styles.materialHeader}>
                    <div className={styles.materialInfo}>
                      <h3 className={styles.materialTitle}>{material.title}</h3>
                      <p className={styles.materialDescription}>{material.description}</p>
                      <div className={styles.materialMeta}>
                        <div className={styles.materialSection}>
                          <Folder size={14} />
                          {getSectionName(material.section_key)}
                        </div>
                        {material.url && (
                          <a href={material.url} target="_blank" rel="noopener noreferrer" className={styles.materialLink}>
                            <ExternalLink size={14} />
                            Ссылка
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

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Ссылка</label>
                  <input
                    type="url"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
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