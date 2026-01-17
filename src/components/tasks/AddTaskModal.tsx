import { useState, useEffect } from 'react';
import { categoryConfig, type TaskCategory } from '../../data/categories';
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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('daily_rituals');
  const [frequencyType, setFrequencyType] = useState<'daily' | 'specific_days' | 'one_off'>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [reminderTime, setReminderTime] = useState('');
  const [saving, setSaving] = useState(false);

  const isEditing = !!editingTask;

  // Populate form when editing
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setCategory(editingTask.category as TaskCategory);
      setFrequencyType(editingTask.frequency.type as 'daily' | 'specific_days' | 'one_off');
      setSelectedDays(editingTask.frequency.days || []);
      setReminderTime(editingTask.reminderTimes?.[0] || '');
    } else {
      // Reset form for new task
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
        await createTask({
          ...taskData,
          source: 'user',
          archived: false,
        });
      }
      
      // Reset form
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
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-6"
        style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #1a0a2e 50%, #0d1f3c 100%)',
          border: '1px solid rgba(183, 148, 246, 0.3)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 
            className="text-2xl font-bold"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              color: '#f0f4ff',
            }}
          >
            {isEditing ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-purple-300/60 hover:text-purple-200 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs text-purple-300/50 block mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs doing?"
              className="w-full bg-gray-800/50 border border-purple-500/30 rounded-lg px-3 py-2 text-purple-200 text-sm focus:outline-none focus:border-purple-400 placeholder:text-purple-300/30"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-purple-300/50 block mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any extra details..."
              rows={2}
              className="w-full bg-gray-800/50 border border-purple-500/30 rounded-lg px-3 py-2 text-purple-200 text-sm focus:outline-none focus:border-purple-400 placeholder:text-purple-300/30 resize-none"
            />
          </div>

          {/* Category - only show if not editing a Lincoln task */}
          {(!isEditing || editingTask?.source !== 'lincoln') && (
            <div>
              <label className="text-xs text-purple-300/50 block mb-1">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(categoryConfig)
                  .filter(([key]) => key !== 'lincoln_demands')
                  .map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setCategory(key as TaskCategory)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium text-left flex items-center gap-2 transition-all ${
                        category === key
                          ? 'border-2'
                          : 'border border-transparent bg-gray-800/30'
                      }`}
                      style={{
                        borderColor: category === key ? config.color : 'transparent',
                        backgroundColor: category === key ? `${config.color}15` : undefined,
                        color: category === key ? config.color : 'rgba(183, 148, 246, 0.6)',
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
            <label className="text-xs text-purple-300/50 block mb-1">How often?</label>
            <div className="flex gap-2">
              {frequencyOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFrequencyType(opt.value as typeof frequencyType)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    frequencyType === opt.value
                      ? 'bg-purple-500/30 border border-purple-400/50 text-purple-200'
                      : 'bg-gray-800/30 border border-transparent text-purple-300/60'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Day selector (only for specific_days) */}
          {frequencyType === 'specific_days' && (
            <div>
              <label className="text-xs text-purple-300/50 block mb-1">Which days?</label>
              <div className="flex gap-1">
                {dayOptions.map(day => (
                  <button
                    key={day.value}
                    onClick={() => toggleDay(day.value)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                      selectedDays.includes(day.value)
                        ? 'bg-purple-500/40 border border-purple-400/50 text-purple-200'
                        : 'bg-gray-800/30 border border-transparent text-purple-300/60'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reminder time */}
          <div>
            <label className="text-xs text-purple-300/50 block mb-1">Reminder time (optional)</label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full bg-gray-800/50 border border-purple-500/30 rounded-lg px-3 py-2 text-purple-200 text-sm focus:outline-none focus:border-purple-400"
            />
          </div>
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!title.trim() || saving}
          className={`w-full mt-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            !title.trim() || saving
              ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
              : 'bg-purple-600/40 border border-purple-500/50 text-purple-200 hover:bg-purple-600/50'
          }`}
        >
          {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Task')}
        </button>
      </div>
    </div>
  );
}
