import React, { useState } from "react";
import { Shield, Smartphone, User, Globe, Bell, Key, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/header/Header";
import AppSidebar from "@/components/sidebar/app-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import hadiAvatar from "@/assets/hadi.jpeg";

const HB = { fontFamily: "'Helvetica World', Helvetica, Arial, sans-serif", fontWeight: "bold", color: "#000" };

const SectionCard = ({ accent, icon: Icon, title, children }) => (
  <Card className="rounded-xl bg-card border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ background: accent }} />
    <CardHeader className="pb-2">
      <CardTitle className="flex items-center gap-2 text-base" style={HB}>
        <Icon className="h-5 w-5 flex-shrink-0" style={{ color: accent }} />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const Toggle = ({ checked, onChange, label, sub }) => (
  <div className="flex items-center justify-between py-3 border-b last:border-0">
    <div>
      <p className="text-sm" style={HB}>{label}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
      style={{ background: checked ? "#1DB96B" : "#d1d5db" }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
        style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  </div>
);

export default function Settings() {
  const [deviceRole, setDeviceRole] = useState(
    () => localStorage.getItem("deviceRole") || "primary"
  );
  const handleDeviceRoleChange = (role) => {
    setDeviceRole(role);
    localStorage.setItem("deviceRole", role);
  };

  const [profile, setProfile] = useState({
    name: "Hadi Anwar",
    email: "hadi@cpx.net",
    phone: "+971 50 123 4567",
    department: "Executive Management",
    location: "Dubai, UAE",
    joined: "14 Jan 2024",
  });

  const [notifs, setNotifs] = useState({
    pushCritical: true,
    pushTask: true,
    emailDigest: false,
    smsAlert: true,
    loginAlert: true,
    policyUpdates: false,
  });

  const [fidoEnabled, setFidoEnabled] = useState(true);

  const devices = [
    { id: 1, name: "Chrome – Windows 10",     type: "Desktop",  lastActive: "2 hours ago",   trusted: true  },
    { id: 2, name: "Safari – iPhone 14 Pro",  type: "Mobile",   lastActive: "Yesterday",      trusted: true  },
    { id: 3, name: "Firefox – MacBook Pro",   type: "Desktop",  lastActive: "3 days ago",    trusted: false },
  ];

  const activity = [
    { id: 1, event: "Login via Passkey",         time: "Today, 09:42 AM",   ip: "192.168.1.14", status: "success" },
    { id: 2, event: "Critical task approved",    time: "Today, 09:47 AM",   ip: "192.168.1.14", status: "success" },
    { id: 3, event: "Failed login attempt",      time: "Yesterday, 11:30 PM", ip: "172.16.5.22", status: "failed"  },
    { id: 4, event: "Profile updated",           time: "18 Apr, 04:15 PM",  ip: "192.168.1.14", status: "success" },
    { id: 5, event: "New device registered",     time: "17 Apr, 08:55 AM",  ip: "192.168.2.40", status: "success" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header type="employee" />

      <div className="flex">
        <div className="hidden lg:block sticky top-14 h-[calc(100vh-56px)]">
          <AppSidebar activeItem="settings" />
        </div>

        <main className="flex-1 px-4 lg:px-8 py-6">
          <div className="max-w-screen-xl mx-auto space-y-6">

            {/* PAGE HEADER */}
            <div className="flex items-center gap-3">
              <div className="h-6 w-1 rounded-full" style={{ background: "linear-gradient(to bottom, #1a2e44, #1DB96B)" }} />
              <h1 className="text-2xl" style={HB}>Settings</h1>
            </div>

            {/* PROFILE HERO */}
            <div className="rounded-xl border bg-card shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ background: "linear-gradient(to right, #1a2e44, #1DB96B)" }} />
              <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <img src={hadiAvatar} alt="Hadi Anwar" className="w-20 h-20 rounded-2xl object-cover ring-4 flex-shrink-0" style={{ ringColor: "#79C6C7" }} />
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl" style={HB}>{profile.name}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{profile.department} &bull; {profile.location}</p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {[
                      { label: "Email", value: profile.email },
                      { label: "Phone", value: profile.phone },
                      { label: "Joined", value: profile.joined },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-lg border px-3 py-1.5 text-xs bg-muted/30">
                        <span className="text-muted-foreground">{label}: </span>
                        <span style={HB}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  className="passkey-btn flex-shrink-0"
                  style={{ width: "auto", padding: "8px 20px", fontSize: "14px" }}
                >
                  Edit Profile
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* PROFILE FORM */}
              <SectionCard accent="#1a2e44" icon={User} title="Profile Information">
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs mb-1 block" style={HB}>Full Name</label>
                      <Input defaultValue={profile.name} className="h-10" />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={HB}>Email Address</label>
                      <Input defaultValue={profile.email} className="h-10" />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={HB}>Phone Number</label>
                      <Input defaultValue={profile.phone} className="h-10" />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={HB}>Department</label>
                      <Input defaultValue={profile.department} className="h-10" />
                    </div>
                  </div>
                  <button className="passkey-btn" style={{ width: "auto", padding: "8px 20px", fontSize: "14px" }}>
                    Save Changes
                  </button>
                </div>
              </SectionCard>

              {/* QUANTUM PASS */}
              <SectionCard accent="#FFB020" icon={Key} title="Quantum Pass">
                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between rounded-xl border p-4" style={{ borderColor: fidoEnabled ? "#1DB96B" : "#e5e7eb", background: fidoEnabled ? "#e6f9f0" : "transparent" }}>
                    <div>
                      <p className="text-sm" style={HB}>{fidoEnabled ? "Passkey Active" : "Passkey Disabled"}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {fidoEnabled ? "Your account is protected with a Quantum Pass." : "Enable passkey for stronger authentication."}
                      </p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: fidoEnabled ? "#1DB96B" : "#e5e7eb", color: fidoEnabled ? "#fff" : "#6b7280" }}>
                      {fidoEnabled ? "ENABLED" : "DISABLED"}
                    </span>
                  </div>
                  <div className="rounded-lg border p-3 bg-muted/30 text-xs space-y-1.5">
                    {[
                      { label: "Registered device", value: "Chrome – Windows 10" },
                      { label: "Registered on",     value: "14 Jan 2024" },
                      { label: "Last used",          value: "Today, 09:42 AM" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-muted-foreground">{label}</span>
                        <span style={HB}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button className="passkey-btn" style={{ width: "auto", padding: "8px 20px", fontSize: "14px" }}>
                      {fidoEnabled ? "Re-register Key" : "Enable FidoQ Key"}
                    </button>
                    {fidoEnabled && (
                      <button
                        className="passkey-btn"
                        style={{ width: "auto", padding: "8px 20px", fontSize: "14px", background: "linear-gradient(to right, #4B1A6E, #E40046)", fontFamily: "'Anton', sans-serif" }}
                        onClick={() => setFidoEnabled(false)}
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              </SectionCard>

            </div>

            {/* NOTIFICATIONS - full width */}
            <SectionCard accent="#1DB96B" icon={Bell} title="Notifications">
                <div className="pt-1 grid grid-cols-1 sm:grid-cols-2">
                  <Toggle checked={notifs.pushCritical} onChange={(v) => setNotifs(p => ({ ...p, pushCritical: v }))}
                    label="Critical Task Alerts" sub="Push notification when a critical task requires your approval" />
                  <Toggle checked={notifs.pushTask} onChange={(v) => setNotifs(p => ({ ...p, pushTask: v }))}
                    label="Task Reminders" sub="Push notification for upcoming task due dates" />
                  <Toggle checked={notifs.emailDigest} onChange={(v) => setNotifs(p => ({ ...p, emailDigest: v }))}
                    label="Daily Email Digest" sub="Summary of pending and completed tasks each morning" />
                  <Toggle checked={notifs.smsAlert} onChange={(v) => setNotifs(p => ({ ...p, smsAlert: v }))}
                    label="SMS Security Alerts" sub="Text message for login from a new device" />
                  <Toggle checked={notifs.loginAlert} onChange={(v) => setNotifs(p => ({ ...p, loginAlert: v }))}
                    label="Login Notifications" sub="Get notified every time your account is accessed" />
                  <Toggle checked={notifs.policyUpdates} onChange={(v) => setNotifs(p => ({ ...p, policyUpdates: v }))}
                    label="Policy Updates" sub="Notify when a policy document is updated or due for review" />
                </div>
              </SectionCard>

            {/* DEVICE ROLE */}
            <SectionCard accent="#1a2e44" icon={Smartphone} title="Device Role">
              <div className="space-y-3 pt-1">
                <p className="text-sm text-muted-foreground">
                  Select whether this device is the <strong>Primary</strong> approver (passkey signing) or a <strong>Secondary</strong> device (requires Android approval for critical tasks).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { role: "primary",   label: "Primary Device",   desc: "Approve tasks directly via passkey on this device.",              icon: "🔑" },
                    { role: "secondary", label: "Secondary Device",  desc: "Critical tasks require push approval from your Android device.", icon: "📱" },
                  ].map(({ role, label, desc, icon }) => (
                    <button
                      key={role}
                      onClick={() => handleDeviceRoleChange(role)}
                      className="rounded-xl border p-4 text-left transition-all"
                      style={{
                        borderColor: deviceRole === role ? "#1DB96B" : "#e5e7eb",
                        background: deviceRole === role ? "#e0f7f7" : "transparent",
                        boxShadow: deviceRole === role ? "0 0 0 2px #1DB96B80" : "none",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{icon}</span>
                        <span className="text-sm" style={HB}>{label}</span>
                        {deviceRole === role && (
                          <span className="ml-auto text-xs px-2 py-0.5 rounded-full text-white" style={{ background: "#1DB96B" }}>Active</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </SectionCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* DEVICE MANAGEMENT */}
              <SectionCard accent="#FFB020" icon={Smartphone} title="Device Management">
                <div className="space-y-3 pt-1">
                  <p className="text-xs text-muted-foreground">Devices that have accessed your account. Remove any device you don't recognise.</p>
                  {devices.map((d) => (
                    <div key={d.id} className="flex items-center justify-between rounded-xl border p-3 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-base"
                          style={{ background: d.trusted ? "#e0f7f7" : "#ffe4e8" }}>
                          {d.type === "Mobile" ? "📱" : "💻"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm truncate" style={HB}>{d.name}</p>
                          <p className="text-xs text-muted-foreground">Last active: {d.lastActive}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {d.trusted && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#e0f7f7", color: "#79C6C7", fontWeight: "bold" }}>Trusted</span>
                        )}
                      <button
                          className="passkey-btn"
                          style={{ width: "auto", padding: "5px 12px", fontSize: "12px", background: "linear-gradient(to right, #4B1A6E, #E40046)", boxShadow: "none", fontFamily: "'Anton', sans-serif" }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button className="passkey-btn" style={{ width: "auto", padding: "8px 20px", fontSize: "14px" }}>
                    + Add New Device
                  </button>
                </div>
              </SectionCard>

              {/* RECENT ACTIVITY */}
              <SectionCard accent="#79C6C7" icon={Activity} title="Recent Account Activity">
                <div className="space-y-0 pt-1">
                  {activity.map((a) => (
                    <div key={a.id} className="flex items-start gap-3 py-3 border-b last:border-0">
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                        style={{ background: a.status === "success" ? "#79C6C7" : "#E40046" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm" style={HB}>{a.event}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{a.time} &bull; {a.ip}</p>
                      </div>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          background: a.status === "success" ? "#e0f7f7" : "#ffdde8",
                          color: a.status === "success" ? "#0e7a7b" : "#E40046",
                          fontWeight: "bold",
                        }}
                      >
                        {a.status === "success" ? "OK" : "FAIL"}
                      </span>
                    </div>
                  ))}
                </div>
              </SectionCard>

            </div>

            {/* APP PREFERENCES */}
            <SectionCard accent="#79C6C7" icon={Globe} title="App Preferences">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {[
                  { label: "Language",    options: ["English", "Arabic", "French"],          current: "English"     },
                  { label: "Theme",       options: ["System Default", "Light", "Dark"],      current: "System Default" },
                  { label: "Timezone",    options: ["UTC+4 (GST)", "UTC+0", "UTC-5 (EST)"],  current: "UTC+4 (GST)" },
                ].map(({ label, options, current }) => (
                  <div key={label}>
                    <label className="text-xs mb-1 block" style={HB}>{label}</label>
                    <select
                      defaultValue={current}
                      className="w-full h-10 rounded-lg border px-3 text-sm bg-background"
                      style={HB}
                    >
                      {options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <button className="passkey-btn" style={{ width: "auto", padding: "8px 20px", fontSize: "14px" }}>
                  Save Preferences
                </button>
              </div>
            </SectionCard>

          </div>
        </main>
      </div>
    </div>
  );
}
