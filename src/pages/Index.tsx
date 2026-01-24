import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  MessageSquare, 
  Map, 
  CheckSquare, 
  Sparkles,
  ChevronRight,
  ClipboardList,
  User,
  LogIn,
  BarChart3,
  ClipboardCheck
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

type TabType = 'assessment' | 'chat' | 'build' | 'roadmap' | 'todo';
type SubTestType = 'none' | 'holland' | 'bigfive';

const Index: React.FC = () => {
  const { user } = useAuth();
  const { hollandResults, bigFiveResults, roadmap, setHollandResults, setBigFiveResults, setRoadmap } = useApp();
  
  const [activeTab, setActiveTab] = useState<TabType>('assessment');
  const [subTest, setSubTest] = useState<SubTestType>('none');
  const [isHollandStarted, setIsHollandStarted] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState<string>('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, subTest, isHollandStarted]);

  const handleHollandComplete = (results: HollandResults) => {
    setHollandResults(results);
  };

  const handleBigFiveComplete = (results: BigFiveResults) => {
    setBigFiveResults(results);
  };

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

  const handleRoadmapCreated = (newRoadmap: Roadmap) => {
    setRoadmap(newRoadmap);
    setActiveTab('roadmap');
  };

  const handleRoadmapUpdate = (updatedRoadmap: Roadmap) => {
    setRoadmap(updatedRoadmap);
  };

  // ==========================================
  // FIX: Sửa hàm này để nhận cả String hoặc Roadmap
  // ==========================================
  const handleRequestAIEdit = (data: Roadmap | string) => {
    if (typeof data === 'string') {
      // Nhận prompt trực tiếp từ nút AI ở mỗi Task
      setChatInitialMessage(data);
    } else {
      // Nhận yêu cầu từ nút "Nhờ AI chỉnh" (toàn bộ lộ trình)
      setChatInitialMessage(`Tôi muốn nhờ bạn xem xét và tối ưu lại lộ trình "${data.title}" này giúp tôi.`);
    }
    setActiveTab('chat');
  };

  const handleResetRoadmap = () => {
    setRoadmap(null);
    setActiveTab('build');
  };

  const tabs = [
    { id: 'assessment' as TabType, icon: ClipboardCheck, label: 'Trắc Nghiệm', desc: 'Holland & Big Five' },
    { id: 'chat' as TabType, icon: MessageSquare, label: 'Chat AI', desc: 'Tư vấn hướng nghiệp' },
    { id: 'build' as TabType, icon: Map, label: 'Lộ trình', desc: 'Xây dựng kế hoạch' },
    { id: 'roadmap' as TabType, icon: CheckSquare, label: 'Theo dõi', desc: 'Tiến độ học tập' },
    { id: 'todo' as TabType, icon: ClipboardList, label: 'To-Do', desc: 'Công việc hàng ngày' },
  ];

  const hasCombinedResults = hollandResults && bigFiveResults;

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
      </div>

      <div className="relative z-10">
        <header className="border-b border-border/50 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="https://futuremeai.vercel.app/favicon.png" 
                  alt="Logo Future Me AI" 
                  className="w-16 h-16 object-contain rounded-xl shadow-sm" 
                />
                <div>
                  <h1 className="text-xl font-bold text-gradient">Future Me AI</h1>
                  <p className="text-xs text-muted-foreground">Hướng nghiệp & Lộ trình học tập</p>
                </div>
              </div>

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
                </div>
                {user ? (
                  <Link to="/profile" className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm">{user.email?.split('@')[0]}</span>
                  </Link>
                ) : (
                  <Link to="/login" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors">
                    <LogIn className="w-4 h-4" />
                    <span className="text-sm">Đăng nhập</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>

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
                      isActive ? 'bg-primary/10 text-primary border border-primary/30' : isDisabled ? 'text-muted-foreground/50 cursor-not-allowed' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium text-sm">{tab.label}</div>
                      <div className="text-xs opacity-70 hidden sm:block">{tab.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {hasCombinedResults && activeTab !== 'chat' && (
          <div className="container mx-auto px-4 pt-4">
            <div className="glass-card p-4 border-primary/30 bg-primary/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-primary">Phân tích tổng hợp sẵn sàng!</p>
                  <p className="text-sm text-muted-foreground">Đã có kết quả Holland và Big Five</p>
                </div>
              </div>
              <button onClick={() => handleSendToAI('combined')} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Phân tích tổng hợp AI
              </button>
            </div>
          </div>
        )}

        <main className="container mx-auto px-4 py-8">
          {activeTab === 'assessment' && (
            <div className="animate-fade-in">
              {subTest === 'none' ? (
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 pt-10">
                  <button onClick={() => setSubTest('holland')} className="glass-card p-8 text-left hover:border-primary transition-all group border-2">
                    <Brain className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-2xl font-bold mb-2">Holland Test</h3>
                    <p className="text-muted-foreground mb-4">Khám phá mật mã nghề nghiệp của bạn.</p>
                    <span className="text-primary font-medium flex items-center">Chọn bài test <ChevronRight className="w-4 h-4 ml-1" /></span>
                  </button>
                  <button onClick={() => setSubTest('bigfive')} className="glass-card p-8 text-left hover:border-accent transition-all group border-2">
                    <BarChart3 className="w-12 h-12 text-accent mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-2xl font-bold mb-2">Big Five Test</h3>
                    <p className="text-muted-foreground mb-4">Phân tích 5 khía cạnh tính cách OCEAN.</p>
                    <span className="text-accent font-medium flex items-center">Chọn bài test <ChevronRight className="w-4 h-4 ml-1" /></span>
                  </button>
                </div>
              ) : subTest === 'holland' ? (
                <div className="animate-fade-in">
                  <button onClick={() => {setSubTest('none'); setIsHollandStarted(false)}} className="text-sm text-muted-foreground mb-4 hover:text-primary">← Quay lại</button>
                  {!isHollandStarted ? (
                    <div className="max-w-2xl mx-auto text-center glass-card p-10 border-primary/20">
                      <h2 className="text-3xl font-bold text-gradient mb-4">Chào mừng bạn đến với Holland Test</h2>
                      <p className="text-muted-foreground mb-8">Bài trắc nghiệm này sẽ giúp bạn hiểu rõ sở thích tự nhiên và môi trường làm việc lý tưởng thông qua 6 nhóm tính cách. Hãy trả lời một cách thoải mái nhất!</p>
                      <button onClick={() => setIsHollandStarted(true)} className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2 mx-auto">Bắt đầu <ChevronRight className="w-5 h-5" /></button>
                    </div>
                  ) : (
                    <HollandTestDB onComplete={handleHollandComplete} onSendToAI={() => handleSendToAI('holland')} />
                  )}
                </div>
              ) : (
                <div className="animate-fade-in">
                  <button onClick={() => setSubTest('none')} className="text-sm text-muted-foreground mb-4 hover:text-accent">← Quay lại</button>
                  <BigFiveTest onComplete={handleBigFiveComplete} onSendToAI={() => handleSendToAI('bigfive')} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'chat' && <div className="animate-fade-in max-w-4xl mx-auto"><AIChat hollandResults={hollandResults} bigFiveResults={bigFiveResults} roadmap={roadmap} initialMessage={chatInitialMessage} /></div>}
          {activeTab === 'build' && <div className="animate-fade-in"><RoadmapBuilder hollandResults={hollandResults} onRoadmapCreated={handleRoadmapCreated} /></div>}
          
          {/* TRUYỀN HÀM handleRequestAIEdit ĐÃ FIX VÀO ĐÂY */}
          {activeTab === 'roadmap' && roadmap && <div className="animate-fade-in max-w-4xl mx-auto"><RoadmapViewer roadmap={roadmap} onUpdate={handleRoadmapUpdate} onRequestAIEdit={handleRequestAIEdit} onReset={handleResetRoadmap} /></div>}
          
          {activeTab === 'todo' && <div className="animate-fade-in max-w-3xl mx-auto">{user ? <TodoList /> : <p className="text-center p-10 glass-card">Vui lòng đăng nhập.</p>}</div>}
        </main>

        <footer className="border-t border-border/50 py-8 mt-16">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Future Me AI - Hướng nghiệp & Lộ trình học tập cá nhân hóa</span>
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