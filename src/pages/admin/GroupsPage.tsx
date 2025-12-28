import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Users,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
  Mail,
  Phone,
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

type Group = {
  _id: string;
  name: string;
  description: string;
  color: string;
  candidateCount: number;
  createdAt: string;
};

type Candidate = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  group?: { _id: string };
};

type GroupForm = {
  name: string;
  description: string;
  color: string;
};

/* ================= PAGE ================= */

export default function GroupsPage() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState<Group[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [viewGroup, setViewGroup] = useState<Group | null>(null);

  const [form, setForm] = useState<GroupForm>({
    name: "",
    description: "",
    color: "#6366f1",
  });

  const loadGroups = async () => {
    const res = await api.get<Group[]>("/admin/groups");
    setGroups(res.data);
  };

  const loadGroupCandidates = async (groupId: string) => {
    const res = await api.get<Candidate[]>("/admin/candidates");
    setCandidates(res.data.filter((c: Candidate) => c.group?._id === groupId));
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const submit = async () => {
    if (editId) {
      await api.put(`/admin/groups/${editId}`, form);
    } else {
      await api.post("/admin/groups", form);
    }
    setOpen(false);
    setEditId(null);
    setForm({ name: "", description: "", color: "#6366f1" });
    loadGroups();
  };

  const remove = async (id: string) => {
    await api.delete(`/admin/groups/${id}`);
    loadGroups();
  };

  return (
    <AdminLayout
      title="Groups"
      subtitle="Organize candidates into groups for easier management"
    >
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11"
          />
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <Card
            key={group._id}
            variant="glass"
            className="p-6 hover-lift cursor-pointer relative"
            onClick={() => {
              setViewGroup(group);
              loadGroupCandidates(group._id);
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${group.color}20` }}
              >
                <Users className="w-6 h-6" style={{ color: group.color }} />
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
                      setEditId(group._id);
                      setForm({
                        name: group.name,
                        description: group.description,
                        color: group.color,
                      });
                      setOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Group
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => remove(group._id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <h3 className="font-bold text-lg mb-2">{group.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {group.description}
            </p>

            <div className="flex justify-between items-center mt-4 text-sm">
              <span>{group.candidateCount} candidates</span>
              <span>{new Date(group.createdAt).toLocaleDateString()}</span>
            </div>

            <div
              className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl"
              style={{ backgroundColor: group.color }}
            />
          </Card>
        ))}
      </div>

      {/* CREATE / EDIT GROUP MODAL */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editId ? "Edit Group" : "Create Group"}
      >
        <Input
          placeholder="Group name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          className="mt-3"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <Input
          className="mt-3"
          type="color"
          value={form.color}
          onChange={(e) => setForm({ ...form, color: e.target.value })}
        />
        <Button className="mt-4 w-full" onClick={submit}>
          Save
        </Button>
      </Modal>

      {/* GROUP CANDIDATES MODAL */}
      <Modal
        open={!!viewGroup}
        onClose={() => setViewGroup(null)}
        title={viewGroup?.name ?? ""}
      >
        <div className="space-y-3 max-h-[50vh] overflow-auto">
          {candidates.map((c) => (
            <div
              key={c._id}
              className="flex justify-between items-center border rounded p-3"
            >
              <div>
                <p className="font-medium">{c.name}</p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {c.email}
                  </span>
                  {c.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {c.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          className="mt-4 w-full"
          onClick={() =>
            navigate(`/admin/candidates?group=${viewGroup?._id}`)
          }
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add More Candidates
        </Button>
      </Modal>
    </AdminLayout>
  );
}
