import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BigFiveRadarChart } from './charts/BigFiveRadarChart';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Send, RotateCcw, Loader2, FileDown, AlertCircle } from 'lucide-react';
import { exportContentToPDF } from '@/utils/pdfExport';
import { toast } from 'sonner';

interface BigFiveTestProps {
  onComplete: (results: BigFiveResults) => void;
  onSendToAI: (results: BigFiveResults) => void;
  existingResults?: BigFiveResults | null;
}

export interface BigFiveResults {
  scores: Record<string, number>;
  percentages: Record<string, number>;
  timestamp: Date;
  answers: Record<number, number>;
}

interface BigFiveQuestion {
  STT: number;
  'Nội dung nhận xét: "Tôi thấy mình là người..."': string;
}

// Big Five scoring key - each question maps to a trait and whether it's reversed
const TRAIT_MAPPING: Record<number, { trait: string; reversed: boolean }> = {
  1: { trait: 'E', reversed: false }, 2: { trait: 'A', reversed: true },
  3: { trait: 'C', reversed: false }, 4: { trait: 'N', reversed: false },
  5: { trait: 'O', reversed: false }, 6: { trait: 'E', reversed: true },
  7: { trait: 'A', reversed: false }, 8: { trait: 'C', reversed: true },
  9: { trait: 'N', reversed: true }, 10: { trait: 'O', reversed: true },
  11: { trait: 'E', reversed: false }, 12: { trait: 'A', reversed: true },
  13: { trait: 'C', reversed: false }, 14: { trait: 'N', reversed: false },
  15: { trait: 'O', reversed: false }, 16: { trait: 'E', reversed: true },
  17: { trait: 'A', reversed: false }, 18: { trait: 'C', reversed: true },
  19: { trait: 'N', reversed: true }, 20: { trait: 'O', reversed: true },
  21: { trait: 'E', reversed: false }, 22: { trait: 'A', reversed: true },
  23: { trait: 'C', reversed: false }, 24: { trait: 'N', reversed: false },
  25: { trait: 'O', reversed: false }, 26: { trait: 'E', reversed: true },
  27: { trait: 'A', reversed: false }, 28: { trait: 'C', reversed: true },
  29: { trait: 'N', reversed: true }, 30: { trait: 'O', reversed: true },
  31: { trait: 'E', reversed: false }, 32: { trait: 'A', reversed: true },
  33: { trait: 'C', reversed: false }, 34: { trait: 'N', reversed: false },
  35: { trait: 'O', reversed: false }, 36: { trait: 'E', reversed: true },
  37: { trait: 'A', reversed: false }, 38: { trait: 'C', reversed: true },
  39: { trait: 'N', reversed: true }, 40: { trait: 'O', reversed: true },
  41: { trait: 'E', reversed: false }, 42: { trait: 'A', reversed: true },
  43: { trait: 'C', reversed: false }, 44: { trait: 'N', reversed: false },
};

const TRAITS = {
  O: { name: 'Openness', vnName: 'Cởi mở', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', desc: 'Trí tưởng tượng, sáng tạo, thích trải nghiệm mới' },
  C: { name: 'Conscientiousness', vnName: 'Tận tâm', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', desc: 'Kỷ luật, có tổ chức, đáng tin cậy' },
  E: { name: 'Extraversion', vnName: 'Hướng ngoại', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', desc: 'Năng động, xã hội, lạc quan' },
  A: { name: 'Agreeableness', vnName: 'Dễ chịu', color: 'bg-green-500/20 text-green-400 border-green-500/30', desc: 'Hợp tác, tin tưởng, đồng cảm' },
  N: { name: 'Neuroticism', vnName: 'Nhạy cảm', color: 'bg-red-500/20 text-red-400 border-red-500/30', desc: 'Cảm xúc mãnh liệt, dễ lo lắng' },
};

const QUESTIONS_PER_PAGE = 10;

export const BigFiveTest: React.FC<BigFiveTestProps> = ({ onComplete, onSendToAI, existingResults }) => {
  const [questions, setQuestions] = useState<BigFiveQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isComplete, setIsComplete] = useState(!!existingResults);
  const [results, setResults] = useState<BigFiveResults | null>(existingResults || null);
  const [isExporting, setIsExporting] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const testContainerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: questionsData, error } = await supabase
        .from('CÂU HỎI BIG FIVE')
        .select('*')
        .order('STT', { ascending: true });

      if (error) throw error;
      setQuestions(questionsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const currentQuestions = questions.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE
  );
  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
  
  // Check if all questions on current page are answered
  const currentPageAnswered = currentQuestions.every(q => answers[q.STT] !== undefined);

  const handleAnswer = (stt: number, value: number) => {
    setAnswers(prev => ({ ...prev, [stt]: value }));
  };

  // Scroll to top when page changes
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    testContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const calculateResults = (): BigFiveResults => {
    const scores: Record<string, number> = { O: 0, C: 0, E: 0, A: 0, N: 0 };
    const counts: Record<string, number> = { O: 0, C: 0, E: 0, A: 0, N: 0 };

    Object.entries(answers).forEach(([sttStr, value]) => {
      const stt = parseInt(sttStr);
      const mapping = TRAIT_MAPPING[stt];
      if (mapping) {
        const score = mapping.reversed ? (6 - value) : value;
        scores[mapping.trait] += score;
        counts[mapping.trait]++;
      }
    });

    // Calculate percentages (scale 1-5 to 0-100)
    const percentages: Record<string, number> = {};
    Object.keys(scores).forEach(trait => {
      const maxPossible = counts[trait] * 5;
      percentages[trait] = maxPossible > 0 ? Math.round((scores[trait] / maxPossible) * 100) : 0;
    });

    return {
      scores,
      percentages,
      timestamp: new Date(),
      answers,
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
    setCurrentPage(0);
    setIsComplete(false);
    setResults(null);
  };

  const handleExportPDF = async () => {
    if (!results || !resultsRef.current) return;
    setIsExporting(true);
    try {
      await exportContentToPDF({
        contentRef: resultsRef,
        fileName: `BigFive_KetQua_${new Date().toISOString().split('T')[0]}.pdf`
      });
      toast.success('Đã xuất PDF thành công!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Lỗi xuất PDF. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  const scaleLabels = ['Hoàn toàn không đúng', 'Không đúng', 'Trung lập', 'Đúng', 'Hoàn toàn đúng'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Đang tải bài test...</p>
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
            <h2 className="text-3xl font-bold text-gradient mb-2">Kết quả Big Five (OCEAN)</h2>
            <p className="text-muted-foreground">Phân tích 5 khía cạnh tính cách của bạn</p>
            <p className="text-sm text-muted-foreground mt-2">
              Ngày thực hiện: {new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

        <div className="glow-effect" ref={chartRef}>
          <BigFiveRadarChart
            data={{
              O: results.percentages.O,
              C: results.percentages.C,
              E: results.percentages.E,
              A: results.percentages.A,
              N: results.percentages.N,
            }}
          />
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold mb-4">Phân tích chi tiết</h3>
          <div className="space-y-4">
            {Object.entries(TRAITS)
              .sort((a, b) => results.percentages[b[0]] - results.percentages[a[0]])
              .map(([code, trait]) => (
                <div key={code} className="p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`holland-badge ${trait.color} border`}>{code}</span>
                    <span className="font-semibold">{trait.vnName}</span>
                    <span className="text-muted-foreground text-sm">({trait.name})</span>
                    <span className="ml-auto text-primary font-bold text-lg">
                      {results.percentages[code]}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{trait.desc}</p>
                  <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                      style={{ width: `${results.percentages[code]}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
          </div>
        </div>
        {/* End PDF Export Content Wrapper */}

        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap print:hidden">
          <Button onClick={() => onSendToAI(results)} className="gap-2" size="lg">
            <Send className="w-4 h-4" />
            Gửi kết quả cho AI phân tích
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
          <span>Tiến độ: {answeredCount}/{questions.length} câu hỏi</span>
          <span className="text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Scale Legend */}
      <div className="glass-card p-4">
        <p className="text-sm text-muted-foreground mb-2 text-center">Thang đánh giá:</p>
        <div className="flex justify-center gap-2 flex-wrap">
          {scaleLabels.map((label, idx) => (
            <span key={idx} className="px-3 py-1 bg-secondary/50 rounded-full text-xs">
              {idx + 1}: {label}
            </span>
          ))}
        </div>
      </div>

      {/* Questions */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">
          "Tôi thấy mình là người..."
        </h3>
        <div className="space-y-4">
          {currentQuestions.map((question, qIdx) => (
            <div 
              key={question.STT}
              className="p-4 bg-secondary/30 rounded-lg border border-border/20 animate-fade-in"
              style={{ animationDelay: `${qIdx * 50}ms` }}
            >
              <p className="mb-4 font-medium">
                <span className="text-primary mr-2">{question.STT}.</span>
                {question['Nội dung nhận xét: "Tôi thấy mình là người..."']}
              </p>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map(value => {
                  const isSelected = answers[question.STT] === value;
                  return (
                    <button
                      key={value}
                      onClick={() => handleAnswer(question.STT, value)}
                      className={`w-12 h-12 rounded-full border-2 font-semibold transition-all duration-200 ${
                        isSelected
                          ? 'bg-primary border-primary text-primary-foreground scale-110'
                          : 'border-border hover:border-primary/50 hover:bg-secondary'
                      }`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Validation Warning */}
      {!currentPageAnswered && currentPage < totalPages - 1 && (
        <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/30 rounded-lg text-warning text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Vui lòng trả lời tất cả câu hỏi trên trang này trước khi tiếp tục.</span>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
          variant="outline"
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Trang trước
        </Button>

        <span className="text-muted-foreground">
          Trang {currentPage + 1} / {totalPages}
        </span>

        {currentPage === totalPages - 1 ? (
          <Button
            onClick={handleComplete}
            className="gap-2"
            disabled={answeredCount < questions.length * 0.5}
          >
            Xem kết quả
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            className="gap-2"
            disabled={!currentPageAnswered}
          >
            Trang tiếp
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default BigFiveTest;
