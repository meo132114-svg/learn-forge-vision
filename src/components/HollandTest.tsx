import React, { useState, useMemo } from 'react';
import { hollandQuestions, hollandGroups, getQuestionsByGroup, type HollandQuestion } from '@/data/hollandQuestions';
import { RadarChart } from './RadarChart';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Send, RotateCcw } from 'lucide-react';

interface HollandTestProps {
  onComplete: (results: HollandResults) => void;
  onSendToAI: (results: HollandResults) => void;
}

export interface HollandResults {
  scores: Record<string, number>;
  percentages: Record<string, number>;
  topThree: string[];
  timestamp: Date;
}

type AnswerType = 'yes' | 'no' | 'unknown' | null;

export const HollandTest: React.FC<HollandTestProps> = ({ onComplete, onSendToAI }) => {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerType>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [results, setResults] = useState<HollandResults | null>(null);

  const groups = ['R', 'I', 'A', 'S', 'E', 'C'] as const;
  const currentGroup = groups[currentGroupIndex];
  const currentQuestions = useMemo(() => getQuestionsByGroup(currentGroup), [currentGroup]);
  const groupInfo = hollandGroups.find(g => g.code === currentGroup);

  const maxQuestionsPerGroup = 19;
  const totalQuestions = hollandQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  const handleAnswer = (questionId: number, answer: AnswerType) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateResults = (): HollandResults => {
    const scores: Record<string, number> = {};
    const percentages: Record<string, number> = {};

    groups.forEach(group => {
      const groupQuestions = getQuestionsByGroup(group);
      const score = groupQuestions.reduce((sum, q) => {
        return sum + (answers[q.id] === 'yes' ? 1 : 0);
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
      timestamp: new Date()
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
  };

  const canGoNext = currentGroupIndex < groups.length - 1;
  const canGoPrev = currentGroupIndex > 0;
  const isLastGroup = currentGroupIndex === groups.length - 1;
  const currentGroupAnswered = currentQuestions.filter(q => answers[q.id] !== undefined).length;

  const groupColors: Record<string, string> = {
    R: 'bg-red-500/20 text-red-400 border-red-500/30',
    I: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    A: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    S: 'bg-green-500/20 text-green-400 border-green-500/30',
    E: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    C: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  };

  if (isComplete && results) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gradient mb-2">Kết quả Holland Code</h2>
          <p className="text-muted-foreground">Dựa trên câu trả lời của bạn</p>
        </div>

        {/* Radar Chart */}
        <div className="glass-card p-8 glow-effect">
          <RadarChart
            data={groups.map(g => ({
              label: g,
              value: results.scores[g],
              maxValue: maxQuestionsPerGroup
            }))}
            size={350}
          />
        </div>

        {/* Top 3 Results */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold mb-4">Top 3 nhóm tính cách nghề nghiệp của bạn</h3>
          <div className="space-y-4">
            {results.topThree.map((code, index) => {
              const group = hollandGroups.find(g => g.code === code);
              if (!group) return null;
              
              return (
                <div key={code} className="p-4 bg-secondary/50 rounded-lg border border-border/30">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`holland-badge ${groupColors[code]} border`}>
                      #{index + 1}
                    </span>
                    <span className={`holland-badge ${groupColors[code]} border`}>
                      {code}
                    </span>
                    <span className="font-semibold">{group.fullName}</span>
                    <span className="ml-auto text-primary font-bold">
                      {results.percentages[code]}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{group.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.careers.map(career => (
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

        {/* All Scores */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold mb-4">Điểm số chi tiết</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {groups.map(code => {
              const group = hollandGroups.find(g => g.code === code);
              return (
                <div key={code} className="p-4 bg-secondary/30 rounded-lg text-center">
                  <div className={`holland-badge ${groupColors[code]} border mb-2 inline-flex`}>
                    {code} - {group?.name}
                  </div>
                  <div className="text-2xl font-bold">{results.scores[code]}/{maxQuestionsPerGroup}</div>
                  <div className="text-sm text-muted-foreground">{results.percentages[code]}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => onSendToAI(results)} className="gap-2" size="lg">
            <Send className="w-4 h-4" />
            Gửi kết quả cho AI tư vấn
          </Button>
          <Button onClick={handleReset} variant="outline" className="gap-2" size="lg">
            <RotateCcw className="w-4 h-4" />
            Làm lại bài test
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="glass-card p-4">
        <div className="flex justify-between text-sm mb-2">
          <span>Tiến độ: {answeredCount}/{totalQuestions} câu hỏi</span>
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
          const groupQs = getQuestionsByGroup(g);
          const answered = groupQs.filter(q => answers[q.id] !== undefined).length;
          const isCurrentGroup = idx === currentGroupIndex;
          const isCompleteGroup = answered === groupQs.length;
          
          return (
            <button
              key={g}
              onClick={() => setCurrentGroupIndex(idx)}
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
              Đã trả lời: {currentGroupAnswered}/{currentQuestions.length} câu
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

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          onClick={() => setCurrentGroupIndex(prev => prev - 1)}
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
            onClick={() => setCurrentGroupIndex(prev => prev + 1)}
            disabled={!canGoNext}
            className="gap-2"
          >
            Nhóm tiếp
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default HollandTest;