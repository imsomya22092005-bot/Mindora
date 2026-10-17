
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Wind,
  Settings,
  Bell,
  Search,
  ArrowRight,
  Sparkles,
  Sun,
  Moon,
  Plus,
  Clock,
  CalendarDays,
  Smile,
  X,
  Play,
  Pause,
  RotateCcw,
  Leaf,
  Check,
  ShieldCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { apiRequest } from "./api";
import LandingPage from "./LandingPage";
import AuthPage from "./AuthPage";
import { JournalPage, InsightsPage, MindfulMomentsPage, MoodHeatmapPage } from "./DashboardPages";
import IncognitoCheckinPage from "./IncognitoCheckinPage";

import {
  CalmCorner,
  InnerGarden,
  LittleComfortBox,
} from "./WellnessPages";

const moods = [
  { label: "Low", emoji: "😔", value: 2, color: "#dce6f3" },
  { label: "Meh", emoji: "😕", value: 4, color: "#e9e4f4" },
  { label: "Okay", emoji: "😐", value: 6, color: "#f3e8c9" },
  { label: "Good", emoji: "🙂", value: 8, color: "#dcebd9" },
  { label: "Great", emoji: "😁", value: 10, color: "#cce5d0" },
];

const initialActivity = [
  {
    id: 1,
    icon: "journal",
    title: "Your space to reflect",
    description: "Write down what's on your mind.",
    time: "Whenever you're ready",
  },
  {
    id: 2,
    icon: "breathing",
    title: "A little breathing room",
    description: "Take a moment to slow down.",
    time: "1 minute",
  },
];

const starterChartData = [
  { day: "Mon", mood: 5 },
  { day: "Tue", mood: 7 },
  { day: "Wed", mood: 4 },
  { day: "Thu", mood: 6 },
  { day: "Fri", mood: 8 },
  { day: "Sat", mood: 7 },
  { day: "Sun", mood: 6 },
];

function readMoodHistory() {
  try {
    const saved = localStorage.getItem("mindora-mood-history");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function readJournalEntries() {
  try {
    const saved = localStorage.getItem("mindora-journal-entries");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function getTodayDate() {
  return new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [savedMood, setSavedMood] = useState(null);
  const [showMoodMessage, setShowMoodMessage] = useState(false);

  const [moodHistory, setMoodHistory] = useState(readMoodHistory);
  const [journalEntries, setJournalEntries] = useState(readJournalEntries);

  const [showJournal, setShowJournal] = useState(false);
  const [journalText, setJournalText] = useState("");

  const [showBreathing, setShowBreathing] = useState(false);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingSeconds, setBreathingSeconds] = useState(60);

  const [activeNav, setActiveNav] = useState("Overview");
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [bookPage, setBookPage] = useState(0);

  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("mindora-theme") === "dark";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        "mindora-mood-history",
        JSON.stringify(moodHistory)
      );
    } catch {
      // The app can continue if browser storage is unavailable.
    }
  }, [moodHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "mindora-journal-entries",
        JSON.stringify(journalEntries)
      );
    } catch {
      // The app can continue if browser storage is unavailable.
    }
  }, [journalEntries]);

  useEffect(() => {
    try {
      localStorage.setItem("mindora-theme", darkMode ? "dark" : "light");
    } catch {
      // Theme preference may not persist in private browsing.
    }
  }, [darkMode]);

  useEffect(() => {
    if (!breathingActive || breathingSeconds <= 0) return;

    const timer = setTimeout(() => {
      setBreathingSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [breathingActive, breathingSeconds]);

  useEffect(() => {
    if (breathingSeconds === 0) {
      setBreathingActive(false);
    }
  }, [breathingSeconds]);

  const elapsed = 60 - breathingSeconds;
  const phasePosition = elapsed % 16;

  const breathingPhase =
    breathingSeconds === 0
      ? "Session complete"
      : !breathingActive
        ? "Ready to begin"
        : phasePosition < 4
          ? "Inhale slowly"
          : phasePosition < 8
            ? "Hold gently"
            : phasePosition < 12
              ? "Exhale slowly"
              : "Rest";

  const recentMoods = moodHistory.slice(0, 7);

  const chartData =
    recentMoods.length > 0
      ? [...recentMoods]
          .slice(0, 7)
          .reverse()
          .map((entry, index) => ({
            day: entry.date,
            mood: entry.value,
            label: entry.label,
            index,
          }))
      : starterChartData;

  const averageMood =
    moodHistory.length > 0
      ? (
          moodHistory.reduce((sum, entry) => sum + entry.value, 0) /
          moodHistory.length
        ).toFixed(1)
      : "—";

  const todayMood = moodHistory.find(
    (entry) => entry.date === getTodayDate()
  );

  const filteredActivity = [
    ...journalEntries.map((entry) => ({
      id: `journal-${entry.id}`,
      icon: "journal",
      title: "Journal entry saved",
      description: entry.preview,
      time: entry.date,
    })),
    ...initialActivity,
  ].filter((item) => {
    const query = searchText.toLowerCase().trim();

    return (
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  });

  async function saveMood() {
    if (!selectedMood) return;

    const token = localStorage.getItem("mindora-token");
    const moodValues = { Low: "bad", Meh: "neutral", Okay: "neutral", Good: "good", Great: "rad" };
    const entry = {
      id: Date.now(),
      label: selectedMood.label,
      emoji: selectedMood.emoji,
      value: selectedMood.value,
      date: getTodayDate(),
      timestamp: Date.now(),
    };

    if (token) {
      try {
        await apiRequest("/api/mood/entry", {
          method: "POST",
          token,
          body: JSON.stringify({
            date: new Date().toISOString().slice(0, 10),
            mood: moodValues[selectedMood.label] || "neutral",
            intensity: Math.max(1, Math.min(5, Math.round(selectedMood.value / 2))),
          }),
        });
      } catch (error) {
        setShowMoodMessage(false);
        window.alert(error.message || "Your mood could not be synced. Please try again.");
        return;
      }
    }

    setMoodHistory((previous) => [entry, ...previous]);
    setSavedMood(selectedMood);
    setShowMoodMessage(true);
  }

  function saveJournal() {
    const trimmedText = journalText.trim();

    if (!trimmedText) return;

    const entry = {
      id: Date.now(),
      text: trimmedText,
      preview:
        trimmedText.length > 90
          ? `${trimmedText.slice(0, 90)}…`
          : trimmedText,
      date: getTodayDate(),
      timestamp: Date.now(),
    };

    setJournalEntries((previous) => [entry, ...previous]);
    setJournalText("");
    setShowJournal(false);
  }

  function startBreathing() {
    if (breathingSeconds === 0) {
      setBreathingSeconds(60);
    }

    setBreathingActive(true);
  }

  function resetBreathing() {
    setBreathingActive(false);
    setBreathingSeconds(60);
  }

  function closeBreathing() {
    setShowBreathing(false);
    resetBreathing();
  }

  function navigateTo(section) {
    setActiveNav(section);
    if (section === "Overview") navigate("/dashboard");
    if (section === "Journal") navigate("/journal");
    if (section === "Insights") navigate("/insights");
    if (section === "Mindful moments") navigate("/mindful-moments");
    if (section === "Incognito check-in") navigate("/incognito-checkin");
    if (section === "Mood heatmap") navigate("/mood-heatmap");
    if (section === "Calm Corner") navigate("/calm-corner");
  }

  const navItems = [
    { label: "Overview", icon: LayoutDashboard },
    { label: "Journal", icon: BookOpen },
    { label: "Insights", icon: BarChart3 },
    { label: "Mindful moments", icon: Wind },
    { label: "Incognito check-in", icon: ShieldCheck },
    { label: "Mood heatmap", icon: Sparkles },
    { label: "Calm Corner", icon: Wind },
  ];

  return (
    <div className={`app-shell ${darkMode ? "dark-theme" : ""}`}>
      <aside className="sidebar">
        <button
          className="brand"
          onClick={() => navigateTo("Overview")}
          aria-label="Mindora home"
        >
          <span className="brand-mark"><img src="/favicon.svg" alt="" /></span>
          <span className="brand-name">mindora</span>
        </button>

        <div className="sidebar-label">YOUR SPACE</div>

        <nav className="sidebar-nav">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${activeNav === label ? "active" : ""}`}
              onClick={() => navigateTo(label)}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {label === "Journal" && journalEntries.length > 0 && (
                <span className="nav-count">{journalEntries.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-quote">
          <span className="quote-sparkle">
            <Sparkles size={18} />
          </span>
          <p>“You don't have to have it all figured out today.”</p>
          <span className="quote-caption">A gentle reminder</span>
        </div>

        <button
          className="nav-item settings-link"
          onClick={() => setShowSettings((value) => !value)}
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>

        {showSettings && (
          <div className="settings-popover">
            <div className="settings-popover-heading">
              <strong>Appearance</strong>
              <button
                className="settings-close"
                type="button"
                onClick={() => setShowSettings(false)}
                aria-label="Close settings"
                title="Close settings"
              >
                <X size={16} />
              </button>
            </div>
            <button
              className="theme-setting"
              onClick={() => setDarkMode((value) => !value)}
            >
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}
              {darkMode ? "Switch to light mode" : "Switch to dark mode"}
            </button>
            <p>Your preference is saved on this device.</p>
          </div>
        )}

        <div className="sidebar-profile">
          <div className="profile-avatar">M</div>
          <div className="profile-copy">
            <strong>Your safe space</strong>
            <span>One day at a time</span>
          </div>
          <Heart size={17} className="profile-heart" />
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Your space</span>
            <span className="breadcrumb-slash">/</span>
            <strong>{activeNav}</strong>
          </div>

          <div className="topbar-actions">
            <label className="search-box">
              <Search size={16} />
              <input
                type="search"
                placeholder="Search your space..."
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
            </label>

            <button
              className="icon-button"
              onClick={() => setShowNotifications((value) => !value)}
              aria-label="Notifications"
            >
              <Bell size={19} />
              {journalEntries.length > 0 && (
                <span className="notification-dot" />
              )}
            </button>

            <button
              className="icon-button theme-toggle"
              onClick={() => setDarkMode((value) => !value)}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={19} /> : <Moon size={19} />}
            </button>
          </div>

          {showNotifications && (
            <div className="notification-popover">
              <div className="popover-heading">
                <strong>A little reminder</strong>
                <button
                  className="plain-icon"
                  onClick={() => setShowNotifications(false)}
                  aria-label="Close notifications"
                >
                  <X size={16} />
                </button>
              </div>
              <p>You deserve a moment of care today.</p>
              <button
                className="text-action"
                onClick={() => {
                  setShowNotifications(false);
                  setShowBreathing(true);
                }}
              >
                Take a breathing break <ArrowRight size={14} />
              </button>
            </div>
          )}
        </header>

        <div className="dashboard-content">
          <section className="welcome-section">
            <div className="welcome-copy">
              <div className="date-label">
                <Sun size={15} />
                <span>
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              </div>

              <h1>
                {getGreeting()}, <span>beautiful soul.</span>
              </h1>

              <p>
                This is your space to pause, reflect, and reconnect with
                yourself. There's no right or wrong way to feel.
              </p>

              <button
                className="welcome-button"
                onClick={() => {
                  document
                    .getElementById("daily-checkin")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
              >
                Check in with yourself <ArrowRight size={16} />
              </button>
            </div>

            <div className="welcome-art" aria-hidden="true">
              <div className="art-sun" />
              <div className="art-orbit art-orbit-one" />
              <div className="art-orbit art-orbit-two" />
              <div className="art-leaf art-leaf-one">
                <Leaf size={43} />
              </div>
              <div className="art-leaf art-leaf-two">
                <Leaf size={31} />
              </div>
              <div className="art-sparkle art-sparkle-one">✦</div>
              <div className="art-sparkle art-sparkle-two">✧</div>
              <div className="art-ground" />
            </div>

            <div className="welcome-bottom-note">
              <Heart size={15} />
              <span>Small steps still move you forward.</span>
            </div>
          </section>

          <section
            className="section-block mood-section"
            id="daily-checkin"
          >
            <div className="section-heading mood-book-heading">
              <div>
                <div className="section-kicker">A MOMENT JUST FOR YOU</div>
                <h2>Your mood today</h2>
                <p>Turn a page, take a breath, and meet yourself where you are.</p>
              </div>
            </div>

            <div className="mood-book-wrap">
              <div className="mood-book">
                <div className="mood-book-spine" aria-hidden="true" />
                <div className="mood-book-page">
                  {bookPage === 0 ? (
                    <div className="book-cover-content">
                      <span className="book-eyebrow">MINDORA · DAILY REFLECTION</span>
                      <span className="book-cover-icon"><BookOpen size={34} strokeWidth={1.4} /></span>
                      <h3>Your mood today</h3>
                      <p>There is no right way to feel.<br />Let’s make a little room for yours.</p>
                      <span className="book-page-number">A LITTLE CHECK-IN · 01</span>
                    </div>
                  ) : bookPage <= moods.length ? (
                    <div className="mood-book-entry" key={bookPage}>
                      <span className="book-eyebrow">PAGE {String(bookPage + 1).padStart(2, "0")} · YOUR FEELINGS ARE WELCOME</span>
                      <span className="book-mood-emoji" style={{ backgroundColor: moods[bookPage - 1].color }}>
                        {moods[bookPage - 1].emoji}
                      </span>
                      <h3>{moods[bookPage - 1].label}</h3>
                      <p className="book-quote">
                        {[
                          "You don’t have to be okay to deserve kindness. Take today one small breath at a time.",
                          "It’s alright to feel a little out of sorts. You don’t need to have all the answers today.",
                          "Some days are simply days. You can meet this moment exactly as it is.",
                          "Let yourself enjoy the good that’s here, without needing to explain it or hold onto it.",
                          "Let this moment be yours. You’re allowed to feel joy and let it gently fill your day."
                        ][bookPage - 1]}
                      </p>
                      <button
                        className={selectedMood?.label === moods[bookPage - 1].label ? "book-feeling-button selected" : "book-feeling-button"}
                        onClick={() => {
                          setSelectedMood(moods[bookPage - 1]);
                          setShowMoodMessage(false);
                        }}
                      >
                        {selectedMood?.label === moods[bookPage - 1].label ? <><Check size={16} /> This is how I feel</> : <>This feels like me <Heart size={16} /></>}
                      </button>
                      <span className="book-page-number">MINDORA · {String(bookPage + 1).padStart(2, "0")}</span>
                    </div>
                  ) : (
                    <div className="book-goodbye">
                      <span className="book-goodbye-heart"><Heart size={30} /></span>
                      <h3>Thank you for showing up for yourself.</h3>
                      <p>Whatever today held, you made space for it.<br />We’ll be right here when tomorrow comes.</p>
                      <span className="book-goodbye-script">See you tomorrow.</span>
                      <span className="book-page-number">UNTIL NEXT TIME · 07</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mood-book-controls">
                <button
                  className="book-turn-button secondary"
                  onClick={() => setBookPage((page) => Math.max(0, page - 1))}
                  disabled={bookPage === 0}
                >
                  <ArrowRight className="book-back-arrow" size={16} /> Previous page
                </button>
                {bookPage > 0 && bookPage <= moods.length && (
                  <button
                    className="book-save-button"
                    onClick={saveMood}
                    disabled={!selectedMood}
                    title={!selectedMood ? "Choose this feeling first" : "Save your daily check-in"}
                  >
                    Save check-in <Heart size={15} />
                  </button>
                )}
                <button
                  className="book-turn-button"
                  onClick={() => setBookPage((page) => page >= moods.length + 1 ? 0 : page + 1)}
                >
                  {bookPage === moods.length + 1 ? "Read again" : "Turn the page"} <ArrowRight size={16} />
                </button>
              </div>
              {showMoodMessage && savedMood && (
                <div className="success-message book-success">
                  <Check size={16} />
                  Check-in saved. Thank you for taking a moment for yourself.
                </div>
              )}
            </div>
          </section>

          <section className="section-block">
            <div className="section-heading">
              <div>
                <div className="section-kicker">LOOKING BACK WITH KINDNESS</div>
                <h2>Your mood history</h2>
                <p>Your previous check-ins, saved on this device.</p>
              </div>
              <span className="step-label">
                {moodHistory.length} check-in
                {moodHistory.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="panel history-panel">
              {moodHistory.length === 0 ? (
                <div className="empty-history">
                  <span className="history-empty-icon">
                    <Heart size={21} />
                  </span>
                  <strong>Your story starts with one check-in.</strong>
                  <p>Choose a mood above and it will appear here.</p>
                </div>
              ) : (
                <div className="history-list">
                  {recentMoods.map((entry) => (
                    <div className="history-row" key={entry.id}>
                      <span className="history-emoji">{entry.emoji}</span>
                      <div className="history-details">
                        <strong>{entry.label}</strong>
                        <span>{entry.date}</span>
                      </div>
                      <span className="history-score">
                        {entry.value}/10
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="stats-grid">
            <div className="panel stat-card">
              <div className="stat-top">
                <span className="stat-icon green-icon">
                  <Smile size={19} />
                </span>
                <span className="stat-label">Today's mood</span>
              </div>
              <div className="stat-value">
                {todayMood ? (
                  <>
                    <span className="stat-emoji">{todayMood.emoji}</span>
                    {todayMood.label}
                  </>
                ) : (
                  "Not checked in"
                )}
              </div>
              <span className="stat-footnote">
                {todayMood ? "Thank you for checking in." : "There's always time."}
              </span>
            </div>

            <div className="panel stat-card">
              <div className="stat-top">
                <span className="stat-icon peach-icon">
                  <CalendarDays size={19} />
                </span>
                <span className="stat-label">Check-ins saved</span>
              </div>
              <div className="stat-value">{moodHistory.length}</div>
              <span className="stat-footnote">Every check-in counts.</span>
            </div>

            <div className="panel stat-card">
              <div className="stat-top">
                <span className="stat-icon lavender-icon">
                  <Heart size={19} />
                </span>
                <span className="stat-label">Average mood</span>
              </div>
              <div className="stat-value">
                {averageMood}
                {averageMood !== "—" && (
                  <span className="stat-suffix"> / 10</span>
                )}
              </div>
              <span className="stat-footnote">
                A reflection, not a rating.
              </span>
            </div>
          </section>

          <section className="section-block" id="mood-insights">
            <div className="section-heading">
              <div>
                <div className="section-kicker">GENTLE SELF-AWARENESS</div>
                <h2>Your mood, over time</h2>
                <p>Notice patterns without judging yourself.</p>
              </div>
              <span className="step-label">
                <BarChart3 size={14} /> Mood insights
              </span>
            </div>

            <div className="panel chart-panel">
              {moodHistory.length < 2 && (
                <p className="chart-note">
                  {moodHistory.length === 0
                    ? "Your mood chart will grow as you save check-ins."
                    : "Save another check-in to start noticing your mood patterns."}
                </p>
              )}

              <div className="mood-chart">
                <ResponsiveContainer width="100%" height={230}>
                  <AreaChart
                    data={chartData}
                    margin={{ top: 12, right: 10, left: -18, bottom: 2 }}
                  >
                    <defs>
                      <linearGradient
                        id="moodFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#8cae89"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8cae89"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 5"
                      vertical={false}
                      stroke="#e8ece3"
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "#899487", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 10]}
                      ticks={[0, 2, 4, 6, 8, 10]}
                      tick={{ fill: "#899487", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #e7ebdf",
                        fontSize: 12,
                      }}
                      formatter={(value) => [`${value}/10`, "Mood"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="mood"
                      stroke="#729572"
                      strokeWidth={2.5}
                      fill="url(#moodFill)"
                      activeDot={{
                        r: 5,
                        fill: "#729572",
                        stroke: "#ffffff",
                        strokeWidth: 2,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-legend">
                <span className="chart-legend-dot" />
                <span>
                  {moodHistory.length > 0
                    ? "Your saved check-ins"
                    : "Example mood pattern"}
                </span>
              </div>
            </div>
          </section>

          <section className="lower-grid">
            <div className="section-block">
              <div className="section-heading">
                <div>
                  <div className="section-kicker">LITTLE MOMENTS MATTER</div>
                  <h2>Recently in your space</h2>
                </div>
                <Clock size={17} className="heading-muted-icon" />
              </div>

              <div className="panel activity-panel">
                {filteredActivity.length === 0 ? (
                  <div className="empty-activity">
                    <Search size={21} />
                    <p>No matching activity found.</p>
                  </div>
                ) : (
                  filteredActivity.slice(0, 4).map((item) => (
                    <div className="activity-row" key={item.id}>
                      <span
                        className={`activity-icon ${
                          item.icon === "journal"
                            ? "activity-journal"
                            : "activity-breathing"
                        }`}
                      >
                        {item.icon === "journal" ? (
                          <BookOpen size={17} />
                        ) : (
                          <Wind size={17} />
                        )}
                      </span>
                      <div className="activity-copy">
                        <strong>{item.title}</strong>
                        <span>{item.description}</span>
                      </div>
                      <span className="activity-time">{item.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <footer className="app-footer">
            <span>
              <Heart size={13} /> Made for your softer days.
            </span>
            <span>Your feelings deserve space.</span>
          </footer>
        </div>
      </main>

      {showJournal && (
        <div className="journal-page-overlay">
          <div className="journal-page">
            <div className="journal-page-header">
              <div>
                <div className="journal-page-eyebrow"><BookOpen size={16} /> YOUR PRIVATE SPACE</div>
                <h1>Your journal</h1>
                <p>A quiet place for the thoughts you don't need to explain.</p>
              </div>
              <button className="journal-back-button" onClick={() => setShowJournal(false)}>
                <ArrowRight size={16} /> Back to overview
              </button>
            </div>
            <div className="journal-writing-card">
              <div className="journal-prompt">
                <span className="journal-prompt-icon"><Sparkles size={18} /></span>
                <div>
                  <strong>A gentle prompt for today</strong>
                  <p>What is taking up space in your mind right now?</p>
                </div>
              </div>

            <textarea
              className="journal-textarea"
              value={journalText}
              onChange={(event) => setJournalText(event.target.value)}
              placeholder="Today, I'm feeling..."
              rows={6}
              autoFocus
            />

            <div className="journal-modal-footer">
              <span>
                <Heart size={13} /> Saved in this browser
              </span>
              <button
                className="primary-button"
                onClick={saveJournal}
                disabled={!journalText.trim()}
              >
                Save reflection <ArrowRight size={15} />
              </button>
            </div>

            </div>
            <section className="journal-entries-section">
              <div className="journal-entries-heading">
                <div>
                  <div className="section-kicker">LOOKING BACK WITH KINDNESS</div>
                  <h2>Your saved reflections</h2>
                </div>
                <span className="journal-entry-count">{journalEntries.length} {journalEntries.length === 1 ? "entry" : "entries"}</span>
              </div>
              {journalEntries.length === 0 ? (
                <div className="journal-empty-state">
                  <span><BookOpen size={22} /></span>
                  <strong>Your first reflection can start here.</strong>
                  <p>When you save a note, it will be waiting for you in this space.</p>
                </div>
              ) : (
                <div className="journal-entry-list">
                  {journalEntries.map((entry) => (
                    <article className="journal-entry-card" key={entry.id}>
                      <div className="journal-entry-date"><CalendarDays size={14} /> {entry.date}</div>
                      <p>{entry.text}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>
            <p className="journal-privacy-note"><Heart size={13} /> Your entries are stored locally in this browser. Clearing browser data may remove them.</p>
          </div>
        </div>
      )}

      {showBreathing && (
        <div className="modal-overlay" onClick={closeBreathing}>
          <div
            className="breathing-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="breathing-close"
              onClick={closeBreathing}
              aria-label="Close breathing timer"
            >
              <X size={20} />
            </button>

            <span className="modal-icon">
              <Wind size={23} />
            </span>

            <div className="section-kicker">A MOMENT FOR YOU</div>
            <h2>Your breathing space</h2>
            <p className="breathing-description">
              Nothing to fix. Just breathe, one moment at a time.
            </p>

            <div
              className={`breathing-orb ${
                breathingActive && breathingSeconds > 0
                  ? phasePosition < 4
                    ? "orb-inhale"
                    : phasePosition < 8
                      ? "orb-hold"
                      : phasePosition < 12
                        ? "orb-exhale"
                        : "orb-rest"
                  : ""
              }`}
            >
              <span className="breathing-orb-emoji">
                {breathingSeconds === 0 ? "🌿" : "☁️"}
              </span>
              <strong>
                {String(Math.floor(breathingSeconds / 60)).padStart(2, "0")}:
                {String(breathingSeconds % 60).padStart(2, "0")}
              </strong>
            </div>

            <h3 className="breathing-phase">{breathingPhase}</h3>
            <p className="breathing-hint">
              {breathingSeconds === 0
                ? "You made space for yourself. Well done."
                : "Follow the circle. There is no need to rush."}
            </p>

            <div className="breathing-actions">
              {breathingSeconds === 0 ? (
                <button className="primary-button" onClick={resetBreathing}>
                  <RotateCcw size={15} /> Try again
                </button>
              ) : (
                <button
                  className="primary-button"
                  onClick={() => {
                    if (breathingActive) {
                      setBreathingActive(false);
                    } else {
                      startBreathing();
                    }
                  }}
                >
                  {breathingActive ? (
                    <>
                      <Pause size={15} /> Pause session
                    </>
                  ) : (
                    <>
                      <Play size={15} /> Start breathing
                    </>
                  )}
                </button>
              )}

              <button
                className="breathing-reset"
                onClick={resetBreathing}
              >
                <RotateCcw size={14} /> Reset
              </button>
            </div>

            <p className="breathing-footer">
              Take it at your own pace. Stop if you feel uncomfortable.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Account pages */}
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="register" />} />

        {/* Main dashboard — existing features preserved */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/mindful-moments" element={<MindfulMomentsPage />} />
        <Route path="/incognito-checkin" element={<IncognitoCheckinPage />} />
        <Route path="/mood-heatmap" element={<MoodHeatmapPage />} />

        {/* Mindora wellness pages */}
        <Route path="/calm-corner" element={<CalmCorner />} />
        <Route path="/inner-garden" element={<InnerGarden />} />
        <Route
          path="/comfort-box"
          element={<LittleComfortBox />}
        />

        {/* Fallback for unknown routes */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;