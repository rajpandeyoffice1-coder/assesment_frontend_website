import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Layers,
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

type Section = {
  _id: string;
  name: string;
  examType: "aptitude" | "knowledge" | "intelligence";
  color: string;
};

type SectionForm = {
  name: string;
  examType: Section["examType"];
  color: string;
};

/* ================= PAGE ================= */

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState<SectionForm>({
    name: "",
    examType: "aptitude",
    color: "#0ea5e9",
  });

  /* ================= API ================= */

  const loadSections = async () => {
    const res = await api.get<Section[]>("/sections");
    setSections(res.data);
  };

  const submit = async () => {
    if (editId) {
      await api.put(`/sections/${editId}`, form);
    } else {
      await api.post("/sections", form);
    }

    setOpen(false);
    setEditId(null);
    setForm({
      name: "",
      examType: "aptitude",
      color: "#0ea5e9",
    });
    loadSections();
  };

  const remove = async (id: string) => {
    await api.delete(`/sections/${id}`);
    loadSections();
  };

  /* ================= EFFECT ================= */

  useEffect(() => {
    loadSections();
  }, []);

  const filteredSections = sections.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout
      title="Sections"
      subtitle="Manage sections for aptitude, knowledge and intelligence exams"
    >
      {/* ACTION BAR */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11"
          />
        </div>

        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Section
        </Button>
      </div>

      {/* SECTIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSections.map((section) => (
          <Card
            key={section._id}
            variant="glass"
            className="p-6 hover-lift relative"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${section.color}20` }}
              >
                <Layers className="w-6 h-6" style={{ color: section.color }} />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditId(section._id);
                      setForm({
                        name: section.name,
                        examType: section.examType,
                        color: section.color,
                      });
                      setOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => remove(section._id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <h3 className="font-bold text-lg mb-1">{section.name}</h3>
            <p className="text-sm text-muted-foreground capitalize">
              {section.examType} exam
            </p>

            <div
              className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl"
              style={{ backgroundColor: section.color }}
            />
          </Card>
        ))}
      </div>

      {/* CREATE / EDIT MODAL */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editId ? "Edit Section" : "Create Section"}
      >
        <Input
          placeholder="Section name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <select
          className="mt-3 w-full border rounded px-3 py-2"
          value={form.examType}
          onChange={(e) =>
            setForm({
              ...form,
              examType: e.target.value as SectionForm["examType"],
            })
          }
        >
          <option value="aptitude">Aptitude</option>
          <option value="knowledge">Knowledge</option>
          <option value="intelligence">Intelligence</option>
        </select>

        <Input
          className="mt-3"
          type="color"
          value={form.color}
          onChange={(e) => setForm({ ...form, color: e.target.value })}
        />

        <Button className="mt-4 w-full" onClick={submit}>
          Save Section
        </Button>
      </Modal>
    </AdminLayout>
  );
}
