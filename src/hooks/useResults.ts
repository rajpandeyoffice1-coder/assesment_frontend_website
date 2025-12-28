import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ExamResult {
  id: string;
  attempt_id: string | null;
  exam_id: string | null;
  user_id: string | null;
  total_score: number;
  max_score: number;
  percentage: number;
  correct_count: number | null;
  incorrect_count: number | null;
  skipped_count: number | null;
  time_taken: number | null;
  traits: TraitScore[] | null;
  intelligences: IntelligenceScore[] | null;
  section_scores: SectionScore[] | null;
  career_fitment: CareerFitment[] | null;
  created_at: string;
  exam?: {
    id: string;
    title: string;
    code: string;
    type: string;
    duration: number;
    total_questions: number;
  };
}

export interface TraitScore {
  trait: string;
  score: number;
  percentage: number;
}

export interface IntelligenceScore {
  intelligence: string;
  score: number;
  percentage: number;
}

export interface SectionScore {
  section: string;
  score: number;
  total: number;
  percentage: number;
  accuracy: number;
}

export interface CareerFitment {
  career: string;
  fitment: number;
  strengths: string[];
  reasoning: string;
}

export function useExamResults() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['exam-results', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('exam_results')
        .select(`
          *,
          exam:exams(id, title, code, type, duration, total_questions)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as ExamResult[];
    },
    enabled: !!user,
  });
}

export function useExamResult(examId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['exam-result', examId, user?.id],
    queryFn: async () => {
      if (!examId || !user) return null;

      const { data, error } = await supabase
        .from('exam_results')
        .select(`
          *,
          exam:exams(id, title, code, type, duration, total_questions)
        `)
        .eq('exam_id', examId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as ExamResult | null;
    },
    enabled: !!user && !!examId,
  });
}

export function useAllResults() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['all-results'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exam_results')
        .select(`
          *,
          exam:exams(id, title, code, type, duration, total_questions),
          profile:profiles(id, name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useResultStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['result-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: results, error } = await supabase
        .from('exam_results')
        .select('percentage, created_at')
        .eq('user_id', user.id);

      if (error) throw error;

      if (!results || results.length === 0) {
        return {
          averageScore: 0,
          bestPercentile: 0,
          examsCompleted: 0,
        };
      }

      const avgScore = Math.round(
        results.reduce((sum, r) => sum + r.percentage, 0) / results.length
      );
      const bestScore = Math.max(...results.map(r => r.percentage));

      return {
        averageScore: avgScore,
        bestPercentile: Math.round(bestScore * 0.9), // Simplified percentile
        examsCompleted: results.length,
      };
    },
    enabled: !!user,
  });
}
