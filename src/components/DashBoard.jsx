import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import AppSidebar from "@/components/sidebar/app-sidebar";
import hadiAvatar from "@/assets/hadi.jpeg";
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

import { Clock, RefreshCw, CheckCircle2, ClipboardList } from "lucide-react";
import { fidar } from "@/lib/fidar";
import { isFidarException } from "fidar-web-sdk";
import PasskeyBanner from "@/components/passkey/PasskeyBanner";
import { signTaskApproval } from "@/api/taskApproval";
import { initiateCriticalTask, completeCriticalTask, getApprovalStatus } from "@/api/transaction";

export default function EmployeeDashboardPage() {

  const navigate = useNavigate();
  const location = useLocation();

  const [activeItem, setActiveItem] = useState("overview");
  const [open, setOpen] = useState(false);

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const designation = "Chief Executive Officer";

  const [openBudgetPopup, setOpenBudgetPopup] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [signingTaskId, setSigningTaskId] = useState(null);
  const [taskApprovalError, setTaskApprovalError] = useState("");
  const [showTaskInfo, setShowTaskInfo] = useState(false);

  // Critical task two-phase flow
  const [openCriticalDialog, setOpenCriticalDialog] = useState(false);
  const [criticalTaskPhase, setCriticalTaskPhase] = useState("idle"); // idle | initiating | waiting | completing | done
  const [criticalTaskSessionId, setCriticalTaskSessionId] = useState(null);
  const [criticalTaskError, setCriticalTaskError] = useState("");
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [successTaskTitle, setSuccessTaskTitle] = useState("");

  // Device role: "primary" = passkey Accept flow, "secondary" = critical_task flow
  const [deviceRole] = useState(() => localStorage.getItem("deviceRole") || "primary");

  const [tasks, setTasks] = useState([
    {
      id: 7,
      title: "Sanction Financial Budget",
      priority: "critical",
      due: "02 Mar 2026",
      status: "pending",
      category: "Compliance",
      requiresSigning: true,
      signing: {
        amount: 2500,
        currency: "USD",
        toAccount: "3a43d8b7-b2e9-4ea5-983b-a70dc83cc2eb",
        remark: "Approve quarterly financial budget release",
      },
      criticalTask: {
        taskType: "BUDGET_APPROVAL",
        taskDescription: "Approve quarterly financial budget release",
        targetResourceId: "3a43d8b7-b2e9-4ea5-983b-a70dc83cc2eb",
        targetResourceName: "Hadi's Samsung",
        targetResourceType: "BUDGET",
        deviceId: "web-browser-or-session-id",
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
      category: "Operations",
      requiresSigning: true,
      signing: {
        amount: 15000,
        currency: "USD",
        toAccount: "5f91c3a2-d4e7-4bc1-a012-b83ef92dd4f1",
        remark: "Emergency fund transfer for disaster recovery operations",
      },
      criticalTask: {
        taskType: "FUND_TRANSFER",
        taskDescription: "Emergency fund transfer for disaster recovery operations",
        targetResourceId: "5f91c3a2-d4e7-4bc1-a012-b83ef92dd4f1",
        targetResourceName: "Disaster Recovery Account",
        targetResourceType: "ACCOUNT",
        deviceId: "web-browser-or-session-id",
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
      category: "IT Governance",
      requiresSigning: true,
      signing: {
        amount: 8750,
        currency: "USD",
        toAccount: "9c27b1e4-f3a8-4d6e-b591-c04da71ee823",
        remark: "Vendor contract payment for Q2 service agreement",
      },
      criticalTask: {
        taskType: "CONTRACT_PAYMENT",
        taskDescription: "Vendor contract payment for Q2 service agreement",
        targetResourceId: "9c27b1e4-f3a8-4d6e-b591-c04da71ee823",
        targetResourceName: "Q2 Vendor Contract",
        targetResourceType: "CONTRACT",
        deviceId: "web-browser-or-session-id",
      },
      description:
        "Approve the Q2 vendor contract payment for third-party service providers under the new SLA agreement.",
    },
    {
      id: 10,
      title: "Revoke Secondary Device",
      priority: "critical",
      due: "18 Apr 2026",
      status: "pending",
      category: "Security",
      taskCategory: "critical_task",
      criticalTask: {
        taskType: "DEVICE_REVOKE",
        taskDescription: "Revoke secondary device registered on 2026-01-10",
        targetResourceId: "device-uuid-to-revoke",
        targetResourceName: "Hadi's Samsung",
        targetResourceType: "DEVICE",
        deviceId: "web-browser-or-session-id",
      },
      description:
        "Revoke the secondary device registered on 2026-01-10 to maintain account security.",
    },
    {
      id: 3,
      title: "Client Onboarding Review",
      priority: "high",
      due: "01 Mar 2026",
      status: "pending",
      category: "HR",
    },
    {
      id: 4,
      title: "Prepare Weekly Performance Report",
      priority: "high",
      due: "03 Mar 2026",
      status: "in-progress",
      category: "Operations",
    },
    {
      id: 5,
      title: "Update Internal Documentation",
      priority: "low",
      due: "05 Mar 2026",
      status: "done",
      category: "Privacy",
    },
    {
      id: 6,
      title: "Team Sync Meeting Preparation",
      priority: "low",
      due: "06 Mar 2026",
      status: "pending",
      category: "Risk",
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("low");
  const [newTaskStatus, setNewTaskStatus] = useState("pending");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const TASK_CATEGORIES = ["All", "Security", "Privacy", "IT Governance", "Compliance", "Operations", "HR", "Risk"];

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

  // Critical task — Phase 1: Initiate
  const handleInitiateCriticalTask = async () => {
    if (!selectedTask?.criticalTask) return;
    setCriticalTaskError("");
    setCriticalTaskPhase("initiating");
    try {
      const result = await initiateCriticalTask(selectedTask.criticalTask);
      setCriticalTaskSessionId(result.sessionId);
      setCriticalTaskPhase("waiting");
    } catch (err) {
      setCriticalTaskError(err?.message || "Failed to initiate critical task.");
      setCriticalTaskPhase("idle");
    }
  };

  // Critical task — Phase 2: Complete
  const handleCompleteCriticalTask = async () => {
    if (!selectedTask?.criticalTask || !criticalTaskSessionId) return;
    setCriticalTaskError("");
    setCriticalTaskPhase("completing");
    try {
      await completeCriticalTask({ ...selectedTask.criticalTask, sessionId: criticalTaskSessionId });
      setTasks((prev) =>
        prev.map((t) => (t.id === selectedTask.id ? { ...t, status: "done" } : t))
      );
      setCriticalTaskPhase("done");
      setSuccessTaskTitle(selectedTask?.title || "Task");
      setTimeout(() => {
        setOpenCriticalDialog(false);
        setOpenSuccessDialog(true);
      }, 800);
    } catch (err) {
      setCriticalTaskError(err?.message || "Failed to complete critical task.");
      setCriticalTaskPhase("waiting");
    }
  };

  // Poll approval status every 3s while in "waiting" phase
  useEffect(() => {
    if (criticalTaskPhase !== "waiting" || !criticalTaskSessionId) return;

    const interval = setInterval(async () => {
      try {
        const result = await getApprovalStatus(criticalTaskSessionId);
        if (result?.status === "APPROVED") {
          clearInterval(interval);
          handleCompleteCriticalTask();
        } else if (result?.status === "REJECTED") {
          clearInterval(interval);
          setCriticalTaskError("Task was rejected on the Android device.");
          setCriticalTaskPhase("idle");
        }
      } catch {
        // silently ignore transient poll failures
      }
    }, 3000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criticalTaskPhase, criticalTaskSessionId]);

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
    const filtered = activeCategory === "All" ? tasks : tasks.filter((t) => t.category === activeCategory);
    return {
      critical: filtered.filter((t) => t.priority === "critical"),
      high: filtered.filter((t) => t.priority === "high"),
      low: filtered.filter((t) => t.priority === "low"),
    };
  }, [tasks, activeCategory]);

  const STATUS_ICON = {
    "Pending Tasks":  { color: "#FFB020", bg: "#fff8e6", Icon: Clock },
    "In Progress":    { color: "#E40046", bg: "#ffdde8", Icon: RefreshCw },
    "Completed":      { color: "#1DB96B", bg: "#e6f9f0", Icon: CheckCircle2 },
  };

  const StatusCard = ({ title, value }) => {
    const meta = STATUS_ICON[title] ?? { color: "#6b7280", bg: "#f3f4f6", Icon: ClipboardList };
    const { Icon } = meta;
    return (
      <div className="rounded-xl p-6 border bg-card shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ background: meta.color }} />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <h2 className="text-4xl font-bold mt-2">{value}</h2>
          </div>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: meta.bg }}>
            <Icon size={22} color="#111" strokeWidth={2} />
          </div>
        </div>
      </div>
    );
  };

  const PRIORITY_ACCENT = { Critical: "#E40046", High: "#FFB020", Low: "#1DB96B" };

  const PrioritySection = ({ title, items, badgeColor }) => (
    <div className="rounded-xl bg-card border shadow-sm overflow-hidden">

      <div
        className="px-5 py-4 flex justify-between items-center border-b"
        style={{ borderTop: `3px solid ${PRIORITY_ACCENT[title] ?? "#6b7280"}` }}
      >
        <h3 className="font-semibold text-lg">{title}</h3>
        <Badge className={badgeColor}>{items.length}</Badge>
      </div>

      <div className="p-4 space-y-3">

        {items.map((task) => (

          <div
            key={task.id}
            className="flex items-center justify-between p-4 rounded-xl border bg-background hover:shadow-sm transition-shadow"
            style={{ borderLeft: `3px solid ${PRIORITY_ACCENT[title] ?? "#e5e7eb"}` }}
          >

            <div className="flex items-center gap-3 min-w-0">

              <Checkbox checked={task.status === "done"} className="flex-shrink-0" />

              <div className="min-w-0">
                <p
                  className={`font-medium truncate ${task.status === "done"
                    ? "line-through text-muted-foreground"
                    : ""
                    }`}
                >
                  {task.title}
                </p>

                <p className="text-xs text-muted-foreground mt-0.5">
                  Due: {task.due}
                </p>
              </div>

            </div>

            <div className="flex items-center gap-2 flex-shrink-0 ml-2">

              {(task.requiresSigning || task.taskCategory === "critical_task") && task.status !== "done" && (
                <Button
                  className="clear-btn rounded-lg"
                  style={{ fontFamily: "'Helvetica World', Helvetica, Arial, sans-serif", fontWeight: "bold", padding: "4px 12px", fontSize: "12px", height: "auto" }}
                  onClick={() => {
                    setSelectedTask(task);
                    if (deviceRole === "primary" && task.requiresSigning) {
                      setTaskApprovalError("");
                      setShowTaskInfo(false);
                      setOpenBudgetPopup(true);
                    } else {
                      setCriticalTaskPhase("idle");
                      setCriticalTaskSessionId(null);
                      setCriticalTaskError("");
                      setOpenCriticalDialog(true);
                    }
                  }}
                >
                  View
                </Button>
              )}

              <Badge variant="outline">{task.status}</Badge>

            </div>

          </div>

        ))}

        {items.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">No tasks in this category.</p>
        )}

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
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-52" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={hadiAvatar}
                        alt="Hadi Anwar"
                        className="w-14 h-14 rounded-full object-cover flex-shrink-0 ring-2 ring-blue-600"
                      />
                      <div>
                        <h2 className="text-2xl font-bold">
                          Welcome back, Hadi Anwar
                        </h2>
                        <p className="text-muted-foreground text-sm mt-0.5">
                          {profile?.email}
                        </p>
                        <p className="text-sm font-medium text-primary mt-1">
                          {designation}
                        </p>
                      </div>
                    </div>
                    <Button
                      className="passkey-btn"
                      style={{ width: "auto", padding: "8px 20px" }}
                      onClick={() => navigate("/bind-device")}
                    >
                      Bind Your Device
                    </Button>
                  </div>
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
              <div className="flex flex-wrap items-center gap-3">
                <div className="h-6 w-1 rounded-full flex-shrink-0" style={{ background: "linear-gradient(to bottom, #1a2e44, #1DB96B)" }} />
                <h3 className="text-lg font-semibold flex-shrink-0">
                  These are the tasks assigned to you this week
                </h3>
                {TASK_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={activeCategory === cat
                      ? { background: "#E40046", color: "#fff", border: "none", fontFamily: "'Helvetica World', Helvetica, Arial, sans-serif", fontWeight: "bold" }
                      : { background: "transparent", fontFamily: "'Helvetica World', Helvetica, Arial, sans-serif", fontWeight: "bold" }}
                    className={`px-3 py-0.5 rounded-full text-xs transition-all border border-border ${activeCategory === cat ? "text-white" : "text-foreground"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
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

      {/* Critical Task Two-Phase Dialog */}
      <Dialog open={openCriticalDialog} onOpenChange={(v) => {
        if (!v) {
          setOpenCriticalDialog(false);
          setCriticalTaskPhase("idle");
          setCriticalTaskSessionId(null);
          setCriticalTaskError("");
        }
      }}>
        <DialogContent className="sm:max-w-md gap-0 p-0" style={{ fontFamily: "'Helvetica World', Helvetica, Arial, sans-serif" }}>
          {/* visually-hidden title keeps Radix accessible */}
          <DialogTitle className="sr-only">{selectedTask?.title}</DialogTitle>

          <div className="p-6">

            {/* Header */}
            <div className="mb-1 pr-6">
              <h2 className="text-xl font-bold" style={{ color: "#000", fontFamily: "'Helvetica World', Helvetica, Arial, sans-serif", fontWeight: "bold" }}>{selectedTask?.title}</h2>
            </div>

            {/* Description */}
            <p className="text-sm mb-5 leading-relaxed" style={{ color: "#000", fontFamily: "'Helvetica World', Helvetica, Arial, sans-serif", fontWeight: "bold" }}>
              {selectedTask?.description}
            </p>

            {/* Metadata Card */}
            {selectedTask?.criticalTask && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 space-y-3">

                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <span className="text-xs uppercase tracking-wide" style={{ color: "#000", fontFamily: "'Helvetica World', Helvetica, Arial, sans-serif", fontWeight: "bold" }}>Task Type</span>
                  <span className="text-sm font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md w-fit">
                    {selectedTask.criticalTask.taskType
                      ?.replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                </div>

                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <span className="text-xs uppercase tracking-wide" style={{ color: "#000", fontFamily: "'Helvetica World', Helvetica, Arial, sans-serif", fontWeight: "bold" }}>Target</span>
                  <span
                      className="text-sm truncate max-w-[180px]"
                      style={{ color: "#000", fontFamily: "'Helvetica World', Helvetica, Arial, sans-serif", fontWeight: "bold" }}
                    >
                      {selectedTask.criticalTask.targetResourceName
                        ? selectedTask.criticalTask.targetResourceName
                        : selectedTask.criticalTask.targetResourceId?.length > 20
                          ? `${selectedTask.criticalTask.targetResourceId.slice(0, 8)}…${selectedTask.criticalTask.targetResourceId.slice(-12)}`
                          : selectedTask.criticalTask.targetResourceId}
                    </span>
                </div>

                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <span className="text-xs uppercase tracking-wide" style={{ color: "#000", fontFamily: "'Helvetica World', Helvetica, Arial, sans-serif", fontWeight: "bold" }}>Resource Type</span>
                  <span className="text-sm" style={{ color: "#000", fontFamily: "'Helvetica World', Helvetica, Arial, sans-serif", fontWeight: "bold" }}>
                    {selectedTask.criticalTask.targetResourceType}
                  </span>
                </div>

              </div>
            )}

            {/* Waiting / Completing Banner */}
            {(criticalTaskPhase === "waiting" || criticalTaskPhase === "completing") && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
                <span className="animate-spin text-amber-500 mt-0.5 flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm" style={{ color: "#000", fontFamily: "'Helvetica World', Helvetica, Arial, sans-serif", fontWeight: "bold" }}>
                    {criticalTaskPhase === "completing" ? "Executing task…" : "Waiting for approval"}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#000", fontFamily: "'Helvetica World', Helvetica, Arial, sans-serif", fontWeight: "bold" }}>
                    A push notification was sent to your Android device.
                    This will complete automatically once approved.
                  </p>
                </div>
              </div>
            )}

            {/* Done Banner */}
            {criticalTaskPhase === "done" && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 mb-4 text-sm text-green-700">
                Critical task executed successfully.
              </div>
            )}

            {/* Error */}
            {criticalTaskError && (
              <p className="text-sm text-red-500 mb-4">{criticalTaskError}</p>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                className="passkey-btn disabled:opacity-50"
                style={{
                  width: "auto",
                  padding: "10px 24px",
                  background: "linear-gradient(to right, #4B1A6E, #E40046)",
                  color: "#fff",
                  border: "none",
                  fontFamily: "'Anton', sans-serif",
                }}
                onClick={() => setOpenCriticalDialog(false)}
                disabled={criticalTaskPhase === "initiating" || criticalTaskPhase === "completing"}
              >
                Cancel
              </button>

              {(criticalTaskPhase === "idle" || criticalTaskPhase === "initiating") && (
                <button
                  className="passkey-btn disabled:opacity-50"
                  style={{ width: "auto", padding: "10px 24px" }}
                  onClick={handleInitiateCriticalTask}
                  disabled={criticalTaskPhase === "initiating"}
                >
                  {criticalTaskPhase === "initiating" ? "Initiating..." : "Initiate"}
                </button>
              )}

              {(criticalTaskPhase === "waiting" || criticalTaskPhase === "completing") && (
                <button
                  className="passkey-btn disabled:opacity-50"
                  style={{ width: "auto", padding: "10px 24px" }}
                  onClick={handleCompleteCriticalTask}
                  disabled={criticalTaskPhase === "completing"}
                >
                  {criticalTaskPhase === "completing" ? "Completing..." : "Complete"}
                </button>
              )}
            </div>

          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={openSuccessDialog} onOpenChange={setOpenSuccessDialog}>
        <DialogContent className="sm:max-w-sm gap-0 p-0 overflow-hidden [&>button]:hidden" style={{ fontFamily: "'Helvetica World', Helvetica, Arial, sans-serif", border: "none" }}>
          <DialogTitle className="sr-only">Task Completed</DialogTitle>
          <div className="flex flex-col items-center px-8 py-10 text-center">

            {/* Animated checkmark */}
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "linear-gradient(135deg, #1DB96B22, #1DB96B44)",
              border: "3px solid #1DB96B",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 20,
              animation: "successPop 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards"
            }}>
              <svg width="40" height="40" viewBox="0 0 50 50" fill="none">
                <path
                  d="M12 26 L21 35 L38 16"
                  stroke="#1DB96B"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: 40,
                    strokeDashoffset: 0,
                    animation: "checkDraw 0.5s ease 0.2s both"
                  }}
                />
              </svg>
            </div>

            <h2 style={{ fontSize: 20, fontWeight: "bold", color: "#000", marginBottom: 6 }}>
              Transaction Signing Successful
            </h2>
            <p style={{ fontSize: 13, color: "#111", marginBottom: 24, lineHeight: 1.5 }}>
              <span style={{ fontWeight: "bold", color: "#111" }}>{successTaskTitle}</span> has been
              signed and executed successfully.
            </p>

            <button
              className="passkey-btn"
              style={{ width: "auto", padding: "10px 36px", fontSize: "15px" }}
              onClick={() => setOpenSuccessDialog(false)}
            >
              Done
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes successPop {
          0%   { transform: scale(0.4); opacity: 0; }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes checkDraw {
          from { stroke-dashoffset: 40; }
          to   { stroke-dashoffset: 0; }
        }
      `}</style>

    </div>
  );
}
