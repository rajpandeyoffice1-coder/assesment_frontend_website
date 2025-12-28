import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  SlidersHorizontal,
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

type ScaleOption = {
  value: number;
  label: string;
};

type LikertScale = {
  _id: string;
  name: string;
  maxValue: number;
  options: ScaleOption[];
  color: string;
};

type ScaleForm = {
  name: string;
  maxValue: number;
  options: ScaleOption[];
  color: string;
};

/* ================= PAGE ================= */

export default function ScalesPage() {
  const [scales, setScales] = useState<LikertScale[]>([]);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  /* ================= HELPERS ================= */

  const generateOptions = (
    count: number,
    existing: ScaleOption[] = []
  ): ScaleOption[] => {
    return Array.from({ length: count }, (_, i) => {
      const value = i + 1;
      const found = existing.find((o) => o.value === value);
      return {
        value,
        label: found?.label || "",
      };
    });
  };

  /* ================= FORM ================= */

  const [form, setForm] = useState<ScaleForm>({
    name: "",
    maxValue: 5,
    options: generateOptions(5),
    color: "#a855f7",
  });

  /* ================= API ================= */

  const loadScales = async () => {
    const res = await api.get<LikertScale[]>("/scales");
    setScales(res.data);
  };

  const submit = async () => {
    if (editId) {
      await api.put(`/scales/${editId}`, form);
    } else {
      await api.post("/scales", form);
    }

    setOpen(false);
    setEditId(null);
    setForm({
      name: "",
      maxValue: 5,
      options: generateOptions(5),
      color: "#a855f7",
    });

    loadScales();
  };

  const remove = async (id: string) => {
    await api.delete(`/scales/${id}`);
    loadScales();
  };

  /* ================= EFFECT ================= */

  useEffect(() => {
    loadScales();
  }, []);

  const filteredScales = scales.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout
      title="Likert Scales"
      subtitle="Manage response scales for behavioral questions"
    >
      {/* ACTION BAR */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search scales..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11"
          />
        </div>

        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Scale
        </Button>
      </div>

      {/* SCALES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScales.map((scale) => (
          <Card
            key={scale._id}
            variant="glass"
            className="p-6 hover-lift relative"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${scale.color}20` }}
              >
                <SlidersHorizontal
                  className="w-6 h-6"
                  style={{ color: scale.color }}
                />
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
                      setEditId(scale._id);
                      setForm({
                        name: scale.name,
                        maxValue: scale.maxValue,
                        options: generateOptions(
                          scale.maxValue,
                          scale.options
                        ),
                        color: scale.color,
                      });
                      setOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => remove(scale._id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <h3 className="font-bold text-lg mb-2">{scale.name}</h3>

            <div className="space-y-1 text-sm text-muted-foreground">
              {scale.options.map((opt) => (
                <div key={opt.value} className="flex justify-between">
                  <span>{opt.value}</span>
                  <span>{opt.label}</span>
                </div>
              ))}
            </div>

            <div
              className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl"
              style={{ backgroundColor: scale.color }}
            />
          </Card>
        ))}
      </div>

      {/* CREATE / EDIT MODAL */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editId ? "Edit Likert Scale" : "Create Likert Scale"}
      >
        <Input
          placeholder="Scale name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <Input
          className="mt-3"
          type="number"
          min={2}
          max={10}
          placeholder="Max Scale Value"
          value={form.maxValue}
          onChange={(e) => {
            const value = Number(e.target.value);
            setForm((prev) => ({
              ...prev,
              maxValue: value,
              options: generateOptions(value, prev.options),
            }));
          }}
        />

        <div className="mt-4 space-y-2">
          {form.options.map((opt, index) => (
            <Input
              key={opt.value}
              placeholder={`Label for ${opt.value}`}
              value={opt.label}
              onChange={(e) => {
                const updated = [...form.options];
                updated[index] = {
                  ...updated[index],
                  label: e.target.value,
                };
                setForm({ ...form, options: updated });
              }}
            />
          ))}
        </div>

        <Input
          className="mt-3"
          type="color"
          value={form.color}
          onChange={(e) => setForm({ ...form, color: e.target.value })}
        />

        <Button className="mt-4 w-full" onClick={submit}>
          Save Scale
        </Button>
      </Modal>
    </AdminLayout>
  );
}
  