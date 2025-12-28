import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Layers,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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

type QuestionBank = {
  _id: string;
  name: string;
  examType: "behavioral" | "aptitude" | "knowledge" | "intelligence";
  description: string;
  color: string;
  createdAt: string;
};

type BankForm = {
  name: string;
  examType: QuestionBank["examType"];
  description: string;
  color: string;
};

/* ================= PAGE ================= */

export default function QuestionBanksPage() {
  const navigate = useNavigate();

  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState<BankForm>({
    name: "",
    examType: "behavioral",
    description: "",
    color: "#6366f1",
  });

  /* ================= API ================= */

  const loadBanks = async () => {
    const res = await api.get<QuestionBank[]>("/question-banks");
    setBanks(res.data);
  };

  const submit = async () => {
    if (editId) {
      await api.put(`/question-banks/${editId}`, form);
    } else {
      await api.post("/question-banks", form);
    }
    setOpen(false);
    setEditId(null);
    setForm({
      name: "",
      examType: "behavioral",
      description: "",
      color: "#6366f1",
    });
    loadBanks();
  };

  const remove = async (id: string) => {
    await api.delete(`/question-banks/${id}`);
    loadBanks();
  };

  useEffect(() => {
    loadBanks();
  }, []);

  const filteredBanks = banks.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout
      title="Question Banks"
      subtitle="Create and manage question banks"
    >
      {/* ACTION BAR */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search banks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11"
          />
        </div>

        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Bank
        </Button>
      </div>

      {/* BANK GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBanks.map((bank) => (
          <Card
            key={bank._id}
            variant="glass"
            className="p-6 hover-lift cursor-pointer relative"
            onClick={() =>
              navigate(`/admin/question-banks/${bank._id}/questions`)
            }
          >
            <div className="flex justify-between mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${bank.color}20` }}
              >
                <Layers className="w-6 h-6" style={{ color: bank.color }} />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditId(bank._id);
                      setForm({
                        name: bank.name,
                        examType: bank.examType,
                        description: bank.description,
                        color: bank.color,
                      });
                      setOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => remove(bank._id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <h3 className="font-bold text-lg">{bank.name}</h3>
            <p className="text-sm capitalize text-muted-foreground">
              {bank.examType} exam
            </p>

            <div
              className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl"
              style={{ backgroundColor: bank.color }}
            />
          </Card>
        ))}
      </div>

      {/* MODAL */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editId ? "Edit Question Bank" : "Create Question Bank"}
      >
        <Input
          placeholder="Bank name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <select
          className="mt-3 w-full border rounded px-3 py-2"
          value={form.examType}
          onChange={(e) =>
            setForm({
              ...form,
              examType: e.target.value as BankForm["examType"],
            })
          }
        >
          <option value="behavioral">Behavioral</option>
          <option value="aptitude">Aptitude</option>
          <option value="knowledge">Knowledge</option>
          <option value="intelligence">Intelligence</option>
        </select>

        <Input
          className="mt-3"
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <Input
          className="mt-3"
          type="color"
          value={form.color}
          onChange={(e) => setForm({ ...form, color: e.target.value })}
        />

        <Button className="mt-4 w-full" onClick={submit}>
          Save Bank
        </Button>
      </Modal>
    </AdminLayout>
  );
}
