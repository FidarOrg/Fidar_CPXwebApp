// src/pages/EmployeeDashboardPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import AppSidebar from "@/components/sidebar/app-sidebar";
import Header from "@/components/header/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { fidar } from "@/lib/fidar";
import { isFidarException } from "fidar-web-sdk";

export default function EmployeeDashboardPage() {
  const [activeItem, setActiveItem] = useState("overview");
  const [open, setOpen] = useState(false);

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // 🔥 Hardcoded Designation
  const designation = "Senior Operations Manager";

  // ✅ Default Tasks (6 tasks added)
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Server outage - Payment API",
      priority: "critical",
      due: "27 Feb 2026",
      status: "pending",
    },
    {
      id: 2,
      title: "Database backup verification",
      priority: "critical",
      due: "28 Feb 2026",
      status: "in-progress",
    },
    {
      id: 3,
      title: "Client onboarding review",
      priority: "high",
      due: "01 Mar 2026",
      status: "pending",
    },
    {
      id: 4,
      title: "Prepare weekly performance report",
      priority: "high",
      due: "03 Mar 2026",
      status: "in-progress",
    },
    {
      id: 5,
      title: "Update internal documentation",
      priority: "low",
      due: "05 Mar 2026",
      status: "done",
    },
    {
      id: 6,
      title: "Team sync meeting preparation",
      priority: "low",
      due: "06 Mar 2026",
      status: "pending",
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("low");
  const [newTaskStatus, setNewTaskStatus] = useState("pending");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");

  // 🔹 Load Profile
  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fidar.getMyProfile();
        setProfile(data);
      } catch (err) {
        console.error("[Profile Error]", err);
        if (isFidarException(err)) {
          console.error("Fidar error:", err.payload);
        }
      } finally {
        setLoadingProfile(false);
      }
    }
    loadProfile();
  }, []);

  // 🔹 Add Task
  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !newTaskDueDate) return;

    const formattedDate = new Date(newTaskDueDate).toLocaleDateString(
      undefined,
      { day: "numeric", month: "short", year: "numeric" }
    );

    const newTask = {
      id: Date.now(),
      title: newTaskTitle,
      priority: newTaskPriority,
      status: newTaskStatus,
      due: formattedDate,
    };

    setTasks((prev) => [...prev, newTask]);

    setNewTaskTitle("");
    setNewTaskPriority("low");
    setNewTaskStatus("pending");
    setNewTaskDueDate("");
    setShowAddForm(false);
  };

  // 🔹 Status Counts
  const statusCounts = useMemo(() => {
    return {
      pending: tasks.filter((t) => t.status === "pending").length,
      inProgress: tasks.filter((t) => t.status === "in-progress").length,
      done: tasks.filter((t) => t.status === "done").length,
    };
  }, [tasks]);

  // 🔹 Group by Priority
  const groupedTasks = useMemo(() => {
    return {
      critical: tasks.filter((t) => t.priority === "critical"),
      high: tasks.filter((t) => t.priority === "high"),
      low: tasks.filter((t) => t.priority === "low"),
    };
  }, [tasks]);

  const StatusCard = ({ title, value }) => (
    <div className="rounded-lg p-6 border bg-card">
      <p className="text-sm text-muted-foreground">{title}</p>
      <h2 className="text-3xl font-bold mt-2">{value}</h2>
    </div>
  );

  const PrioritySection = ({ title, items, badgeColor }) => (
    <div className="rounded-lg bg-card border">
      <div className="p-6 pb-2 flex justify-between items-center">
        <h3 className="font-semibold text-lg">{title}</h3>
        <Badge className={badgeColor}>{items.length}</Badge>
      </div>

      <div className="p-6 pt-2 space-y-4">
        {items.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between p-4 rounded-md border bg-background"
          >
            <div className="flex items-center gap-3">
              <Checkbox checked={task.status === "done"} />
              <div>
                <p
                  className={`font-medium ${
                    task.status === "done"
                      ? "line-through text-muted-foreground"
                      : ""
                  }`}
                >
                  {task.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  Due: {task.due}
                </p>
              </div>
            </div>
            <Badge variant="outline">{task.status}</Badge>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Header open={open} onOpenChange={setOpen} type={"employee"} />

      <div className="flex">
        <div className="hidden lg:block sticky top-14 h-[calc(100vh-56px)]">
          <AppSidebar activeItem={activeItem} onNavigate={setActiveItem} />
        </div>

        <main className="flex-1 w-full px-4 lg:px-8 py-6">
          <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Welcome Section */}
            <section className="lg:col-span-12">
              <div className="rounded-lg bg-card border p-6">
                {loadingProfile ? (
                  <Skeleton className="h-8 w-64" />
                ) : (
                  <>
                    <h2 className="text-2xl font-bold">
                      Welcome back, {profile?.name || "Employee"} 
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      {profile?.email}
                    </p>
                    <p className="text-sm font-medium text-primary mt-2">
                      {designation}
                    </p>
                  </>
                )}
              </div>
            </section>

            {/* Status Summary */}
            <section className="lg:col-span-4">
              <StatusCard title="Pending Tasks" value={statusCounts.pending} />
            </section>
            <section className="lg:col-span-4">
              <StatusCard title="In Progress" value={statusCounts.inProgress} />
            </section>
            <section className="lg:col-span-4">
              <StatusCard title="Completed" value={statusCounts.done} />
            </section>

            {/* Tasks Header + Add Form */}
            <section className="lg:col-span-12">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  These are the Tasks assigned to you this week
                </h3>
                <Button onClick={() => setShowAddForm(!showAddForm)}>
                  {showAddForm ? "Cancel" : "Add Task"}
                </Button>
              </div>

              {showAddForm && (
                <div className="mt-4 p-6 border rounded-lg bg-card space-y-4">
                  <Input
                    placeholder="Task title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                  />

                  <Select
                    value={newTaskPriority}
                    onValueChange={setNewTaskPriority}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={newTaskStatus}
                    onValueChange={setNewTaskStatus}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                  />

                  <Button onClick={handleAddTask} className="w-full">
                    Save Task
                  </Button>
                </div>
              )}
            </section>

            {/* Priority Columns */}
            <section className="lg:col-span-4">
              <PrioritySection
                title="Critical"
                items={groupedTasks.critical}
                badgeColor="bg-red-500 text-white"
              />
            </section>

            <section className="lg:col-span-4">
              <PrioritySection
                title="High"
                items={groupedTasks.high}
                badgeColor="bg-orange-500 text-white"
              />
            </section>

            <section className="lg:col-span-4">
              <PrioritySection
                title="Low"
                items={groupedTasks.low}
                badgeColor="bg-green-500 text-white"
              />
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}