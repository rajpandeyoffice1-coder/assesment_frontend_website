import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Search,
  Calendar,
  Users,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  fetchAssignments,
  createAssignment,
  deleteAssignment,
  Assignment,
} from "@/api/assignments";
import { fetchExams, Exam } from "@/api/exams";
import api from "@/lib/axios";

type Group = {
  _id: string;
  name: string;
};

type Candidate = {
  _id: string;
  name: string;
};

const statusColors = {
  pending: "bg-warning/20 text-warning",
  active: "bg-success/20 text-success",
  completed: "bg-muted text-muted-foreground",
  expired: "bg-destructive/20 text-destructive",
};

export default function AssignmentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<Assignment | null>(null);
  const [examId, setExamId] = useState("");
  const [assignType, setAssignType] =
    useState<"group" | "individual">("group");
  const [targetId, setTargetId] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  const loadTargets = async () => {
    const [gRes, cRes] = await Promise.all([
      api.get<Group[]>("/admin/groups"),
      api.get<Candidate[]>("/admin/candidates"),
    ]);
    setGroups(gRes.data);
    setCandidates(cRes.data);
  };

  const loadData = useCallback(async () => {
    const [assignmentRes, examRes] = await Promise.all([
      fetchAssignments(),
      fetchExams(),
    ]);

    setAssignments(assignmentRes);
    setExams(examRes);

    const [gRes, cRes] = await Promise.all([
      api.get<Group[]>("/admin/groups"),
      api.get<Candidate[]>("/admin/candidates"),
    ]);

    setGroups(gRes.data);
    setCandidates(cRes.data);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);


  const handleCreate = async () => {
    await createAssignment({
      exam_id: examId,
      assign_type: assignType,
      group_id: assignType === "group" ? targetId : null,
      candidate_id: assignType === "individual" ? targetId : null,
      start_at: startAt,
      end_at: endAt,
    });

    toast({
      title: "Assignment Created",
      description: "Exam assigned successfully",
    });

    setOpen(false);
    setExamId("");
    setTargetId("");
    setStartAt("");
    setEndAt("");
    loadData();
  };

  const filteredAssignments = assignments.filter((a) =>
    a.exam_id.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout title="Exam Assignments" subtitle="Assign exams to candidates and groups">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11"
          />
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Exam</Label>
                <Select onValueChange={setExamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map((e) => (
                      <SelectItem key={e._id} value={e._id}>
                        {e.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Assign To</Label>
                <Select onValueChange={(v: "group" | "individual") => setAssignType(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="group">Group</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Select onValueChange={setTargetId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target" />
                  </SelectTrigger>
                  <SelectContent>
                    {(assignType === "group" ? groups : candidates).map((t) => (
                      <SelectItem key={t._id} value={t._id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="datetime-local" onChange={(e) => setStartAt(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="datetime-local" onChange={(e) => setEndAt(e.target.value)} />
                </div>
              </div>

              <Button onClick={handleCreate} className="w-full">
                Create Assignment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {filteredAssignments.map((a) => (
          <Card
            key={a._id}
            variant="glass"
            className="p-6 hover-lift cursor-pointer"
            onClick={() => {
              setSelected(a);
              setViewOpen(true);
            }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={statusColors[a.status]}>{a.status}</Badge>
                  <Badge variant="outline">
                    {a.assign_type === "group" ? "Group" : "Individual"}
                  </Badge>
                </div>
                <h3 className="font-display font-bold text-xl">
                  {a.exam_id.title}
                </h3>
                <p className="text-muted-foreground mt-1">
                  Assigned to:{" "}
                  {a.assign_type === "group"
                    ? a.group_id?.name
                    : a.candidate_id?.name}
                </p>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>—</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(a.start_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(a.end_at).toLocaleDateString()}</span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={async () => {
                        await deleteAssignment(a._id);
                        loadData();
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {selected && (
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Assignment Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Exam</Label>
                  <p className="font-medium">{selected.exam_id.title}</p>
                </div>

                <div>
                  <Label>Status</Label>
                  <Badge className={statusColors[selected.status]}>
                    {selected.status}
                  </Badge>
                </div>

                <div>
                  <Label>Assigned Type</Label>
                  <p className="capitalize">{selected.assign_type}</p>
                </div>

                <div>
                  <Label>Assigned To</Label>
                  <p>
                    {selected.assign_type === "group"
                      ? selected.group_id?.name
                      : selected.candidate_id?.name}
                  </p>
                </div>

                <div>
                  <Label>Start Date</Label>
                  <p>{new Date(selected.start_at).toLocaleString()}</p>
                </div>

                <div>
                  <Label>End Date</Label>
                  <p>{new Date(selected.end_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}
