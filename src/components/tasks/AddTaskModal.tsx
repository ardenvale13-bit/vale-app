import { useState, useEffect } from 'react';
import { categoryConfig, type TaskCategory } from '../../data/categories';
import { useTheme } from '../../theme/ThemeContext';
import { createTask, updateTask } from '../../lib/api';
import type { Task } from '../../utils/taskUtils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskSaved: () => void;
  editingTask?: Task | null;
}

const frequencyOptions = [
  { value: 'daily', label: 'Every day' },
  { value: 'specific_days', label: 'Specific days' },
  { value: 'one_off', label: 'One time only' },
];

const dayOptions = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export function AddTaskModal({ isOpen, onClose, onTaskSaved, editingTask }: TaskModalProps) {
  const { theme } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('daily_rituals');
  const [frequencyType, setFrequencyType] = useState<'daily' | 'specific_days' | 'one_off'>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [reminderTime, setReminderTime] = useState('');
  const [saving, setSaving] = useState(false);

  const isEditing = !!editingTask;

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setCategory(editingTask.category as TaskCategory);
      setFrequencyType(editingTask.frequency.type as 'daily' | 'specific_days' | 'one_off');
      setSelectedDays(editingTask.frequency.days || []);
      setReminderTime(editingTask.reminderTimes?.[0] || '');
    } else {
      setTitle('');
      setDescription('');
      setCategory('daily_rituals');
      setFrequencyType('daily');
      setSelectedDays([]);
      setReminderTime('');
    }
  }, [editingTask, isOpen]);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim() || null,
        category,
        frequency_type: frequencyType,
        frequency_days: frequencyType === 'specific_days' ? selectedDays : null,
        reminder_times: reminderTime ? [reminderTime] : null,
      };

      if (isEditing && editingTask) {
        await updateTask(editingTask.id, taskData);
      } else {
        await createTask({ ...taskData, source: 'user', archived: false });
      }

      setTitle('');
      setDescription('');
      setCategory('daily_rituals');
      setFrequencyType('daily');
      setSelectedDays([]);
      setReminderTime('');
      onTaskSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save task:', err);
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  if (!isOpen) return null;

  // Shared input styles
  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    background: `${theme.bg}cc`, border: `1px solid ${theme.rule}`,
    borderRadius: 10, padding: '12px 16px',
    color: theme.ink, fontFamily: theme.sans, fontSize: 16,
    outline: 'none',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-6"
        style={{
          background: `linear-gradient(135deg, ${theme.bg} 0%, ${theme.bgDeep} 100%)`,
          border: `1px solid ${theme.accent}40`,
          boxShadow: `0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px ${theme.accent}22`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontFamily: theme.serifH, fontSize: 28, fontWeight: 400, fontStyle: 'italic', color: theme.ink }}>
            {isEditing ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            style={{ all: 'unset', cursor: 'pointer', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 999, fontSize: 24, color: theme.inkFaint }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Title */}
          <div>
            <label style={{ fontFamily: theme.sans, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: theme.inkFaint, display: 'block', marginBottom: 6 }}>Title *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="What needs doing?" style={inputStyle} />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontFamily: theme.sans, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: theme.inkFaint, display: 'block', marginBottom: 6 }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Any extra details..." rows={2} style={{ ...inputStyle, resize: 'none' }} />
          </div>

          {/* Category */}
          {(!isEditing || editingTask?.source !== 'lincoln') && (
            <div>
              <label style={{ fontFamily: theme.sans, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: theme.inkFaint, display: 'block', marginBottom: 8 }}>Category</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {Object.entries(categoryConfig)
                  .filter(([key]) => key !== 'lincoln_demands')
                  .map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setCategory(key as TaskCategory)}
                      style={{
                        all: 'unset', cursor: 'pointer',
                        padding: '12px', borderRadius: 10,
                        display: 'flex', alignItems: 'center', gap: 8,
                        fontFamily: theme.sans, fontSize: 14,
                        border: category === key ? `2px solid ${config.color}` : `1px solid ${theme.rule}`,
                        background: category === key ? `${config.color}15` : 'transparent',
                        color: category === key ? config.color : theme.inkSoft,
                        transition: 'all 200ms',
                      }}
                    >
                      <span>{config.icon}</span>
                      <span>{config.label}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Frequency */}
          <div>
            <label style={{ fontFamily: theme.sans, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: theme.inkFaint, display: 'block', marginBottom: 8 }}>How often?</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {frequencyOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFrequencyType(opt.value as typeof frequencyType)}
                  style={{
                    all: 'unset', cursor: 'pointer', flex: 1,
                    padding: '12px 8px', borderRadius: 10, textAlign: 'center',
                    fontFamily: theme.sans, fontSize: 13,
                    border: frequencyType === opt.value ? `1px solid ${theme.accent}80` : `1px solid ${theme.rule}`,
                    background: frequencyType === opt.value ? theme.accentSoft : 'transparent',
                    color: frequencyType === opt.value ? theme.accent : theme.inkSoft,
                    transition: 'all 200ms',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Day selector */}
          {frequencyType === 'specific_days' && (
            <div>
              <label style={{ fontFamily: theme.sans, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: theme.inkFaint, display: 'block', marginBottom: 8 }}>Which days?</label>
              <div style={{ display: 'flex', gap: 4 }}>
                {dayOptions.map(day => (
                  <button
                    key={day.value}
                    onClick={() => toggleDay(day.value)}
                    style={{
                      all: 'unset', cursor: 'pointer', flex: 1,
                      padding: '12px 0', borderRadius: 10, textAlign: 'center',
                      fontFamily: theme.sans, fontSize: 13,
                      border: selectedDays.includes(day.value) ? `1px solid ${theme.accent}80` : `1px solid ${theme.rule}`,
                      background: selectedDays.includes(day.value) ? theme.accentSoft : 'transparent',
                      color: selectedDays.includes(day.value) ? theme.accent : theme.inkSoft,
                      transition: 'all 200ms',
                    }}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reminder time */}
          <div>
            <label style={{ fontFamily: theme.sans, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: theme.inkFaint, display: 'block', marginBottom: 6 }}>Reminder time</label>
            <input type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }} />
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!title.trim() || saving}
          style={{
            all: 'unset', cursor: !title.trim() || saving ? 'not-allowed' : 'pointer',
            display: 'block', width: '100%', boxSizing: 'border-box',
            marginTop: 24, padding: '16px 0', borderRadius: 14, textAlign: 'center',
            fontFamily: theme.serifH, fontSize: 18, fontStyle: 'italic',
            background: !title.trim() || saving ? theme.rule : theme.accentSoft,
            border: `1px solid ${!title.trim() || saving ? theme.rule : theme.accent}`,
            color: !title.trim() || saving ? theme.inkFaint : theme.accent,
            opacity: !title.trim() || saving ? 0.5 : 1,
            transition: 'all 300ms',
          }}
        >
          {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Task')}
        </button>
      </div>
    </div>
  );
}
