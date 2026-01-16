import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  MessageSquare, 
  Map, 
  CheckSquare, 
  Sparkles,
  ChevronRight,
  Compass,
  ClipboardList,
  User,
  LogIn,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import HollandTestDB, { type HollandResults } from '@/components/HollandTestDB';
import BigFiveTest, { type BigFiveResults } from '@/components/BigFiveTest';
import AIChat from '@/components/AIChat';
import RoadmapBuilder, { type Roadmap } from '@/components/RoadmapBuilder';
import RoadmapViewer from '@/components/RoadmapViewer';
import TodoList from '@/components/TodoList';

type TabType = 'holland' | 'bigfive' | 'chat' | 'build' | 'roadmap' | 'todo';

const Index: React.FC = () => {
  const { user } = useAuth();
  const { hollandResults, bigFiveResults, roadmap, setHollandResults, setBigFiveResults, setRoadmap } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('holland');
  const [chatInitialMessage, setChatInitialMessage] = useState<string>('');

  // Handle Holland complete
  const handleHollandComplete = (results: HollandResults) => {
    setHollandResults(results);
  };

  // Handle Big Five complete
  const handleBigFiveComplete = (results: BigFiveResults) => {
    setBigFiveResults(results);
  };

  // Handle send to AI with combined analysis
  const handleSendToAI = (type: 'holland' | 'bigfive' | 'combined') => {
    if (type === 'combined' && hollandResults && bigFiveResults) {
      setChatInitialMessage('Hãy phân tích TỔNG HỢP kết quả Holland Code và Big Five (OCEAN) của tôi. Cho tôi biết sự kết hợp này nói gì về tính cách nghề nghiệp và gợi ý ngành nghề phù hợp nhất.');
    } else if (type === 'holland') {
      setChatInitialMessage('Hãy phân tích chi tiết kết quả Holland Code của tôi và đưa ra gợi ý nghề nghiệp phù hợp.');
    } else {
      setChatInitialMessage('Hãy phân tích chi tiết kết quả Big Five (OCEAN) của tôi và cho tôi biết điểm mạnh, điểm yếu trong tính cách.');
    }
    setActiveTab('chat');
  };

  // Handle roadmap creation
  const handleRoadmapCreated = (newRoadmap: Roadmap) => {
    setRoadmap(newRoadmap);
    setActiveTab('roadmap');
  };

  // Handle roadmap update
  const handleRoadmapUpdate = (updatedRoadmap: Roadmap) => {
    setRoadmap(updatedRoadmap);
  };

  // Handle AI edit request
  const handleRequestAIEdit = (currentRoadmap: Roadmap) => {
    setChatInitialMessage('Tôi muốn nhờ bạn chỉnh lại lộ trình học tập của tôi. Hãy xem xét và đưa ra gợi ý cải thiện.');
    setActiveTab('chat');
  };

  // Handle reset roadmap
  const handleResetRoadmap = () => {
    setRoadmap(null);
    setActiveTab('build');
  };

  const tabs = [
    { id: 'holland' as TabType, icon: Brain, label: 'Holland Test', desc: 'Khám phá nghề nghiệp' },
    { id: 'bigfive' as TabType, icon: BarChart3, label: 'Big Five', desc: 'Tính cách OCEAN' },
    { id: 'chat' as TabType, icon: MessageSquare, label: 'Chat AI', desc: 'Tư vấn hướng nghiệp' },
    { id: 'build' as TabType, icon: Map, label: 'Lộ trình', desc: 'Xây dựng kế hoạch' },
    { id: 'roadmap' as TabType, icon: CheckSquare, label: 'Theo dõi', desc: 'Tiến độ học tập' },
    { id: 'todo' as TabType, icon: ClipboardList, label: 'To-Do', desc: 'Công việc hàng ngày' },
  ];

  // Check if combined analysis is available
  const hasCombinedResults = hollandResults && bigFiveResults;

  return (
    <div className="min-h-screen bg-background">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Compass className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gradient">Future Me AI</h1>
                  <p className="text-xs text-muted-foreground">Hướng nghiệp & Lộ trình học tập</p>
                </div>
              </div>

              {/* Status Badges & Auth */}
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2">
                  {hollandResults && (
                    <span className="px-3 py-1.5 bg-success/10 text-success text-sm rounded-full flex items-center gap-2 border border-success/20">
                      <Brain className="w-4 h-4" />
                      {hollandResults.topThree.join('')}
                    </span>
                  )}
                  {bigFiveResults && (
                    <span className="px-3 py-1.5 bg-accent/10 text-accent text-sm rounded-full flex items-center gap-2 border border-accent/20">
                      <BarChart3 className="w-4 h-4" />
                      OCEAN ✓
                    </span>
                  )}
                  {roadmap && (
                    <span className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full flex items-center gap-2 border border-primary/20">
                      <CheckSquare className="w-4 h-4" />
                      Lộ trình
                    </span>
                  )}
                </div>

                {user ? (
                  <Link 
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm">{user.email?.split('@')[0]}</span>
                  </Link>
                ) : (
                  <Link 
                    to="/login"
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="text-sm">Đăng nhập</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="border-b border-border/50 backdrop-blur-xl bg-background/50 sticky top-[73px] z-40">
          <div className="container mx-auto px-4">
            <div className="flex overflow-x-auto scrollbar-hide gap-1 py-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const isDisabled = (tab.id === 'roadmap' && !roadmap) || (tab.id === 'todo' && !user);

                return (
                  <button
                    key={tab.id}
                    onClick={() => !isDisabled && setActiveTab(tab.id)}
                    disabled={isDisabled}
                    className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 whitespace-nowrap ${
                      isActive 
                        ? 'bg-primary/10 text-primary border border-primary/30' 
                        : isDisabled
                          ? 'text-muted-foreground/50 cursor-not-allowed'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium text-sm">{tab.label}</div>
                      <div className="text-xs opacity-70 hidden sm:block">{tab.desc}</div>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Combined Analysis Banner */}
        {hasCombinedResults && activeTab !== 'chat' && (
          <div className="container mx-auto px-4 pt-4">
            <div className="glass-card p-4 border-primary/30 bg-primary/5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary">Phân tích tổng hợp sẵn sàng!</p>
                    <p className="text-sm text-muted-foreground">Bạn đã hoàn thành cả Holland và Big Five</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleSendToAI('combined')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Phân tích tổng hợp AI
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {activeTab === 'holland' && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gradient mb-2">Trắc nghiệm Holland Code</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Khám phá sở thích nghề nghiệp theo Mật mã Holland - công cụ định hướng nghề nghiệp hàng đầu thế giới.
                </p>
              </div>
              <HollandTestDB 
                onComplete={handleHollandComplete} 
                onSendToAI={() => handleSendToAI('holland')} 
              />
            </div>
          )}

          {activeTab === 'bigfive' && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gradient mb-2">Trắc nghiệm Big Five (OCEAN)</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Đánh giá 5 khía cạnh tính cách cốt lõi: Cởi mở, Tận tâm, Hướng ngoại, Dễ chịu và Nhạy cảm.
                </p>
              </div>
              <BigFiveTest 
                onComplete={handleBigFiveComplete} 
                onSendToAI={() => handleSendToAI('bigfive')} 
              />
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="animate-fade-in max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gradient mb-2">AI Tư Vấn Hướng Nghiệp</h2>
                <p className="text-muted-foreground">
                  Chat với AI để nhận tư vấn về nghề nghiệp, lộ trình học tập và phát triển bản thân.
                </p>
              </div>
              <AIChat 
                hollandResults={hollandResults} 
                bigFiveResults={bigFiveResults}
                roadmap={roadmap}
                initialMessage={chatInitialMessage}
              />
            </div>
          )}

          {activeTab === 'build' && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gradient mb-2">Xây Dựng Lộ Trình Học Tập</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Trả lời một vài câu hỏi để AI tạo lộ trình học tập cá nhân hóa cho bạn.
                </p>
              </div>
              <RoadmapBuilder 
                hollandResults={hollandResults} 
                onRoadmapCreated={handleRoadmapCreated} 
              />
            </div>
          )}

          {activeTab === 'roadmap' && roadmap && (
            <div className="animate-fade-in max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gradient mb-2">Lộ Trình Học Tập</h2>
                <p className="text-muted-foreground">
                  Theo dõi, chỉnh sửa và hoàn thành các mục tiêu của bạn.
                </p>
              </div>
              <RoadmapViewer 
                roadmap={roadmap}
                onUpdate={handleRoadmapUpdate}
                onRequestAIEdit={handleRequestAIEdit}
                onReset={handleResetRoadmap}
              />
            </div>
          )}

          {activeTab === 'todo' && (
            <div className="animate-fade-in max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gradient mb-2">To-Do List</h2>
                <p className="text-muted-foreground">
                  Quản lý công việc hàng ngày và theo dõi tiến độ.
                </p>
              </div>
              {user ? (
                <TodoList />
              ) : (
                <div className="glass-card p-8 text-center">
                  <p className="text-muted-foreground mb-4">Vui lòng đăng nhập để sử dụng tính năng này.</p>
                  <Link 
                    to="/login"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Đăng nhập
                  </Link>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 py-8 mt-16">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Future Me AI - Hướng nghiệp & Lộ trình học tập cá nhân hóa
              </span>
            </div>
            <p className="text-xs text-muted-foreground/60">
              Dựa trên lý thuyết Holland Code & Big Five (OCEAN)
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
