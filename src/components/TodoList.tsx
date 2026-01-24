import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  ChevronUp, 
  ChevronDown,
  Calendar,
  Clock,
  Loader2,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  dueDate?: string;
  duration?: number; // minutes
  createdAt: string;
}

interface TodoListProps {
  roadmapId?: string;
  onGenerateAITasks?: () => void;
}

const PRIORITY_COLORS = {
  low: 'border-l-green-500 bg-green-500/5',
  medium: 'border-l-yellow-500 bg-yellow-500/5',
  high: 'border-l-red-500 bg-red-500/5',
};

const PRIORITY_LABELS = {
  low: 'Thấp',
  medium: 'TB',
  high: 'Cao',
};

const DURATION_OPTIONS = [
  { value: 15, label: '15 phút' },
  { value: 30, label: '30 phút' },
  { value: 45, label: '45 phút' },
  { value: 60, label: '1 giờ' },
  { value: 90, label: '1.5 giờ' },
  { value: 120, label: '2 giờ' },
];

// AI suggested tasks for new users
const AI_SUGGESTED_TASKS: Omit<Task, 'id' | 'createdAt'>[] = [
  { text: 'Học 10 từ vựng tiếng Anh mới', completed: false, priority: 'medium', duration: 30 },
  { text: 'Đọc 1 bài viết về ngành nghề yêu thích', completed: false, priority: 'low', duration: 20 },
  { text: 'Hoàn thành bài tập về nhà', completed: false, priority: 'high', duration: 60 },
  { text: 'Xem video hướng dẫn kỹ năng mới', completed: false, priority: 'medium', duration: 45 },
  { text: 'Ghi chép những điều đã học được hôm nay', completed: false, priority: 'low', duration: 15 },
];

export const TodoList: React.FC<TodoListProps> = ({ roadmapId }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editDuration, setEditDuration] = useState<number | undefined>();
  const [newTask, setNewTask] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDuration, setNewDuration] = useState<number>(30);
  const [newDueDate, setNewDueDate] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user, roadmapId]);

  const loadTasks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let query = supabase
        .from('todo_lists')
        .select('*')
        .eq('user_id', user.id);
      
      if (roadmapId) {
        query = query.eq('roadmap_id', roadmapId);
      } else {
        query = query.is('roadmap_id', null);
      }

      const { data, error } = await query.maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data?.tasks) {
        setTasks(data.tasks as unknown as Task[]);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Lỗi tải danh sách công việc');
    } finally {
      setLoading(false);
    }
  };

  const saveTasks = async (newTasks: Task[]) => {
    if (!user) return;
    setSaving(true);
    try {
      let query = supabase
        .from('todo_lists')
        .select('id')
        .eq('user_id', user.id);
      
      if (roadmapId) {
        query = query.eq('roadmap_id', roadmapId);
      } else {
        query = query.is('roadmap_id', null);
      }
      
      const { data: existing } = await query.maybeSingle();

      if (existing) {
        await supabase
          .from('todo_lists')
          .update({ tasks: newTasks as any })
          .eq('id', existing.id);
      } else {
        await supabase.from('todo_lists').insert({
          user_id: user.id,
          roadmap_id: roadmapId || null,
          tasks: newTasks as any,
        });
      }
      setTasks(newTasks);
    } catch (error) {
      console.error('Error saving tasks:', error);
      toast.error('Lỗi lưu danh sách công việc');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    
    const task: Task = {
      id: `task-${Date.now()}`,
      text: newTask.trim(),
      completed: false,
      priority: newPriority,
      duration: newDuration,
      dueDate: newDueDate || selectedDate,
      createdAt: new Date().toISOString(),
    };

    saveTasks([task, ...tasks]);
    setNewTask('');
    setNewDueDate('');
    toast.success('Đã thêm công việc');
  };

  const handleGenerateAITasks = () => {
    const aiTasks: Task[] = AI_SUGGESTED_TASKS.map((t, idx) => ({
      ...t,
      id: `ai-task-${Date.now()}-${idx}`,
      dueDate: selectedDate,
      createdAt: new Date().toISOString(),
    }));
    saveTasks([...aiTasks, ...tasks]);
    toast.success('AI đã tạo công việc gợi ý cho bạn!');
  };

  const handleToggle = (id: string) => {
    const updated = tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveTasks(updated);
  };

  const handleDelete = (id: string) => {
    saveTasks(tasks.filter(t => t.id !== id));
    toast.success('Đã xóa công việc');
  };

  const handleStartEdit = (task: Task) => {
    setEditingId(task.id);
    setEditValue(task.text);
    setEditDuration(task.duration);
  };

  const handleSaveEdit = (id: string) => {
    if (!editValue.trim()) return;
    const updated = tasks.map(t => 
      t.id === id ? { ...t, text: editValue.trim(), duration: editDuration } : t
    );
    saveTasks(updated);
    setEditingId(null);
    setEditValue('');
    setEditDuration(undefined);
  };

  const handleMove = (id: string, direction: 'up' | 'down') => {
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return;
    
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= tasks.length) return;
    
    const newTasks = [...tasks];
    [newTasks[idx], newTasks[newIdx]] = [newTasks[newIdx], newTasks[idx]];
    saveTasks(newTasks);
  };

  const handlePriorityChange = (id: string, priority: 'low' | 'medium' | 'high') => {
    const updated = tasks.map(t => 
      t.id === id ? { ...t, priority } : t
    );
    saveTasks(updated);
  };

  const handleDurationChange = (id: string, duration: number) => {
    const updated = tasks.map(t => 
      t.id === id ? { ...t, duration } : t
    );
    saveTasks(updated);
  };

  // Filter by date and other filters
  const filteredTasks = tasks.filter(task => {
    if (!showCompleted && task.completed) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (task.dueDate && task.dueDate !== selectedDate) return false;
    return true;
  });

  const todayTasks = tasks.filter(t => t.dueDate === selectedDate);
  const completedCount = todayTasks.filter(t => t.completed).length;
  const progressPercent = todayTasks.length > 0 ? Math.round((completedCount / todayTasks.length) * 100) : 0;

  // Calculate total time
  const totalMinutes = filteredTasks.reduce((sum, t) => sum + (t.duration || 0), 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Date & Progress */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">To-Do List</h2>
            <p className="text-sm text-muted-foreground">
              Quản lý công việc hàng ngày của bạn
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-secondary/50 border border-border/30 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            {saving && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Tiến độ ngày {format(new Date(selectedDate), 'dd/MM', { locale: vi })}</span>
            <span className="text-primary font-semibold">
              {completedCount}/{todayTasks.length} ({progressPercent}%)
            </span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-success transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {totalMinutes > 0 && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
              <Clock className="w-3 h-3" />
              Tổng thời gian: {hours > 0 ? `${hours}h ` : ''}{minutes > 0 ? `${minutes}p` : ''}
            </p>
          )}
        </div>
      </div>

      {/* Add Task */}
      <div className="glass-card p-4">
        <div className="grid gap-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="Thêm công việc mới..."
              className="flex-1 bg-secondary/50 border border-border/30 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Button onClick={handleAddTask} disabled={!newTask.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as any)}
              className="bg-secondary/50 border border-border/30 rounded-lg px-3 py-2 text-sm"
            >
              <option value="low">Ưu tiên Thấp</option>
              <option value="medium">Ưu tiên TB</option>
              <option value="high">Ưu tiên Cao</option>
            </select>

            <select
              value={newDuration}
              onChange={(e) => setNewDuration(Number(e.target.value))}
              className="bg-secondary/50 border border-border/30 rounded-lg px-3 py-2 text-sm"
            >
              {DURATION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <input
              type="date"
              value={newDueDate || selectedDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="bg-secondary/50 border border-border/30 rounded-lg px-3 py-2 text-sm"
            />

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGenerateAITasks}
              className="gap-2 ml-auto"
            >
              <Sparkles className="w-4 h-4" />
              AI Gợi ý
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mt-3 pt-3 border-t border-border/30">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-secondary/30 border border-border/30 rounded-lg px-3 py-1 text-sm"
          >
            <option value="all">Tất cả</option>
            <option value="high">Cao</option>
            <option value="medium">Trung bình</option>
            <option value="low">Thấp</option>
          </select>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
              showCompleted 
                ? 'bg-secondary/50 border-border/30' 
                : 'bg-primary/20 border-primary/30 text-primary'
            }`}
          >
            {showCompleted ? 'Ẩn đã xong' : 'Hiện đã xong'}
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-muted-foreground mb-4">
              {tasks.length === 0 
                ? 'Chưa có công việc nào. Thêm công việc hoặc để AI gợi ý!' 
                : `Không có công việc cho ngày ${format(new Date(selectedDate), 'dd/MM/yyyy', { locale: vi })}`}
            </p>
            {tasks.length === 0 && (
              <Button onClick={handleGenerateAITasks} className="gap-2">
                <Sparkles className="w-4 h-4" />
                AI tạo công việc gợi ý
              </Button>
            )}
          </div>
        ) : (
          filteredTasks.map((task, idx) => (
            <div 
              key={task.id}
              className={`todo-item group border-l-4 ${task.completed ? 'completed opacity-60' : ''} ${PRIORITY_COLORS[task.priority]}`}
            >
              <button
                onClick={() => handleToggle(task.id)}
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                  task.completed 
                    ? 'bg-success border-success' 
                    : 'border-border hover:border-primary'
                }`}
              >
                {task.completed && <Check className="w-4 h-4 text-success-foreground" />}
              </button>

              {editingId === task.id ? (
                <div className="flex-1 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 bg-background/50 border border-border/30 rounded-lg px-3 py-1 text-sm"
                    autoFocus
                  />
                  <select
                    value={editDuration || 30}
                    onChange={(e) => setEditDuration(Number(e.target.value))}
                    className="bg-background/50 border border-border/30 rounded-lg px-2 py-1 text-sm"
                  >
                    {DURATION_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <Button size="sm" onClick={() => handleSaveEdit(task.id)}>
                    <Save className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <span className={`todo-text ${task.completed ? 'line-through' : ''}`}>
                      {task.text}
                    </span>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        task.priority === 'high' ? 'bg-red-500/20 text-red-600' :
                        task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-600' :
                        'bg-green-500/20 text-green-600'
                      }`}>
                        {PRIORITY_LABELS[task.priority]}
                      </span>
                      {task.duration && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.duration >= 60 ? `${Math.floor(task.duration/60)}h ${task.duration%60}p` : `${task.duration}p`}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(task.dueDate), 'dd/MM', { locale: vi })}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <select
                      value={task.duration || 30}
                      onChange={(e) => handleDurationChange(task.id, Number(e.target.value))}
                      className="bg-transparent border-none text-xs p-1 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {DURATION_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleMove(task.id, 'up')}
                      disabled={idx === 0}
                      className="p-1 hover:bg-secondary rounded disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMove(task.id, 'down')}
                      disabled={idx === filteredTasks.length - 1}
                      className="p-1 hover:bg-secondary rounded disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleStartEdit(task)}
                      className="p-1 hover:bg-secondary rounded"
                    >
                      <Edit3 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-1 hover:bg-destructive/20 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TodoList;