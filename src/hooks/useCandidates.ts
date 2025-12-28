import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Candidate {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'candidate';
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  groups?: { id: string; name: string; color: string }[];
  exams_completed?: number;
}

export function useCandidates() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['candidates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'candidate')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get group memberships and exam counts for each candidate
      const candidatesWithData = await Promise.all(
        data.map(async (candidate) => {
          // Get groups
          const { data: memberships } = await supabase
            .from('group_members')
            .select(`
              group:candidate_groups(id, name, color)
            `)
            .eq('user_id', candidate.id);

          // Get completed exams count
          const { count: examsCompleted } = await supabase
            .from('exam_attempts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', candidate.id)
            .eq('status', 'submitted');

          return {
            ...candidate,
            groups: memberships?.map(m => m.group).filter(Boolean) || [],
            exams_completed: examsCompleted || 0,
          };
        })
      );

      return candidatesWithData as Candidate[];
    },
    enabled: !!user,
  });
}

export function useCandidate(candidateId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['candidate', candidateId],
    queryFn: async () => {
      if (!candidateId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', candidateId)
        .maybeSingle();

      if (error) throw error;
      return data as Candidate | null;
    },
    enabled: !!user && !!candidateId,
  });
}

export function useCreateCandidate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (candidateData: { email: string; name: string; password: string; phone?: string }) => {
      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: candidateData.email,
        password: candidateData.password,
        options: {
          data: {
            name: candidateData.name,
            role: 'candidate',
          },
        },
      });

      if (authError) throw authError;

      // Profile is auto-created by trigger, but update phone if provided
      if (candidateData.phone && authData.user) {
        await supabase
          .from('profiles')
          .update({ phone: candidateData.phone })
          .eq('id', authData.user.id);
      }

      return authData.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast({ title: 'Success', description: 'Candidate created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateCandidate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...candidateData }: { id: string; name?: string; phone?: string; avatar_url?: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(candidateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['candidate', variables.id] });
      toast({ title: 'Success', description: 'Candidate updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}
