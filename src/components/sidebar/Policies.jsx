import React, { useState } from "react";
import Header from "@/components/header/Header";
import AppSidebar from "@/components/sidebar/app-sidebar";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2, Search, LayoutGrid } from "lucide-react";

const HB = { fontFamily: "'Helvetica World', Helvetica, Arial, sans-serif", fontWeight: "bold", color: "#000" };

const POLICIES = [
  {
    id: 1,
    name: "Information Security Policy",
    category: "Security",
    description:
      "Defines the framework for protecting organizational information assets, access control standards, and incident response procedures.",
    status: "Active",
    version: "v3.1",
    effectiveDate: "01 Jan 2026",
    lastUpdated: "10 Dec 2025",
    owner: "CISO Office",
  },
  {
    id: 2,
    name: "Data Privacy & Protection Policy",
    category: "Privacy",
    description:
      "Governs the collection, storage, processing, and sharing of personal data in compliance with GDPR and local regulations.",
    status: "Active",
    version: "v2.4",
    effectiveDate: "15 Feb 2026",
    lastUpdated: "20 Jan 2026",
    owner: "Legal & Compliance",
  },
  {
    id: 3,
    name: "Acceptable Use Policy",
    category: "IT Governance",
    description:
      "Outlines permitted and prohibited uses of corporate IT systems, devices, networks, and digital resources.",
    status: "Active",
    version: "v1.8",
    effectiveDate: "01 Mar 2025",
    lastUpdated: "15 Feb 2025",
    owner: "IT Department",
  },
  {
    id: 4,
    name: "Anti-Money Laundering (AML) Policy",
    category: "Compliance",
    description:
      "Establishes procedures for detecting, preventing, and reporting money laundering activities in line with regulatory requirements.",
    status: "Under Review",
    version: "v4.0-draft",
    effectiveDate: "Pending",
    lastUpdated: "02 Apr 2026",
    owner: "Compliance Team",
  },
  {
    id: 5,
    name: "Business Continuity Plan",
    category: "Operations",
    description:
      "Defines recovery objectives, failover procedures, and roles for maintaining operations during system outages or disasters.",
    status: "Active",
    version: "v2.2",
    effectiveDate: "01 Oct 2025",
    lastUpdated: "28 Sep 2025",
    owner: "Operations",
  },
  {
    id: 6,
    name: "Employee Code of Conduct",
    category: "HR",
    description:
      "Sets expectations for ethical behavior, workplace standards, conflict of interest disclosures, and disciplinary procedures.",
    status: "Active",
    version: "v5.0",
    effectiveDate: "01 Jan 2025",
    lastUpdated: "01 Dec 2024",
    owner: "Human Resources",
  },
  {
    id: 7,
    name: "Vendor Risk Management Policy",
    category: "Risk",
    description:
      "Outlines the due diligence process, contractual requirements, and monitoring procedures for third-party vendors and suppliers.",
    status: "Under Review",
    version: "v1.3-draft",
    effectiveDate: "Pending",
    lastUpdated: "18 Apr 2026",
    owner: "Risk Management",
  },
  {
    id: 8,
    name: "Password & Authentication Policy",
    category: "Security",
    description:
      "Specifies minimum password requirements, MFA mandates, passkey adoption guidelines, and session timeout standards.",
    status: "Active",
    version: "v2.0",
    effectiveDate: "15 Mar 2026",
    lastUpdated: "01 Mar 2026",
    owner: "CISO Office",
  },
];

const CATEGORY_COLORS = {
  Security: "bg-red-100 text-red-700 border-red-300",
  Privacy: "bg-purple-100 text-purple-700 border-purple-300",
  "IT Governance": "bg-blue-100 text-blue-700 border-blue-300",
  Compliance: "bg-orange-100 text-orange-700 border-orange-300",
  Operations: "bg-cyan-100 text-cyan-700 border-cyan-300",
  HR: "bg-pink-100 text-pink-700 border-pink-300",
  Risk: "bg-yellow-100 text-yellow-700 border-yellow-300",
};

const STATUS_COLORS = {
  Active: "bg-green-100 text-green-700 border-green-300",
  "Under Review": "bg-amber-100 text-amber-700 border-amber-300",
};

export default function PoliciesPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const categories = ["All", ...Array.from(new Set(POLICIES.map((p) => p.category)))];

  const filtered = POLICIES.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "All" || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header type="employee" />

      <div className="flex">
        <div className="hidden lg:block sticky top-14 h-[calc(100vh-56px)]">
          <AppSidebar activeItem="policies" />
        </div>

        <main className="flex-1 px-4 lg:px-8 py-6">
          <div className="max-w-screen-2xl mx-auto space-y-6">

            {/* Page Title */}
            <div>
              <h1 className="text-3xl" style={HB}>Policies</h1>
              <p className="mt-1 text-sm" style={HB}>
                Review and manage all organizational compliance and governance policies.
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Policies", value: POLICIES.length,                                           accent: "#1a2e44", bg: "#e8edf2", Icon: FileText },
                { label: "Active",         value: POLICIES.filter((p) => p.status === "Active").length,        accent: "#1DB96B",  bg: "#e6f9f0", Icon: CheckCircle2 },
                { label: "Under Review",   value: POLICIES.filter((p) => p.status === "Under Review").length,  accent: "#FFB020",  bg: "#fff8e6", Icon: Search },
                { label: "Categories",     value: categories.length - 1,                                       accent: "#E40046",  bg: "#ffdde8", Icon: LayoutGrid },
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
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <input
                type="text"
                placeholder="Search policies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded-lg px-4 py-2 text-sm w-full sm:w-72 bg-background"
                style={{ ...HB, fontWeight: "normal" }}
              />
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                      categoryFilter === cat
                        ? "border-transparent"
                        : "bg-background border-border hover:border-primary"
                    }`}
                    style={categoryFilter === cat
                      ? { background: "#E40046", color: "#fff", border: "none", fontFamily: "'Helvetica World', Helvetica, Arial, sans-serif", fontWeight: "bold" }
                      : { ...HB }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Policy Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map((policy) => (
                <div key={policy.id} className="rounded-xl border bg-card p-5 space-y-3 shadow-sm">

                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[policy.category] ?? ""}`}
                          style={HB}
                        >
                          {policy.category}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[policy.status] ?? ""}`}
                          style={HB}
                        >
                          {policy.status}
                        </span>
                        <span className="text-xs text-gray-400" style={HB}>{policy.version}</span>
                      </div>
                      <h3 className="text-base" style={HB}>{policy.name}</h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm leading-relaxed" style={HB}>{policy.description}</p>

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <span style={HB}>
                      <span className="text-gray-400">Effective:</span> {policy.effectiveDate}
                    </span>
                    <span style={HB}>
                      <span className="text-gray-400">Updated:</span> {policy.lastUpdated}
                    </span>
                    <span className="col-span-2" style={HB}>
                      <span className="text-gray-400">Owner:</span> {policy.owner}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      className="passkey-btn"
                      style={{ width: "auto", padding: "8px 20px", fontSize: "14px" }}
                    >
                      View Policy
                    </button>
                    <button
                      className="passkey-btn"
                      style={{
                        width: "auto",
                        padding: "8px 20px",
                        fontSize: "14px",
                        background: "#e5e7eb",
                        color: "#000",
                        boxShadow: "none",
                      }}
                    >
                      Download
                    </button>
                  </div>

                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <p style={HB}>No policies match your search.</p>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
