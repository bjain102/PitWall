"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ReplaySettings, DEFAULTS as DEFAULT_SETTINGS } from "@/hooks/useSettings";
import { WeatherData } from "@/hooks/useReplaySocket";

interface Props {
  eventName: string;
  circuit: string;
  country: string;
  sessionType: string;
  year: number;
  settings?: ReplaySettings;
  onSettingChange?: (key: keyof ReplaySettings, value: boolean) => void;
  weather?: WeatherData;
  extraActions?: React.ReactNode;
  mobileTeamAbbrHidden?: boolean;
}

const SESSION_LABELS: Record<string, string> = {
  R: "Race",
  Q: "Qualifying",
  S: "Sprint",
  SQ: "Sprint Qualifying",
  FP1: "Practice 1",
  FP2: "Practice 2",
  FP3: "Practice 3",
};

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
  "Turkey": "🇹🇷",
  "South Africa": "🇿🇦",
  "Las Vegas": "🇺🇸",
  "Miami": "🇺🇸",
};

const LEADERBOARD_SETTINGS: { key: keyof ReplaySettings; label: string; raceOnly?: boolean; nonRaceOnly?: boolean; qualiOnly?: boolean; badge?: string; parent?: keyof ReplaySettings }[] = [
  { key: "showTeamAbbr", label: "Team" },
  { key: "showGridChange", label: "Grid position change", raceOnly: true },
  { key: "showBestLapTime", label: "Best time", nonRaceOnly: true },
  { key: "showLastLapTime", label: "Last lap time" },
  { key: "showGapToLeader", label: "Gap" },
  { key: "highlightClose", label: "Highlight under 1s", raceOnly: true },
  { key: "showPitStops", label: "Pit stops", raceOnly: true },
  { key: "showTyreType", label: "Tyre type" },
  { key: "showTyreAge", label: "Tyre age" },
  { key: "showTyreHistory", label: "Tyre history", raceOnly: true },
  { key: "showSectors", label: "Live sectors", nonRaceOnly: true },
  { key: "showPitPrediction", label: "Pit prediction", raceOnly: true },
  { key: "showPitConfidence", label: "Confidence", raceOnly: true, parent: "showPitPrediction" },
  { key: "showPitFreeAir", label: "Pit gaps", raceOnly: true, parent: "showPitPrediction" },
];

const WEATHER_SETTINGS: { key: keyof ReplaySettings; label: string }[] = [
  { key: "showAirTemp", label: "Air temperature" },
  { key: "showTrackTemp", label: "Track temperature" },
  { key: "showHumidity", label: "Humidity" },
  { key: "showWind", label: "Wind" },
  { key: "showRainfall", label: "Rainfall" },
];

const TRACK_MAP_SETTINGS: { key: keyof ReplaySettings; label: string }[] = [
  { key: "showDriverNames", label: "Driver names on track" },
  { key: "showCorners", label: "Corner numbers" },
];

const OTHER_SETTINGS: { key: keyof ReplaySettings; label: string; hint?: string }[] = [
  { key: "showAllPanels", label: "Open all data panels" },
  { key: "showSessionTime", label: "Show total session time", hint: "May indicate red flags and spoilers" },
  { key: "useImperial", label: "Imperial units (°F, mph)" },
  { key: "highContrast", label: "High contrast text" },
];

export default function SessionBanner({
  eventName,
  circuit,
  country,
  sessionType,
  year,
  settings: settingsProp,
  onSettingChange,
  weather,
  extraActions,
  mobileTeamAbbrHidden,
}: Props) {
  const settings = settingsProp || DEFAULT_SETTINGS;
  const isRace = sessionType === "R" || sessionType === "S";
  const isQualifying = sessionType === "Q" || sessionType === "SQ";
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"Leaderboard" | "Weather" | "Track Map" | "Race Control" | "Other">("Leaderboard");
  const [mounted, setMounted] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close settings on outside click
  useEffect(() => {
    if (!settingsOpen) return;
    function handleClick(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        // Only close if click was outside modal
        const modalEl = document.getElementById("f1-telemetry-settings-modal");
        if (modalEl && modalEl.contains(e.target as Node)) {
          return;
        }
        setSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [settingsOpen]);

  const weatherBar = weather && settings.showWeather ? (
    <div className="flex items-center gap-3 text-xs text-f1-muted flex-wrap">
      {settings.showAirTemp && (
        <span className="flex items-center gap-1" title="Air temperature">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="m15.98 11.52c-.33-.28-.51-.74-.51-1.26v-4.62c0-1.86-1.38-3.45-3.14-3.63-.98-.1-1.97.22-2.71.89-.73.66-1.15 1.61-1.15 2.6v4.79c0 .53-.19 1-.51 1.3-1.58 1.43-2.27 3.55-1.84 5.66.46 2.31 2.31 4.18 4.61 4.66.43.09.86.13 1.28.13 1.38 0 2.72-.46 3.8-1.34 1.42-1.15 2.23-2.86 2.23-4.68 0-1.72-.75-3.36-2.06-4.51zm-1.43 7.63c-.96.78-2.17 1.07-3.42.81-1.52-.32-2.75-1.56-3.06-3.1-.28-1.41.18-2.83 1.23-3.79.74-.67 1.17-1.69 1.17-2.78v-4.79c0-.43.18-.83.49-1.11.28-.25.63-.39 1.01-.39h.16c.75.08 1.34.79 1.34 1.64v4.62c0 1.09.44 2.1 1.2 2.77.87.76 1.37 1.86 1.37 3 0 1.22-.54 2.36-1.49 3.13z"/>
            <circle cx="12" cy="16" r="2.47"/>
          </svg>
          {settings.useImperial ? `${Math.round(weather.air_temp * 9 / 5 + 32)}°F` : `${weather.air_temp}°C`}
        </span>
      )}
      {settings.showTrackTemp && (
        <span className="flex items-center gap-1" title="Track temperature">
          <svg className="w-3.5 h-3.5" viewBox="0 0 512 512" fill="currentColor">
            <path d="M162.9.4c-5.7-1.6-11.6 1.7-13.2 7.4L11.1 498.4c-1.6 5.7 1.7 11.6 7.4 13.2c.9.3 1.9.4 2.9.4c4.8 0 9-3.2 10.3-7.8L170.3 13.6c1.6-5.7-1.7-11.6-7.4-13.2z"/>
            <path d="M500.9 498.4L362.3 7.8c-1.6-5.7-7.5-9-13.2-7.4-5.7 1.6-9 7.5-7.4 13.2l138.7 490.7c1.3 4.6 5.5 7.8 10.3 7.8 1 0 2-.1 2.9-.4 5.7-1.6 9-7.5 7.4-13.2z"/>
            <path d="M256 405.3c-5.9 0-10.7 4.8-10.7 10.7v85.3c0 5.9 4.8 10.7 10.7 10.7s10.7-4.8 10.7-10.7V416c0-5.9-4.8-10.7-10.7-10.7z"/>
            <path d="M256 234.7c-5.9 0-10.7 4.8-10.7 10.7v85.3c0 5.9 4.8 10.7 10.7 10.7s10.7-4.8 10.7-10.7v-85.3c0-5.9-4.8-10.7-10.7-234.7z"/>
            <path d="M256 85.3c-5.9 0-10.7 4.8-10.7 10.7v64c0 5.9 4.8 10.7 10.7 10.7s10.7-4.8 10.7-10.7v-64c0-5.9-4.8-10.7-10.7-10.7z"/>
            <path d="M256 0c-5.9 0-10.7 4.8-10.7 10.7V32c0 5.9 4.8 10.7 10.7 10.7s10.7-4.8 10.7-10.7V10.7C266.7 4.8 261.9 0 256 0z"/>
          </svg>
          {settings.useImperial ? `${Math.round(weather.track_temp * 9 / 5 + 32)}°F` : `${weather.track_temp}°C`}
        </span>
      )}
      {settings.showHumidity && (
        <span className="flex items-center gap-1" title="Humidity">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3C12 3 5 11 5 15a7 7 0 0014 0c0-4-7-12-7-12z" />
          </svg>
          {weather.humidity}%
        </span>
      )}
      {settings.showRainfall && (
        <span className={`flex items-center gap-1 ${weather.rainfall ? "text-blue-400" : ""}`} title="Rainfall">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-4.584-7A6 6 0 003 15z" />
          </svg>
          {weather.rainfall ? "Rain" : "Dry"}
        </span>
      )}
      {settings.showWind && (
        <span className="flex items-center gap-1" title={`Wind direction: ${weather.wind_direction}°`}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            style={{ transform: `rotate(${weather.wind_direction}deg)` }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-4 4m4-4l4 4" />
          </svg>
          {settings.useImperial ? `${Math.round(weather.wind_speed * 2.237)} mph` : `${weather.wind_speed} m/s`}
        </span>
      )}
    </div>
  ) : null;

  return (
    <>
      <div className="bg-[#10121A] border-b border-f1-border px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 shadow-lg relative f1-stripe-top z-30">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <a href="/" className="flex-shrink-0 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden border border-f1-border group-hover:border-f1-red transition-all shadow-md">
              <img src="/logo.png" alt="Home" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </div>
          </a>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-extrabold text-white truncate f1-font tracking-wide flex items-center gap-2">
              <span className="text-f1-red">F1</span> {year} {eventName}
            </h1>
            <p className="text-[11px] sm:text-xs font-semibold text-f1-muted truncate uppercase tracking-wider">
              {country && <span className="mr-1.5">{COUNTRY_FLAGS[country] || "🏎️"}</span>}
              {circuit}, {country}
            </p>
          </div>
        </div>

        {/* Weather - desktop only (inline in header) */}
        {weatherBar && (
          <div className="hidden lg:flex items-center gap-4 ml-auto mr-6 bg-[#161926] px-3.5 py-1.5 rounded-lg border border-f1-border/60">
            {weatherBar}
          </div>
        )}

        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {extraActions}
          <div className="f1-slant bg-gradient-to-r from-[#E10600] to-[#FF2A2A] px-3 sm:px-4 py-1.5 rounded text-white font-black text-[11px] sm:text-xs uppercase tracking-widest shadow-f1-red">
            <span className="f1-slant-unskew inline-block">
              {SESSION_LABELS[sessionType] || sessionType}
            </span>
          </div>

          {/* Features/info link */}
          <a
            href="/features"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-8 h-8 sm:w-9 sm:h-9 items-center justify-center rounded-lg bg-[#181B26] border border-f1-border hover:border-f1-red/50 hover:bg-[#212534] transition-all text-f1-muted hover:text-white"
            title="How it works"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M12 16v-4m0-4h.01" />
            </svg>
          </a>

          {/* Settings button */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-[#181B26] border border-f1-border hover:border-f1-red/50 hover:bg-[#212534] transition-all text-f1-muted hover:text-white"
              title="Settings"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Render modal directly in document.body via Portal to prevent any parent container stacking/offsetting */}
      {settingsOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Modal backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-0"
            onClick={() => setSettingsOpen(false)}
          />

          {/* Settings modal window - perfectly centered in viewport */}
          <div
            id="f1-telemetry-settings-modal"
            className="relative z-10 w-full max-w-[540px] h-[460px] carbon-card border border-f1-border rounded-xl shadow-2xl overflow-hidden flex flex-col f1-stripe-top text-left bg-[#141622]"
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-f1-border bg-[#141622]">
              <span className="text-sm font-black text-white uppercase f1-font tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-f1-red animate-pulse"></span>
                Telemetry Settings
              </span>
              <button
                onClick={() => setSettingsOpen(false)}
                className="text-f1-muted hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs + content side by side */}
            <div className="flex flex-1 min-h-0">
              {/* Tab sidebar */}
              <div className="flex flex-col border-r border-f1-border py-2 w-36 sm:w-40 flex-shrink-0 bg-[#12141E]">
                {(["Leaderboard", "Weather", "Track Map", "Race Control", "Other"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSettingsTab(tab)}
                    className={`px-3 sm:px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-left transition-colors f1-font ${
                      settingsTab === tab
                        ? "text-white bg-f1-red/10 border-l-4 border-f1-red font-black"
                        : "text-f1-muted hover:text-white border-l-4 border-transparent hover:bg-white/5"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="pt-4 pb-2 flex-1 overflow-y-auto px-3 sm:px-4 bg-[#181B26]">
                {settingsTab === "Leaderboard" && (
                  <>
                    <button
                      onClick={() => onSettingChange?.("showLeaderboard", !settings.showLeaderboard)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#1D2130] mb-2 hover:bg-[#252A3E] transition-colors"
                    >
                      <span className="text-xs font-bold text-white uppercase tracking-wider f1-font">Show Leaderboard</span>
                      <div className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${settings.showLeaderboard ? "bg-f1-red" : "bg-f1-border"}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${settings.showLeaderboard ? "translate-x-4" : "translate-x-0.5"}`} />
                      </div>
                    </button>
                    {LEADERBOARD_SETTINGS.filter(s => (!s.raceOnly || isRace) && (!s.nonRaceOnly || !isRace) && (!s.qualiOnly || isQualifying)).map(({ key, label, badge, parent }) => {
                      const parentOff = parent ? !settings[parent] : false;
                      const disabled = !settings.showLeaderboard || parentOff;
                      return (
                        <button
                          key={key}
                          onClick={() => onSettingChange?.(key, !settings[key])}
                          disabled={disabled}
                          className={`w-full flex items-center justify-between ${parent ? "pl-5 sm:pl-8" : "pl-2 sm:pl-3"} pr-2 py-1.5 rounded hover:bg-white/5 transition-colors ${disabled ? "opacity-40 pointer-events-none" : ""}`}
                        >
                          <span className={`${parent ? "text-xs text-f1-muted" : "text-xs font-semibold text-white"} flex items-center gap-2`}>
                            {label}
                            {badge && <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-f1-red/20 text-f1-red leading-none">{badge}</span>}
                            {key === "showTeamAbbr" && mobileTeamAbbrHidden && (
                              <span className="px-1 py-0.5 text-[8px] font-bold uppercase rounded bg-yellow-500/20 text-yellow-400 leading-none">Auto-hidden</span>
                            )}
                          </span>
                          <div className={`relative ${parent ? "w-7 h-4" : "w-9 h-5"} rounded-full transition-colors flex-shrink-0 ${settings[key] ? "bg-f1-red" : "bg-f1-border"}`}>
                            <div className={`absolute top-0.5 ${parent ? "w-3 h-3" : "w-4 h-4"} bg-white rounded-full transition-transform ${settings[key] ? (parent ? "translate-x-3.5" : "translate-x-4") : "translate-x-0.5"}`} />
                          </div>
                        </button>
                      );
                    })}
                  </>
                )}

                {settingsTab === "Weather" && (
                  <>
                    <button
                      onClick={() => onSettingChange?.("showWeather", !settings.showWeather)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#1D2130] mb-2 hover:bg-[#252A3E] transition-colors"
                    >
                      <span className="text-xs font-bold text-white uppercase tracking-wider f1-font">Show Weather</span>
                      <div className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${settings.showWeather ? "bg-f1-red" : "bg-f1-border"}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${settings.showWeather ? "translate-x-4" : "translate-x-0.5"}`} />
                      </div>
                    </button>
                    {WEATHER_SETTINGS.map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => onSettingChange?.(key, !settings[key])}
                        disabled={!settings.showWeather}
                        className={`w-full flex items-center justify-between pl-2 sm:pl-3 pr-2 py-1.5 rounded hover:bg-white/5 transition-colors ${!settings.showWeather ? "opacity-40 pointer-events-none" : ""}`}
                      >
                        <span className="text-xs font-semibold text-white">{label}</span>
                        <div className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${settings[key] ? "bg-f1-red" : "bg-f1-border"}`}>
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${settings[key] ? "translate-x-4" : "translate-x-0.5"}`} />
                        </div>
                      </button>
                    ))}
                  </>
                )}

                {settingsTab === "Track Map" && (
                  <>
                    {TRACK_MAP_SETTINGS.map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => onSettingChange?.(key, !settings[key])}
                        className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-white/5 transition-colors"
                      >
                        <span className="text-xs font-semibold text-white">{label}</span>
                        <div className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${settings[key] ? "bg-f1-red" : "bg-f1-border"}`}>
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${settings[key] ? "translate-x-4" : "translate-x-0.5"}`} />
                        </div>
                      </button>
                    ))}
                  </>
                )}

                {settingsTab === "Race Control" && (
                  <>
                    <button
                      onClick={() => onSettingChange?.("rcSound", !settings.rcSound)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-white/5 transition-colors"
                    >
                      <span className="text-xs font-semibold text-white">Notification sound</span>
                      <div className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${settings.rcSound ? "bg-f1-red" : "bg-f1-border"}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${settings.rcSound ? "translate-x-4" : "translate-x-0.5"}`} />
                      </div>
                    </button>
                  </>
                )}

                {settingsTab === "Other" && (
                  <>
                    {OTHER_SETTINGS.map(({ key, label, hint }) => (
                      <button
                        key={key}
                        onClick={() => onSettingChange?.(key, !settings[key])}
                        className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-white/5 transition-colors"
                      >
                        <span className="text-left">
                          <span className="text-xs font-semibold text-white block">{label}</span>
                          {hint && <span className="text-[10px] text-f1-muted block">{hint}</span>}
                        </span>
                        <div className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${settings[key] ? "bg-f1-red" : "bg-f1-border"}`}>
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${settings[key] ? "translate-x-4" : "translate-x-0.5"}`} />
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Weather bar - mobile only (separate row below header) */}
      {weatherBar && (
        <div className="lg:hidden bg-[#12141E] border-b border-f1-border px-3 py-2 flex items-center justify-center">
          {weatherBar}
        </div>
      )}
    </>
  );
}
