import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ExamAttempt {
  id: string;
  exam_id: string | null;
  user_id: string | null;
  assignment_id: string | null;
  status: 'in_progress' | 'submitted' | 'evaluated';
  started_at: string;
  submitted_at: string | null;
  current_question: number | null;
  time_remaining: number | null;
}

export interface ExamResponse {
  id: string;
  attempt_id: string | null;
  question_id: string | null;
  selected_option: string | null;
  is_flagged: boolean | null;
  time_taken: number | null;
  score: number | null;
}

export function useExamAttempt(examId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['exam-attempt', examId, user?.id],
    queryFn: async () => {
      if (!examId || !user) return null;

      const { data, error } = await supabase
        .from('exam_attempts')
        .select('*')
        .eq('exam_id', examId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as ExamAttempt | null;
    },
    enabled: !!user && !!examId,
  });
}

export function useAttemptResponses(attemptId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['attempt-responses', attemptId],
    queryFn: async () => {
      if (!attemptId) return [];

      const { data, error } = await supabase
        .from('exam_responses')
        .select('*')
        .eq('attempt_id', attemptId);

      if (error) throw error;
      return data as ExamResponse[];
    },
    enabled: !!user && !!attemptId,
  });
}

export function useStartExam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ examId, assignmentId, duration }: { examId: string; assignmentId?: string; duration: number }) => {
      if (!user) throw new Error('Not authenticated');

      // Check for existing attempt
      const { data: existing } = await supabase
        .from('exam_attempts')
        .select('*')
        .eq('exam_id', examId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Return existing attempt if in progress
        if (existing.status === 'in_progress') {
          return existing;
        }
        // Don't allow re-attempt if already submitted
        if (existing.status === 'submitted') {
          throw new Error('You have already completed this exam');
        }
      }

      // Create new attempt
      const { data, error } = await supabase
        .from('exam_attempts')
        .insert({
          exam_id: examId,
          user_id: user.id,
          assignment_id: assignmentId,
          status: 'in_progress',
          current_question: 0,
          time_remaining: duration * 60, // Convert minutes to seconds
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exam-attempt', variables.examId] });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useSaveResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      attemptId,
      questionId,
      selectedOption,
      isFlagged,
      timeTaken,
    }: {
      attemptId: string;
      questionId: string;
      selectedOption?: string;
      isFlagged?: boolean;
      timeTaken?: number;
    }) => {
      // Check if response exists
      const { data: existing } = await supabase
        .from('exam_responses')
        .select('id')
        .eq('attempt_id', attemptId)
        .eq('question_id', questionId)
        .maybeSingle();

      if (existing) {
        // Update existing response
        const { data, error } = await supabase
          .from('exam_responses')
          .update({
            selected_option: selectedOption,
            is_flagged: isFlagged,
            time_taken: timeTaken,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new response
        const { data, error } = await supabase
          .from('exam_responses')
          .insert({
            attempt_id: attemptId,
            question_id: questionId,
            selected_option: selectedOption,
            is_flagged: isFlagged ?? false,
            time_taken: timeTaken,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attempt-responses', variables.attemptId] });
    },
  });
}

export function useUpdateAttemptProgress() {
  return useMutation({
    mutationFn: async ({
      attemptId,
      currentQuestion,
      timeRemaining,
    }: {
      attemptId: string;
      currentQuestion: number;
      timeRemaining: number;
    }) => {
      const { error } = await supabase
        .from('exam_attempts')
        .update({
          current_question: currentQuestion,
          time_remaining: timeRemaining,
        })
        .eq('id', attemptId);

      if (error) throw error;
    },
  });
}

export function useSubmitExam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ attemptId, examId }: { attemptId: string; examId: string }) => {
      if (!user) throw new Error('Not authenticated');

      // Update attempt status
      const { error: attemptError } = await supabase
        .from('exam_attempts')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        })
        .eq('id', attemptId);

      if (attemptError) throw attemptError;

      // Calculate and store results
      const result = await calculateAndStoreResults(attemptId, examId, user.id);
      
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exam-attempt', variables.examId] });
      queryClient.invalidateQueries({ queryKey: ['candidate-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['exam-results'] });
      toast({ title: 'Success', description: 'Exam submitted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

async function calculateAndStoreResults(attemptId: string, examId: string, userId: string) {
  // Get exam details
  const { data: exam } = await supabase
    .from('exams')
    .select('*')
    .eq('id', examId)
    .single();

  if (!exam) throw new Error('Exam not found');

  // Get questions
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('exam_id', examId);

  if (!questions) throw new Error('Questions not found');

  // Get responses
  const { data: responses } = await supabase
    .from('exam_responses')
    .select('*')
    .eq('attempt_id', attemptId);

  const responseMap = new Map(responses?.map(r => [r.question_id, r]) || []);

  let totalScore = 0;
  let maxScore = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;
  let totalTimeTaken = 0;

  const traitScores: Record<string, { total: number; count: number }> = {};
  const intelligenceScores: Record<string, { total: number; count: number; max: number }> = {};
  const sectionScores: Record<string, { score: number; total: number; correct: number; count: number }> = {};

  for (const question of questions) {
    const questionOptions = Array.isArray(question.options) 
      ? question.options 
      : JSON.parse(question.options as string || '[]');
    
    const response = responseMap.get(question.id);
    const marks = question.marks || 1;
    const negativeMarks = question.negative_marks || 0;
    maxScore += marks;

    if (response) {
      totalTimeTaken += response.time_taken || 0;

      if (response.selected_option) {
        if (exam.type === 'behavioral') {
          // Likert scoring for behavioral
          const selectedScore = parseInt(response.selected_option) || 3;
          const trait = question.trait || 'General';
          
          if (!traitScores[trait]) {
            traitScores[trait] = { total: 0, count: 0 };
          }
          traitScores[trait].total += selectedScore;
          traitScores[trait].count += 1;
          totalScore += selectedScore;
          correctCount += 1;
        } else if (exam.type === 'intelligence') {
          // Intelligence weighted scoring
          const intelligence = question.intelligence || 'General';
          const weightage = question.weightage || 1;
          const isCorrect = response.selected_option === question.correct_answer;

          if (!intelligenceScores[intelligence]) {
            intelligenceScores[intelligence] = { total: 0, count: 0, max: 0 };
          }
          intelligenceScores[intelligence].max += weightage * marks;

          if (isCorrect) {
            const score = weightage * marks;
            intelligenceScores[intelligence].total += score;
            totalScore += score;
            correctCount += 1;
          } else {
            incorrectCount += 1;
            if (exam.negative_marking) {
              totalScore -= negativeMarks;
            }
          }
          intelligenceScores[intelligence].count += 1;
        } else {
          // MCQ scoring for aptitude/knowledge
          const isCorrect = response.selected_option === question.correct_answer;
          const difficulty = question.difficulty || 'medium';

          if (!sectionScores[difficulty]) {
            sectionScores[difficulty] = { score: 0, total: 0, correct: 0, count: 0 };
          }
          sectionScores[difficulty].total += marks;
          sectionScores[difficulty].count += 1;

          if (isCorrect) {
            totalScore += marks;
            correctCount += 1;
            sectionScores[difficulty].score += marks;
            sectionScores[difficulty].correct += 1;
          } else {
            incorrectCount += 1;
            if (exam.negative_marking) {
              totalScore -= negativeMarks;
            }
          }
        }
      } else {
        skippedCount += 1;
      }
    } else {
      skippedCount += 1;
    }
  }

  // Calculate percentages
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  // Format trait scores
  const traits = Object.entries(traitScores).map(([trait, data]) => ({
    trait,
    score: data.total,
    percentage: Math.round((data.total / (data.count * 5)) * 100),
  }));

  // Format intelligence scores
  const intelligences = Object.entries(intelligenceScores).map(([intelligence, data]) => ({
    intelligence,
    score: data.total,
    percentage: data.max > 0 ? Math.round((data.total / data.max) * 100) : 0,
  }));

  // Find dominant intelligence
  const sortedIntelligences = [...intelligences].sort((a, b) => b.percentage - a.percentage);
  const dominantIntelligence = sortedIntelligences[0]?.intelligence;
  const secondaryIntelligence = sortedIntelligences[1]?.intelligence;

  // Format section scores
  const sections = Object.entries(sectionScores).map(([section, data]) => ({
    section: section.charAt(0).toUpperCase() + section.slice(1),
    score: data.score,
    total: data.total,
    percentage: data.total > 0 ? Math.round((data.score / data.total) * 100) : 0,
    accuracy: data.count > 0 ? Math.round((data.correct / data.count) * 100) : 0,
  }));

  // Career fitment calculation (simplified)
  const careerFitment = calculateCareerFitment(traits, intelligences);

  // Store result
  const { data: result, error } = await supabase
    .from('exam_results')
    .insert({
      attempt_id: attemptId,
      exam_id: examId,
      user_id: userId,
      total_score: totalScore,
      max_score: maxScore,
      percentage,
      correct_count: correctCount,
      incorrect_count: incorrectCount,
      skipped_count: skippedCount,
      time_taken: totalTimeTaken,
      traits: traits.length > 0 ? traits : null,
      intelligences: intelligences.length > 0 ? intelligences : null,
      section_scores: sections.length > 0 ? sections : null,
      career_fitment: careerFitment,
    })
    .select()
    .single();

  if (error) throw error;
  return result;
}

function calculateCareerFitment(
  traits: { trait: string; score: number; percentage: number }[],
  intelligences: { intelligence: string; score: number; percentage: number }[]
) {
  const careers = [
    {
      career: 'Software Engineer',
      requiredTraits: ['Problem Solving', 'Analytical'],
      requiredIntelligences: ['Logical', 'Linguistic'],
    },
    {
      career: 'Data Scientist',
      requiredTraits: ['Analytical', 'Problem Solving'],
      requiredIntelligences: ['Logical', 'Spatial'],
    },
    {
      career: 'Product Manager',
      requiredTraits: ['Leadership', 'Communication'],
      requiredIntelligences: ['Interpersonal', 'Linguistic'],
    },
    {
      career: 'UX Designer',
      requiredTraits: ['Creativity', 'Communication'],
      requiredIntelligences: ['Spatial', 'Interpersonal'],
    },
  ];

  return careers.map(career => {
    let fitmentScore = 0;
    let factors = 0;

    career.requiredTraits.forEach(requiredTrait => {
      const trait = traits.find(t => t.trait.toLowerCase().includes(requiredTrait.toLowerCase()));
      if (trait) {
        fitmentScore += trait.percentage;
        factors += 1;
      }
    });

    career.requiredIntelligences.forEach(requiredInt => {
      const int = intelligences.find(i => i.intelligence.toLowerCase().includes(requiredInt.toLowerCase()));
      if (int) {
        fitmentScore += int.percentage;
        factors += 1;
      }
    });

    const fitment = factors > 0 ? Math.round(fitmentScore / factors) : 50;

    return {
      career: career.career,
      fitment,
      strengths: career.requiredTraits,
      reasoning: `Based on your ${career.requiredIntelligences.join(' and ')} abilities`,
    };
  }).sort((a, b) => b.fitment - a.fitment);
}
