"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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

function StatusPill({ status }: { status: Event["status"] }) {
  switch (status) {
    case "latest":
      return (
        <span className="f1-slant px-2.5 py-0.5 text-[10px] font-black uppercase rounded bg-gradient-to-r from-[#E10600] to-[#FF2A2A] text-white shadow-f1-red">
          <span className="f1-slant-unskew">Latest</span>
        </span>
      );
    case "available":
      return (
        <span className="f1-slant px-2.5 py-0.5 text-[10px] font-bold uppercase rounded bg-green-500/20 text-green-400 border border-green-500/40">
          <span className="f1-slant-unskew">Available</span>
        </span>
      );
    case "future":
      return (
        <span className="f1-slant px-2.5 py-0.5 text-[10px] font-semibold uppercase rounded bg-[#1C2030] text-f1-muted border border-f1-border/40">
          <span className="f1-slant-unskew">Upcoming</span>
        </span>
      );
  }
}

export default function SessionPicker() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
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
  const latestRef = useRef<HTMLDivElement>(null);
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

  const latestEvent = useMemo(
    () => year === currentYear ? displayEvents.find((e) => e.status === "latest") || null : null,
    [displayEvents, year, currentYear],
  );

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

  function EventRow({ evt, id }: { evt: Event; id?: string }) {
    const displayEvt = displayEvents.find((e) => e.round_number === evt.round_number) || evt;
    const isLatest = displayEvt.status === "latest" && year === currentYear;
    const isFuture = displayEvt.status === "future";
    const selectionKey = id || String(evt.round_number);
    const isSelected = selectedKey === selectionKey;

    return (
      <div
        className={`carbon-card border rounded-xl overflow-hidden transition-all duration-200 cursor-pointer ${
          isSelected && isLatest
            ? "border-f1-red ring-1 ring-f1-red/50 shadow-f1-glow"
            : isSelected
              ? "border-white/80 ring-1 ring-white/30 shadow-lg"
              : isLatest
                ? "border-f1-red/80 shadow-f1-glow"
              : isFuture
                ? "border-f1-border/40 opacity-55 hover:opacity-80"
                : "border-f1-border/80 hover:border-f1-red/60 hover:shadow-md"
        }`}
      >
        {/* Compact header row */}
        <div
          className="px-4 sm:px-5 py-3.5 flex items-center gap-3 sm:gap-4 cursor-pointer"
          onClick={() => { if (isSelected) { setSelectedKey(null); } else { setSelectedKey(selectionKey); setSelectedEvent(evt); } }}
        >
          <span className="text-xs font-black text-f1-red w-8 flex-shrink-0 f1-font">R{evt.round_number}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {COUNTRY_CODES[evt.country] && (
                <span className="text-xs font-black text-white px-1.5 py-0.5 rounded bg-[#1F2334] border border-f1-border/60 flex-shrink-0 f1-font">
                  {COUNTRY_CODES[evt.country]}
                </span>
              )}
              <span className="text-white font-extrabold text-sm sm:text-base f1-font tracking-wide truncate">
                {evt.event_name}
              </span>
            </div>
            <div className="sm:hidden flex items-center justify-between mt-1">
              <span className="text-[11px] text-f1-muted font-semibold">{evt.event_date}</span>
              <StatusPill status={isLatest ? "latest" : displayEvt.status === "latest" ? "available" : displayEvt.status} />
            </div>
          </div>
          <span className="text-xs font-semibold text-f1-muted hidden sm:block flex-shrink-0 w-48 text-right truncate">
            {evt.location}, {evt.country}
          </span>
          <span className="text-xs font-bold text-f1-muted hidden sm:block flex-shrink-0 w-24 text-right tabular-nums">{evt.event_date}</span>
          <span className="hidden sm:flex flex-shrink-0 w-24 justify-end">
            <StatusPill status={isLatest ? "latest" : displayEvt.status === "latest" ? "available" : displayEvt.status} />
          </span>
          <svg
            className={`w-4 h-4 text-f1-muted transition-transform flex-shrink-0 ${isSelected ? "rotate-180 text-f1-red" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Expanded session drawer */}
        {isSelected && (
          <div className="px-5 pb-4 flex flex-wrap gap-3 border-t border-f1-border/60 pt-4 bg-[#141622]/80" onClick={(e) => e.stopPropagation()}>
            {evt.sessions.map((session) => {
              const code = SESSION_LABELS[session.name];
              if (!code) return null;
              const localTime = formatLocalTime(session.date_utc);
              const isLive = liveSession?.year === year && liveSession?.round_number === evt.round_number && liveSession?.session_type === code;
              if (isLive) {
                return (
                  <div key={session.name} className="flex flex-col items-center">
                    {localTime && (
                      <span className="text-[10px] font-bold text-red-400 mb-1 text-center leading-tight">
                        {localTime.dayDate}<br />{localTime.time}
                      </span>
                    )}
                    <a
                      href={`/live?year=${year}&round=${evt.round_number}&type=${code}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setNavigating(true);
                      }}
                      className="f1-slant px-4 py-2 bg-gradient-to-r from-[#E10600] to-[#FF2A2A] text-white text-xs font-black rounded uppercase tracking-wider hover:brightness-110 transition-all flex items-center gap-2 shadow-f1-red"
                    >
                      <span className="f1-slant-unskew flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                        </span>
                        {session.name}
                      </span>
                    </a>
                  </div>
                );
              }
              if (session.available) {
                return (
                  <div key={session.name} className="flex flex-col items-center">
                    {localTime && (
                      <span className="text-[10px] text-f1-muted mb-1 text-center leading-tight">
                        {localTime.dayDate}<br />{localTime.time}
                      </span>
                    )}
                    <a
                      href={`/replay?year=${year}&round=${evt.round_number}&type=${code}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setNavigating(true);
                      }}
                      className="f1-slant px-4 py-2 bg-[#1F2334] border border-f1-border text-white text-xs font-extrabold rounded uppercase tracking-wider hover:bg-gradient-to-r hover:from-[#E10600] hover:to-[#FF2A2A] hover:border-transparent transition-all shadow-sm"
                    >
                      <span className="f1-slant-unskew">{session.name}</span>
                    </a>
                  </div>
                );
              }
              return (
                <div key={session.name} className="flex flex-col items-center">
                  {localTime && (
                    <span className="text-[10px] text-f1-muted/50 mb-1 text-center leading-tight">
                      {localTime.dayDate}<br />{localTime.time}
                    </span>
                  )}
                  <span
                    className="f1-slant px-4 py-2 bg-[#161824] border border-f1-border/30 text-f1-muted/40 text-xs font-bold rounded uppercase tracking-wider cursor-not-allowed"
                  >
                    <span className="f1-slant-unskew">{session.name}</span>
                  </span>
                </div>
              );
            })}
            {isFuture && (
              <p className="text-xs text-f1-muted w-full font-semibold uppercase tracking-wider f1-font">Sessions not yet available</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen carbon-bg text-f1-text">
      {/* Loading overlay */}
      {navigating && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-f1-border border-t-f1-red rounded-full animate-spin shadow-f1-red" />
            <p className="text-white font-extrabold text-base f1-font tracking-wider">Loading Telemetry Session...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#10121A] border-b border-f1-border relative f1-stripe-top shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex items-center gap-4 sm:gap-6">
          <div className="w-12 h-12 sm:w-[72px] sm:h-[72px] rounded-xl overflow-hidden border border-f1-border/80 shadow-f1-glow flex-shrink-0">
            <img src="/logo.png" alt="PitWall" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-4xl font-black text-white mb-1 f1-font tracking-wide flex items-center gap-2.5">
              <span className="text-f1-red">Pit</span>Wall
            </h1>
            <p className="text-f1-muted text-xs sm:text-sm font-semibold uppercase tracking-wider">
              Race Replay & Pit Wall Telemetry Visualizer
            </p>
          </div>
          {/* Desktop: text buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="/features"
              className="px-4 py-2.5 bg-[#181B26] border border-f1-border text-f1-muted hover:text-white hover:border-f1-red/50 text-xs font-black uppercase tracking-wider rounded-lg transition-all f1-font"
            >
              Features
            </a>
            <a
              href="/about"
              className="px-4 py-2.5 bg-[#181B26] border border-f1-border text-f1-muted hover:text-white hover:border-f1-red/50 text-xs font-black uppercase tracking-wider rounded-lg transition-all f1-font"
            >
              About
            </a>
          </div>
          {/* Mobile: hamburger menu */}
          <div className="relative sm:hidden" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#181B26] border border-f1-border text-f1-muted hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-12 w-44 carbon-card border border-f1-border rounded-xl shadow-2xl z-50 py-1.5 f1-stripe-top">
                <a
                  href="/features"
                  className="block px-4 py-2.5 text-xs font-extrabold uppercase f1-font text-f1-muted hover:text-white hover:bg-white/5 transition-colors"
                >
                  Features
                </a>
                <a
                  href="/about"
                  className="block px-4 py-2.5 text-xs font-extrabold uppercase f1-font text-f1-muted hover:text-white hover:bg-white/5 transition-colors"
                >
                  About
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Season selector */}
        <div className="flex gap-2 mb-8 flex-wrap max-w-3xl mx-auto justify-center sm:justify-start">
          {seasons.map((s) => (
            <button
              key={s}
              onClick={() => { setYear(s); setSelectedEvent(null); }}
              className={`f1-slant px-4 py-2 rounded-lg text-sm font-black transition-all uppercase tracking-wider ${
                year === s
                  ? "bg-gradient-to-r from-[#E10600] to-[#FF2A2A] text-white shadow-f1-red scale-105"
                  : "bg-[#141724] text-f1-muted hover:text-white border border-f1-border hover:border-f1-red/40"
              }`}
            >
              <span className="f1-slant-unskew">{s}</span>
            </button>
          ))}
        </div>

        {eventsLoading ? (
          <div className="text-f1-muted text-center py-24">
            <div className="inline-block w-10 h-10 border-4 border-f1-border border-t-f1-red rounded-full animate-spin mb-4 shadow-f1-red" />
            <p className="f1-font text-sm tracking-wider font-bold">Fetching Grand Prix Data...</p>
          </div>
        ) : (
          <>
            {/* Live session banner */}
            {liveSession && liveSession.year === year && (
              <div className="mb-8 max-w-3xl mx-auto">
                <a
                  href={`/live?year=${liveSession.year}&round=${liveSession.round_number}&type=${liveSession.session_type}`}
                  onClick={() => setNavigating(true)}
                  className="block carbon-card border border-f1-red/60 rounded-xl overflow-hidden hover:border-f1-red transition-all group shadow-f1-glow f1-stripe-top"
                >
                  <div className="px-5 py-4 flex items-center gap-4">
                    <div className="f1-slant flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#E10600] to-[#FF2A2A] rounded text-xs font-black text-white uppercase tracking-widest flex-shrink-0 shadow-f1-red">
                      <span className="f1-slant-unskew flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                        </span>
                        LIVE
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-black text-base group-hover:text-f1-red transition-colors f1-font tracking-wide">
                        {COUNTRY_FLAGS[liveSession.country] && <span className="mr-2">{COUNTRY_FLAGS[liveSession.country]}</span>}
                        {liveSession.event_name} — {liveSession.session_name}
                      </h3>
                      <p className="text-f1-muted text-xs font-semibold">
                        {liveSession.pre_session ? "Pre-session build-up — click to launch live timing feed" : "Session in progress — click to launch live timing feed"}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-f1-muted group-hover:text-white transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
              </div>
            )}

            {/* Latest round at top */}
            {latestEvent && (
              <div className="mb-8 max-w-3xl mx-auto">
                <h2 className="text-xs font-black text-f1-muted uppercase tracking-widest mb-3 flex items-center gap-2 f1-font">
                  <span className="w-2 h-2 rounded-full bg-f1-red"></span>
                  Most Recent Grand Prix
                </h2>
                <EventRow evt={latestEvent} id="featured" />
              </div>
            )}

            {/* Season list */}
            <h2 className="text-xs font-black text-f1-muted uppercase tracking-widest mb-4 max-w-3xl mx-auto flex items-center gap-2 f1-font">
              <span className="w-2 h-2 rounded-full bg-f1-border"></span>
              {year} Formula 1 Season Calendar
            </h2>
            <div className="flex flex-col gap-2.5 max-w-3xl mx-auto">
              {displayEvents.map((evt) => (
                <EventRow key={evt.round_number} evt={evt} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
