"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type NavItem = {
  id: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: "profile", label: "Profile" },
  { id: "preferences", label: "Preferences" },
  { id: "notifications", label: "Notifications" },
  { id: "security", label: "Security" },
  { id: "integrations", label: "Integrations" },
  { id: "privacy", label: "Data & Privacy" },
  { id: "danger", label: "Danger Zone" },
];

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-semibold text-text-primary mb-4">{children}</h2>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded border border-border-subtle bg-bg-surface p-5 mb-4 ${className ?? ""}`}>
      {children}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="rounded bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

function DangerButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

// Simple in-page toast replacement
function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const show = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };
  return { message, show };
}

function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 rounded border border-border-subtle bg-bg-surface px-4 py-3 text-sm text-text-primary shadow-lg"
    >
      {message}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section: Profile (Task 7)
// ---------------------------------------------------------------------------

function ProfileSection({ onToast }: { onToast: (msg: string) => void }) {
  const [displayName, setDisplayName] = useState("Aegis Lens User");
  const [bio, setBio] = useState("");
  const [publicProfile, setPublicProfile] = useState(true);

  // Load saved profile on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("aegis_profile") ?? "{}");
      if (saved.displayName) setDisplayName(saved.displayName);
      if (saved.bio) setBio(saved.bio);
      if (saved.publicProfile !== undefined) setPublicProfile(saved.publicProfile);
    } catch {
      // ignore
    }
  }, []);

  const saveProfile = () => {
    localStorage.setItem("aegis_profile", JSON.stringify({ displayName, bio, publicProfile }));
    // Emit aegis:toast event for any listening ToastProvider
    window.dispatchEvent(new CustomEvent("aegis:toast", {
      detail: { message: "Profile saved", variant: "success" },
    }));
    onToast("Profile saved.");
  };

  return (
    <section id="profile" className="scroll-mt-20">
      <SectionHeading>Profile</SectionHeading>
      <Card>
        <div className="flex items-start gap-5 mb-6">
          {/* Avatar placeholder */}
          <div className="h-16 w-16 shrink-0 rounded-full bg-bg-elevated flex items-center justify-center text-sm font-semibold text-text-primary select-none">
            {displayName
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0])
              .join("")
              .toUpperCase() || "AL"}
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">Profile photo</p>
            <p className="mt-1 text-xs text-text-secondary">
              Avatar upload coming soon. Your initials are shown for now.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="display-name" className="block text-sm font-medium text-text-primary mb-1">
              Display name
            </label>
            <input
              id="display-name"
              name="display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded border border-border-subtle bg-bg-base px-3 py-2 text-text-primary outline-none focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-text-primary mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              maxLength={160}
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the community about yourself (max 160 chars)"
              className="w-full rounded border border-border-subtle bg-bg-base px-3 py-2 text-text-primary outline-none focus:border-accent resize-none text-sm"
            />
            <p className="mt-1 text-xs text-text-secondary">{bio.length}/160 characters.</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="public-profile"
              name="public-profile"
              type="checkbox"
              checked={publicProfile}
              onChange={(e) => setPublicProfile(e.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            <label htmlFor="public-profile" className="text-sm text-text-primary">
              Public profile — visible to all visitors
            </label>
          </div>
        </div>

        <div className="mt-5">
          <PrimaryButton onClick={saveProfile}>
            Save profile
          </PrimaryButton>
        </div>
      </Card>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section: Preferences (Tasks 3, 5)
// ---------------------------------------------------------------------------

type ThemeId = "dark" | "tactical" | "light";

const THEMES: { id: ThemeId; label: string }[] = [
  { id: "dark", label: "Dark" },
  { id: "tactical", label: "Tactical" },
  { id: "light", label: "Light" },
];

function PreferencesSection({ onToast }: { onToast: (msg: string) => void }) {
  // Task 3: theme with real apply
  const [theme, setTheme] = useState<ThemeId>(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("aegis_theme") as ThemeId) ?? "dark";
  });

  // Task 5: locale + timezone
  const [locale, setLocale] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("aegis_locale") ?? "en" : "en"
  );
  const [timezone, setTimezone] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("aegis_timezone") ?? "UTC+2" : "UTC+2"
  );
  const [dateFormat, setDateFormat] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("aegis_date_format") ?? "dd/mm/yyyy" : "dd/mm/yyyy"
  );
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("aegis_reduced_motion") === "true";
  });

  const applyTheme = (t: ThemeId) => {
    setTheme(t);
    localStorage.setItem("aegis_theme", t);
    if (t === "dark") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", t);
    }
  };

  const applyLocale = (l: string) => {
    setLocale(l);
    localStorage.setItem("aegis_locale", l);
    const currentPath = window.location.pathname;
    if (l === "en") {
      window.location.href = currentPath.replace(/^\/uk/, "") || "/";
    } else {
      window.location.href = `/${l}${currentPath.replace(/^\/uk|^\/en/, "")}`;
    }
  };

  const savePreferences = () => {
    localStorage.setItem("aegis_timezone", timezone);
    localStorage.setItem("aegis_date_format", dateFormat);
    localStorage.setItem("aegis_reduced_motion", String(reducedMotion));
    onToast("Preferences saved.");
  };

  return (
    <section id="preferences" className="scroll-mt-20">
      <SectionHeading>Preferences</SectionHeading>

      {/* Theme */}
      <Card>
        <p className="text-sm font-medium text-text-primary mb-3">Theme</p>
        <div className="flex gap-3 flex-wrap">
          {THEMES.map((t) => (
            <label
              key={t.id}
              className={`flex cursor-pointer items-center gap-2 rounded border px-4 py-2.5 text-sm transition-colors ${
                theme === t.id
                  ? "border-accent bg-accent/10 text-text-primary"
                  : "border-border-subtle bg-bg-base text-text-secondary hover:border-border-default"
              }`}
            >
              <input
                type="radio"
                name="theme"
                value={t.id}
                checked={theme === t.id}
                onChange={() => applyTheme(t.id)}
                className="sr-only"
              />
              {theme === t.id && <span aria-hidden="true">&#10003;</span>}
              {t.label}
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-text-secondary">
          Theme is applied immediately and persisted across sessions.
        </p>
      </Card>

      {/* Locale + Timezone + Date format */}
      <Card>
        <div className="space-y-4">
          <div>
            <label htmlFor="locale" className="block text-sm font-medium text-text-primary mb-1">
              Language
            </label>
            <select
              id="locale"
              name="locale"
              value={locale}
              onChange={(e) => applyLocale(e.target.value)}
              className="w-full rounded border border-border-subtle bg-bg-base px-3 py-2 text-text-primary outline-none focus:border-accent"
            >
              <option value="en">English</option>
              <option value="uk">Ukrainian</option>
            </select>
          </div>

          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-text-primary mb-1">
              Timezone
            </label>
            <select
              id="timezone"
              name="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded border border-border-subtle bg-bg-base px-3 py-2 text-text-primary outline-none focus:border-accent"
            >
              <option value="UTC-8">UTC-8 — Pacific Time</option>
              <option value="UTC-5">UTC-5 — Eastern Time</option>
              <option value="UTC+0">UTC+0 — Greenwich</option>
              <option value="UTC+1">UTC+1 — Central European</option>
              <option value="UTC+2">UTC+2 — Eastern European (Kyiv)</option>
              <option value="UTC+3">UTC+3 — Moscow / Ankara</option>
            </select>
          </div>

          <div>
            <label htmlFor="date-format" className="block text-sm font-medium text-text-primary mb-1">
              Date format
            </label>
            <select
              id="date-format"
              name="date-format"
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="w-full rounded border border-border-subtle bg-bg-base px-3 py-2 text-text-primary outline-none focus:border-accent"
            >
              <option value="dd/mm/yyyy">DD/MM/YYYY — e.g. 03/06/2026</option>
              <option value="mm/dd/yyyy">MM/DD/YYYY — e.g. 06/03/2026</option>
              <option value="iso">ISO 8601 — e.g. 2026-06-03</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="reduced-motion"
              name="reduced-motion"
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            <label htmlFor="reduced-motion" className="text-sm text-text-primary">
              Reduced motion{" "}
              <span className="text-text-secondary">
                — honour <code className="rounded bg-bg-elevated px-1 py-0.5 font-mono text-xs">prefers-reduced-motion</code>
              </span>
            </label>
          </div>
        </div>

        <div className="mt-5">
          <PrimaryButton onClick={savePreferences}>
            Save preferences
          </PrimaryButton>
        </div>
      </Card>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section: Notifications (Task 4)
// ---------------------------------------------------------------------------

const NOTIF_TYPES = [
  "New verified event",
  "Alert rule triggered",
  "Daily digest",
  "Weekly brief",
  "Security alerts",
] as const;

const NOTIF_CHANNELS = ["In-app", "Email", "Telegram", "Slack"] as const;

// Default: security alerts always on for in-app; everything else unchecked
const defaultChecked = (type: string, channel: string): boolean => {
  if (type === "Security alerts" && channel === "In-app") return true;
  if (type === "New verified event" && channel === "In-app") return true;
  if (type === "Alert rule triggered" && (channel === "In-app" || channel === "Email")) return true;
  return false;
};

function makeNotifKey(type: string, channel: string): string {
  return `${type}_${channel}`;
}

function NotificationsSection({ onToast }: { onToast: (msg: string) => void }) {
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = JSON.parse(localStorage.getItem("aegis_notif_prefs") ?? "{}") as Record<string, boolean>;
      // Seed defaults for keys not yet in storage
      const seeded: Record<string, boolean> = {};
      for (const type of NOTIF_TYPES) {
        for (const ch of NOTIF_CHANNELS) {
          const key = makeNotifKey(type, ch);
          seeded[key] = key in saved ? saved[key] : defaultChecked(type, ch);
        }
      }
      return seeded;
    } catch {
      return {};
    }
  });

  const toggleNotif = (key: string) => {
    const next = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(next);
    localStorage.setItem("aegis_notif_prefs", JSON.stringify(next));
  };

  const saveNotifications = () => {
    localStorage.setItem("aegis_notif_prefs", JSON.stringify(notifPrefs));
    onToast("Notification preferences saved.");
  };

  return (
    <section id="notifications" className="scroll-mt-20">
      <SectionHeading>Notifications</SectionHeading>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-left">
                <th className="pb-3 pr-4 font-medium text-text-primary">Notification type</th>
                {NOTIF_CHANNELS.map((ch) => (
                  <th key={ch} className="pb-3 px-3 text-center font-medium text-text-primary">
                    {ch}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {NOTIF_TYPES.map((type) => (
                <tr key={type}>
                  <td className="py-3 pr-4 text-text-secondary">{type}</td>
                  {NOTIF_CHANNELS.map((ch) => {
                    const key = makeNotifKey(type, ch);
                    return (
                      <td key={ch} className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={notifPrefs[key] ?? defaultChecked(type, ch)}
                          onChange={() => toggleNotif(key)}
                          aria-label={`${type} via ${ch}`}
                          className="h-4 w-4 accent-accent"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-5">
          <PrimaryButton onClick={saveNotifications}>
            Save
          </PrimaryButton>
        </div>
      </Card>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section: Security (Task 6)
// ---------------------------------------------------------------------------

type SessionInfo = {
  browser: string;
  os: string;
  location: string;
  lastActive: string;
};

function detectSession(): SessionInfo | null {
  if (typeof window === "undefined") return null;
  const ua = navigator.userAgent;
  const browser = ua.includes("Chrome") && !ua.includes("Edg")
    ? "Chrome"
    : ua.includes("Edg")
    ? "Edge"
    : ua.includes("Firefox")
    ? "Firefox"
    : ua.includes("Safari")
    ? "Safari"
    : "Browser";
  const os = ua.includes("Mac")
    ? "macOS"
    : ua.includes("Windows")
    ? "Windows"
    : ua.includes("Linux")
    ? "Linux"
    : ua.includes("Android")
    ? "Android"
    : ua.includes("iPhone") || ua.includes("iPad")
    ? "iOS"
    : "Unknown";
  return { browser, os, location: "Current location", lastActive: "Now" };
}

function SecuritySection({ onToast }: { onToast: (msg: string) => void }) {
  const [sessionInfo] = useState<SessionInfo | null>(() => detectSession());

  return (
    <section id="security" className="scroll-mt-20">
      <SectionHeading>Security</SectionHeading>

      {/* Active sessions */}
      <Card>
        <p className="text-sm font-semibold text-text-primary mb-3">Active sessions</p>
        <div className="rounded border border-border-subtle divide-y divide-border-subtle overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
            <div>
              <span className="font-medium text-text-primary">Current session</span>
              <span className="mx-2 text-text-muted">·</span>
              <span className="text-text-secondary">
                {sessionInfo ? `${sessionInfo.browser} · ${sessionInfo.os}` : "Unknown browser"}
              </span>
              <span className="mx-2 text-text-muted">·</span>
              <span className="text-text-secondary">{sessionInfo?.location ?? "Unknown"}</span>
              <span className="mx-2 text-text-muted">·</span>
              <span className="text-text-secondary">{sessionInfo?.lastActive ?? "Now"}</span>
            </div>
            <span className="rounded bg-accent/10 px-2 py-0.5 text-xs font-mono text-accent">
              This device
            </span>
          </div>
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => onToast("All other sessions signed out.")}
            className="rounded border border-border-subtle px-4 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
          >
            Sign out all other sessions
          </button>
        </div>
      </Card>

      {/* 2FA */}
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-text-primary">Two-factor authentication</p>
            <p className="mt-1 text-sm text-text-secondary">
              Status: <span className="text-text-muted">Not enabled</span>
            </p>
            <p className="mt-2 text-xs text-text-secondary">
              Add an extra layer of security to your account using an authenticator app or hardware key.
            </p>
          </div>
          <a
            href="/account/security/mfa"
            className="shrink-0 rounded bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent-hover"
          >
            Enable 2FA
          </a>
        </div>
      </Card>

      {/* Password */}
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-text-primary">Password</p>
            <p className="mt-1 text-xs text-text-secondary">
              Last changed: unknown. We recommend a strong, unique password.
            </p>
          </div>
          <a
            href="/account/security/password"
            className="shrink-0 rounded border border-border-subtle px-4 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
          >
            Change password
          </a>
        </div>
      </Card>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section: Integrations
// ---------------------------------------------------------------------------

type Integration = {
  id: string;
  emoji: string;
  name: string;
  description: string;
  action: "connect" | "coming-soon";
  connectLabel?: string;
  connectHref?: string;
};

const INTEGRATIONS: Integration[] = [
  {
    id: "telegram",
    emoji: "✈️",
    name: "Telegram",
    description: "Receive real-time alerts via @aegislens_bot. Send /start after connecting.",
    action: "connect",
    connectLabel: "Connect @aegislens_bot",
    connectHref: "https://t.me/aegislens_bot?start=connect",
  },
  {
    id: "slack",
    emoji: "💬",
    name: "Slack",
    description: "Post verified events to a Slack channel of your choice.",
    action: "coming-soon",
  },
  {
    id: "discord",
    emoji: "🎮",
    name: "Discord",
    description: "Stream alerts to a Discord server via webhooks.",
    action: "coming-soon",
  },
  {
    id: "webhooks",
    emoji: "🔗",
    name: "Webhooks",
    description: "Push signed HTTP POST payloads to any HTTPS endpoint.",
    action: "coming-soon",
  },
];

function IntegrationsSection() {
  return (
    <section id="integrations" className="scroll-mt-20">
      <SectionHeading>Integrations</SectionHeading>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {INTEGRATIONS.map((intg) => (
          <Card key={intg.id} className="mb-0">
            <div className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden="true">{intg.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary">{intg.name}</p>
                <p className="mt-1 text-xs text-text-secondary leading-relaxed">{intg.description}</p>
                <div className="mt-3">
                  {intg.action === "connect" ? (
                    <a
                      href={intg.connectHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded bg-accent px-3 py-1.5 text-xs font-semibold text-black hover:bg-accent-hover"
                    >
                      {intg.connectLabel ?? "Connect"}
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="rounded border border-border-subtle px-3 py-1.5 text-xs text-text-muted cursor-not-allowed"
                      title="Coming soon"
                    >
                      Coming soon
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section: Data & Privacy
// ---------------------------------------------------------------------------

function PrivacySection({ onToast }: { onToast: (msg: string) => void }) {
  const [deleteInput, setDeleteInput] = useState("");

  return (
    <section id="privacy" className="scroll-mt-20">
      <SectionHeading>Data &amp; Privacy</SectionHeading>

      {/* GDPR export */}
      <Card>
        <p className="text-sm font-semibold text-text-primary">Export your data</p>
        <p className="mt-1 text-xs text-text-secondary">
          Request a full GDPR export of your account data. You will receive a download link by email
          within 24 hours.
        </p>
        <div className="mt-4">
          <PrimaryButton
            onClick={() => {
              // stub — POST /api/account/export
              onToast("Export requested. Check your email within 24 hours.");
            }}
          >
            Request GDPR export
          </PrimaryButton>
        </div>
      </Card>

      {/* Cookie preferences */}
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-text-primary">Cookie preferences</p>
            <p className="mt-1 text-xs text-text-secondary">
              Manage analytics and non-essential cookies.
            </p>
          </div>
          <a
            href="/legal/cookies"
            className="shrink-0 rounded border border-border-subtle px-4 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
          >
            Manage cookies
          </a>
        </div>
      </Card>

      {/* Delete account (in privacy section) */}
      <Card>
        <p className="text-sm font-semibold text-text-primary">Delete account</p>
        <p className="mt-1 text-xs text-text-secondary">
          Permanently delete your account and all associated data. This action cannot be undone.
          Type <code className="rounded bg-bg-elevated px-1 py-0.5 font-mono">DELETE</code> to confirm.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <input
            type="text"
            value={deleteInput}
            onChange={(e) => setDeleteInput(e.target.value)}
            placeholder='Type "DELETE"'
            className="w-40 rounded border border-border-subtle bg-bg-base px-3 py-2 text-text-primary outline-none focus:border-red-500 text-sm"
          />
          <DangerButton disabled={deleteInput !== "DELETE"}>
            Delete account
          </DangerButton>
        </div>
      </Card>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section: Danger Zone (Task 8)
// ---------------------------------------------------------------------------

function DangerZoneSection() {
  const [confirmInput, setConfirmInput] = useState("");

  const resetAllSettings = () => {
    const keysToRemove = Object.keys(localStorage).filter((k) => k.startsWith("aegis_"));
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  };

  return (
    <section id="danger" className="scroll-mt-20">
      <SectionHeading>Danger Zone</SectionHeading>
      <div className="rounded border border-red-700/50 bg-bg-surface p-5">
        <p className="text-sm font-semibold text-red-500">Delete account permanently</p>
        <p className="mt-2 text-xs text-text-secondary leading-relaxed">
          This will immediately and irreversibly delete your account, all saved alerts, subscriptions,
          API keys, and any data you have generated on Aegis Lens. There is no recovery path.
        </p>
        <div className="mt-5">
          <label htmlFor="danger-confirm" className="block text-sm font-medium text-text-primary mb-2">
            Type <code className="rounded bg-bg-elevated px-1.5 py-0.5 font-mono text-xs">CONFIRM</code> to enable the button
          </label>
          <div className="flex items-center gap-3">
            <input
              id="danger-confirm"
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="CONFIRM"
              className="w-40 rounded border border-border-subtle bg-bg-base px-3 py-2 text-text-primary outline-none focus:border-red-500 text-sm"
            />
            <DangerButton disabled={confirmInput !== "CONFIRM"}>
              Delete my account
            </DangerButton>
          </div>
          <p className="mt-3 text-xs text-text-muted">
            You will be signed out and redirected to the home page. Account data will be purged within
            48 hours per GDPR Article 17.
          </p>
        </div>

        {/* Reset all settings (Task 8) */}
        <div className="mt-6 pt-5 border-t border-border-subtle">
          <p className="text-xs text-text-secondary mb-2">
            Reset all local settings (theme, notifications, profile, preferences) to their defaults. Your account is not deleted.
          </p>
          <button
            type="button"
            onClick={resetAllSettings}
            className="text-sm text-text-muted hover:text-yellow-400 transition-colors"
          >
            Reset all settings to defaults
          </button>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Sidebar navigation
// ---------------------------------------------------------------------------

function SettingsSidebar() {
  return (
    <aside className="w-48 shrink-0">
      <nav className="sticky top-20 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`rounded px-3 py-2 text-sm transition-colors ${
              item.id === "danger"
                ? "text-red-500 hover:bg-red-900/20"
                : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
            }`}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Root page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const { message, show } = useToast();

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Manage your profile, preferences, notifications, and account security."
      />

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <SettingsSidebar />

          {/* Content */}
          <main className="flex-1 min-w-0 space-y-12">
            <ProfileSection onToast={show} />
            <PreferencesSection onToast={show} />
            <NotificationsSection onToast={show} />
            <SecuritySection onToast={show} />
            <IntegrationsSection />
            <PrivacySection onToast={show} />
            <DangerZoneSection />
          </main>
        </div>
      </div>

      <Toast message={message} />
    </>
  );
}
