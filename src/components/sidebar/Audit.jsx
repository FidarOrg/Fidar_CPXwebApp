import React, { useState, useMemo } from "react";
import Header from "@/components/header/Header";
import AppSidebar from "@/components/sidebar/app-sidebar";
import { BarChart2, CheckCircle2, XCircle, Users } from "lucide-react";

const HB = { fontFamily: "'Helvetica World', Helvetica, Arial, sans-serif", fontWeight: "bold" };

const AUDIT_LOGS = [
  { id: 1,  timestamp: "2026-04-20 09:42:11", user: "hadi.anwar@fidar.io",    action: "LOGIN",            resource: "Auth Service",          ip: "192.168.1.14",  status: "Success", details: "Passkey authentication successful" },
  { id: 2,  timestamp: "2026-04-20 09:45:03", user: "hadi.anwar@fidar.io",    action: "TASK_INITIATE",    resource: "Sanction Financial Budget", ip: "192.168.1.14",  status: "Success", details: "Critical task initiated — session created" },
  { id: 3,  timestamp: "2026-04-20 09:46:55", user: "hadi.anwar@fidar.io",    action: "TASK_COMPLETE",    resource: "Sanction Financial Budget", ip: "192.168.1.14",  status: "Success", details: "Approval received from Android device" },
  { id: 4,  timestamp: "2026-04-19 14:20:30", user: "sara.malik@fidar.io",    action: "POLICY_VIEW",      resource: "AML Policy v4.0-draft",  ip: "10.0.0.88",     status: "Success", details: "Policy document opened for review" },
  { id: 5,  timestamp: "2026-04-19 13:55:12", user: "admin@fidar.io",         action: "USER_CREATED",     resource: "User Management",        ip: "10.0.0.1",      status: "Success", details: "New user account provisioned" },
  { id: 6,  timestamp: "2026-04-19 11:30:47", user: "omar.hassan@fidar.io",   action: "LOGIN",            resource: "Auth Service",          ip: "172.16.5.22",   status: "Failed",  details: "Invalid credential attempt — account locked after 3 retries" },
  { id: 7,  timestamp: "2026-04-19 10:15:00", user: "sara.malik@fidar.io",    action: "TASK_INITIATE",    resource: "Authorize Emergency Fund", ip: "10.0.0.88",     status: "Success", details: "Critical task initiated" },
  { id: 8,  timestamp: "2026-04-18 16:44:22", user: "hadi.anwar@fidar.io",    action: "SETTINGS_UPDATE",  resource: "Profile Settings",       ip: "192.168.1.14",  status: "Success", details: "Profile name and email updated" },
  { id: 9,  timestamp: "2026-04-18 15:10:09", user: "admin@fidar.io",         action: "ROLE_CHANGE",      resource: "User Management",        ip: "10.0.0.1",      status: "Success", details: "Role changed from Analyst to Manager" },
  { id: 10, timestamp: "2026-04-18 14:02:55", user: "omar.hassan@fidar.io",   action: "LOGOUT",           resource: "Auth Service",          ip: "172.16.5.22",   status: "Success", details: "Session terminated by user" },
  { id: 11, timestamp: "2026-04-17 09:30:18", user: "layla.nasser@fidar.io",  action: "DEVICE_BIND",      resource: "Device Registry",        ip: "192.168.2.40",  status: "Success", details: "New Android device registered via QR" },
  { id: 12, timestamp: "2026-04-17 08:55:44", user: "layla.nasser@fidar.io",  action: "LOGIN",            resource: "Auth Service",          ip: "192.168.2.40",  status: "Success", details: "SAML SSO login successful" },
  { id: 13, timestamp: "2026-04-16 17:20:33", user: "admin@fidar.io",         action: "POLICY_UPDATE",    resource: "Vendor Risk Policy v1.3", ip: "10.0.0.1",      status: "Success", details: "Policy updated to draft — review assigned" },
  { id: 14, timestamp: "2026-04-16 16:05:11", user: "hadi.anwar@fidar.io",    action: "TASK_INITIATE",    resource: "Approve Vendor Contract", ip: "192.168.1.14",  status: "Failed",  details: "Initiation failed — approval session timeout" },
  { id: 15, timestamp: "2026-04-15 11:48:02", user: "sara.malik@fidar.io",    action: "EXPORT",           resource: "Task Analytics",         ip: "10.0.0.88",     status: "Success", details: "Analytics data exported as CSV" },
  { id: 16, timestamp: "2026-04-15 10:30:50", user: "omar.hassan@fidar.io",   action: "DEVICE_REVOKE",    resource: "Device Registry",        ip: "172.16.5.22",   status: "Success", details: "Secondary device revoked from account" },
  { id: 17, timestamp: "2026-04-14 14:22:10", user: "admin@fidar.io",         action: "AUDIT_EXPORT",     resource: "Audit Log",             ip: "10.0.0.1",      status: "Success", details: "Full audit log exported for Q1 review" },
  { id: 18, timestamp: "2026-04-14 09:10:05", user: "layla.nasser@fidar.io",  action: "TASK_COMPLETE",    resource: "Revoke Secondary Device", ip: "192.168.2.40",  status: "Success", details: "Critical task completed via push approval" },
];

const ACTION_COLORS = {
  LOGIN:          "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  LOGOUT:         "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700",
  TASK_INITIATE:  "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  TASK_COMPLETE:  "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  POLICY_VIEW:    "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
  POLICY_UPDATE:  "bg-violet-100 text-violet-700 border-violet-300 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800",
  USER_CREATED:   "bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800",
  ROLE_CHANGE:    "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
  SETTINGS_UPDATE:"bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800",
  DEVICE_BIND:    "bg-teal-100 text-teal-700 border-teal-300 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800",
  DEVICE_REVOKE:  "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  EXPORT:         "bg-lime-100 text-lime-700 border-lime-300 dark:bg-lime-900/30 dark:text-lime-400 dark:border-lime-800",
  AUDIT_EXPORT:   "bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800",
};

const STATUS_COLORS = {
  Success: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  Failed:  "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
};

const ACTIONS = ["All", ...Array.from(new Set(AUDIT_LOGS.map((l) => l.action)))];
const STATUSES = ["All", "Success", "Failed"];

export default function AuditPage() {
  const [actionFilter, setActionFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return AUDIT_LOGS.filter((log) => {
      const matchAction = actionFilter === "All" || log.action === actionFilter;
      const matchStatus = statusFilter === "All" || log.status === statusFilter;
      const matchSearch =
        search === "" ||
        log.user.toLowerCase().includes(search.toLowerCase()) ||
        log.resource.toLowerCase().includes(search.toLowerCase()) ||
        log.details.toLowerCase().includes(search.toLowerCase());
      return matchAction && matchStatus && matchSearch;
    });
  }, [actionFilter, statusFilter, search]);

  const counts = useMemo(() => ({
    total:   AUDIT_LOGS.length,
    success: AUDIT_LOGS.filter((l) => l.status === "Success").length,
    failed:  AUDIT_LOGS.filter((l) => l.status === "Failed").length,
    users:   new Set(AUDIT_LOGS.map((l) => l.user)).size,
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header type="employee" />

      <div className="flex">
        <div className="hidden lg:block sticky top-14 h-[calc(100vh-56px)]">
          <AppSidebar activeItem="audit" />
        </div>

        <main className="flex-1 px-4 lg:px-8 py-6">
          <div className="max-w-screen-2xl mx-auto space-y-6">

            {/* Page Title */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl" style={HB}>Audit Log</h1>
                <p className="mt-1 text-sm" style={HB}>
                  Complete record of all system actions, authentication events, and administrative changes.
                </p>
              </div>
              <button
                className="passkey-btn"
                style={{ width: "auto", padding: "10px 24px", fontSize: "14px" }}
              >
                Export CSV
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Events",  value: counts.total,   accent: "#1a2e44", bg: "#e8edf2", Icon: BarChart2 },
                { label: "Successful",    value: counts.success, accent: "#1DB96B",  bg: "#e6f9f0", Icon: CheckCircle2 },
                { label: "Failed",        value: counts.failed,  accent: "#E40046",  bg: "#ffdde8", Icon: XCircle },
                { label: "Unique Users",  value: counts.users,   accent: "#FFB020",  bg: "#fff8e6", Icon: Users },
              ].map(({ label, value, accent, bg, Icon }) => (
                <div key={label} className="rounded-xl p-6 border bg-card shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ background: accent }} />
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm" style={HB}>{label}</p>
                      <p className="text-4xl mt-2" style={HB}>{value}</p>
                    </div>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                      <Icon size={22} color="#111" strokeWidth={2} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Search by user, resource, or details…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded-lg px-4 py-2 text-sm w-full sm:w-96 bg-background"
                style={{ ...HB, fontWeight: "normal" }}
              />
              <div className="flex flex-wrap gap-2">
                <span className="text-xs self-center" style={HB}>Status:</span>
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${statusFilter === s ? "border-transparent" : "bg-background border-border hover:border-primary"}`}
                    style={statusFilter === s
                      ? { background: "#E40046", color: "#fff", border: "none", fontFamily: "'Helvetica World', Helvetica, Arial, sans-serif", fontWeight: "bold" }
                      : { ...HB }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs self-center" style={HB}>Action:</span>
                {ACTIONS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setActionFilter(a)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${actionFilter === a ? "border-transparent" : "bg-background border-border hover:border-primary"}`}
                    style={actionFilter === a
                      ? { background: "#E40046", color: "#fff", border: "none", fontFamily: "'Helvetica World', Helvetica, Arial, sans-serif", fontWeight: "bold" }
                      : { ...HB }}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      {["Timestamp", "User", "Action", "Resource", "IP Address", "Status", "Details"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 whitespace-nowrap" style={HB}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((log, idx) => (
                      <tr
                        key={log.id}
                        className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${
                          idx % 2 === 0 ? "" : "bg-muted/10"
                        }`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs" style={HB}>
                          {log.timestamp}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs" style={HB}>
                          {log.user}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border ${ACTION_COLORS[log.action] ?? ""}`}
                            style={HB}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs max-w-[160px] truncate" style={HB} title={log.resource}>
                          {log.resource}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs whitespace-nowrap" style={HB}>
                          {log.ip}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[log.status] ?? ""}`}
                            style={HB}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs max-w-[220px] truncate" style={HB} title={log.details}>
                          {log.details}
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-12" style={HB}>
                          No audit events match your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {filtered.length > 0 && (
                <div className="px-4 py-3 border-t text-xs" style={HB}>
                  Showing {filtered.length} of {AUDIT_LOGS.length} events
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
