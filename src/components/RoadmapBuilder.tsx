import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Sparkles, Loader2, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { HollandResults } from './HollandTest';

interface UserInfo {
  // Layer 1 - Profile
  educationLevel: string;
  birthYear: string;
  schoolType: string;
  mainStrength: string;
  hasCompetitionExp: string;
  competitionDetails: string;
  selfRating: number;
  
  // Layer 2 - Goals
  mainGoal: string;
  goalTimeframe: string;
  specificResult: string;
  specificResultDetails: string;
  
  // Layer 3 - Interests
  favoriteActivity: string;
  learningStyle: string;
  learningHate: string;
  
  // Layer 4 - Skill Gap
  weakestSubject: string;
  previousLevel: string;
  difficultyResponse: string;
  
  // Layer 5 - Constraints
  dailyStudyTime: string;
  bestStudyTime: string;
  budget: string;
  device: string;
  
  // Layer 6 - Behavior
  studyPattern: string;
  hasQuitBefore: string;
  quitReason: string;
  quitTrigger: string;
  
  // Layer 7 - Mindset
  studyMotivation: string;
  failureResponse: string;
  aiRole: string;
  
  // Layer 8 - Decision
  roadmapStyle: string;
  priority: string;
}

export interface Phase {
  id: string;
  title: string;
  duration: string;
  goals: string[];
  tasks: Task[];
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface Roadmap {
  id: string;
  title: string;
  createdAt: Date;
  phases: Phase[];
  userInfo: UserInfo;
}

interface RoadmapBuilderProps {
  hollandResults: HollandResults | null;
  onRoadmapCreated: (roadmap: Roadmap) => void;
}

// Question Types
type QuestionType = 'select' | 'radio' | 'text' | 'number' | 'chips';

interface QuestionOption {
  value: string;
  label: string;
}

interface Question {
  key: keyof UserInfo;
  label: string;
  type: QuestionType;
  options?: QuestionOption[];
  placeholder?: string;
  min?: number;
  max?: number;
  layer: string;
  layerTitle: string;
  showIf?: (answers: Partial<UserInfo>) => boolean;
}

// ============================================
// CÂU HỎI 8 LAYERS
// ============================================
const questions: Question[] = [
  // 1️⃣ LAYER 1: Profile Layer
  {
    key: 'educationLevel',
    label: 'Bạn đang ở cấp học nào?',
    type: 'select',
    layer: '1',
    layerTitle: 'Thông tin cá nhân',
    options: [
      { value: 'thcs', label: 'THCS' },
      { value: 'thpt', label: 'THPT' },
      { value: 'sinhvien', label: 'Sinh viên' },
      { value: 'dilam', label: 'Đi làm' },
      { value: 'tuhoc', label: 'Tự học' },
    ]
  },
  {
    key: 'birthYear',
    label: 'Năm sinh của bạn?',
    type: 'text',
    layer: '1',
    layerTitle: 'Thông tin cá nhân',
    placeholder: 'VD: 2005'
  },
  {
    key: 'schoolType',
    label: 'Bạn đang học ở loại trường nào?',
    type: 'select',
    layer: '1',
    layerTitle: 'Thông tin cá nhân',
    options: [
      { value: 'cong', label: 'Trường công' },
      { value: 'tu', label: 'Trường tư' },
      { value: 'quocte', label: 'Trường quốc tế' },
      { value: 'homeschool', label: 'Homeschool' },
    ]
  },
  {
    key: 'mainStrength',
    label: 'Điểm mạnh nhất hiện tại của bạn là gì?',
    type: 'select',
    layer: '1',
    layerTitle: 'Thông tin cá nhân',
    options: [
      { value: 'toan_logic', label: 'Toán / Logic' },
      { value: 'ngonngu', label: 'Ngôn ngữ' },
      { value: 'sangtao', label: 'Sáng tạo' },
      { value: 'giaotiep', label: 'Giao tiếp' },
      { value: 'kyluat', label: 'Kỷ luật – tự học' },
    ]
  },
  {
    key: 'hasCompetitionExp',
    label: 'Bạn đã từng tham gia cuộc thi / dự án học thuật nào chưa?',
    type: 'radio',
    layer: '1',
    layerTitle: 'Thông tin cá nhân (Nâng cao)',
    options: [
      { value: 'co', label: 'Có' },
      { value: 'khong', label: 'Chưa' },
    ]
  },
  {
    key: 'competitionDetails',
    label: 'Hãy chia sẻ về cuộc thi/dự án đó:',
    type: 'text',
    layer: '1',
    layerTitle: 'Thông tin cá nhân (Nâng cao)',
    placeholder: 'VD: Học sinh giỏi Toán cấp tỉnh, Hackathon...',
    showIf: (answers) => answers.hasCompetitionExp === 'co'
  },
  {
    key: 'selfRating',
    label: 'Bạn tự đánh giá năng lực học tập hiện tại (1–10)?',
    type: 'number',
    layer: '1',
    layerTitle: 'Thông tin cá nhân (Nâng cao)',
    min: 1,
    max: 10,
    placeholder: '7'
  },

  // 2️⃣ LAYER 2: Goal Layer
  {
    key: 'mainGoal',
    label: 'Mục tiêu chính của bạn là gì?',
    type: 'select',
    layer: '2',
    layerTitle: 'Mục tiêu học tập',
    options: [
      { value: 'daukythi', label: 'Đậu kỳ thi' },
      { value: 'dilam', label: 'Học để đi làm sớm' },
      { value: 'duhoc', label: 'Du học / học bổng' },
      { value: 'khoinghiep', label: 'Khởi nghiệp' },
      { value: 'damme', label: 'Học vì đam mê' },
    ]
  },
  {
    key: 'goalTimeframe',
    label: 'Bạn muốn đạt được mục tiêu đó trong bao lâu?',
    type: 'select',
    layer: '2',
    layerTitle: 'Mục tiêu học tập',
    options: [
      { value: 'duoi6thang', label: '< 6 tháng' },
      { value: '6-12thang', label: '6–12 tháng' },
      { value: '1-3nam', label: '1–3 năm' },
      { value: 'chuaro', label: 'Chưa rõ' },
    ]
  },
  {
    key: 'specificResult',
    label: 'Nếu phải chọn 1 kết quả cụ thể, bạn muốn là:',
    type: 'select',
    layer: '2',
    layerTitle: 'Mục tiêu học tập',
    options: [
      { value: 'dautruong', label: 'Đậu trường/ngành X' },
      { value: 'cokynang', label: 'Có kỹ năng Y' },
      { value: 'coportfolio', label: 'Có portfolio / dự án' },
      { value: 'cochungchi', label: 'Có chứng chỉ / giải thưởng' },
    ]
  },
  {
    key: 'specificResultDetails',
    label: 'Cụ thể là gì?',
    type: 'text',
    layer: '2',
    layerTitle: 'Mục tiêu học tập',
    placeholder: 'VD: Đậu ĐH Bách Khoa, IELTS 7.0, Giải nhất Olympic Tin...'
  },

  // 3️⃣ LAYER 3: Interest Layer
  {
    key: 'favoriteActivity',
    label: 'Bạn hứng thú với hoạt động nào nhất?',
    type: 'select',
    layer: '3',
    layerTitle: 'Định hướng & sở thích',
    options: [
      { value: 'phantich', label: 'Phân tích – giải quyết vấn đề' },
      { value: 'sangtao', label: 'Sáng tạo nội dung' },
      { value: 'connguoi', label: 'Làm việc với con người' },
      { value: 'dulieu', label: 'Làm việc với dữ liệu / máy móc' },
    ]
  },
  {
    key: 'learningStyle',
    label: 'Khi học, bạn thích kiểu nào hơn?',
    type: 'select',
    layer: '3',
    layerTitle: 'Định hướng & sở thích',
    options: [
      { value: 'cautruc', label: 'Có cấu trúc, từng bước' },
      { value: 'tudo', label: 'Tự do, thử – sai' },
      { value: 'duan', label: 'Học qua dự án' },
      { value: 'video', label: 'Học qua video' },
    ]
  },
  {
    key: 'learningHate',
    label: 'Bạn ghét nhất điều gì khi học?',
    type: 'select',
    layer: '3',
    layerTitle: 'Định hướng & sở thích',
    options: [
      { value: 'lythuyet', label: 'Lý thuyết dài' },
      { value: 'laptap', label: 'Bài tập lặp lại' },
      { value: 'apluc', label: 'Áp lực điểm số' },
      { value: 'deadline', label: 'Deadline gắt' },
    ]
  },

  // 4️⃣ LAYER 4: Skill Gap Layer
  {
    key: 'weakestSubject',
    label: 'Môn học/kỹ năng bạn đang yếu nhất?',
    type: 'text',
    layer: '4',
    layerTitle: 'Năng lực hiện tại',
    placeholder: 'VD: Tiếng Anh, Toán, Lập trình...'
  },
  {
    key: 'previousLevel',
    label: 'Bạn đã từng học nội dung này ở mức nào?',
    type: 'select',
    layer: '4',
    layerTitle: 'Năng lực hiện tại',
    options: [
      { value: 'chua', label: 'Chưa từng' },
      { value: 'coban', label: 'Biết cơ bản' },
      { value: 'trungbinh', label: 'Trung bình' },
      { value: 'kha', label: 'Khá' },
    ]
  },
  {
    key: 'difficultyResponse',
    label: 'Khi gặp bài khó, bạn thường:',
    type: 'select',
    layer: '4',
    layerTitle: 'Năng lực hiện tại',
    options: [
      { value: 'boqua', label: 'Bỏ qua' },
      { value: 'tradapan', label: 'Tra đáp án' },
      { value: 'cohieu', label: 'Cố hiểu đến cùng' },
      { value: 'hoinguoi', label: 'Hỏi người khác' },
    ]
  },

  // 5️⃣ LAYER 5: Constraint Layer
  {
    key: 'dailyStudyTime',
    label: 'Mỗi ngày bạn có thể học bao nhiêu phút/giờ?',
    type: 'select',
    layer: '5',
    layerTitle: 'Thời gian & nguồn lực',
    options: [
      { value: '30', label: '30 phút' },
      { value: '60', label: '1 giờ' },
      { value: '90', label: '1.5 giờ' },
      { value: '120+', label: '> 2 giờ' },
    ]
  },
  {
    key: 'bestStudyTime',
    label: 'Bạn học tốt nhất vào:',
    type: 'select',
    layer: '5',
    layerTitle: 'Thời gian & nguồn lực',
    options: [
      { value: 'sang', label: 'Sáng' },
      { value: 'chieu', label: 'Chiều' },
      { value: 'toi', label: 'Tối' },
    ]
  },
  {
    key: 'budget',
    label: 'Bạn có thể chi tiền cho việc học không?',
    type: 'select',
    layer: '5',
    layerTitle: 'Thời gian & nguồn lực',
    options: [
      { value: 'khong', label: 'Không' },
      { value: 'it', label: 'Ít' },
      { value: 'trungbinh', label: 'Trung bình' },
      { value: 'khonggioihan', label: 'Không giới hạn' },
    ]
  },
  {
    key: 'device',
    label: 'Bạn có thiết bị gì để học?',
    type: 'select',
    layer: '5',
    layerTitle: 'Thời gian & nguồn lực',
    options: [
      { value: 'laptop', label: 'Laptop' },
      { value: 'tablet', label: 'Tablet' },
      { value: 'phone', label: 'Chỉ điện thoại' },
    ]
  },

  // 6️⃣ LAYER 6: Behavior Layer
  {
    key: 'studyPattern',
    label: 'Bạn thường học theo kiểu:',
    type: 'select',
    layer: '6',
    layerTitle: 'Thói quen & kỷ luật',
    options: [
      { value: 'hung', label: 'Hứng lên mới học' },
      { value: 'kehoach', label: 'Có kế hoạch nhưng hay trễ' },
      { value: 'kyluat', label: 'Kỷ luật cao' },
    ]
  },
  {
    key: 'hasQuitBefore',
    label: 'Bạn đã từng bỏ dở lộ trình học nào chưa?',
    type: 'radio',
    layer: '6',
    layerTitle: 'Thói quen & kỷ luật',
    options: [
      { value: 'co', label: 'Có' },
      { value: 'khong', label: 'Không' },
    ]
  },
  {
    key: 'quitReason',
    label: 'Vì sao bạn bỏ dở?',
    type: 'text',
    layer: '6',
    layerTitle: 'Thói quen & kỷ luật',
    placeholder: 'VD: Quá khó, không có thời gian, mất hứng...',
    showIf: (answers) => answers.hasQuitBefore === 'co'
  },
  {
    key: 'quitTrigger',
    label: 'Điều gì khiến bạn dễ bỏ cuộc nhất?',
    type: 'select',
    layer: '6',
    layerTitle: 'Thói quen & kỷ luật',
    options: [
      { value: 'khongtienbo', label: 'Không thấy tiến bộ' },
      { value: 'quakho', label: 'Quá khó' },
      { value: 'motminh', label: 'Không ai đồng hành' },
      { value: 'matdongluc', label: 'Mất động lực' },
    ]
  },

  // 7️⃣ LAYER 7: Mindset Layer
  {
    key: 'studyMotivation',
    label: 'Bạn học vì:',
    type: 'select',
    layer: '7',
    layerTitle: 'Tâm lý & động lực',
    options: [
      { value: 'apluc', label: 'Áp lực' },
      { value: 'giadinh', label: 'Kỳ vọng gia đình' },
      { value: 'tudo', label: 'Muốn tự do hơn' },
      { value: 'chungminh', label: 'Muốn chứng minh bản thân' },
    ]
  },
  {
    key: 'failureResponse',
    label: 'Khi thất bại, bạn thường:',
    type: 'select',
    layer: '7',
    layerTitle: 'Tâm lý & động lực',
    options: [
      { value: 'tutrach', label: 'Tự trách' },
      { value: 'boqua', label: 'Bỏ qua' },
      { value: 'phantich', label: 'Phân tích nguyên nhân' },
      { value: 'netranh', label: 'Né tránh' },
    ]
  },
  {
    key: 'aiRole',
    label: 'Bạn cần AI đóng vai gì?',
    type: 'select',
    layer: '7',
    layerTitle: 'Tâm lý & động lực',
    options: [
      { value: 'giaovien', label: 'Giáo viên nghiêm khắc' },
      { value: 'donghanh', label: 'Người đồng hành' },
      { value: 'nhacnho', label: 'Người nhắc nhở' },
      { value: 'chienluoc', label: 'Người phân tích chiến lược' },
    ]
  },

  // 8️⃣ LAYER 8: Decision Layer
  {
    key: 'roadmapStyle',
    label: 'Bạn muốn lộ trình:',
    type: 'radio',
    layer: '8',
    layerTitle: 'Quyết định lộ trình',
    options: [
      { value: 'antoan', label: 'An toàn – chắc chắn' },
      { value: 'thuthach', label: 'Thử thách – bứt phá' },
    ]
  },
  {
    key: 'priority',
    label: 'Bạn ưu tiên:',
    type: 'radio',
    layer: '8',
    layerTitle: 'Quyết định lộ trình',
    options: [
      { value: 'nhanh', label: 'Đi nhanh' },
      { value: 'chac', label: 'Đi chắc' },
      { value: 'canbang', label: 'Cân bằng' },
    ]
  },
];

// ============================================
// API HOOK - Gắn API AI thật ở đây
// ============================================
async function generateRoadmapWithAI(userData: UserInfo & { hollandResults: HollandResults | null }): Promise<Roadmap> {
  try {
    // Prepare user data summary for AI
    const userDataSummary = {
      profile: {
        educationLevel: userData.educationLevel,
        birthYear: userData.birthYear,
        schoolType: userData.schoolType,
        mainStrength: userData.mainStrength,
        competitionExp: userData.hasCompetitionExp === 'co' ? userData.competitionDetails : 'Chưa có',
        selfRating: userData.selfRating
      },
      goals: {
        mainGoal: userData.mainGoal,
        timeframe: userData.goalTimeframe,
        specificResult: userData.specificResult,
        specificDetails: userData.specificResultDetails
      },
      interests: {
        favoriteActivity: userData.favoriteActivity,
        learningStyle: userData.learningStyle,
        learningHate: userData.learningHate
      },
      skillGap: {
        weakestSubject: userData.weakestSubject,
        previousLevel: userData.previousLevel,
        difficultyResponse: userData.difficultyResponse
      },
      constraints: {
        dailyStudyTime: userData.dailyStudyTime,
        bestStudyTime: userData.bestStudyTime,
        budget: userData.budget,
        device: userData.device
      },
      behavior: {
        studyPattern: userData.studyPattern,
        hasQuitBefore: userData.hasQuitBefore,
        quitReason: userData.quitReason,
        quitTrigger: userData.quitTrigger
      },
      mindset: {
        studyMotivation: userData.studyMotivation,
        failureResponse: userData.failureResponse,
        aiRole: userData.aiRole
      },
      decision: {
        roadmapStyle: userData.roadmapStyle,
        priority: userData.priority
      },
      hollandCode: userData.hollandResults?.topThree?.join('') || 'Chưa có'
    };

    // Call the AI edge function
    const { data, error } = await supabase.functions.invoke('gemini-chat', {
      body: {
        messages: [{
          role: 'user',
          content: `Tạo lộ trình học tập chi tiết dựa trên thông tin người dùng sau:

${JSON.stringify(userDataSummary, null, 2)}

Hãy tạo lộ trình với 4 giai đoạn (phases), mỗi giai đoạn có:
- title: Tên giai đoạn
- duration: Thời lượng (VD: "4 tuần")
- goals: 3 mục tiêu chính
- tasks: 4-5 công việc cụ thể

Trả về JSON theo format:
{
  "title": "Tên lộ trình",
  "phases": [
    {
      "id": "1",
      "title": "Giai đoạn 1: ...",
      "duration": "4 tuần",
      "goals": ["Mục tiêu 1", "Mục tiêu 2", "Mục tiêu 3"],
      "tasks": [
        {"id": "t1", "text": "Công việc 1", "completed": false},
        {"id": "t2", "text": "Công việc 2", "completed": false}
      ]
    }
  ]
}

CHỈ trả về JSON, không có text giải thích.`
        }],
        systemPrompt: 'Bạn là AI chuyên tạo lộ trình học tập. Luôn trả về JSON hợp lệ, không markdown.'
      }
    });

    if (error) throw error;

    // Try to parse AI response as JSON
    let roadmapData;
    try {
      const responseText = data.response;
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        roadmapData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not extract JSON');
      }
    } catch (parseError) {
      console.warn('AI response parsing failed, using fallback:', parseError);
      // Fallback to generated roadmap
      roadmapData = generateFallbackRoadmap(userData);
    }

    return {
      id: Date.now().toString(),
      title: roadmapData.title || `Lộ trình: ${userData.specificResultDetails || 'Mục tiêu cá nhân'}`,
      createdAt: new Date(),
      phases: roadmapData.phases || generateFallbackRoadmap(userData).phases,
      userInfo: userData
    };
  } catch (error) {
    console.error('AI roadmap generation failed:', error);
    toast.error('Không thể kết nối AI. Đang tạo lộ trình mặc định...');
    
    // Return fallback roadmap
    return {
      id: Date.now().toString(),
      title: `Lộ trình: ${userData.specificResultDetails || 'Mục tiêu cá nhân'}`,
      createdAt: new Date(),
      phases: generateFallbackRoadmap(userData).phases,
      userInfo: userData
    };
  }
}

// Fallback roadmap generator
function generateFallbackRoadmap(userData: UserInfo & { hollandResults: HollandResults | null }) {
  const goalLabel = questions.find(q => q.key === 'mainGoal')?.options?.find(o => o.value === userData.mainGoal)?.label || 'Mục tiêu học tập';
  const timeframe = questions.find(q => q.key === 'goalTimeframe')?.options?.find(o => o.value === userData.goalTimeframe)?.label || '6 tháng';

  const phases: Phase[] = [
    {
      id: '1',
      title: 'Giai đoạn 1: Xây dựng nền tảng',
      duration: '4 tuần',
      goals: [
        'Thiết lập thói quen học tập phù hợp với lịch trình cá nhân',
        `Tập trung vào điểm mạnh: ${questions.find(q => q.key === 'mainStrength')?.options?.find(o => o.value === userData.mainStrength)?.label}`,
        `Cải thiện môn yếu: ${userData.weakestSubject}`
      ],
      tasks: [
        { id: 't1', text: `Học ${userData.dailyStudyTime === '120+' ? '2+' : userData.dailyStudyTime} phút/ngày vào buổi ${questions.find(q => q.key === 'bestStudyTime')?.options?.find(o => o.value === userData.bestStudyTime)?.label?.toLowerCase()}`, completed: false },
        { id: 't2', text: 'Lập danh sách tài liệu học tập cần thiết', completed: false },
        { id: 't3', text: `Ôn tập kiến thức cơ bản môn ${userData.weakestSubject}`, completed: false },
        { id: 't4', text: 'Theo dõi tiến độ hàng ngày', completed: false },
      ]
    },
    {
      id: '2', 
      title: 'Giai đoạn 2: Phát triển kỹ năng',
      duration: '8 tuần',
      goals: [
        `Nâng cao năng lực theo phong cách học: ${questions.find(q => q.key === 'learningStyle')?.options?.find(o => o.value === userData.learningStyle)?.label}`,
        'Phát triển kỹ năng mềm và tư duy',
        'Bắt đầu thực hành dự án nhỏ'
      ],
      tasks: [
        { id: 't5', text: 'Hoàn thành bài tập nâng cao mỗi tuần', completed: false },
        { id: 't6', text: 'Tham gia 1 hoạt động học nhóm/tuần', completed: false },
        { id: 't7', text: 'Bắt đầu dự án cá nhân nhỏ', completed: false },
        { id: 't8', text: 'Đọc thêm tài liệu chuyên ngành', completed: false },
      ]
    },
    {
      id: '3',
      title: 'Giai đoạn 3: Đạt mục tiêu cụ thể',
      duration: '8 tuần',
      goals: [
        `${goalLabel}: ${userData.specificResultDetails || 'Hoàn thành mục tiêu đề ra'}`,
        'Đánh giá tiến độ và điều chỉnh',
        'Chuẩn bị cho giai đoạn tiếp theo'
      ],
      tasks: [
        { id: 't9', text: `Hoàn thành: ${userData.specificResultDetails || 'mục tiêu đề ra'}`, completed: false },
        { id: 't10', text: 'Đánh giá lại lộ trình học tập', completed: false },
        { id: 't11', text: 'Nghiên cứu bước tiếp theo', completed: false },
        { id: 't12', text: 'Tổng kết kiến thức đã học', completed: false },
      ]
    },
    {
      id: '4',
      title: 'Giai đoạn 4: Hoàn thiện & bứt phá',
      duration: timeframe,
      goals: [
        `Hoàn thành mục tiêu: ${goalLabel}`,
        'Xây dựng portfolio/hồ sơ năng lực',
        'Kết nối với cộng đồng học tập'
      ],
      tasks: [
        { id: 't13', text: 'Lập kế hoạch chi tiết giai đoạn cuối', completed: false },
        { id: 't14', text: 'Thực hiện các bước quan trọng', completed: false },
        { id: 't15', text: 'Xây dựng portfolio cá nhân', completed: false },
        { id: 't16', text: 'Tham gia cộng đồng học tập', completed: false },
        { id: 't17', text: 'Hoàn thành mục tiêu cuối cùng', completed: false },
      ]
    }
  ];

  return {
    id: Date.now().toString(),
    title: `Lộ trình: ${goalLabel} - ${userData.specificResultDetails || 'Mục tiêu cá nhân'}`,
    createdAt: new Date(),
    phases,
    userInfo: userData
  };
}

// Get unique layers
const getUniqueLayers = () => {
  const layers: { id: string; title: string }[] = [];
  questions.forEach(q => {
    if (!layers.find(l => l.id === q.layer && l.title === q.layerTitle)) {
      layers.push({ id: q.layer, title: q.layerTitle });
    }
  });
  return layers;
};

export const RoadmapBuilder: React.FC<RoadmapBuilderProps> = ({ hollandResults, onRoadmapCreated }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<UserInfo>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter questions based on showIf conditions
  const visibleQuestions = questions.filter(q => !q.showIf || q.showIf(answers));
  const currentQuestion = visibleQuestions[currentStep];
  const isLastStep = currentStep === visibleQuestions.length - 1;
  const layers = getUniqueLayers();

  // Calculate current layer
  const getCurrentLayer = () => {
    if (!currentQuestion) return null;
    return layers.findIndex(l => l.id === currentQuestion.layer && l.title === currentQuestion.layerTitle);
  };

  const handleNext = () => {
    if (isLastStep) {
      handleGenerate();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleInputChange = (value: any) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.key]: value
    }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const roadmap = await generateRoadmapWithAI({
        ...answers as UserInfo,
        hollandResults
      });
      onRoadmapCreated(roadmap);
    } catch (error) {
      console.error('Error generating roadmap:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const canProceed = () => {
    const value = answers[currentQuestion?.key];
    if (currentQuestion?.type === 'number') {
      return value !== undefined && value !== '';
    }
    return value !== undefined && value !== '';
  };

  if (!currentQuestion) return null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Layer Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-1 mb-2 overflow-x-auto pb-2">
          {layers.map((layer, index) => {
            const currentLayerIndex = getCurrentLayer() || 0;
            const isCompleted = index < currentLayerIndex;
            const isCurrent = index === currentLayerIndex;
            return (
              <div 
                key={`${layer.id}-${layer.title}`}
                className={`flex-1 min-w-[80px] flex flex-col items-center gap-1 transition-all ${
                  isCompleted ? 'text-primary' : isCurrent ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isCompleted ? 'bg-primary text-primary-foreground' : 
                  isCurrent ? 'bg-primary/20 text-primary border-2 border-primary' : 
                  'bg-secondary text-muted-foreground'
                }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : layer.id}
                </div>
                <span className="text-xs text-center leading-tight hidden sm:block">{layer.title.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
        
        {/* Overall Progress Bar */}
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${((currentStep + 1) / visibleQuestions.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-muted-foreground">Câu {currentStep + 1}/{visibleQuestions.length}</span>
          <span className="text-primary font-medium">{currentQuestion.layerTitle}</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-card p-8">
        {/* AI Avatar & Question */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="chat-bubble-ai animate-fade-in flex-1">
            <p className="text-lg font-medium">{currentQuestion.label}</p>
          </div>
        </div>

        {/* Input Area */}
        <div className="mb-8 animate-fade-in">
          {/* Select Type */}
          {currentQuestion.type === 'select' && currentQuestion.options && (
            <div className="grid gap-3">
              {currentQuestion.options.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleInputChange(option.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all hover:border-primary/50 ${
                    answers[currentQuestion.key] === option.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/30 bg-secondary/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQuestion.key] === option.value
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`}>
                      {answers[currentQuestion.key] === option.value && (
                        <Check className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                    <span className="font-medium">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Radio Type */}
          {currentQuestion.type === 'radio' && currentQuestion.options && (
            <div className="flex flex-wrap gap-4">
              {currentQuestion.options.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleInputChange(option.value)}
                  className={`px-6 py-3 rounded-xl border-2 transition-all hover:border-primary/50 ${
                    answers[currentQuestion.key] === option.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/30 bg-secondary/30'
                  }`}
                >
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Text Type */}
          {currentQuestion.type === 'text' && (
            <input
              type="text"
              value={answers[currentQuestion.key] as string || ''}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={currentQuestion.placeholder}
              className="w-full bg-secondary/50 border border-border/30 rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          )}

          {/* Number Type */}
          {currentQuestion.type === 'number' && (
            <div className="flex items-center gap-4">
              <input
                type="number"
                min={currentQuestion.min || 1}
                max={currentQuestion.max || 100}
                value={answers[currentQuestion.key] as number || ''}
                onChange={(e) => handleInputChange(parseInt(e.target.value))}
                placeholder={currentQuestion.placeholder}
                className="w-32 bg-secondary/50 border border-border/30 rounded-xl px-6 py-4 text-xl text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {currentQuestion.min !== undefined && currentQuestion.max !== undefined && (
                <span className="text-muted-foreground">({currentQuestion.min} - {currentQuestion.max})</span>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            onClick={handlePrev}
            variant="outline"
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Quay lại
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed() || isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang tạo lộ trình...
              </>
            ) : isLastStep ? (
              <>
                <Sparkles className="w-4 h-4" />
                Tạo lộ trình với AI
              </>
            ) : (
              <>
                Tiếp tục
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Holland Context */}
      {hollandResults && (
        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-sm text-green-400">
            ✓ AI sẽ sử dụng kết quả Holland ({hollandResults.topThree.join(', ')}) để tạo lộ trình phù hợp nhất với bạn.
          </p>
        </div>
      )}
    </div>
  );
};

export default RoadmapBuilder;
