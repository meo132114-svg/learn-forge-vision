import React from 'react';
import { Brain, BarChart3, ChevronRight, Info, Zap, Target, Brain as BrainIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

type TestMode = 'quick' | 'standard' | 'deep';

interface TestSelectionProps {
  hollandCompleted: boolean;
  bigFiveCompleted: boolean;
  onSelectHolland: (mode: TestMode) => void;
  onSelectBigFive: () => void;
  onViewHollandResults: () => void;
  onViewBigFiveResults: () => void;
}

const MODE_CONFIG: Record<TestMode, { label: string; desc: string; icon: React.ReactNode }> = {
  quick: { label: 'Nhanh', desc: '36 câu (~5 phút)', icon: <Zap className="w-4 h-4" /> },
  standard: { label: 'Chuẩn', desc: '72 câu (~10 phút)', icon: <Target className="w-4 h-4" /> },
  deep: { label: 'Sâu', desc: '114 câu (~15 phút)', icon: <BrainIcon className="w-4 h-4" /> },
};

export const TestSelection: React.FC<TestSelectionProps> = ({
  hollandCompleted,
  bigFiveCompleted,
  onSelectHolland,
  onSelectBigFive,
  onViewHollandResults,
  onViewBigFiveResults,
}) => {
  const [showHollandModes, setShowHollandModes] = React.useState(false);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gradient mb-4">Khám phá bản thân</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Hoàn thành các bài trắc nghiệm để AI có thể tư vấn hướng nghiệp và xây dựng lộ trình học tập phù hợp nhất cho bạn.
        </p>
      </div>

      {/* Recommendation Banner */}
      <div className="glass-card p-4 border-primary/30 bg-primary/5">
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-primary shrink-0" />
          <p className="text-sm">
            <span className="font-medium text-primary">Gợi ý:</span>{' '}
            Bạn nên hoàn thành cả 2 bài test để AI có đủ dữ liệu tư vấn lộ trình học tập chính xác nhất.
          </p>
        </div>
      </div>

      {/* Test Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Holland Test Card */}
        <div className="glass-card p-6 hover:border-primary/30 transition-all duration-300">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">Holland Test</h3>
              <p className="text-sm text-muted-foreground">Mật mã nghề nghiệp RIASEC</p>
            </div>
            {hollandCompleted && (
              <span className="px-3 py-1 bg-success/20 text-success text-xs rounded-full border border-success/30">
                ✓ Đã làm
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Bài test Holland giúp xác định sở thích nghề nghiệp theo 6 nhóm: 
            <span className="text-primary font-medium"> Kỹ thuật (R), Nghiên cứu (I), Nghệ thuật (A), Xã hội (S), Quản lý (E), Nghiệp vụ (C)</span>. 
            Kết quả sẽ cho bạn mật mã 3 chữ cái phản ánh xu hướng nghề nghiệp.
          </p>

          {hollandCompleted ? (
            <Button onClick={onViewHollandResults} variant="outline" className="w-full gap-2">
              Xem kết quả
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : showHollandModes ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-center mb-2">Chọn chế độ làm bài:</p>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(MODE_CONFIG) as [TestMode, typeof MODE_CONFIG['quick']][]).map(([mode, config]) => (
                  <button
                    key={mode}
                    onClick={() => onSelectHolland(mode)}
                    className="p-3 rounded-lg border border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all text-center"
                  >
                    <div className="flex justify-center mb-1">{config.icon}</div>
                    <p className="font-medium text-sm">{config.label}</p>
                    <p className="text-xs text-muted-foreground">{config.desc}</p>
                  </button>
                ))}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-2"
                onClick={() => setShowHollandModes(false)}
              >
                Quay lại
              </Button>
            </div>
          ) : (
            <Button onClick={() => setShowHollandModes(true)} className="w-full gap-2">
              Bắt đầu làm bài
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Big Five Card */}
        <div className="glass-card p-6 hover:border-primary/30 transition-all duration-300">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shrink-0">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">Big Five (OCEAN)</h3>
              <p className="text-sm text-muted-foreground">5 khía cạnh tính cách cốt lõi</p>
            </div>
            {bigFiveCompleted && (
              <span className="px-3 py-1 bg-success/20 text-success text-xs rounded-full border border-success/30">
                ✓ Đã làm
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Đánh giá 5 khía cạnh tính cách: 
            <span className="text-primary font-medium"> Cởi mở (O), Tận tâm (C), Hướng ngoại (E), Dễ chịu (A), Nhạy cảm (N)</span>. 
            Giúp hiểu sâu hơn về điểm mạnh, điểm yếu và phong cách làm việc của bạn.
          </p>

          {bigFiveCompleted ? (
            <Button onClick={onViewBigFiveResults} variant="outline" className="w-full gap-2">
              Xem kết quả
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={onSelectBigFive} className="w-full gap-2">
              Bắt đầu làm bài
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Completion Status */}
      <div className="text-center text-sm text-muted-foreground">
        {hollandCompleted && bigFiveCompleted ? (
          <p className="text-success font-medium">
            🎉 Tuyệt vời! Bạn đã hoàn thành cả 2 bài test. AI đã sẵn sàng tư vấn toàn diện cho bạn!
          </p>
        ) : hollandCompleted || bigFiveCompleted ? (
          <p>
            Bạn đã hoàn thành {hollandCompleted ? 'Holland Test' : 'Big Five'}. 
            Hãy làm thêm {hollandCompleted ? 'Big Five' : 'Holland Test'} để có kết quả phân tích đầy đủ hơn.
          </p>
        ) : (
          <p>Chọn một bài test để bắt đầu khám phá bản thân.</p>
        )}
      </div>
    </div>
  );
};

export default TestSelection;
