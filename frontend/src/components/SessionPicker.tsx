"use client";

import { useState, useEffect, useRef } from "react";
import { useApi } from "@/hooks/useApi";

interface SessionEntry {
  name: string;
  date_utc: string | null;
  available: boolean;
}

interface LiveSessionInfo {
  year: number;
  round_number: number;
  event_name: string;
  country: string;
  session_name: string;
  session_type: string;
  session_start: string;
  pre_session: boolean;
}

interface Event {
  round_number: number;
  country: string;
  event_name: string;
  location: string;
  event_date: string;
  sessions: SessionEntry[];
  status: "latest" | "available" | "future";
}

interface EventsResponse {
  year: number;
  events: Event[];
}

interface SeasonsResponse {
  seasons: number[];
}

const COUNTRY_FLAGS: Record<string, string> = {
  "Australia": "🇦🇺",
  "Austria": "🇦🇹",
  "Azerbaijan": "🇦🇿",
  "Bahrain": "🇧🇭",
  "Belgium": "🇧🇪",
  "Brazil": "🇧🇷",
  "Canada": "🇨🇦",
  "China": "🇨🇳",
  "Hungary": "🇭🇺",
  "Italy": "🇮🇹",
  "Japan": "🇯🇵",
  "Mexico": "🇲🇽",
  "Monaco": "🇲🇨",
  "Netherlands": "🇳🇱",
  "Qatar": "🇶🇦",
  "Saudi Arabia": "🇸🇦",
  "Singapore": "🇸🇬",
  "Spain": "🇪🇸",
  "United Arab Emirates": "🇦🇪",
  "United Kingdom": "🇬🇧",
  "United States": "🇺🇸",
  "Portugal": "🇵🇹",
  "France": "🇫🇷",
  "Germany": "🇩🇪",
  "Russia": "🇷🇺",
  "Las Vegas": "🇺🇸",
  "Miami": "🇺🇸",
};

const COUNTRY_CODES: Record<string, string> = {
  "Australia": "AU",
  "Austria": "AT",
  "Azerbaijan": "AZ",
  "Bahrain": "BH",
  "Belgium": "BE",
  "Brazil": "BR",
  "Canada": "CA",
  "China": "CN",
  "Hungary": "HU",
  "Italy": "IT",
  "Japan": "JP",
  "Mexico": "MX",
  "Monaco": "MC",
  "Netherlands": "NL",
  "Qatar": "QA",
  "Saudi Arabia": "SA",
  "Singapore": "SG",
  "Spain": "ES",
  "United Arab Emirates": "AE",
  "United Kingdom": "GB",
  "United States": "US",
  "Portugal": "PT",
  "France": "FR",
  "Germany": "DE",
  "Russia": "RU",
  "Turkey": "TR",
  "South Africa": "ZA",
  "Las Vegas": "US",
  "Miami": "US",
};

const SESSION_LABELS: Record<string, string> = {
  Race: "R",
  Qualifying: "Q",
  Sprint: "S",
  "Sprint Qualifying": "SQ",
  "Sprint Shootout": "SQ",
  "Practice 1": "FP1",
  "Practice 2": "FP2",
  "Practice 3": "FP3",
};

function formatLocalTime(dateUtc: string | null): { dayDate: string; time: string } | null {
  if (!dateUtc) return null;
  try {
    const date = new Date(dateUtc);
    if (isNaN(date.getTime())) return null;
    const weekday = date.toLocaleString([], { weekday: "short" });
    const day = date.getDate();
    const month = date.toLocaleString([], { month: "short" });
    const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
    return { dayDate: `${weekday} ${day} ${month}`, time };
  } catch {
    return null;
  }
}

export default function SessionPicker() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navigating, setNavigating] = useState(false);
  useEffect(() => {
    setNavigating(false);
    const handlePageShow = () => setNavigating(false);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("popstate", handlePageShow);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("popstate", handlePageShow);
    };
  }, []);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: seasonsData } = useApi<SeasonsResponse>("/api/seasons");
  const { data: eventsData, loading: eventsLoading } = useApi<EventsResponse>(
    `/api/seasons/${year}/events`,
  );
  const { data: liveData } = useApi<{ live: LiveSessionInfo | null }>("/api/live/status");
  const liveSession = liveData?.live || null;

  const seasons = (seasonsData?.seasons || []).filter((s) => s <= currentYear);
  const events = eventsData?.events || [];

  const displayEvents = events;

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  // No auto-scroll — let the page load at the top

  function SessionBadge({ evt, session }: { evt: Event; session: SessionEntry }) {
    const code = SESSION_LABELS[session.name];
    if (!code) return null;

    const localTime = formatLocalTime(session.date_utc);
    const timeLabel = localTime ? `${session.name} — ${localTime.dayDate} ${localTime.time}` : session.name;
    const isLive =
      liveSession?.year === year &&
      liveSession?.round_number === evt.round_number &&
      liveSession?.session_type === code;

    const base =
      "font-mono text-[10px] font-bold px-[7px] py-[3px] border transition-colors";

    if (isLive) {
      return (
        <a
          href={`/live?year=${year}&round=${evt.round_number}&type=${code}`}
          onClick={() => setNavigating(true)}
          title={`${timeLabel} (live)`}
          className={`${base} bg-f1-red border-f1-red text-f1-dark hover:brightness-110`}
        >
          {code}
        </a>
      );
    }

    if (session.available) {
      return (
        <a
          href={`/replay?year=${year}&round=${evt.round_number}&type=${code}`}
          onClick={() => setNavigating(true)}
          title={timeLabel}
          className={`${base} bg-f1-cardHover border-f1-borderLight text-f1-muted hover:text-f1-text hover:border-f1-red`}
        >
          {code}
        </a>
      );
    }

    return (
      <span
        title={`${timeLabel} — not yet available`}
        className={`${base} bg-f1-card border-f1-border text-f1-subtle cursor-not-allowed`}
      >
        {code}
      </span>
    );
  }

  function RoundCard({ evt }: { evt: Event }) {
    const displayEvt = displayEvents.find((e) => e.round_number === evt.round_number) || evt;
    const isLatest = displayEvt.status === "latest" && year === currentYear;
    const isFuture = displayEvt.status === "future";
    const hasLive = liveSession?.year === year && liveSession?.round_number === evt.round_number;

    return (
      <div
        className={`relative bg-f1-card border p-5 transition-all duration-150 ${
          isFuture
            ? "border-f1-border opacity-60"
            : "border-f1-border hover:border-f1-red hover:-translate-y-[3px]"
        }`}
      >
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ backgroundColor: hasLive || isLatest ? "#FF3D1A" : "#3A342C" }}
        />

        <div className="flex justify-between items-start mb-3.5">
          <span className="f1-font text-[34px] leading-none text-f1-dim">
            {String(evt.round_number).padStart(2, "0")}
          </span>
          {hasLive && (
            <span className="font-mono text-[10px] font-bold tracking-[0.1em] text-f1-red border border-f1-red px-1.5 py-0.5">
              LIVE
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mb-0.5">
          {COUNTRY_CODES[evt.country] && (
            <span className="font-mono text-[10px] font-bold text-f1-muted flex-shrink-0">
              {COUNTRY_CODES[evt.country]}
            </span>
          )}
          <span className="font-bold text-[15px] text-f1-text truncate" title={evt.event_name}>
            {evt.event_name}
          </span>
        </div>
        <div className="text-xs text-f1-muted mb-4 truncate">
          {evt.location} · {evt.event_date}
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {evt.sessions.map((session) => (
            <SessionBadge key={session.name} evt={evt} session={session} />
          ))}
          {isFuture && evt.sessions.length === 0 && (
            <span className="font-mono text-[10px] text-f1-subtle">SCHEDULE TBC</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-f1-dark text-f1-text flex flex-col">
      {/* Loading overlay */}
      {navigating && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-f1-border border-t-f1-red rounded-full animate-spin shadow-f1-red" />
            <p className="text-white font-extrabold text-base f1-font tracking-wider">Loading Telemetry Session...</p>
          </div>
        </div>
      )}

      {/* Top nav */}
      <div className="flex items-center gap-4 sm:gap-7 px-4 sm:px-7 h-[60px] flex-shrink-0 bg-f1-surface border-b border-f1-border relative z-30">
        <a href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <span className="w-[10px] h-[22px] bg-f1-red f1-slant" />
          <span className="f1-font text-[22px] text-f1-text tracking-[0.02em]">PITWALL</span>
        </a>

        <nav className="hidden sm:flex items-center gap-1 ml-3">
          <a href="/features" className="px-4 py-2.5 text-[12px] font-semibold tracking-[0.12em] uppercase text-f1-muted hover:text-f1-text hover:bg-f1-cardHover transition-colors">
            Features
          </a>
          <a href="/about" className="px-4 py-2.5 text-[12px] font-semibold tracking-[0.12em] uppercase text-f1-muted hover:text-f1-text hover:bg-f1-cardHover transition-colors">
            About
          </a>
        </nav>

        <div className="ml-auto hidden sm:flex items-center gap-2.5">
          <span className="font-mono text-[11px] text-f1-muted tracking-[0.05em]">SEASON</span>
          <span className="font-mono text-[13px] font-bold text-f1-text bg-f1-cardHover px-3 py-1.5 border border-f1-borderLight">
            {year}
          </span>
        </div>

        {/* Mobile menu */}
        <div className="relative sm:hidden ml-auto" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 flex items-center justify-center bg-f1-card border border-f1-border text-f1-muted hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-12 w-44 bg-f1-card border border-f1-border shadow-2xl z-50 py-1.5 f1-stripe-top">
              <a href="/features" className="block px-4 py-2.5 text-xs font-extrabold uppercase f1-font text-f1-muted hover:text-white hover:bg-white/5 transition-colors">
                Features
              </a>
              <a href="/about" className="block px-4 py-2.5 text-xs font-extrabold uppercase f1-font text-f1-muted hover:text-white hover:bg-white/5 transition-colors">
                About
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1">
        {/* Hero */}
        <div
          className="relative px-5 sm:px-10 pt-12 sm:pt-[72px] pb-10 sm:pb-14 overflow-hidden"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-55deg, rgba(255,61,26,0.05) 0px, rgba(255,61,26,0.05) 2px, transparent 2px, transparent 26px)",
          }}
        >
          <div className="max-w-[1200px] mx-auto">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-7 h-1.5 bg-f1-red" />
              <span className="font-mono text-[11px] sm:text-xs tracking-[0.2em] text-f1-redGlow uppercase">
                Timing Tower &amp; Track Map
              </span>
            </div>
            <h1 className="f1-font text-[44px] sm:text-[68px] lg:text-[88px] leading-[0.94] text-f1-text tracking-[0.01em] text-balance">
              EVERY SESSION.<br />EVERY GAP.<br />
              <span className="text-f1-red">DOWN TO THE TENTH.</span>
            </h1>
            <p className="max-w-[560px] mt-6 text-[15px] sm:text-base leading-relaxed text-f1-secondary">
              Live timing and replay for Formula 1 race weekends — leaderboard, track position,
              pit strategy and telemetry, rebuilt for people who watch races like it&apos;s a job.
            </p>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-5 sm:px-10 pb-20">
          {/* Live session banner */}
          {liveSession && liveSession.year === year && (
            <a
              href={`/live?year=${liveSession.year}&round=${liveSession.round_number}&type=${liveSession.session_type}`}
              onClick={() => setNavigating(true)}
              className="flex items-center gap-4 px-5 py-4 border border-[#4A2A20] border-l-4 border-l-f1-red -mt-6 mb-10 transition-colors hover:brightness-125"
              style={{ backgroundImage: "linear-gradient(90deg, rgba(255,61,26,0.12), rgba(255,61,26,0.02))" }}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-f1-red animate-f1-pulse flex-shrink-0" />
              <span className="font-mono text-xs font-bold tracking-[0.15em] text-f1-redGlow flex-shrink-0">LIVE NOW</span>
              <span className="text-f1-text font-semibold text-sm truncate">
                {COUNTRY_FLAGS[liveSession.country] && <span className="mr-2">{COUNTRY_FLAGS[liveSession.country]}</span>}
                Round {liveSession.round_number} — {liveSession.event_name} · {liveSession.session_name}
              </span>
              <span className="ml-auto font-mono text-xs text-f1-muted flex-shrink-0 hidden sm:inline">Watch →</span>
            </a>
          )}

          {/* Calendar header + season switcher */}
          <div className="flex items-baseline justify-between gap-4 mb-5 flex-wrap">
            <h2 className="f1-font text-2xl text-f1-text tracking-[0.02em]">{year} CALENDAR</h2>
            <div className="flex gap-1.5 flex-wrap">
              {seasons.map((s) => (
                <button
                  key={s}
                  onClick={() => setYear(s)}
                  className={`font-mono text-xs font-bold px-3.5 py-1.5 border transition-colors ${
                    year === s
                      ? "bg-f1-red border-f1-red text-f1-dark"
                      : "bg-f1-cardHover border-f1-borderLight text-f1-muted hover:text-f1-text"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {eventsLoading ? (
            <div className="text-f1-muted text-center py-24">
              <div className="inline-block w-10 h-10 border-4 border-f1-border border-t-f1-red rounded-full animate-spin mb-4 shadow-f1-red" />
              <p className="f1-font text-sm tracking-wider">Fetching Grand Prix Data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {displayEvents.map((evt) => (
                <RoundCard key={evt.round_number} evt={evt} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
