import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Assignment {
  id: string;
  exam_id: string | null;
  user_id: string | null;
  group_id: string | null;
  start_time: string;
  end_time: string;
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
  created_at: string;
  exam?: {
    id: string;
    title: string;
    code: string;
    type: string;
    duration: number;
    total_questions: number;
  };
  profile?: {
    id: string;
    name: string;
    email: string;
  };
  group?: {
    id: string;
    name: string;
    color: string;
  };
}

export function useAssignments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exam_assignments')
        .select(`
          *,
          exam:exams(id, title, code, type, duration, total_questions),
          profile:profiles(id, name, email),
          group:candidate_groups(id, name, color)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Assignment[];
    },
    enabled: !!user,
  });
}

export function useCandidateAssignments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['candidate-assignments', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get direct assignments
      const { data: directAssignments, error: directError } = await supabase
        .from('exam_assignments')
        .select(`
          *,
          exam:exams(*)
        `)
        .eq('user_id', user.id);

      if (directError) throw directError;

      // Get group memberships
      const { data: memberships } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      const groupIds = memberships?.map(m => m.group_id).filter(Boolean) || [];

      // Get group assignments
      let groupAssignments: any[] = [];
      if (groupIds.length > 0) {
        const { data, error } = await supabase
          .from('exam_assignments')
          .select(`
            *,
            exam:exams(*)
          `)
          .in('group_id', groupIds);

        if (!error && data) {
          groupAssignments = data;
        }
      }

      // Merge and deduplicate
      const allAssignments = [...(directAssignments || []), ...groupAssignments];
      const uniqueAssignments = allAssignments.reduce((acc, curr) => {
        const key = `${curr.exam_id}`;
        if (!acc[key]) {
          acc[key] = curr;
        }
        return acc;
      }, {} as Record<string, any>);

      // Check attempt status for each assignment
      const assignmentsWithStatus = await Promise.all(
        Object.values(uniqueAssignments).map(async (assignment: any) => {
          const { data: attempt } = await supabase
            .from('exam_attempts')
            .select('status')
            .eq('user_id', user.id)
            .eq('exam_id', assignment.exam_id)
            .maybeSingle();

          let examStatus = 'not_started';
          if (attempt) {
            examStatus = attempt.status === 'submitted' ? 'completed' : 'in_progress';
          }

          // Check if expired
          const now = new Date();
          const endTime = new Date(assignment.end_time);
          if (endTime < now && examStatus !== 'completed') {
            examStatus = 'expired';
          }

          return {
            ...assignment,
            attempt_status: examStatus,
          };
        })
      );

      return assignmentsWithStatus;
    },
    enabled: !!user,
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (assignmentData: {
      exam_id: string;
      user_id?: string;
      group_id?: string;
      start_time: string;
      end_time: string;
    }) => {
      // If assigning to a group, expand to individual assignments
      if (assignmentData.group_id && !assignmentData.user_id) {
        // Get all members of the group
        const { data: members, error: membersError } = await supabase
          .from('group_members')
          .select('user_id')
          .eq('group_id', assignmentData.group_id);

        if (membersError) throw membersError;

        // Create assignment for the group
        const { data, error } = await supabase
          .from('exam_assignments')
          .insert({
            exam_id: assignmentData.exam_id,
            group_id: assignmentData.group_id,
            start_time: assignmentData.start_time,
            end_time: assignmentData.end_time,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      // Direct assignment to user
      const { data, error } = await supabase
        .from('exam_assignments')
        .insert({
          exam_id: assignmentData.exam_id,
          user_id: assignmentData.user_id,
          start_time: assignmentData.start_time,
          end_time: assignmentData.end_time,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-assignments'] });
      toast({ title: 'Success', description: 'Assignment created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('exam_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast({ title: 'Success', description: 'Assignment deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}
