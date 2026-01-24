import React, { useState, useMemo, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { HollandRadarChart } from './charts/HollandRadarChart';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Send, RotateCcw, Loader2, Zap, Target, Brain, FileDown, AlertCircle } from 'lucide-react';
import { exportContentToPDF } from '@/utils/pdfExport';
import { toast } from 'sonner';

interface HollandTestDBProps {
  onComplete: (results: HollandResults) => void;
  onSendToAI: (results: HollandResults) => void;
  initialMode?: 'quick' | 'standard' | 'deep';
  existingResults?: HollandResults | null;
}

export interface HollandResults {
  scores: Record<string, number>;
  percentages: Record<string, number>;
  topThree: string[];
  timestamp: Date;
  mode?: 'quick' | 'standard' | 'deep';
}

type AnswerType = 'yes' | 'no' | 'unknown' | null;
type TestMode = 'quick' | 'standard' | 'deep';

interface HollandQuestion {
  STT: number;
  'Nhóm A (Kỹ thuật)': string;
  'Nhóm B (Nghiên cứu)': string | null;
  'Nhóm C (Nghệ thuật)': string | null;
  'Nhóm D (Xã hội)': string | null;
  'Nhóm E (Quản lý)': string | null;
  'Nhóm F (Nghiệp vụ)': string | null;
}

const GROUP_MAPPING = {
  'Nhóm A (Kỹ thuật)': { code: 'R', name: 'Kỹ thuật', fullName: 'Realistic - Nhóm Kỹ thuật' },
  'Nhóm B (Nghiên cứu)': { code: 'I', name: 'Nghiên cứu', fullName: 'Investigative - Nhóm Nghiên cứu' },
  'Nhóm C (Nghệ thuật)': { code: 'A', name: 'Nghệ thuật', fullName: 'Artistic - Nhóm Nghệ thuật' },
  'Nhóm D (Xã hội)': { code: 'S', name: 'Xã hội', fullName: 'Social - Nhóm Xã hội' },
  'Nhóm E (Quản lý)': { code: 'E', name: 'Quản lý', fullName: 'Enterprising - Nhóm Quản lý' },
  'Nhóm F (Nghiệp vụ)': { code: 'C', name: 'Nghiệp vụ', fullName: 'Conventional - Nhóm Nghiệp vụ' },
};

const MODE_CONFIG: Record<TestMode, { questions: number; label: string; desc: string; icon: React.ReactNode }> = {
  quick: { questions: 6, label: 'Nhanh', desc: '36 câu (~5 phút)', icon: <Zap className="w-5 h-5" /> },
  standard: { questions: 12, label: 'Chuẩn', desc: '72 câu (~10 phút)', icon: <Target className="w-5 h-5" /> },
  deep: { questions: 19, label: 'Sâu', desc: '114 câu (~15 phút)', icon: <Brain className="w-5 h-5" /> },
};

const groupColors: Record<string, string> = {
  R: 'bg-red-500/20 text-red-400 border-red-500/30',
  I: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  A: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  S: 'bg-green-500/20 text-green-400 border-green-500/30',
  E: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  C: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

const groupCareers: Record<string, string[]> = {
  R: ['Kỹ sư cơ khí', 'Kỹ thuật viên điện', 'Thợ sửa chữa', 'Nông nghiệp', 'Xây dựng'],
  I: ['Nhà khoa học', 'Bác sĩ', 'Nhà nghiên cứu', 'Lập trình viên', 'Nhà phân tích'],
  A: ['Họa sĩ', 'Nhạc sĩ', 'Nhà thiết kế', 'Nhà văn', 'Nhiếp ảnh gia'],
  S: ['Giáo viên', 'Tư vấn viên', 'Nhân viên xã hội', 'Y tá', 'Huấn luyện viên'],
  E: ['Doanh nhân', 'Quản lý', 'Luật sư', 'Sales', 'Marketing'],
  C: ['Kế toán', 'Thư ký', 'Nhân viên hành chính', 'Ngân hàng', 'Kiểm toán'],
};

export const HollandTestDB: React.FC<HollandTestDBProps> = ({ 
  onComplete, 
  onSendToAI, 
  initialMode,
  existingResults 
}) => {
  const [mode, setMode] = useState<TestMode | null>(initialMode || null);
  const [questions, setQuestions] = useState<HollandQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerType>>({});
  const [isComplete, setIsComplete] = useState(!!existingResults);
  const [results, setResults] = useState<HollandResults | null>(existingResults || null);
  const [isExporting, setIsExporting] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const testContainerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const groups = ['R', 'I', 'A', 'S', 'E', 'C'] as const;
  const groupKeys = Object.keys(GROUP_MAPPING) as (keyof typeof GROUP_MAPPING)[];

  useEffect(() => {
    if (mode && !existingResults) {
      fetchQuestions();
    }
  }, [mode]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('CÂU HỎI HOLLAND TEST')
        .select('*')
        .order('STT', { ascending: true })
        .limit(MODE_CONFIG[mode!].questions);

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentGroup = groups[currentGroupIndex];
  const currentGroupKey = groupKeys[currentGroupIndex];
  const groupInfo = GROUP_MAPPING[currentGroupKey];

  const currentQuestions = useMemo(() => {
    return questions
      .filter(q => q[currentGroupKey])
      .map((q) => ({
        id: `${currentGroup}-${q.STT}`,
        text: q[currentGroupKey] as string,
        stt: q.STT,
      }));
  }, [questions, currentGroupKey, currentGroup]);

  const maxQuestionsPerGroup = mode ? MODE_CONFIG[mode].questions : 19;
  const totalQuestions = maxQuestionsPerGroup * 6;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;
  
  // Check if all questions in current group are answered
  const currentGroupAnswered = currentQuestions.every(q => answers[q.id] !== undefined);

  const handleAnswer = (questionId: string, answer: AnswerType) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  // Scroll to top when group changes
  const handleGroupChange = (newIndex: number) => {
    setCurrentGroupIndex(newIndex);
    testContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const calculateResults = (): HollandResults => {
    const scores: Record<string, number> = {};
    const percentages: Record<string, number> = {};

    groups.forEach((group, idx) => {
      const groupKey = groupKeys[idx];
      const groupQuestions = questions.filter(q => q[groupKey]);
      const score = groupQuestions.reduce((sum, q) => {
        const qId = `${group}-${q.STT}`;
        return sum + (answers[qId] === 'yes' ? 1 : 0);
      }, 0);
      scores[group] = score;
      percentages[group] = Math.round((score / maxQuestionsPerGroup) * 100);
    });

    const sortedGroups = [...groups].sort((a, b) => scores[b] - scores[a]);
    const topThree = sortedGroups.slice(0, 3);

    return {
      scores,
      percentages,
      topThree,
      timestamp: new Date(),
      mode: mode || 'standard',
    };
  };

  const handleComplete = () => {
    const calculatedResults = calculateResults();
    setResults(calculatedResults);
    setIsComplete(true);
    onComplete(calculatedResults);
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentGroupIndex(0);
    setIsComplete(false);
    setResults(null);
    setMode(null);
    setQuestions([]);
  };

  const handleExportPDF = async () => {
    if (!results || !resultsRef.current) return;
    setIsExporting(true);
    try {
      await exportContentToPDF({
        contentRef: resultsRef,
        fileName: `HollandCode_KetQua_${new Date().toISOString().split('T')[0]}.pdf`
      });
      toast.success('Đã xuất PDF thành công!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Lỗi xuất PDF. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  const canGoNext = currentGroupIndex < groups.length - 1;
  const canGoPrev = currentGroupIndex > 0;
  const isLastGroup = currentGroupIndex === groups.length - 1;
  const currentGroupAnsweredCount = currentQuestions.filter(q => answers[q.id] !== undefined).length;

  // Mode selection screen
  if (!mode && !existingResults) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gradient mb-4">Chọn chế độ làm bài</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Chọn chế độ phù hợp với thời gian bạn có. Bài test càng dài, kết quả càng chính xác.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {(Object.entries(MODE_CONFIG) as [TestMode, typeof MODE_CONFIG['quick']][]).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className="glass-card p-6 text-left hover:border-primary/50 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                {config.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{config.label}</h3>
              <p className="text-muted-foreground">{config.desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Đang tải câu hỏi...</p>
      </div>
    );
  }

  // Results screen
  if (isComplete && results) {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* PDF Export Content Wrapper */}
        <div ref={resultsRef} data-pdf-content className="space-y-8 bg-background p-6 rounded-xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gradient mb-2">Kết quả Holland Code</h2>
            <p className="text-muted-foreground">
              Dựa trên câu trả lời của bạn {mode && `(chế độ ${MODE_CONFIG[mode].label})`}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Ngày thực hiện: {new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

        <div className="glow-effect" ref={chartRef}>
          <HollandRadarChart
            data={{
              R: results.percentages.R || 0,
              I: results.percentages.I || 0,
              A: results.percentages.A || 0,
              S: results.percentages.S || 0,
              E: results.percentages.E || 0,
              C: results.percentages.C || 0,
            }}
          />
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold mb-4">Top 3 nhóm tính cách nghề nghiệp</h3>
          <div className="space-y-4">
            {results.topThree.map((code, index) => {
              const groupMapping = Object.values(GROUP_MAPPING).find(g => g.code === code);
              return (
                <div key={code} className="p-4 bg-secondary/50 rounded-lg border border-border/30">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`holland-badge ${groupColors[code]} border`}>#{index + 1}</span>
                    <span className={`holland-badge ${groupColors[code]} border`}>{code}</span>
                    <span className="font-semibold">{groupMapping?.fullName}</span>
                    <span className="ml-auto text-primary font-bold">{results.percentages[code]}%</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {groupCareers[code]?.map(career => (
                      <span key={career} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                        {career}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold mb-4">Điểm số chi tiết</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {groups.map(code => {
              const groupMapping = Object.values(GROUP_MAPPING).find(g => g.code === code);
              return (
                <div key={code} className="p-4 bg-secondary/30 rounded-lg text-center">
                  <div className={`holland-badge ${groupColors[code]} border mb-2 inline-flex`}>
                    {code} - {groupMapping?.name}
                  </div>
                  <div className="text-2xl font-bold">{results.scores[code]}/{maxQuestionsPerGroup}</div>
                  <div className="text-sm text-muted-foreground">{results.percentages[code]}%</div>
                </div>
              );
            })}
          </div>
          </div>
        </div>
        {/* End PDF Export Content Wrapper */}

        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap print:hidden">
          <Button onClick={() => onSendToAI(results)} className="gap-2" size="lg">
            <Send className="w-4 h-4" />
            Gửi kết quả cho AI tư vấn
          </Button>
          <Button 
            onClick={handleExportPDF} 
            variant="secondary" 
            className="gap-2" 
            size="lg"
            disabled={isExporting}
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            Xuất kết quả PDF
          </Button>
          <Button onClick={handleReset} variant="outline" className="gap-2" size="lg">
            <RotateCcw className="w-4 h-4" />
            Làm lại bài test
          </Button>
        </div>
      </div>
    );
  }

  // Test interface
  return (
    <div className="space-y-6" ref={testContainerRef}>
      {/* Progress Bar */}
      <div className="glass-card p-4">
        <div className="flex justify-between text-sm mb-2">
          <span>Tiến độ: {answeredCount}/{totalQuestions} câu hỏi ({mode && MODE_CONFIG[mode].label})</span>
          <span className="text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Group Tabs */}
      <div className="flex justify-center gap-2 flex-wrap">
        {groups.map((g, idx) => {
          const gKey = groupKeys[idx];
          const groupQs = questions.filter(q => q[gKey]);
          const answered = groupQs.filter(q => answers[`${g}-${q.STT}`] !== undefined).length;
          const isCurrentGroup = idx === currentGroupIndex;
          const isCompleteGroup = answered === groupQs.length && groupQs.length > 0;
          
          return (
            <button
              key={g}
              onClick={() => handleGroupChange(idx)}
              className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 ${
                isCurrentGroup 
                  ? `${groupColors[g]} border-current` 
                  : isCompleteGroup
                    ? 'bg-success/20 border-success/30 text-success'
                    : 'bg-secondary/30 border-border/30 text-muted-foreground hover:border-border'
              }`}
            >
              <span className="font-medium">{g}</span>
              <span className="text-xs ml-1 opacity-70">({answered}/{groupQs.length})</span>
            </button>
          );
        })}
      </div>

      {/* Current Group Info */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className={`holland-badge ${groupColors[currentGroup]} border text-lg px-4 py-2`}>
            {currentGroup}
          </span>
          <div>
            <h2 className="text-xl font-bold">{groupInfo?.fullName}</h2>
            <p className="text-sm text-muted-foreground">
              Đã trả lời: {currentGroupAnsweredCount}/{currentQuestions.length} câu
            </p>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {currentQuestions.map((question, qIdx) => (
            <div 
              key={question.id}
              className="p-4 bg-secondary/30 rounded-lg border border-border/20 animate-fade-in"
              style={{ animationDelay: `${qIdx * 50}ms` }}
            >
              <p className="mb-3 font-medium">
                <span className="text-primary mr-2">{qIdx + 1}.</span>
                {question.text}
              </p>
              <div className="flex gap-3">
                {(['yes', 'no', 'unknown'] as AnswerType[]).map(answerType => {
                  const labels = { yes: 'Có', no: 'Không', unknown: 'Không rõ' };
                  const isSelected = answers[question.id] === answerType;
                  
                  return (
                    <button
                      key={answerType}
                      onClick={() => handleAnswer(question.id, answerType)}
                      className={`answer-option flex-1 text-center ${
                        isSelected ? 'selected' : ''
                      } ${
                        answerType === 'yes' && isSelected ? 'border-success bg-success/10' :
                        answerType === 'no' && isSelected ? 'border-destructive bg-destructive/10' :
                        answerType === 'unknown' && isSelected ? 'border-warning bg-warning/10' : ''
                      }`}
                    >
                      {labels[answerType!]}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Validation Warning */}
      {!currentGroupAnswered && !isLastGroup && (
        <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/30 rounded-lg text-warning text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Vui lòng trả lời tất cả câu hỏi trong nhóm này trước khi tiếp tục.</span>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          onClick={() => handleGroupChange(currentGroupIndex - 1)}
          disabled={!canGoPrev}
          variant="outline"
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Nhóm trước
        </Button>

        <span className="text-muted-foreground">
          Nhóm {currentGroupIndex + 1} / {groups.length}
        </span>

        {isLastGroup ? (
          <Button
            onClick={handleComplete}
            className="gap-2"
            disabled={answeredCount < totalQuestions * 0.5}
          >
            Xem kết quả
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={() => handleGroupChange(currentGroupIndex + 1)}
            className="gap-2"
            disabled={!currentGroupAnswered}
          >
            Nhóm tiếp
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default HollandTestDB;
