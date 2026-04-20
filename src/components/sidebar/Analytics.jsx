import React, { useMemo, useState, useCallback } from "react";
import Header from "@/components/header/Header";
import AppSidebar from "@/components/sidebar/app-sidebar";
import { ClipboardList, Clock, TrendingUp, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Sector,
} from "recharts";

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
  const [filter, setFilter]           = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [activeDonutIndex, setActiveDonutIndex] = useState(null);
  const [activeBarIndex, setActiveBarIndex]     = useState(null);

  const counts = useMemo(() => ({
    total:      ALL_TASKS.length,
    pending:    ALL_TASKS.filter((t) => t.status === "Pending").length,
    inProgress: ALL_TASKS.filter((t) => t.status === "In Progress").length,
    completed:  ALL_TASKS.filter((t) => t.status === "Completed").length,
  }), []);

  const priorityCounts = useMemo(() => [
    { name: "Critical", value: ALL_TASKS.filter((t) => t.priority === "Critical").length, color: "#E40046" },
    { name: "High",     value: ALL_TASKS.filter((t) => t.priority === "High").length,     color: "#FFB020" },
    { name: "Low",      value: ALL_TASKS.filter((t) => t.priority === "Low").length,      color: "#1DB96B" },
  ], []);

  const statusChartData = useMemo(() => [
    { name: "Pending",     value: counts.pending,    color: "#FFB020" },
    { name: "In Progress", value: counts.inProgress, color: "#E40046" },
    { name: "Completed",   value: counts.completed,  color: "#1DB96B" },
  ], [counts]);

  const completionPct = Math.round((counts.completed / counts.total) * 100);

  // Clicking donut slice sets status filter; clicking again clears it
  const handleDonutClick = useCallback((_, index) => {
    const clicked = statusChartData[index].name;
    if (filter === clicked) {
      setFilter("All");
      setActiveDonutIndex(null);
    } else {
      setFilter(clicked);
      setActiveDonutIndex(index);
    }
  }, [filter, statusChartData]);

  // Clicking bar sets priority filter; clicking again clears it
  const handleBarClick = useCallback((data, index) => {
    const clicked = data.name;
    if (priorityFilter === clicked) {
      setPriorityFilter("All");
      setActiveBarIndex(null);
    } else {
      setPriorityFilter(clicked);
      setActiveBarIndex(index);
    }
  }, [priorityFilter]);

  // Keep activeDonutIndex in sync when filter tab changes
  const handleFilterTab = (f) => {
    setFilter(f);
    if (f === "All") {
      setActiveDonutIndex(null);
    } else {
      const idx = statusChartData.findIndex((d) => d.name === f);
      setActiveDonutIndex(idx >= 0 ? idx : null);
    }
  };

  const filtered = useMemo(() => {
    return ALL_TASKS.filter((t) => {
      const matchStatus   = filter === "All"         || t.status   === filter;
      const matchPriority = priorityFilter === "All" || t.priority === priorityFilter;
      return matchStatus && matchPriority;
    });
  }, [filter, priorityFilter]);

  const FILTERS = ["All", "Pending", "In Progress", "Completed"];

  // Custom active donut slice (expanded + glow)
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
    return (
      <g>
        <text x={cx} y={cy - 10} textAnchor="middle" fill={fill} style={{ fontSize: 28, fontWeight: "bold" }}>
          {value}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" fill="#6b7280" style={{ fontSize: 11 }}>
          {payload.name}
        </text>
        <Sector
          cx={cx} cy={cy}
          innerRadius={innerRadius - 4}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={1}
          style={{ filter: `drop-shadow(0 0 8px ${fill}80)` }}
        />
        <Sector
          cx={cx} cy={cy}
          innerRadius={outerRadius + 12}
          outerRadius={outerRadius + 16}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.4}
        />
      </g>
    );
  };

  // Custom tooltip for donut
  const DonutTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const { name, value, payload: p } = payload[0];
    const pct = Math.round((value / counts.total) * 100);
    return (
      <div style={{
        background: "#fff", border: `2px solid ${p.color}`,
        borderRadius: 10, padding: "8px 14px", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
      }}>
        <p style={{ fontWeight: "bold", color: p.color, marginBottom: 2 }}>{name}</p>
        <p style={{ color: "#374151" }}>{value} tasks &nbsp;<span style={{ color: "#9ca3af" }}>({pct}%)</span></p>
        <p style={{ color: "#9ca3af", fontSize: 10, marginTop: 4 }}>Click to filter tasks ↓</p>
      </div>
    );
  };

  // Custom tooltip for bar
  const BarTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const { name, value } = payload[0].payload;
    const color = payload[0].fill;
    return (
      <div style={{
        background: "#fff", border: `2px solid ${color}`,
        borderRadius: 10, padding: "8px 14px", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
      }}>
        <p style={{ fontWeight: "bold", color, marginBottom: 2 }}>{name}</p>
        <p style={{ color: "#374151" }}>{value} tasks</p>
        <p style={{ color: "#9ca3af", fontSize: 10, marginTop: 4 }}>Click to filter tasks ↓</p>
      </div>
    );
  };

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
                Weekly team task breakdown — pending, in progress, and completed.
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Tasks",  value: counts.total,      accent: "#1a2e44", bg: "#e8edf2", Icon: ClipboardList },
                { label: "Pending",      value: counts.pending,    accent: "#FFB020",  bg: "#fff8e6",  Icon: Clock },
                { label: "In Progress",  value: counts.inProgress, accent: "#E40046",  bg: "#ffdde8",  Icon: TrendingUp },
                { label: "Completed",    value: counts.completed,  accent: "#1DB96B",  bg: "#e6f9f0",  Icon: CheckCircle2 },
              ].map(({ label, value, accent, bg, Icon }) => (
                <div key={label} className="rounded-xl p-6 border bg-card shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ background: accent }} />
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{label}</p>
                      <p className="text-4xl font-bold mt-2">{value}</p>
                    </div>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                      <Icon size={22} color="#111" strokeWidth={2} />
                    </div>
                  </div>
                </div>
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
                    className="h-full rounded-full transition-all"
                    style={{ width: `${completionPct}%`, background: "linear-gradient(to right, #1a2e44, #1DB96B)" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">{completionPct}% complete</p>
              </CardContent>
            </Card>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Donut — Status Breakdown (click to filter) */}
              <div className="rounded-xl border bg-card shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ background: "linear-gradient(to right, #FFB020, #E40046, #1DB96B)" }} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3 className="font-semibold text-base">Status Breakdown</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Click a slice to filter tasks below</p>
                    </div>
                    {filter !== "All" && (
                      <button
                        onClick={() => handleFilterTab("All")}
                        className="text-xs px-2 py-1 rounded-full border border-gray-300 text-gray-500 hover:border-red-400 hover:text-red-500 transition-colors"
                      >
                        ✕ Clear
                      </button>
                    )}
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                        activeIndex={activeDonutIndex ?? undefined}
                        activeShape={renderActiveShape}
                        onClick={handleDonutClick}
                        style={{ cursor: "pointer" }}
                      >
                        {statusChartData.map((entry, i) => (
                          <Cell
                            key={entry.name}
                            fill={entry.color}
                            opacity={activeDonutIndex === null || activeDonutIndex === i ? 1 : 0.3}
                            style={{ transition: "opacity 0.2s" }}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<DonutTooltip />} />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={(value, entry) => (
                          <span style={{
                            fontSize: 12,
                            fontWeight: filter === value ? "bold" : "normal",
                            color: filter === value ? entry.color : undefined,
                          }}>
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar — Tasks by Priority (click to filter) */}
              <div className="rounded-xl border bg-card shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ background: "linear-gradient(to right, #E40046, #FFB020, #1DB96B)" }} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3 className="font-semibold text-base">Tasks by Priority</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Click a bar to filter tasks below</p>
                    </div>
                    {priorityFilter !== "All" && (
                      <button
                        onClick={() => { setPriorityFilter("All"); setActiveBarIndex(null); }}
                        className="text-xs px-2 py-1 rounded-full border border-gray-300 text-gray-500 hover:border-red-400 hover:text-red-500 transition-colors"
                      >
                        ✕ Clear
                      </button>
                    )}
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={priorityCounts} barSize={48} onClick={(data) => data?.activePayload && handleBarClick(data.activePayload[0].payload, data.activeTooltipIndex)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={24} />
                      <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)", radius: 6 }} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} style={{ cursor: "pointer" }}>
                        {priorityCounts.map((entry, i) => (
                          <Cell
                            key={entry.name}
                            fill={entry.color}
                            opacity={activeBarIndex === null || activeBarIndex === i ? 1 : 0.3}
                            style={{ transition: "opacity 0.2s" }}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Active Filters Banner */}
            {(filter !== "All" || priorityFilter !== "All") && (
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <span className="text-muted-foreground">Filtering:</span>
                {filter !== "All" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border"
                    style={{
                      background: statusChartData.find(d => d.name === filter)?.color + "18",
                      borderColor: statusChartData.find(d => d.name === filter)?.color,
                      color: statusChartData.find(d => d.name === filter)?.color,
                    }}>
                    Status: {filter}
                    <button onClick={() => handleFilterTab("All")} className="ml-1 hover:opacity-70">✕</button>
                  </span>
                )}
                {priorityFilter !== "All" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border"
                    style={{
                      background: priorityCounts.find(d => d.name === priorityFilter)?.color + "18",
                      borderColor: priorityCounts.find(d => d.name === priorityFilter)?.color,
                      color: priorityCounts.find(d => d.name === priorityFilter)?.color,
                    }}>
                    Priority: {priorityFilter}
                    <button onClick={() => { setPriorityFilter("All"); setActiveBarIndex(null); }} className="ml-1 hover:opacity-70">✕</button>
                  </span>
                )}
                <span className="text-muted-foreground text-xs">— {filtered.length} task{filtered.length !== 1 ? "s" : ""} shown</span>
              </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => handleFilterTab(f)}
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
