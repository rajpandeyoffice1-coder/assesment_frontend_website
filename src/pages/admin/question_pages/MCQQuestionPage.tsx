import { useEffect, useState } from "react";
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Modal } from "@/components/ui/Modal";
import api from "@/lib/axios";

/* ================= TYPES ================= */

type Bank = {
  _id: string;
  name: string;
  examType: "behavioral" | "mcq" | "aptitude" | "knowledge" | "intelligence";
};
type Section = { _id: string; name: string };
type Option = { key: string; text: string };

type MCQQuestion = {
  _id: string;
  question_text: string;
  section_id: Section;
  options: Option[];
  correct_option: string;
  weightage: number;
};

type QuestionForm = {
  question_text: string;
  section_id: string;
  options: Option[];
  correct_option: string;
  weightage: number;
};

/* ================= PAGE ================= */

export default function MCQQuestionPage() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);

  const [selectedBankId, setSelectedBankId] = useState("");

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState<QuestionForm>({
    question_text: "",
    section_id: "",
    options: [
      { key: "A", text: "" },
      { key: "B", text: "" },
      { key: "C", text: "" },
      { key: "D", text: "" },
    ],
    correct_option: "A",
    weightage: 1,
  });

  /* ================= API ================= */

  const loadBanks = async () => {
    const res = await api.get<Bank[]>("/question-banks");
    setBanks(res.data);
    const mcqBank = res.data.find(
      (b) => b.examType !== "behavioral"
    );

    if (mcqBank) {
      setSelectedBankId(mcqBank._id);
    }
  };

  const loadSections = async () => {
    const res = await api.get<Section[]>("/sections");
    setSections(res.data);
  };

  const loadQuestions = async () => {
    if (!selectedBankId) return;
    const res = await api.get<MCQQuestion[]>(`/questions/bank/${selectedBankId}`);
    setQuestions(res.data);
  };

  const submit = async () => {
    console.log("form", form);
    if (!selectedBankId) {
      alert("Please select a Question Bank");
      return;
    }

    const payload = {
      ...form,
      question_type: "mcq",
      question_bank_id: selectedBankId,
    };

    await (editId
      ? api.put(`/questions/${editId}`, payload)
      : api.post("/questions", payload));

    setOpen(false);
    setEditId(null);
    setForm({
      question_text: "",
      section_id: "",
      options: [
        { key: "A", text: "" },
        { key: "B", text: "" },
        { key: "C", text: "" },
        { key: "D", text: "" },
      ],
      correct_option: "A",
      weightage: 1,
    });

    loadQuestions();
  };

  const remove = async (id: string) => {
    await api.delete(`/questions/${id}`);
    loadQuestions();
  };

  useEffect(() => {
    loadBanks();
    loadSections();
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [selectedBankId]);

  return (
    <AdminLayout
      title="MCQ Questions"
      subtitle="Aptitude, Knowledge & Intelligence questions"
    >
      {/* TOP BAR */}
      <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
        <select
          className="
    w-full md:max-w-sm
    rounded-xl
    border border-slate-200 dark:border-slate-700
    bg-white/80 dark:bg-slate-900/80
    px-4 py-2.5
    text-sm font-medium
    text-slate-800 dark:text-slate-100
    shadow-sm
    backdrop-blur
    transition-all duration-200
    focus:outline-none
    focus:ring-2 focus:ring-indigo-500
    focus:border-indigo-500
    hover:border-slate-300 dark:hover:border-slate-600
  "
          value={selectedBankId}
          onChange={(e) => setSelectedBankId(e.target.value)}
        >
          <option value="">Select Question Bank *</option>
          {banks.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>

        <Button disabled={!selectedBankId} onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      </div>

      {/* QUESTIONS */}
      <div className="space-y-4">
        {questions.map((q) => (
          <Card key={q._id} variant="glass" className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{q.question_text}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Section: {q.section_id?.name} · Weightage: {q.weightage}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  {q.options.map((opt) => (
                    <div
                      key={opt.key}
                      className={`border rounded px-3 py-1 text-sm ${opt.key === q.correct_option
                        ? "border-emerald-500 bg-emerald-50"
                        : ""
                        }`}
                    >
                      <strong>{opt.key}.</strong> {opt.text}
                    </div>
                  ))}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <MoreVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditId(q._id);
                      setForm({
                        question_text: q.question_text,
                        section_id: q.section_id._id,
                        options: q.options,
                        correct_option: q.correct_option,
                        weightage: q.weightage,
                      });
                      setOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => remove(q._id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
      </div>

      {/* MODAL */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editId ? "Edit MCQ Question" : "Add MCQ Question"}
      >
        <select
          className="w-full border rounded px-3 py-2"
          value={selectedBankId}
          required
          onChange={(e) => setSelectedBankId(e.target.value)}
        >
          <option value="">Select Question Bank *</option>
          {banks.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>

        <Input
          className="mt-3"
          placeholder="Question text"
          value={form.question_text}
          onChange={(e) =>
            setForm({ ...form, question_text: e.target.value })
          }
        />

        <select
          className="mt-3 w-full border rounded px-3 py-2"
          value={form.section_id}
          onChange={(e) =>
            setForm({ ...form, section_id: e.target.value })
          }
        >
          <option value="">Select Section *</option>
          {sections.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>

        <div className="mt-4 space-y-2">
          {form.options.map((opt, index) => (
            <div key={opt.key} className="flex gap-2 items-center">
              <input
                type="radio"
                checked={form.correct_option === opt.key}
                onChange={() =>
                  setForm({ ...form, correct_option: opt.key })
                }
              />
              <span className="w-6">{opt.key}</span>
              <Input
                placeholder={`Option ${opt.key}`}
                value={opt.text}
                onChange={(e) => {
                  const updated = [...form.options];
                  updated[index].text = e.target.value;
                  setForm({ ...form, options: updated });
                }}
              />
            </div>
          ))}
        </div>

        <Input
          className="mt-3"
          type="number"
          placeholder="Weightage"
          value={form.weightage}
          onChange={(e) =>
            setForm({ ...form, weightage: Number(e.target.value) })
          }
        />

        <Button className="mt-4 w-full" onClick={submit}>
          Save Question
        </Button>
      </Modal>
    </AdminLayout>
  );
}
