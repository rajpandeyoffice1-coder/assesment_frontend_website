import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Brain,
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

type Trait = {
  _id: string;
  name: string;
  description: string;
  color: string;
};

type TraitForm = {
  name: string;
  description: string;
  color: string;
};

/* ================= PAGE ================= */

export default function TraitsPage() {
  const [traits, setTraits] = useState<Trait[]>([]);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState<TraitForm>({
    name: "",
    description: "",
    color: "#22c55e",
  });

  /* ================= API ================= */

  const loadTraits = async () => {
    const res = await api.get<Trait[]>("/traits");
    setTraits(res.data);
  };

  const submit = async () => {
    if (editId) {
      await api.put(`/traits/${editId}`, form);
    } else {
      await api.post("/traits", form);
    }

    setOpen(false);
    setEditId(null);
    setForm({ name: "", description: "", color: "#22c55e" });
    loadTraits();
  };

  const remove = async (id: string) => {
    await api.delete(`/traits/${id}`);
    loadTraits();
  };

  /* ================= EFFECT ================= */

  useEffect(() => {
    loadTraits();
  }, []);

  const filteredTraits = traits.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout
      title="Behavioral Traits"
      subtitle="Manage personality traits for psychometric questions"
    >
      {/* ACTION BAR */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search traits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11"
          />
        </div>

        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Trait
        </Button>
      </div>

      {/* TRAITS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTraits.map((trait) => (
          <Card
            key={trait._id}
            variant="glass"
            className="p-6 hover-lift relative"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${trait.color}20` }}
              >
                <Brain className="w-6 h-6" style={{ color: trait.color }} />
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
                      setEditId(trait._id);
                      setForm({
                        name: trait.name,
                        description: trait.description,
                        color: trait.color,
                      });
                      setOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => remove(trait._id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <h3 className="font-bold text-lg mb-1">{trait.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {trait.description}
            </p>

            <div
              className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl"
              style={{ backgroundColor: trait.color }}
            />
          </Card>
        ))}
      </div>

      {/* CREATE / EDIT MODAL */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editId ? "Edit Trait" : "Create Trait"}
      >
        <Input
          placeholder="Trait name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

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
          Save Trait
        </Button>
      </Modal>
    </AdminLayout>
  );
}
