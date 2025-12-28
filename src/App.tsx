import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/auth/LoginPage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import CandidatesPage from "./pages/admin/CandidatesPage";
import GroupsPage from "./pages/admin/GroupsPage";
import ExamsPage from "./pages/admin/ExamsPage";
import ExamCreatePage from "./pages/admin/ExamCreatePage";
import AssignmentsPage from "./pages/admin/AssignmentsPage";
import ReportsPage from "./pages/admin/ReportsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import HelpPage from "./pages/admin/HelpPage";

/* ================= QUESTION SYSTEM (10 PAGES) ================= */

import QuestionBanksPage from "./pages/admin/question_pages/QuestionBanksPage";
import QuestionBankQuestionsPage from "./pages/admin/question_pages/QuestionBankQuestionsPage";
import BehavioralQuestionPage from "./pages/admin/question_pages/BehavioralQuestionPage";
import MCQQuestionPage from "./pages/admin/question_pages/MCQQuestionPage";
import TraitsPage from "./pages/admin/question_pages/TraitsPage";
import SectionsPage from "./pages/admin/question_pages/SectionsPage";
import ScalesPage from "./pages/admin/question_pages/ScalesPage";
import BulkUploadPage from "./pages/admin/question_pages/BulkUploadPage";
import QuestionAnalyticsPage from "./pages/admin/question_pages/QuestionAnalyticsPage";


// Candidate Pages
import CandidateDashboard from "./pages/candidate/CandidateDashboard";
import CandidateExamsPage from "./pages/candidate/CandidateExamsPage";
import CandidateResultsPage from "./pages/candidate/CandidateResultsPage";
import CandidateProfilePage from "./pages/candidate/CandidateProfilePage";
import ExamInstructionsPage from "./pages/candidate/ExamInstructionsPage";
import ExamPage from "./pages/candidate/ExamPage";
import ResultPage from "./pages/candidate/ResultPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/candidates" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CandidatesPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/groups" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <GroupsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/exams" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ExamsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/exams/create" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ExamCreatePage />
              </ProtectedRoute>
            } />
            <Route path="/admin/assignments" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AssignmentsPage />
              </ProtectedRoute>
            } />

            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ReportsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/help" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <HelpPage />
              </ProtectedRoute>
            } />

            {/* ================= QUESTION SYSTEM ROUTES ================= */}

            <Route
              path="/admin/question-banks"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <QuestionBanksPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/question-banks/:bankId/questions"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <QuestionBankQuestionsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/questions/behavioral"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <BehavioralQuestionPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/questions/mcq"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <MCQQuestionPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/traits"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <TraitsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/sections"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <SectionsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/scales"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ScalesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/questions/bulk-upload"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <BulkUploadPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/questions/analytics"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <QuestionAnalyticsPage />
                </ProtectedRoute>
              }
            />


            {/* Candidate Routes */}
            <Route path="/candidate" element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <CandidateDashboard />
              </ProtectedRoute>
            } />
            <Route path="/candidate/exams" element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <CandidateExamsPage />
              </ProtectedRoute>
            } />

            <Route path="/candidate/results" element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <CandidateResultsPage />
              </ProtectedRoute>
            } />

            <Route path="/candidate/profile" element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <CandidateProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/candidate/exam/:assignmentId/instructions" element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <ExamInstructionsPage />
              </ProtectedRoute>
            } />
            <Route path="/candidate/exam/:assignmentId" element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <ExamPage />
              </ProtectedRoute>
            } />
            <Route path="/candidate/results/:id" element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <ResultPage />
              </ProtectedRoute>
            } />

            {/* <Route path="/candidate/results/:id" element={<ResultPage />} /> */}

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
