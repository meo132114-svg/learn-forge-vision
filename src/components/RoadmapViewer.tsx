import React, { useState, useEffect } from 'react';
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
  Sparkles,
  RotateCcw
} from 'lucide-react';
import type { Roadmap, Phase, Task } from './RoadmapBuilder';

interface RoadmapViewerProps {
  roadmap: Roadmap;
  onUpdate: (roadmap: Roadmap) => void;
  onRequestAIEdit: (prompt: string) => void; // Thay đổi type để nhận vào string prompt
  onReset: () => void;
}

export const RoadmapViewer: React.FC<RoadmapViewerProps> = ({ 
  roadmap, 
  onUpdate, 
  onRequestAIEdit,
  onReset 
}) => {
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, string>>({});

  // Hàm xử lý nhờ AI hỗ trợ cho từng task cụ thể
  const handleAskAIForTask = (taskText: string) => {
    const customPrompt = `Tôi đang thực hiện lộ trình "${roadmap.title}". Với nhiệm vụ cụ thể là: "${taskText}", hãy hướng dẫn tôi các bước thực hiện chi tiết, cách tìm tài liệu và các mẹo để hoàn thành task này hiệu quả nhất.`;
    onRequestAIEdit(customPrompt);
  };

  const totalTasks = roadmap.phases.reduce((sum, p) => sum + p.tasks.length, 0);
  const completedTasks = roadmap.phases.reduce(
    (sum, p) => sum + p.tasks.filter(t => t.completed).length, 
    0
  );
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleToggleTask = (phaseId: string, taskId: string) => {
    const updatedPhases = roadmap.phases.map(phase => {
      if (phase.id !== phaseId) return phase;
      return {
        ...phase,
        tasks: phase.tasks.map(task => 
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      };
    });
    onUpdate({ ...roadmap, phases: updatedPhases });
  };

  const handleAddTask = (phaseId: string) => {
    const taskText = newTaskInputs[phaseId]?.trim();
    if (!taskText) return;
    const updatedPhases = roadmap.phases.map(phase => {
      if (phase.id !== phaseId) return phase;
      return {
        ...phase,
        tasks: [...phase.tasks, { id: `t${Date.now()}`, text: taskText, completed: false }]
      };
    });
    onUpdate({ ...roadmap, phases: updatedPhases });
    setNewTaskInputs(prev => ({ ...prev, [phaseId]: '' }));
  };

  const handleDeleteTask = (phaseId: string, taskId: string) => {
    const updatedPhases = roadmap.phases.map(phase => {
      if (phase.id !== phaseId) return phase;
      return { ...phase, tasks: phase.tasks.filter(task => task.id !== taskId) };
    });
    onUpdate({ ...roadmap, phases: updatedPhases });
  };

  const handleStartEditTask = (taskId: string, currentText: string) => {
    setEditingTaskId(taskId);
    setEditValue(currentText);
  };

  const handleSaveEditTask = (phaseId: string, taskId: string) => {
    if (!editValue.trim()) return;
    const updatedPhases = roadmap.phases.map(phase => {
      if (phase.id !== phaseId) return phase;
      return {
        ...phase,
        tasks: phase.tasks.map(task => 
          task.id === taskId ? { ...task, text: editValue.trim() } : task
        )
      };
    });
    onUpdate({ ...roadmap, phases: updatedPhases });
    setEditingTaskId(null);
  };

  const handleMoveTask = (phaseId: string, taskId: string, direction: 'up' | 'down') => {
    const updatedPhases = roadmap.phases.map(phase => {
      if (phase.id !== phaseId) return phase;
      const taskIndex = phase.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return phase;
      const newIndex = direction === 'up' ? taskIndex - 1 : taskIndex + 1;
      if (newIndex < 0 || newIndex >= phase.tasks.length) return phase;
      const newTasks = [...phase.tasks];
      [newTasks[taskIndex], newTasks[newIndex]] = [newTasks[newIndex], newTasks[taskIndex]];
      return { ...phase, tasks: newTasks };
    });
    onUpdate({ ...roadmap, phases: updatedPhases });
  };

  const handleEditPhaseTitle = (phaseId: string) => {
    const phase = roadmap.phases.find(p => p.id === phaseId);
    if (phase) {
      setEditingPhaseId(phaseId);
      setEditValue(phase.title);
    }
  };

  const handleSavePhaseTitle = (phaseId: string) => {
    if (!editValue.trim()) return;
    const updatedPhases = roadmap.phases.map(phase => 
      phase.id === phaseId ? { ...phase, title: editValue.trim() } : phase
    );
    onUpdate({ ...roadmap, phases: updatedPhases });
    setEditingPhaseId(null);
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{roadmap.title}</h2>
            <p className="text-sm text-muted-foreground">Tạo lúc: {roadmap.createdAt.toLocaleDateString('vi-VN')}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => onRequestAIEdit("Hãy giúp tôi chỉnh sửa lộ trình này tối ưu hơn.")} variant="outline" className="gap-2">
              <Sparkles className="w-4 h-4" /> Nhờ AI chỉnh
            </Button>
            <Button onClick={onReset} variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" /> Tạo mới
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Tiến độ tổng thể</span>
            <span className="text-primary font-semibold">{completedTasks}/{totalTasks} tasks ({progressPercent}%)</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-success transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {roadmap.phases.map((phase) => {
          const phaseCompleted = phase.tasks.every(t => t.completed);
          return (
            <div key={phase.id} className="roadmap-phase animate-fade-in">
              <div className={`glass-card p-4 mb-4 ${phaseCompleted ? 'border-success/30' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  {editingPhaseId === phase.id ? (
                    <div className="flex-1 flex gap-2">
                      <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1 bg-secondary/50 border border-border/30 rounded-lg px-3 py-1" autoFocus />
                      <Button size="sm" onClick={() => handleSavePhaseTitle(phase.id)}><Save className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingPhaseId(null)}><X className="w-4 h-4" /></Button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold">{phase.title}</h3>
                      <button onClick={() => handleEditPhaseTitle(phase.id)} className="p-1 hover:bg-secondary rounded"><Edit3 className="w-4 h-4 text-muted-foreground" /></button>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>⏱️ {phase.duration}</span>
                  <span>✓ {phase.tasks.filter(t => t.completed).length}/{phase.tasks.length} tasks</span>
                </div>
              </div>

              <div className="space-y-2 ml-4">
                {phase.tasks.map((task, taskIdx) => (
                  <div key={task.id} className={`todo-item group flex items-center gap-3 p-3 glass-card hover:border-primary/50 transition-all ${task.completed ? 'opacity-60' : ''}`}>
                    <button
                      onClick={() => handleToggleTask(phase.id, task.id)}
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${task.completed ? 'bg-success border-success' : 'border-border hover:border-primary'}`}
                    >
                      {task.completed && <Check className="w-4 h-4 text-success-foreground" />}
                    </button>

                    {editingTaskId === task.id ? (
                      <div className="flex-1 flex gap-2">
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1 bg-background/50 border border-border/30 rounded-lg px-3 py-1 text-sm" autoFocus />
                        <Button size="sm" onClick={() => handleSaveEditTask(phase.id, task.id)}><Save className="w-3 h-3" /></Button>
                      </div>
                    ) : (
                      <>
                        <span className={`flex-1 text-sm ${task.completed ? 'line-through' : ''}`}>{task.text}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* NÚT AI CHO TỪNG TASK */}
                          <button 
                            onClick={() => handleAskAIForTask(task.text)}
                            className="p-1.5 text-primary hover:bg-primary/10 rounded-md transition-all"
                            title="Nhờ AI hỗ trợ task này"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                          
                          <button onClick={() => handleMoveTask(phase.id, task.id, 'up')} disabled={taskIdx === 0} className="p-1 hover:bg-secondary rounded disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                          <button onClick={() => handleMoveTask(phase.id, task.id, 'down')} disabled={taskIdx === phase.tasks.length - 1} className="p-1 hover:bg-secondary rounded disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                          <button onClick={() => handleStartEditTask(task.id, task.text)} className="p-1 hover:bg-secondary rounded"><Edit3 className="w-4 h-4 text-muted-foreground" /></button>
                          <button onClick={() => handleDeleteTask(phase.id, task.id)} className="p-1 hover:bg-destructive/20 rounded"><Trash2 className="w-4 h-4 text-destructive" /></button>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newTaskInputs[phase.id] || ''}
                    onChange={(e) => setNewTaskInputs(prev => ({ ...prev, [phase.id]: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask(phase.id)}
                    placeholder="Thêm task mới..."
                    className="flex-1 bg-secondary/30 border border-border/30 rounded-lg px-4 py-2 text-sm focus:outline-none"
                  />
                  <Button onClick={() => handleAddTask(phase.id)} size="sm" disabled={!newTaskInputs[phase.id]?.trim()}><Plus className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoadmapViewer;