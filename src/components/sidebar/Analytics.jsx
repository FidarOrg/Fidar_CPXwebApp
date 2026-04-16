import React, { useMemo, useState } from "react";
import Header from "@/components/header/Header";
import AppSidebar from "@/components/sidebar/app-sidebar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ALL_TASKS = [
  {
    id: 7,
    title: "Sanction Financial Budget",
    priority: "Critical",
    status: "Pending",
    due: "02 Mar 2026",
    description:
      "Approve the quarterly financial budget for operational expenses and department allocations.",
  },
  {
    id: 8,
    title: "Authorize Emergency Fund Transfer",
    priority: "Critical",
    status: "Pending",
    due: "10 Apr 2026",
    description:
      "Authorize an emergency fund transfer to cover disaster recovery and business continuity costs.",
  },
  {
    id: 9,
    title: "Approve Vendor Contract Payment",
    priority: "Critical",
    status: "Pending",
    due: "12 Apr 2026",
    description:
      "Approve the Q2 vendor contract payment for third-party service providers under the new SLA agreement.",
  },
  {
    id: 3,
    title: "Client onboarding review",
    priority: "High",
    status: "Pending",
    due: "01 Mar 2026",
    description:
      "Review the onboarding documentation and workflow for new enterprise clients. Identify friction points and propose improvements for faster onboarding.",
  },
  {
    id: 4,
    title: "Prepare weekly performance report",
    priority: "High",
    status: "In Progress",
    due: "03 Mar 2026",
    description:
      "Compile weekly KPIs including revenue metrics, transaction success rate, and operational performance. Present findings to management team.",
  },
  {
    id: 10,
    title: "Security audit follow-up",
    priority: "High",
    status: "Completed",
    due: "08 Mar 2026",
    description:
      "Address findings from the Q1 security audit. Patch identified vulnerabilities and verify remediations with the security team.",
  },
  {
    id: 11,
    title: "Compliance report submission",
    priority: "High",
    status: "Completed",
    due: "07 Mar 2026",
    description:
      "Submit the monthly compliance report to the regulatory team covering transaction monitoring and AML checks.",
  },
  {
    id: 5,
    title: "Update internal documentation",
    priority: "Low",
    status: "Completed",
    due: "05 Mar 2026",
    description:
      "Update internal technical documentation to reflect recent API changes and infrastructure upgrades.",
  },
  {
    id: 6,
    title: "Team sync meeting preparation",
    priority: "Low",
    status: "Pending",
    due: "06 Mar 2026",
    description:
      "Prepare agenda and discussion points for the weekly team sync. Highlight blockers, upcoming releases, and performance insights.",
  },
  {
    id: 12,
    title: "Onboard new operations analyst",
    priority: "Low",
    status: "In Progress",
    due: "14 Apr 2026",
    description:
      "Set up system access, complete orientation checklist, and schedule shadowing sessions for the new operations analyst.",
  },
];

const getPriorityColor = (priority) => {
  switch (priority) {
    case "Critical": return "bg-red-500 text-white";
    case "High":     return "bg-orange-500 text-white";
    case "Low":      return "bg-green-500 text-white";
    default:         return "";
  }
};

const getStatusStyles = (status) => {
  switch (status) {
    case "Completed":  return { dot: "bg-green-500",  badge: "bg-green-100 text-green-700 border-green-300" };
    case "In Progress":return { dot: "bg-blue-500",   badge: "bg-blue-100 text-blue-700 border-blue-300" };
    case "Pending":    return { dot: "bg-yellow-500", badge: "bg-yellow-100 text-yellow-700 border-yellow-300" };
    default:           return { dot: "bg-muted",      badge: "" };
  }
};

export default function AnalyticsPage() {
  const [filter, setFilter] = useState("All");

  const counts = useMemo(() => ({
    total:      ALL_TASKS.length,
    pending:    ALL_TASKS.filter((t) => t.status === "Pending").length,
    inProgress: ALL_TASKS.filter((t) => t.status === "In Progress").length,
    completed:  ALL_TASKS.filter((t) => t.status === "Completed").length,
  }), []);

  const completionPct = Math.round((counts.completed / counts.total) * 100);

  const filtered = useMemo(() =>
    filter === "All" ? ALL_TASKS : ALL_TASKS.filter((t) => t.status === filter),
    [filter]
  );

  const FILTERS = ["All", "Pending", "In Progress", "Completed"];

  return (
    <div className="min-h-screen bg-background">
      <Header type="employee" />

      <div className="flex">
        <div className="hidden lg:block sticky top-14 h-[calc(100vh-56px)]">
          <AppSidebar activeItem="analytics" />
        </div>

        <main className="flex-1 px-4 lg:px-8 py-6">
          <div className="max-w-screen-2xl mx-auto space-y-8">

            {/* Page Title */}
            <div>
              <h1 className="text-3xl font-bold">Task Analytics</h1>
              <p className="text-muted-foreground mt-1">
                Weekly task breakdown — pending, in progress, and completed.
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Tasks",  value: counts.total,      color: "text-foreground" },
                { label: "Pending",      value: counts.pending,    color: "text-yellow-600" },
                { label: "In Progress",  value: counts.inProgress, color: "text-blue-600"   },
                { label: "Completed",    value: counts.completed,  color: "text-green-600"  },
              ].map(({ label, value, color }) => (
                <Card key={label} className="bg-card border">
                  <CardContent className="pt-5 pb-4">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className={`text-4xl font-bold mt-1 ${color}`}>{value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Completion Progress */}
            <Card className="bg-card border">
              <CardContent className="pt-5 pb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Overall Completion</span>
                  <span className="text-muted-foreground">{counts.completed} / {counts.total} tasks</span>
                </div>
                <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">{completionPct}% complete</p>
              </CardContent>
            </Card>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    filter === f
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground"
                  }`}
                >
                  {f}
                  <span className="ml-1.5 text-xs opacity-70">
                    {f === "All" ? counts.total : ALL_TASKS.filter((t) => t.status === f).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Task Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((task) => {
                const { dot, badge } = getStatusStyles(task.status);
                return (
                  <Card key={task.id} className="bg-card border shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-base leading-snug">{task.title}</CardTitle>
                        <Badge className={`shrink-0 ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                          {task.status}
                        </span>
                        <span className="text-xs text-muted-foreground">Due: {task.due}</span>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {task.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
