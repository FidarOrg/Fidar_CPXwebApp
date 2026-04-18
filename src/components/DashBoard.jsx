import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { fidar } from "@/lib/fidar";
import { isFidarException } from "fidar-web-sdk";
import PasskeyBanner from "@/components/passkey/PasskeyBanner";
import { signTaskApproval } from "@/api/taskApproval";

export default function EmployeeDashboardPage() {

  const navigate = useNavigate();
  const location = useLocation();

  const [activeItem, setActiveItem] = useState("overview");
  const [open, setOpen] = useState(false);

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const designation = "Chief executive officer";

  const [openBudgetPopup, setOpenBudgetPopup] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [signingTaskId, setSigningTaskId] = useState(null);
  const [taskApprovalError, setTaskApprovalError] = useState("");
  const [showTaskInfo, setShowTaskInfo] = useState(false);

  const [tasks, setTasks] = useState([
    {
      id: 7,
      title: "Sanction Financial Budget",
      priority: "critical",
      due: "02 Mar 2026",
      status: "pending",
      requiresSigning: true,
      signing: {
        amount: 2500,
        currency: "USD",
        toAccount: "3a43d8b7-b2e9-4ea5-983b-a70dc83cc2eb",
        remark: "Approve quarterly financial budget release",
      },
      description:
        "Approve the quarterly financial budget for operational expenses and department allocations.",
    },
    {
      id: 8,
      title: "Authorize Emergency Fund Transfer",
      priority: "critical",
      due: "10 Apr 2026",
      status: "pending",
      requiresSigning: true,
      signing: {
        amount: 15000,
        currency: "USD",
        toAccount: "5f91c3a2-d4e7-4bc1-a012-b83ef92dd4f1",
        remark: "Emergency fund transfer for disaster recovery operations",
      },
      description:
        "Authorize an emergency fund transfer to cover disaster recovery and business continuity costs.",
    },
    {
      id: 9,
      title: "Approve Vendor Contract Payment",
      priority: "critical",
      due: "12 Apr 2026",
      status: "pending",
      requiresSigning: true,
      signing: {
        amount: 8750,
        currency: "USD",
        toAccount: "9c27b1e4-f3a8-4d6e-b591-c04da71ee823",
        remark: "Vendor contract payment for Q2 service agreement",
      },
      description:
        "Approve the Q2 vendor contract payment for third-party service providers under the new SLA agreement.",
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

  // Handle QR result when returning from QR page
  useEffect(() => {
    const { qrSuccess, taskId } = location.state || {};
    if (taskId !== undefined && qrSuccess !== undefined) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, status: qrSuccess ? "done" : "pending" }
            : task
        )
      );
      // Clear the state so re-renders don't re-apply it
      navigate("/dashboard", { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load profile — use backend API for SSO/passkey sessions, fidar SDK for QR sessions
  useEffect(() => {
    async function loadProfile() {
      try {
        const authToken = localStorage.getItem('authToken');
        const isSamlOrPasskey = authToken === 'saml-session' || authToken === 'passkey-session';

        if (isSamlOrPasskey) {
          // For SSO/passkey: get email from sessionStorage (set by PasskeyBanner)
          const samlEmail = sessionStorage.getItem('saml_email');
          if (samlEmail) {
            setProfile({ name: null, email: samlEmail, image: null });
          }
        } else {
          // Original QR-bind flow: use fidar SDK
          const data = await fidar.getMyProfile();
          setProfile(data);
        }
      } catch (err) {
        console.error("[Profile Error]", err);
      } finally {
        setLoadingProfile(false);
      }
    }
    loadProfile();
  }, []);

  // Add new task
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

  // Accept a signing task via FIDAR passkey signing
  const acceptBudgetTask = async () => {
    if (!selectedTask) return;

    setTaskApprovalError("");
    setSigningTaskId(selectedTask.id);

    try {
      const approval = await signTaskApproval(selectedTask);
      const isApproved = approval?.approved === true;

      setTasks((prev) =>
        prev.map((task) =>
          task.id === selectedTask.id
            ? {
                ...task,
                status: isApproved ? "done" : "pending",
                approval,
              }
            : task
        )
      );

      if (isApproved) {
        setOpenBudgetPopup(false);
      } else {
        setTaskApprovalError(
          "Passkey assertion was not approved. The task remains pending."
        );
      }
    } catch (err) {
      setTaskApprovalError(
        err?.message || "Task approval signing was cancelled or failed."
      );
    } finally {
      setSigningTaskId(null);
    }
  };

  // Status counts
  const statusCounts = useMemo(() => {
    return {
      pending: tasks.filter((t) => t.status === "pending").length,
      inProgress: tasks.filter((t) => t.status === "in-progress").length,
      done: tasks.filter((t) => t.status === "done").length,
    };
  }, [tasks]);

  // Group tasks
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
                  className={`font-medium ${task.status === "done"
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

            <div className="flex items-center gap-2">

              {task.requiresSigning && task.status !== "done" && (
                <Button
                  className="clear-btn rounded-lg"
                  onClick={() => {
                    setSelectedTask(task);
                    setTaskApprovalError("");
                    setShowTaskInfo(false);
                    setOpenBudgetPopup(true);
                  }}
                >
                  View
                </Button>
              )}

              <Badge variant="outline">{task.status}</Badge>

            </div>

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

                {/* Passkey Registration Banner (shown after SAML login) */}
                <PasskeyBanner />

                {loadingProfile ? (
                  <Skeleton className="h-8 w-64" />
                ) : (
                  <>
                    <h2 className="text-2xl font-bold">
                      {/* Welcome back, {profile?.name || "Hadi Anwar"} */}
                      Welcome back, Hadi Anwar

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

            {/* Status Cards */}

            <section className="lg:col-span-4">
              <StatusCard title="Pending Tasks" value={statusCounts.pending} />
            </section>

            <section className="lg:col-span-4">
              <StatusCard title="In Progress" value={statusCounts.inProgress} />
            </section>

            <section className="lg:col-span-4">
              <StatusCard title="Completed" value={statusCounts.done} />
            </section>

            {/* Tasks Title */}

            <section className="lg:col-span-12">
              <h3 className="text-lg font-semibold">
                These are the Tasks assigned to you this week
              </h3>
            </section>

            {/* Task Columns */}

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

      {/* Budget Approval Popup */}

      <Dialog open={openBudgetPopup} onOpenChange={setOpenBudgetPopup}>

        <DialogContent>

          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            {selectedTask?.description}
          </p>

          <button
            className="text-sm text-primary underline underline-offset-4 hover:opacity-80 text-left"
            onClick={() => setShowTaskInfo((prev) => !prev)}
          >
            {showTaskInfo ? "Hide information" : "Click here for more information"}
          </button>

          {showTaskInfo && selectedTask && (
            <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground space-y-1">
              <p><span className="font-medium text-foreground">Priority:</span> {selectedTask.priority}</p>
              <p><span className="font-medium text-foreground">Due Date:</span> {selectedTask.due}</p>
              <p><span className="font-medium text-foreground">Status:</span> {selectedTask.status}</p>
            </div>
          )}

          {taskApprovalError && (
            <p className="text-sm text-destructive">{taskApprovalError}</p>
          )}

          <div className="flex justify-end gap-3 mt-6">

            <Button
              variant="outline"
              onClick={() => setOpenBudgetPopup(false)}
            >
              Cancel
            </Button>

            <Button className="passkey-btn" style={{ width: "auto", padding: "10px 28px" }} onClick={acceptBudgetTask} disabled={signingTaskId === selectedTask?.id}>
              {signingTaskId === selectedTask?.id ? "Signing..." : "Accept"}
            </Button>

          </div>

        </DialogContent>

      </Dialog>

    </div>
  );
}
