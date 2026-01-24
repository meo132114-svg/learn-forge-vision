import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Shield, 
  Users, 
  GraduationCap, 
  FileText, 
  Loader2,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Admin: React.FC = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [testMetadata, setTestMetadata] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast({
        title: 'Truy cập bị từ chối',
        description: 'Bạn không có quyền truy cập trang quản trị',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [user, isAdmin, authLoading, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      switch (activeTab) {
        case 'users':
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
          setUsers(profilesData || []);
          break;
        case 'universities':
          const { data: uniData } = await supabase
            .from('CÁC TRƯỜNG ĐẠI HỌC')
            .select('*')
            .limit(100);
          setUniversities(uniData || []);
          break;
        case 'tests':
          const { data: metaData } = await supabase
            .from('test_metadata')
            .select('*');
          setTestMetadata(metaData || []);
          break;
        case 'results':
          const { data: resultsData } = await supabase
            .from('test_results')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
          setTestResults(resultsData || []);
          break;
        case 'roadmaps':
          const { data: roadmapsData } = await supabase
            .from('roadmaps')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
          setRoadmaps(roadmapsData || []);
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">Admin Panel</h1>
                <p className="text-xs text-muted-foreground">Future Me AI - Quản trị hệ thống</p>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={loadData} className="gap-2">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Người dùng</span>
            </TabsTrigger>
            <TabsTrigger value="universities" className="gap-2">
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Trường ĐH</span>
            </TabsTrigger>
            <TabsTrigger value="tests" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Tests</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Kết quả</span>
            </TabsTrigger>
            <TabsTrigger value="roadmaps" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Lộ trình</span>
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Danh sách người dùng</h2>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Tên hiển thị</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{u.display_name || '-'}</TableCell>
                        <TableCell>{new Date(u.created_at).toLocaleDateString('vi-VN')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* Universities Tab */}
          <TabsContent value="universities">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Danh sách trường đại học</h2>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Tên trường</TableHead>
                        <TableHead>Ngành</TableHead>
                        <TableHead>Tổ hợp</TableHead>
                        <TableHead>Điểm chuẩn</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {universities.map((u) => (
                        <TableRow key={u.ID}>
                          <TableCell>{u.ID}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{u['Tên trường']}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{u['Tên ngành'] || '-'}</TableCell>
                          <TableCell>{u['Tổ hợp'] || '-'}</TableCell>
                          <TableCell>{u['điểm chuẩn 2025'] || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tests Tab */}
          <TabsContent value="tests">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Test Metadata</h2>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên test</TableHead>
                      <TableHead>File URL</TableHead>
                      <TableHead>Hướng dẫn</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testMetadata.map((t, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{t.test_name}</TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          <a href={t.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {t.file_url}
                          </a>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">{t.instruction || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Kết quả test</h2>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Loại test</TableHead>
                      <TableHead>Ngày làm</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testResults.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-xs">{r.user_id?.slice(0, 8)}...</TableCell>
                        <TableCell>{r.test_type}</TableCell>
                        <TableCell>{new Date(r.created_at).toLocaleDateString('vi-VN')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* Roadmaps Tab */}
          <TabsContent value="roadmaps">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Lộ trình học tập</h2>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roadmaps.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="max-w-[300px] truncate">{r.title}</TableCell>
                        <TableCell className="font-mono text-xs">{r.user_id?.slice(0, 8)}...</TableCell>
                        <TableCell>{new Date(r.created_at).toLocaleDateString('vi-VN')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
