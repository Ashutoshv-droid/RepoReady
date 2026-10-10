// components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Search, Zap, Map, Trophy,
  Settings, GitBranch, Menu, X,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { useUser } from "@/hooks/useUser";

const NAV_ITEMS = [
  { label: "Dashboard",            href: "/",             icon: LayoutDashboard },
  { label: "Discover Issues",      href: "/discover",     icon: Search           },
  { label: "My Skills",            href: "/skills",       icon: Zap              },
  { label: "Contribution Roadmap", href: "/roadmap",      icon: Map              },
  { label: "Achievements",         href: "/achievements", icon: Trophy           },
  { label: "Settings",             href: "/settings",     icon: Settings         },
] as const;

/* ─── Single nav link ────────────────────────────────────────── */
function NavLink({
  href, icon: Icon, label, active, onClick,
}: {
  href: string; icon: React.ElementType; label: string;
  active: boolean; onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`nav-item ${active ? "nav-item-active" : ""}`}
      style={{ textDecoration: "none" }}
    >
      <Icon size={15} strokeWidth={active ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {label}
      </span>
      {active && (
        <span style={{
          marginLeft: "auto", width: "5px", height: "5px",
          borderRadius: "9999px", backgroundColor: "var(--color-accent)",
          flexShrink: 0, boxShadow: "0 0 6px rgba(184,243,107,0.6)",
        }} />
      )}
    </Link>
  );
}

/* ─── Sidebar body ───────────────────────────────────────────── */
function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();
  const { name, githubHandle, avatarUrl, initials, loading } = useUser();

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      backgroundColor: "var(--color-surface)",
      borderRight: "1px solid var(--color-subtle)",
      width: "var(--sidebar-width)",
    }}>
      {/* ── Logo ─────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: "0.625rem",
        padding: "0 1rem", height: "var(--header-height)",
        borderBottom: "1px solid var(--color-subtle)", flexShrink: 0,
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "28px", height: "28px", borderRadius: "var(--radius)",
          backgroundColor: "var(--color-accent)", flexShrink: 0,
          boxShadow: "0 0 12px rgba(184,243,107,0.25)",
        }}>
          <GitBranch size={14} strokeWidth={2.5} style={{ color: "var(--color-inverse)" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
          <span style={{
            fontSize: "var(--text-sm)", fontWeight: 700,
            color: "var(--color-primary)", letterSpacing: "-0.02em",
          }}>
            RepoReady
          </span>
          <span className="text-2xs" style={{ color: "var(--color-muted)", marginTop: "2px" }}>
            v0.1
          </span>
        </div>
      </div>

      {/* ── Navigation ───────────────────────────────────────── */}
      <nav
        className="no-scrollbar"
        aria-label="Main navigation"
        style={{
          flex: 1, padding: "0.5rem 0.5rem", overflowY: "auto",
          display: "flex", flexDirection: "column", gap: "1px",
        }}
      >
        <p className="section-label"
          style={{ padding: "0.5rem 0.75rem 0.375rem", marginBottom: "2px" }}>
          Navigation
        </p>
        {NAV_ITEMS.map(({ label, href, icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <NavLink key={href} href={href} icon={icon}
              label={label} active={active} onClick={onNavClick} />
          );
        })}
      </nav>

      {/* ── Profile strip ────────────────────────────────────── */}
      <div style={{ padding: "0.5rem", borderTop: "1px solid var(--color-subtle)", flexShrink: 0 }}>
        <Link href="/settings" onClick={onNavClick} style={{ textDecoration: "none", display: "block" }}>
          <div
            style={{
              display: "flex", alignItems: "center", gap: "0.625rem",
              padding: "0.5rem 0.625rem", borderRadius: "var(--radius)",
              cursor: "pointer", border: "1px solid transparent",
              transition: "background-color 150ms ease, border-color 150ms ease",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.backgroundColor = "var(--color-elevated)";
              el.style.borderColor = "var(--color-subtle)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.backgroundColor = "transparent";
              el.style.borderColor = "transparent";
            }}
          >
            {/* Avatar — real GitHub photo or initials fallback */}
            <div style={{
              width: "28px", height: "28px", borderRadius: "9999px",
              backgroundColor: "var(--color-accent-muted)",
              border: "1px solid rgba(184,243,107,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, overflow: "hidden",
            }}>
              {!loading && avatarUrl ? (
                <img
    src={avatarUrl}
    alt={name}
    width={28}
    height={28}
    style={{ borderRadius: "9999px", objectFit: "cover", width: "28px", height: "28px" }}
  />
              ) : (
                <span className="text-2xs" style={{ fontWeight: 700, color: "var(--color-accent)" }}>
                  {loading ? "…" : initials}
                </span>
              )}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: "var(--text-xs)", fontWeight: 600,
                color: "var(--color-primary)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {loading ? "Loading…" : name}
              </p>
              <p className="text-2xs" style={{
                color: "var(--color-muted)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {loading ? "" : `@${githubHandle}`}
              </p>
            </div>

            <Settings size={13} style={{ color: "var(--color-muted)", flexShrink: 0 }} />
          </div>
        </Link>
      </div>
    </div>
  );
}

/* ─── Exported sidebar shell ─────────────────────────────────── */
export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex" style={{ flexDirection: "column", flexShrink: 0 }}>
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        className="lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={mobileOpen}
        style={{
          position: "fixed", top: "20px", left: "12px", zIndex: 50,
          width: "32px", height: "32px", display: "flex",
          alignItems: "center", justifyContent: "center",
          borderRadius: "var(--radius)", border: "1px solid var(--color-subtle)",
          backgroundColor: "var(--color-surface)", color: "var(--color-secondary)",
          cursor: "pointer", transition: "color 150ms ease, border-color 150ms ease",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.color = "var(--color-primary)";
          el.style.borderColor = "var(--color-moderate)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.color = "var(--color-secondary)";
          el.style.borderColor = "var(--color-subtle)";
        }}
      >
        <Menu size={16} />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden animate-in"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
            style={{
              position: "fixed", inset: 0, zIndex: 40,
              backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
            }}
          />
          <div className="lg:hidden" style={{
            position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
          }}>
            <SidebarContent onNavClick={() => setMobileOpen(false)} />
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              style={{
                position: "absolute", top: "20px", right: "-40px",
                width: "32px", height: "32px", display: "flex",
                alignItems: "center", justifyContent: "center",
                borderRadius: "var(--radius)", border: "1px solid var(--color-subtle)",
                backgroundColor: "var(--color-surface)", color: "var(--color-secondary)",
                cursor: "pointer",
              }}
            >
              <X size={16} />
            </button>
          </div>
        </>
      )}
    </>
  );
}

