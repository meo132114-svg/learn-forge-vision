import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Sparkles, Loader2, Check, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { HollandResults } from './HollandTest';
import { Input } from '@/components/ui/input';

interface UserInfo {
  // Layer 1 - Profile
  gradeLevel: string;
  gradeLevelOther: string;
  birthYear: string;
  mainStrength: string;
  mainStrengthOther: string;
  selfRating: number;
  
  // Layer 2 - Goals
  mainGoal: string;
  mainGoalOther: string;
  goalTimeframe: string;
  goalTimeframeOther: string;
  
  // Layer 3 - Interests
  focusSubjects: string[];
  focusSubjectsOther: string;
  learningStyle: string;
  learningStyleOther: string;
  learningHate: string;
  learningHateOther: string;
  
  // Layer 4 - Skill Gap
  weakestSubject: string;
  previousLevel: string;
  previousLevelOther: string;
  difficultyResponse: string;
  difficultyResponseOther: string;
  
  // Layer 5 - Constraints
  dailyStudyTime: string;
  dailyStudyTimeOther: string;
  bestStudyTime: string;
  bestStudyTimeOther: string;
  budget: string;
  budgetOther: string;
  device: string;
  deviceOther: string;
  
  // Layer 6 - Behavior
  studyPattern: string;
  studyPatternOther: string;
  hasQuitBefore: string;
  quitReason: string;
  quitTrigger: string;
  quitTriggerOther: string;
  
  // Layer 7 - Mindset
  studyMotivation: string;
  studyMotivationOther: string;
  failureResponse: string;
  failureResponseOther: string;
  aiRole: string;
  aiRoleOther: string;
  
  // Layer 8 - Decision
  roadmapStyle: string;
  priority: string;
  priorityOther: string;
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
  hasOtherOption?: boolean;
  maxSelect?: number;
}

// List of subjects for the chips selector
const subjectOptions: QuestionOption[] = [
  { value: 'toan', label: 'Toán' },
  { value: 'vatly', label: 'Vật lý' },
  { value: 'hoahoc', label: 'Hóa học' },
  { value: 'sinhhoc', label: 'Sinh học' },
  { value: 'nguvan', label: 'Ngữ văn' },
  { value: 'tiengAnh', label: 'Tiếng Anh' },
  { value: 'lichsu', label: 'Lịch sử' },
  { value: 'dialy', label: 'Địa lý' },
  { value: 'gdcd', label: 'GDCD' },
  { value: 'tinhoc', label: 'Tin học' },
  { value: 'congnght', label: 'Công nghệ' },
  { value: 'amnhac', label: 'Âm nhạc' },
  { value: 'mythuat', label: 'Mỹ thuật' },
  { value: 'theduc', label: 'Thể dục' },
];

// ============================================
// CÂU HỎI 8 LAYERS (ĐÃ CẬP NHẬT)
// ============================================
const questions: Question[] = [
  // 1️⃣ LAYER 1: Profile Layer
  {
    key: 'gradeLevel',
    label: 'Bạn đang học lớp mấy?',
    type: 'select',
    layer: '1',
    layerTitle: 'Thông tin cá nhân',
    hasOtherOption: true,
    options: [
      { value: '10', label: 'Lớp 10' },
      { value: '11', label: 'Lớp 11' },
      { value: '12', label: 'Lớp 12' },
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
    key: 'mainStrength',
    label: 'Điểm mạnh nhất hiện tại của bạn là gì?',
    type: 'select',
    layer: '1',
    layerTitle: 'Thông tin cá nhân',
    hasOtherOption: true,
    options: [
      { value: 'toan_logic', label: 'Toán / Logic' },
      { value: 'ngonngu', label: 'Ngôn ngữ' },
      { value: 'sangtao', label: 'Sáng tạo' },
      { value: 'giaotiep', label: 'Giao tiếp' },
      { value: 'kyluat', label: 'Kỷ luật – tự học' },
    ]
  },
  {
    key: 'selfRating',
    label: 'Bạn tự đánh giá năng lực học tập hiện tại (1–10)?',
    type: 'number',
    layer: '1',
    layerTitle: 'Thông tin cá nhân',
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
    hasOtherOption: true,
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
    hasOtherOption: true,
    options: [
      { value: 'duoi6thang', label: '< 6 tháng' },
      { value: '6-12thang', label: '6–12 tháng' },
      { value: '1-3nam', label: '1–3 năm' },
      { value: 'chuaro', label: 'Chưa rõ' },
    ]
  },

  // 3️⃣ LAYER 3: Interest Layer
  {
    key: 'focusSubjects',
    label: 'Chọn tối đa 4 môn học bạn muốn tập trung nhất:',
    type: 'chips',
    layer: '3',
    layerTitle: 'Định hướng & sở thích',
    hasOtherOption: true,
    maxSelect: 4,
    options: subjectOptions
  },
  {
    key: 'learningStyle',
    label: 'Khi học, bạn thích kiểu nào hơn?',
    type: 'select',
    layer: '3',
    layerTitle: 'Định hướng & sở thích',
    hasOtherOption: true,
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
    hasOtherOption: true,
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
    hasOtherOption: true,
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
    hasOtherOption: true,
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
    hasOtherOption: true,
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
    hasOtherOption: true,
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
    hasOtherOption: true,
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
    hasOtherOption: true,
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
    hasOtherOption: true,
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
    hasOtherOption: true,
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
    hasOtherOption: true,
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
    hasOtherOption: true,
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
    hasOtherOption: true,
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
    hasOtherOption: true,
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
    // Get display values for chips
    const focusSubjectsLabels = userData.focusSubjects?.map(v => 
      subjectOptions.find(o => o.value === v)?.label || v
    ) || [];
    if (userData.focusSubjectsOther) {
      focusSubjectsLabels.push(userData.focusSubjectsOther);
    }

    // Helper to get value or other
    const getValueOrOther = (key: keyof UserInfo, otherKey: keyof UserInfo, question: Question | undefined) => {
      const value = userData[key] as string;
      if (value === 'other') {
        return userData[otherKey] as string || 'Không xác định';
      }
      return question?.options?.find(o => o.value === value)?.label || value;
    };

    // Prepare user data summary for AI
    const userDataSummary = {
      profile: {
        gradeLevel: getValueOrOther('gradeLevel', 'gradeLevelOther', questions.find(q => q.key === 'gradeLevel')),
        birthYear: userData.birthYear,
        mainStrength: getValueOrOther('mainStrength', 'mainStrengthOther', questions.find(q => q.key === 'mainStrength')),
        selfRating: userData.selfRating
      },
      goals: {
        mainGoal: getValueOrOther('mainGoal', 'mainGoalOther', questions.find(q => q.key === 'mainGoal')),
        timeframe: getValueOrOther('goalTimeframe', 'goalTimeframeOther', questions.find(q => q.key === 'goalTimeframe')),
      },
      interests: {
        focusSubjects: focusSubjectsLabels.join(', '),
        learningStyle: getValueOrOther('learningStyle', 'learningStyleOther', questions.find(q => q.key === 'learningStyle')),
        learningHate: getValueOrOther('learningHate', 'learningHateOther', questions.find(q => q.key === 'learningHate'))
      },
      skillGap: {
        weakestSubject: userData.weakestSubject,
        previousLevel: getValueOrOther('previousLevel', 'previousLevelOther', questions.find(q => q.key === 'previousLevel')),
        difficultyResponse: getValueOrOther('difficultyResponse', 'difficultyResponseOther', questions.find(q => q.key === 'difficultyResponse'))
      },
      constraints: {
        dailyStudyTime: getValueOrOther('dailyStudyTime', 'dailyStudyTimeOther', questions.find(q => q.key === 'dailyStudyTime')),
        bestStudyTime: getValueOrOther('bestStudyTime', 'bestStudyTimeOther', questions.find(q => q.key === 'bestStudyTime')),
        budget: getValueOrOther('budget', 'budgetOther', questions.find(q => q.key === 'budget')),
        device: getValueOrOther('device', 'deviceOther', questions.find(q => q.key === 'device'))
      },
      behavior: {
        studyPattern: getValueOrOther('studyPattern', 'studyPatternOther', questions.find(q => q.key === 'studyPattern')),
        hasQuitBefore: userData.hasQuitBefore,
        quitReason: userData.quitReason,
        quitTrigger: getValueOrOther('quitTrigger', 'quitTriggerOther', questions.find(q => q.key === 'quitTrigger'))
      },
      mindset: {
        studyMotivation: getValueOrOther('studyMotivation', 'studyMotivationOther', questions.find(q => q.key === 'studyMotivation')),
        failureResponse: getValueOrOther('failureResponse', 'failureResponseOther', questions.find(q => q.key === 'failureResponse')),
        aiRole: getValueOrOther('aiRole', 'aiRoleOther', questions.find(q => q.key === 'aiRole'))
      },
      decision: {
        roadmapStyle: userData.roadmapStyle,
        priority: getValueOrOther('priority', 'priorityOther', questions.find(q => q.key === 'priority'))
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
      title: roadmapData.title || `Lộ trình học tập cá nhân`,
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
      title: `Lộ trình học tập cá nhân`,
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

  const focusSubjectsLabels = userData.focusSubjects?.map(v => 
    subjectOptions.find(o => o.value === v)?.label || v
  ).join(', ') || 'Các môn học chính';

  const phases: Phase[] = [
    {
      id: '1',
      title: 'Giai đoạn 1: Xây dựng nền tảng',
      duration: '4 tuần',
      goals: [
        'Thiết lập thói quen học tập phù hợp với lịch trình cá nhân',
        `Tập trung vào điểm mạnh: ${questions.find(q => q.key === 'mainStrength')?.options?.find(o => o.value === userData.mainStrength)?.label || userData.mainStrengthOther}`,
        `Cải thiện môn yếu: ${userData.weakestSubject}`
      ],
      tasks: [
        { id: 't1', text: `Học ${userData.dailyStudyTime === '120+' ? '2+' : userData.dailyStudyTime} phút/ngày vào buổi ${questions.find(q => q.key === 'bestStudyTime')?.options?.find(o => o.value === userData.bestStudyTime)?.label?.toLowerCase() || 'tối'}`, completed: false },
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
        `Nâng cao năng lực theo phong cách học: ${questions.find(q => q.key === 'learningStyle')?.options?.find(o => o.value === userData.learningStyle)?.label || userData.learningStyleOther}`,
        `Tập trung các môn: ${focusSubjectsLabels}`,
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
        `${goalLabel}: Hoàn thành mục tiêu đề ra`,
        'Đánh giá tiến độ và điều chỉnh',
        'Chuẩn bị cho giai đoạn tiếp theo'
      ],
      tasks: [
        { id: 't9', text: 'Hoàn thành mục tiêu đề ra', completed: false },
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
    title: `Lộ trình: ${goalLabel}`,
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
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiChatMessage, setAiChatMessage] = useState('');
  const [aiChatResponse, setAiChatResponse] = useState('');
  const [isAIChatLoading, setIsAIChatLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Scroll to top when step changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentStep]);

  const handleNext = () => {
    if (isLastStep) {
      setShowAIChat(true);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (showAIChat) {
      setShowAIChat(false);
    } else {
      setCurrentStep(prev => Math.max(0, prev - 1));
    }
  };

  const handleInputChange = (value: any) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.key]: value
    }));
  };

  const handleOtherInputChange = (value: string) => {
    const otherKey = `${currentQuestion.key}Other` as keyof UserInfo;
    setAnswers(prev => ({
      ...prev,
      [otherKey]: value
    }));
  };

  // Handle chips selection (multi-select with max limit)
  const handleChipsChange = (value: string) => {
    const currentValues = (answers[currentQuestion.key] as string[]) || [];
    const maxSelect = currentQuestion.maxSelect || 4;
    
    if (currentValues.includes(value)) {
      // Remove if already selected
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.key]: currentValues.filter(v => v !== value)
      }));
    } else if (currentValues.length < maxSelect) {
      // Add if under limit
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.key]: [...currentValues, value]
      }));
    } else {
      toast.error(`Bạn chỉ có thể chọn tối đa ${maxSelect} mục`);
    }
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

  const handleAIChatSubmit = async () => {
    if (!aiChatMessage.trim()) return;
    
    setIsAIChatLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: {
          messages: [{
            role: 'user',
            content: `Dựa trên thông tin người dùng đã cung cấp:
${JSON.stringify(answers, null, 2)}

Yêu cầu bổ sung của người dùng: ${aiChatMessage}

Hãy tư vấn và điều chỉnh lộ trình phù hợp.`
          }],
          systemPrompt: 'Bạn là AI chuyên tư vấn học tập. Hãy trả lời ngắn gọn, rõ ràng và hữu ích.'
        }
      });

      if (error) throw error;
      setAiChatResponse(data.response);
    } catch (error) {
      console.error('AI chat error:', error);
      toast.error('Không thể kết nối AI. Vui lòng thử lại.');
    } finally {
      setIsAIChatLoading(false);
    }
  };

  const canProceed = () => {
    if (!currentQuestion) return false;
    
    const value = answers[currentQuestion.key];
    
    if (currentQuestion.type === 'chips') {
      const values = value as string[] | undefined;
      return values && values.length > 0;
    }
    
    if (value === 'other') {
      const otherKey = `${currentQuestion.key}Other` as keyof UserInfo;
      const otherValue = answers[otherKey];
      return otherValue !== undefined && otherValue !== '';
    }
    
    if (currentQuestion.type === 'number') {
      return value !== undefined && value !== '';
    }
    
    return value !== undefined && value !== '';
  };

  if (!currentQuestion && !showAIChat) return null;

  // Show AI Chat section after completing questions
  if (showAIChat) {
    return (
      <div ref={containerRef} className="max-w-3xl mx-auto">
        {/* Progress complete */}
        <div className="mb-6">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-accent w-full" />
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">Hoàn thành câu hỏi ✓</p>
        </div>

        {/* AI Chat Card */}
        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Tùy chỉnh với AI</h3>
              <p className="text-sm text-muted-foreground">Bạn có yêu cầu đặc biệt nào cho lộ trình không?</p>
            </div>
          </div>

          {/* Chat input */}
          <div className="space-y-4 mb-6">
            <textarea
              value={aiChatMessage}
              onChange={(e) => setAiChatMessage(e.target.value)}
              placeholder="VD: Tôi muốn tập trung nhiều hơn vào tiếng Anh, hoặc cần lộ trình phù hợp với lịch làm thêm..."
              className="w-full h-24 bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
            
            <Button
              onClick={handleAIChatSubmit}
              disabled={isAIChatLoading || !aiChatMessage.trim()}
              className="w-full gap-2"
              variant="outline"
            >
              {isAIChatLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4" />
                  Gửi yêu cầu
                </>
              )}
            </Button>
          </div>

          {/* AI Response */}
          {aiChatResponse && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-xl">
              <p className="text-sm font-medium text-primary mb-2">AI phản hồi:</p>
              <p className="text-sm whitespace-pre-wrap">{aiChatResponse}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button onClick={handlePrev} variant="outline" className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Quay lại
            </Button>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang tạo lộ trình...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Tạo lộ trình với AI
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
  }

  return (
    <div ref={containerRef} className="max-w-3xl mx-auto">
      {/* Layer Progress: Đã nhích lên và làm dày thanh progress */}
      <div className="mb-10 -mt-3"> 
        <div className="h-4 bg-secondary rounded-full overflow-hidden shadow-inner border border-white/5">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / visibleQuestions.length) * 100}%` }}
          />
        </div>
        
        {/* Thông tin số câu và Giai đoạn */}
        <div className="flex justify-between items-center mt-3 px-1">
          <span className="text-muted-foreground font-semibold text-xs bg-secondary/50 px-2 py-1 rounded">
            CÂU {currentStep + 1} / {visibleQuestions.length}
          </span>
          <span className="text-primary font-bold uppercase tracking-widest text-[10px] sm:text-xs">
            {currentQuestion.layerTitle}
          </span>
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
            {currentQuestion.type === 'chips' && currentQuestion.maxSelect && (
              <p className="text-sm text-muted-foreground mt-1">
                (Đã chọn: {((answers[currentQuestion.key] as string[]) || []).length}/{currentQuestion.maxSelect})
              </p>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="mb-8 animate-fade-in">
          {/* Chips Type (Multi-select) */}
          {currentQuestion.type === 'chips' && currentQuestion.options && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {currentQuestion.options.map(option => {
                  const isSelected = ((answers[currentQuestion.key] as string[]) || []).includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleChipsChange(option.value)}
                      className={`px-4 py-2 rounded-full border-2 transition-all text-sm ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border/30 bg-secondary/30 hover:border-primary/50'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              
              {/* Other option for chips */}
              {currentQuestion.hasOtherOption && (
                <div className="mt-4">
                  <label className="text-sm text-muted-foreground mb-2 block">Môn khác (nếu có):</label>
                  <Input
                    type="text"
                    value={(answers[`${currentQuestion.key}Other` as keyof UserInfo] as string) || ''}
                    onChange={(e) => handleOtherInputChange(e.target.value)}
                    placeholder="Nhập môn học khác..."
                    className="bg-secondary/50"
                  />
                </div>
              )}
            </div>
          )}

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
              
              {/* Other option */}
              {currentQuestion.hasOtherOption && (
                <button
                  onClick={() => handleInputChange('other')}
                  className={`p-4 rounded-xl border-2 text-left transition-all hover:border-primary/50 ${
                    answers[currentQuestion.key] === 'other'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/30 bg-secondary/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQuestion.key] === 'other'
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`}>
                      {answers[currentQuestion.key] === 'other' && (
                        <Check className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                    <span className="font-medium">KHÁC</span>
                  </div>
                </button>
              )}
              
              {/* Other input field */}
              {currentQuestion.hasOtherOption && answers[currentQuestion.key] === 'other' && (
                <Input
                  type="text"
                  value={(answers[`${currentQuestion.key}Other` as keyof UserInfo] as string) || ''}
                  onChange={(e) => handleOtherInputChange(e.target.value)}
                  placeholder="Nhập câu trả lời của bạn..."
                  className="mt-2 bg-secondary/50"
                  autoFocus
                />
              )}
            </div>
          )}

          {/* Radio Type */}
          {currentQuestion.type === 'radio' && currentQuestion.options && (
            <div className="space-y-3">
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
                
                {/* Other option for radio */}
                {currentQuestion.hasOtherOption && (
                  <button
                    onClick={() => handleInputChange('other')}
                    className={`px-6 py-3 rounded-xl border-2 transition-all hover:border-primary/50 ${
                      answers[currentQuestion.key] === 'other'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/30 bg-secondary/30'
                    }`}
                  >
                    <span className="font-medium">KHÁC</span>
                  </button>
                )}
              </div>
              
              {/* Other input field for radio */}
              {currentQuestion.hasOtherOption && answers[currentQuestion.key] === 'other' && (
                <Input
                  type="text"
                  value={(answers[`${currentQuestion.key}Other` as keyof UserInfo] as string) || ''}
                  onChange={(e) => handleOtherInputChange(e.target.value)}
                  placeholder="Nhập câu trả lời của bạn..."
                  className="mt-2 bg-secondary/50"
                  autoFocus
                />
              )}
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
                <MessageCircle className="w-4 h-4" />
                Tiếp tục
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
