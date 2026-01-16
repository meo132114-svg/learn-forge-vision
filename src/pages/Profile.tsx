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
  Compass,
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

  const handleDeleteRoadmap = async (roadmapId: string) => {
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
              <div className="flex items-center gap-4">
                <Link 
                  to="/"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Quay lại</span>
                </Link>
                <div className="h-6 w-px bg-border"></div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Compass className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h1 className="text-xl font-bold text-gradient">Tài khoản</h1>
                </div>
              </div>
              <Button variant="outline" onClick={handleSignOut} className="gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Profile Card */}
          <div className="glass-card p-8 mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <User className="w-12 h-12 text-primary-foreground" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                {editingName ? (
                  <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-lg font-semibold"
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
                      className="p-1 hover:bg-secondary rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Tham gia: {format(new Date(user.created_at || Date.now()), 'dd/MM/yyyy', { locale: vi })}</span>
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
              <span className="text-sm text-muted-foreground">
                {roadmaps.length} lộ trình
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : roadmaps.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <Map className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Bạn chưa có lộ trình học tập nào.
                </p>
                <Link to="/">
                  <Button className="gap-2">
                    Tạo lộ trình đầu tiên
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
                      className="profile-card group hover:border-primary/30"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-2">{roadmap.title}</h4>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(roadmap.created_at), 'dd/MM/yyyy', { locale: vi })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Cập nhật: {format(new Date(roadmap.updated_at), 'dd/MM/yyyy', { locale: vi })}
                            </span>
                            <span>{phaseCount} giai đoạn</span>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Tiến độ</span>
                              <span className="text-primary font-medium">{progress}%</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-primary to-success transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link to={`/?roadmap=${roadmap.id}`}>
                            <Button size="sm" variant="outline" className="gap-1">
                              <ChevronRight className="w-4 h-4" />
                              Xem
                            </Button>
                          </Link>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteRoadmap(roadmap.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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