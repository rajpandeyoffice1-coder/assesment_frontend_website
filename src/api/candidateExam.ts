import api from "@/lib/axios";

export type ExamApiResponse = {
    assignment: {
        _id: string;
        status: "pending" | "in_progress" | "completed";
        start_at: string;
    };
    exam: {
        _id: string;
        title: string;
        type: "behavioral" | "aptitude" | "knowledge" | "intelligence";
        duration: number;
        totalQuestions: number;
    };
    questions: {
        _id: string;
        question_text: string;
        options: { key: string; text: string }[];
    }[];
};

export const fetchExamByAssignment = async (
    candidateId: string,
    assignmentId: string
): Promise<ExamApiResponse> => {
    const res = await api.get<{
        success: boolean;
        data: ExamApiResponse;
    }>(`/candidate/${candidateId}/assignments/${assignmentId}/exam`);

    return res.data.data;
};
