import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Mail, 
  Calendar, 
  Map, 
  LogOut, 
  ArrowLeft,
  ChevronRight,
  Edit3,
  Loader2,
  Trash2,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface SavedRoadmap {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  phases: any;
}

const Profile: React.FC = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [roadmaps, setRoadmaps] = useState<SavedRoadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchRoadmaps();
    setDisplayName(profile?.display_name || '');
  }, [user, profile, navigate]);

  const fetchRoadmaps = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setRoadmaps(data || []);
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      toast.error('Lỗi tải danh sách lộ trình');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('user_id', user.id);

      if (error) throw error;
      await refreshProfile();
      setEditingName(false);
      toast.success('Đã cập nhật thông tin');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Lỗi cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoadmap = async (e: React.MouseEvent, roadmapId: string) => {
    e.stopPropagation();
    if (!confirm('Bạn có chắc muốn xóa lộ trình này?')) return;
    
    try {
      const { error } = await supabase
        .from('roadmaps')
        .delete()
        .eq('id', roadmapId);

      if (error) throw error;
      setRoadmaps(roadmaps.filter(r => r.id !== roadmapId));
      toast.success('Đã xóa lộ trình');
    } catch (error) {
      console.error('Error deleting roadmap:', error);
      toast.error('Lỗi xóa lộ trình');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const calculateRoadmapProgress = (phases: any[]): number => {
    if (!phases || phases.length === 0) return 0;
    let totalTasks = 0;
    let completedTasks = 0;
    phases.forEach(phase => {
      if (phase.tasks) {
        totalTasks += phase.tasks.length;
        completedTasks += phase.tasks.filter((t: any) => t.completed).length;
      }
    });
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
      </div>

      <div className="relative z-10">
        {/* Header - Fixed structure */}
        <header className="border-b border-border/50 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link 
                  to="/"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Quay lại</span>
                </Link>
                <div className="h-6 w-px bg-border shrink-0"></div>
                
                {/* Logo & Title Container */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-border/50 bg-white shadow-sm">
                    <img
                      src="https://futuremeai.vercel.app/favicon.png"
                      alt="logo"
                      className="w-full h-full object-contain scale-110"
                    />
                  </div>
                  <h1 className="text-xl font-bold text-gradient whitespace-nowrap">Tài khoản</h1>
                </div>
              </div>

              <Button variant="outline" onClick={handleSignOut} className="gap-2 shrink-0">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Profile Card */}
          <div className="glass-card p-8 mb-8 border border-border/40 shadow-xl rounded-2xl bg-card/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <User className="w-12 h-12 text-primary-foreground" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                {editingName ? (
                  <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                    <input
                      type="text"
                      autoFocus
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-lg font-semibold outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Tên hiển thị"
                    />
                    <Button size="sm" onClick={handleUpdateProfile} disabled={saving}>
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lưu'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingName(false)}>
                      Hủy
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                    <h2 className="text-2xl font-bold">
                      {profile?.display_name || user.email?.split('@')[0]}
                    </h2>
                    <button 
                      onClick={() => setEditingName(true)}
                      className="p-1 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Tham gia: {format(new Date(user.created_at || Date.now()), 'dd/MM/yyyy', { locale: vi })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Roadmaps Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Map className="w-5 h-5 text-primary" />
                Lộ trình học tập của tôi
              </h3>
              <span className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">
                {roadmaps.length} lộ trình
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : roadmaps.length === 0 ? (
              <div className="glass-card p-12 text-center border-dashed border-2">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Map className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-6">
                  Bạn chưa có lộ trình học tập nào được lưu.
                </p>
                <Link to="/">
                  <Button className="gap-2 shadow-lg hover:shadow-primary/20 transition-all">
                    Tạo lộ trình ngay
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {roadmaps.map((roadmap) => {
                  const progress = calculateRoadmapProgress(roadmap.phases);
                  const phaseCount = roadmap.phases?.length || 0;
                  
                  return (
                    <div 
                      key={roadmap.id}
                      onClick={() => navigate(`/?roadmap=${roadmap.id}`)}
                      className="group p-6 rounded-2xl border border-border/50 bg-card hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 cursor-pointer transition-all duration-300"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
                            {roadmap.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {format(new Date(roadmap.created_at), 'dd/MM/yyyy')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              Cập nhật: {format(new Date(roadmap.updated_at), 'dd/MM/yyyy')}
                            </span>
                            <span className="px-2 py-0.5 bg-secondary rounded text-secondary-foreground">
                              {phaseCount} giai đoạn
                            </span>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-medium">
                              <span className="text-muted-foreground">Tiến độ hoàn thành</span>
                              <span className="text-primary">{progress}%</span>
                            </div>
                            <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-primary via-primary to-emerald-400 transition-all duration-700 ease-out"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="text-destructive hover:bg-destructive/10 rounded-full h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => handleDeleteRoadmap(e, roadmap.id)}
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </Button>
                          <div className="p-2 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all">
                             <ChevronRight className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;