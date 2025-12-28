import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Exam {
  id: string;
  title: string;
  code: string;
  description: string | null;
  type: 'behavioral' | 'aptitude' | 'knowledge' | 'intelligence';
  duration: number;
  total_questions: number;
  shuffle_questions: boolean;
  negative_marking: boolean;
  negative_marks: number | null;
  marks_per_question: number | null;
  allow_skip: boolean;
  auto_submit: boolean;
  status: 'draft' | 'published' | 'active' | 'completed';
  theme_color: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Question {
  id: string;
  exam_id: string | null;
  text: string;
  type: 'mcq' | 'mcq_image' | 'likert' | 'true_false' | 'scenario' | 'image_identification';
  options: QuestionOption[];
  correct_answer: string | null;
  marks: number;
  negative_marks: number | null;
  difficulty: 'easy' | 'medium' | 'hard';
  trait: string | null;
  intelligence: string | null;
  weightage: number | null;
  image_url: string | null;
  order_index: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  image?: string;
  isCorrect?: boolean;
  score?: number;
}

export function useExams() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Exam[];
    },
    enabled: !!user,
  });
}

export function useExam(examId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['exam', examId],
    queryFn: async () => {
      if (!examId) return null;
      
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('id', examId)
        .maybeSingle();

      if (error) throw error;
      return data as Exam | null;
    },
    enabled: !!user && !!examId,
  });
}

export function useExamQuestions(examId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['exam-questions', examId],
    queryFn: async () => {
      if (!examId) return [];
      
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('exam_id', examId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data.map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string || '[]'),
      })) as Question[];
    },
    enabled: !!user && !!examId,
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (examData: Partial<Exam>) => {
      const insertData = {
        title: examData.title || 'Untitled Exam',
        code: examData.code || `EXAM-${Date.now()}`,
        description: examData.description,
        type: examData.type || 'aptitude',
        duration: examData.duration || 60,
        total_questions: examData.total_questions || 0,
        shuffle_questions: examData.shuffle_questions ?? true,
        negative_marking: examData.negative_marking ?? false,
        negative_marks: examData.negative_marks,
        marks_per_question: examData.marks_per_question,
        allow_skip: examData.allow_skip ?? true,
        auto_submit: examData.auto_submit ?? true,
        status: examData.status || 'draft',
        theme_color: examData.theme_color,
        created_by: user?.id,
      };
      
      const { data, error } = await supabase
        .from('exams')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast({ title: 'Success', description: 'Exam created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateExam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...examData }: Partial<Exam> & { id: string }) => {
      const { data, error } = await supabase
        .from('exams')
        .update(examData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['exam', variables.id] });
      toast({ title: 'Success', description: 'Exam updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteExam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (examId: string) => {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', examId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast({ title: 'Success', description: 'Exam deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (questionData: Partial<Question>) => {
      const insertData = {
        exam_id: questionData.exam_id,
        text: questionData.text || '',
        type: questionData.type || 'mcq',
        options: JSON.stringify(questionData.options || []),
        correct_answer: questionData.correct_answer,
        marks: questionData.marks || 1,
        negative_marks: questionData.negative_marks,
        difficulty: questionData.difficulty || 'medium',
        trait: questionData.trait,
        intelligence: questionData.intelligence,
        weightage: questionData.weightage,
        image_url: questionData.image_url,
        order_index: questionData.order_index || 0,
      };
      
      const { data, error } = await supabase
        .from('questions')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exam-questions', variables.exam_id] });
      toast({ title: 'Success', description: 'Question added successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...questionData }: Partial<Question> & { id: string }) => {
      const updateData: any = { ...questionData };
      if (questionData.options) {
        updateData.options = JSON.stringify(questionData.options);
      }
      
      const { data, error } = await supabase
        .from('questions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['exam-questions', data.exam_id] });
      toast({ title: 'Success', description: 'Question updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ questionId, examId }: { questionId: string; examId: string }) => {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;
      return { examId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['exam-questions', data.examId] });
      toast({ title: 'Success', description: 'Question deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}
