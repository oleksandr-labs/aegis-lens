"use client";

import { useState, useMemo } from "react";

type Plan = "Free" | "Analyst" | "Team" | "Enterprise";
type Role = "admin" | "analyst" | "viewer";
type Status = "active" | "suspended";

type User = {
  id: string;
  email: string;
  name: string;
  plan: Plan;
  role: Role;
  status: Status;
  joined: string;
  lastLogin: string;
  apiRequests: number;
};

const INITIAL_USERS: User[] = [
  { id: "u1", email: "analyst@bellingcat.com", name: "James Wilson", plan: "Team", role: "analyst", status: "active", joined: "2026-05-01", lastLogin: "2026-06-03", apiRequests: 14832 },
  { id: "u2", email: "journalist@kyivpost.com", name: "Olena Kovalenko", plan: "Analyst", role: "viewer", status: "active", joined: "2026-05-15", lastLogin: "2026-06-02", apiRequests: 523 },
  { id: "u3", email: "researcher@uni.ac.uk", name: "Dr. Peter Smith", plan: "Free", role: "viewer", status: "active", joined: "2026-04-10", lastLogin: "2026-05-28", apiRequests: 47 },
  { id: "u4", email: "spam@example.com", name: "Unknown", plan: "Free", role: "viewer", status: "suspended", joined: "2026-06-01", lastLogin: "2026-06-01", apiRequests: 0 },
];

const PLAN_COLOR: Record<Plan, string> = {
  Free: "text-text-muted border-border-default",
  Analyst: "text-[#4ea1ff] border-[#4ea1ff]/40",
  Team: "text-emerald-400 border-emerald-400/40",
  Enterprise: "text-amber-400 border-amber-400/40",
};

const RECENT_ACTIVITY: Record<string, string[]> = {
  u1: ["Viewed event EVT-001", "Exported report PDF", "API request ×200", "Viewed source bellingcat.com"],
  u2: ["Viewed event LIVE-001", "API request ×12"],
  u3: ["Signed in", "Viewed map"],
  u4: ["Flagged as spam", "Account suspended"],
};

const PLANS: Plan[] = ["Free", "Analyst", "Team", "Enterprise"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawer, setDrawer] = useState<User | null>(null);
  const [drawerPlan, setDrawerPlan] = useState<Plan>("Free");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          u.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [users, search],
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((u) => u.id)));
    }
  };

  const toggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "active" ? "suspended" : "active" }
          : u,
      ),
    );
    if (drawer?.id === id) {
      setDrawer((d) =>
        d ? { ...d, status: d.status === "active" ? "suspended" : "active" } : null,
      );
    }
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    if (drawer?.id === id) setDrawer(null);
    setConfirmDelete(null);
  };

  const bulkSuspend = () => {
    setUsers((prev) =>
      prev.map((u) => (selected.has(u.id) ? { ...u, status: "suspended" } : u)),
    );
    setSelected(new Set());
  };

  const exportCsv = () => {
    const rows = [
      ["ID", "Email", "Name", "Plan", "Role", "Status", "Joined", "LastLogin", "APIRequests"],
      ...filtered
        .filter((u) => selected.size === 0 || selected.has(u.id))
        .map((u) => [u.id, u.email, u.name, u.plan, u.role, u.status, u.joined, u.lastLogin, String(u.apiRequests)]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const openDrawer = (user: User) => {
    setDrawer(user);
    setDrawerPlan(user.plan);
  };

  return (
    <div className="px-6 py-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-accent">Admin</span>
          <h1 className="text-xl font-semibold text-text-primary">User Management</h1>
        </div>
        <a href="/admin" className="rounded border border-border-subtle px-2 py-1 text-xs text-text-secondary hover:bg-bg-surface">
          ← Dashboard
        </a>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email or name…"
          className="w-64 rounded border border-border-default bg-bg-surface px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
        />
        <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest">
          {filtered.length} user{filtered.length === 1 ? "" : "s"}
        </span>
        <div className="ml-auto flex gap-2">
          {selected.size > 0 && (
            <>
              <button
                onClick={bulkSuspend}
                className="rounded border border-amber-500/40 px-3 py-1.5 text-xs text-amber-400 hover:bg-amber-500/10"
              >
                Suspend selected ({selected.size})
              </button>
              <button
                onClick={exportCsv}
                className="rounded border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-surface"
              >
                Export CSV
              </button>
            </>
          )}
          {selected.size === 0 && (
            <button
              onClick={exportCsv}
              className="rounded border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-surface"
            >
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className={`overflow-x-auto rounded border border-border-subtle bg-bg-surface transition-all ${drawer ? "mr-[376px]" : ""}`}>
        <table className="w-full text-sm min-w-[900px]">
          <thead className="border-b border-border-subtle bg-bg-elevated">
            <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-text-muted">
              <th className="px-3 py-2">
                <input
                  type="checkbox"
                  checked={selected.size === filtered.length && filtered.length > 0}
                  onChange={toggleAll}
                  className="accent-accent cursor-pointer"
                />
              </th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Plan</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Joined</th>
              <th className="px-3 py-2">Last login</th>
              <th className="px-3 py-2 text-right">API reqs</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr
                key={user.id}
                onClick={() => openDrawer(user)}
                className={`border-t border-border-subtle cursor-pointer transition-colors hover:bg-bg-elevated ${
                  drawer?.id === user.id ? "bg-bg-elevated" : ""
                }`}
              >
                <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.has(user.id)}
                    onChange={() => toggleSelect(user.id)}
                    className="accent-accent cursor-pointer"
                  />
                </td>
                <td className="px-3 py-3 font-mono text-xs text-text-secondary">{user.email}</td>
                <td className="px-3 py-3 text-text-primary text-xs">{user.name}</td>
                <td className="px-3 py-3">
                  <span className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase ${PLAN_COLOR[user.plan]}`}>
                    {user.plan}
                  </span>
                </td>
                <td className="px-3 py-3 font-mono text-[11px] uppercase text-text-muted">{user.role}</td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase ${
                      user.status === "active" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full ${
                        user.status === "active" ? "bg-emerald-400" : "bg-red-400"
                      }`}
                    />
                    {user.status}
                  </span>
                </td>
                <td className="px-3 py-3 font-mono text-[11px] text-text-muted">{user.joined}</td>
                <td className="px-3 py-3 font-mono text-[11px] text-text-muted">{user.lastLogin}</td>
                <td className="px-3 py-3 text-right font-mono text-[11px] text-text-secondary">
                  {user.apiRequests.toLocaleString()}
                </td>
                <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => toggleStatus(user.id)}
                      className={`rounded border px-2 py-1 text-[10px] font-mono uppercase transition ${
                        user.status === "active"
                          ? "border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                          : "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                      }`}
                    >
                      {user.status === "active" ? "Suspend" : "Activate"}
                    </button>
                    <button
                      onClick={() => openDrawer(user)}
                      className="rounded border border-[#4ea1ff]/40 px-2 py-1 text-[10px] font-mono uppercase text-[#4ea1ff] hover:bg-[#4ea1ff]/10"
                    >
                      View
                    </button>
                    <button
                      onClick={() => setConfirmDelete(user.id)}
                      className="rounded border border-red-500/40 px-2 py-1 text-[10px] font-mono uppercase text-red-400 hover:bg-red-500/10"
                    >
                      Del
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-sm text-text-muted">
                  No users match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="rounded border border-border-subtle bg-bg-elevated p-6 w-80 shadow-xl">
            <div className="mb-3 text-sm font-semibold text-text-primary">Delete user?</div>
            <p className="text-xs text-text-muted mb-5">
              This action cannot be undone. The user will be permanently removed.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => deleteUser(confirmDelete)}
                className="flex-1 rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded border border-border-default px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-surface"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User detail drawer */}
      {drawer && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setDrawer(null)}
          />
          <div className="fixed right-0 top-0 z-40 h-full w-[360px] border-l border-border-subtle bg-bg-elevated flex flex-col shadow-2xl overflow-y-auto">
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-accent">User detail</span>
              <button
                onClick={() => setDrawer(null)}
                className="text-text-muted hover:text-text-primary text-lg leading-none"
                aria-label="Close drawer"
              >
                ×
              </button>
            </div>

            <div className="flex-1 p-4 space-y-5">
              {/* Identity */}
              <div>
                <div className="text-base font-semibold text-text-primary">{drawer.name}</div>
                <div className="font-mono text-xs text-text-secondary mt-0.5">{drawer.email}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase ${PLAN_COLOR[drawer.plan]}`}>
                    {drawer.plan}
                  </span>
                  <span className="font-mono text-[10px] uppercase text-text-muted">{drawer.role}</span>
                  <span className={`font-mono text-[10px] uppercase ${drawer.status === "active" ? "text-emerald-400" : "text-red-400"}`}>
                    {drawer.status}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "User ID", val: drawer.id },
                  { label: "API requests", val: drawer.apiRequests.toLocaleString() },
                  { label: "Joined", val: drawer.joined },
                  { label: "Last login", val: drawer.lastLogin },
                ].map((s) => (
                  <div key={s.label} className="rounded border border-border-subtle bg-bg-surface p-2">
                    <div className="font-mono text-[9px] uppercase tracking-widest text-text-muted">{s.label}</div>
                    <div className="mt-0.5 font-mono text-xs text-text-primary">{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Recent activity */}
              <div>
                <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">Recent activity</div>
                <ul className="space-y-1">
                  {(RECENT_ACTIVITY[drawer.id] ?? ["No activity recorded"]).map((act, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                      <span className="mt-1 inline-block h-1 w-1 flex-shrink-0 rounded-full bg-accent" />
                      {act}
                    </li>
                  ))}
                </ul>
              </div>

              {/* API keys */}
              <div>
                <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">API keys</div>
                <div className="rounded border border-border-subtle bg-bg-surface px-3 py-2 font-mono text-[10px] text-text-muted">
                  ak_{drawer.id}_••••••••••••••••
                </div>
              </div>

              {/* Change plan */}
              <div>
                <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">Change plan</div>
                <div className="flex gap-2">
                  <select
                    value={drawerPlan}
                    onChange={(e) => setDrawerPlan(e.target.value as Plan)}
                    className="flex-1 rounded border border-border-default bg-bg-surface px-2 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
                  >
                    {PLANS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      setUsers((prev) => prev.map((u) => u.id === drawer.id ? { ...u, plan: drawerPlan } : u));
                      setDrawer((d) => d ? { ...d, plan: drawerPlan } : null);
                    }}
                    className="rounded border border-accent/40 px-3 py-1.5 text-xs text-accent hover:bg-accent/10"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Add to org */}
              <div>
                <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">Add to org</div>
                <input
                  placeholder="org-slug…"
                  className="w-full rounded border border-border-default bg-bg-surface px-2 py-1.5 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
                />
              </div>

              {/* Audit log for user */}
              <div>
                <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">User audit log</div>
                <div className="space-y-1 rounded border border-border-subtle bg-bg-surface p-2">
                  {[
                    { msg: "Account created", when: drawer.joined },
                    { msg: "Plan assigned: " + drawer.plan, when: drawer.joined },
                    { msg: "Last sign-in", when: drawer.lastLogin },
                  ].map((e, i) => (
                    <div key={i} className="flex justify-between text-[10px] font-mono">
                      <span className="text-text-secondary">{e.msg}</span>
                      <span className="text-text-muted">{e.when}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer actions footer */}
            <div className="border-t border-border-subtle p-4 space-y-2">
              <button
                onClick={() => toggleStatus(drawer.id)}
                className={`w-full rounded border px-3 py-2 text-xs font-semibold transition ${
                  drawer.status === "active"
                    ? "border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                    : "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                }`}
              >
                {drawer.status === "active" ? "Suspend user" : "Activate user"}
              </button>
              <button className="w-full rounded border border-[#4ea1ff]/40 px-3 py-2 text-xs font-semibold text-[#4ea1ff] hover:bg-[#4ea1ff]/10">
                Impersonate (SSO bypass)
              </button>
              <button className="w-full rounded border border-[#4ea1ff]/40 px-3 py-2 text-xs font-semibold text-[#4ea1ff] hover:bg-[#4ea1ff]/10">
                Force logout (revoke sessions)
              </button>
              <button
                onClick={() => setConfirmDelete(drawer.id)}
                className="w-full rounded border border-red-500/40 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10"
              >
                Delete user
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
