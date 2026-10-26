
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Heart,
  HeartHandshake,
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
  Gamepad2,
  StickyNote,
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
import { useLanguage } from "./language";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { apiRequest } from "./api";
import LandingPage from "./LandingPage";
import AuthPage from "./AuthPage";
import { JournalPage, InsightsPage, MindfulMomentsPage } from "./DashboardPages";
import ProfilePage from "./ProfilePage";
import GamesZone from "./GamesZone";
import SharedSidebarLayout from "./SharedSidebarLayout";
import MindoraAI from "./MindoraAI";
import StickyNoteWall from "./StickyNoteWall";

import {
  CalmCorner,
  InnerGarden,
  LittleComfortBox,
  MoodSoundscape,
} from "./WellnessPages";

const mindfulPractices = [
  { id: "child-pose", title: "Child’s Pose", hindi: "बालासन", type: "Rest & release", typeHi: "आराम और तनाव से राहत", duration: "2 min", durationHi: "2 मिनट", image: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?q=85&w=1600&auto=format&fit=crop", description: "A gentle resting pose to ease tension.", descriptionHi: "तनाव कम करने के लिए आरामदायक आसन।", steps: ["Kneel on the mat and bring your big toes together.", "Gently widen your knees to a comfortable position.", "Sit your hips back toward your heels.", "Fold forward and rest your forehead on the mat or a cushion.", "Let your arms rest forward or alongside your body and take 5 slow breaths."], stepsHi: [
        "घुटनों के बल मैट पर बैठें और पैरों के दोनों अंगूठों को आपस में मिलाएँ।",
        "घुटनों को धीरे-धीरे आरामदायक दूरी तक फैलाएँ।",
        "कूल्हों को पीछे की ओर एड़ियों के पास ले जाएँ।",
        "आगे की ओर झुकें और माथे को मैट या कुशन पर टिकाएँ।",
        "हाथों को आगे की ओर या शरीर के बगल में आराम से रखें और 5 धीमी साँसें लें।"
      ], },
  { id: "mountain-pose", title: "Mountain Pose", hindi: "ताड़ासन", type: "Grounding", typeHi: "स्थिरता", duration: "1 min", durationHi: "1 मिनट", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=85&w=1600&auto=format&fit=crop", description: "Stand tall, breathe slowly, feel steady.", descriptionHi: "सीधे खड़े होकर धीरे साँस लें और स्थिरता महसूस करें।", steps: ["Stand with your feet hip-width apart and toes facing forward.", "Spread your weight evenly across both feet.", "Keep your knees soft, shoulders relaxed and arms by your sides.", "Lengthen your spine and let your gaze rest straight ahead.", "Take 5 calm breaths without forcing your posture."], stepsHi: [
        "पैरों के बीच कूल्हों जितनी दूरी रखकर सीधे खड़े हों और पंजों को आगे की ओर रखें।",
        "दोनों पैरों पर शरीर का वज़न बराबर रखें।",
        "घुटनों को सहज रखें, कंधों को ढीला छोड़ें और हाथों को शरीर के बगल में रखें।",
        "रीढ़ को सीधा और लंबा रखें तथा सामने की ओर सहज नज़र रखें।",
        "अपनी मुद्रा पर ज़ोर डाले बिना 5 शांत साँसें लें।"
      ], },
  { id: "seated-breathing", title: "Seated Breathing", hindi: "बैठकर श्वास", type: "Breathwork", typeHi: "श्वास अभ्यास", duration: "2 min", durationHi: "2 मिनट", image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=85&w=1600&auto=format&fit=crop", description: "Make room for a slower, softer breath.", descriptionHi: "धीमी और सहज साँसों के लिए थोड़ा समय निकालें।", steps: ["Sit comfortably on a chair or cushion with your back supported.", "Relax your jaw and lower your shoulders.", "Breathe in gently through your nose, only as deeply as feels comfortable.", "Breathe out slowly without holding or forcing your breath.", "Continue for 1–2 minutes; return to normal breathing if you feel dizzy."], stepsHi: [
        "कुर्सी या कुशन पर आराम से बैठें और पीठ को सहारा दें।",
        "जबड़े को ढीला छोड़ें और कंधों को नीचे रखें।",
        "नाक से धीरे-धीरे साँस लें—उतनी ही गहरी, जितनी सहज लगे।",
        "साँस रोके बिना या ज़ोर लगाए बिना धीरे-धीरे साँस छोड़ें।",
        "1–2 मिनट तक जारी रखें। चक्कर आए तो सामान्य रूप से साँस लें।"
      ], },
  { id: "tree-pose", title: "Tree Pose", hindi: "वृक्षासन", type: "Balance", typeHi: "संतुलन", duration: "1 min", durationHi: "1 मिनट", image: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?q=85&w=1600&auto=format&fit=crop", description: "Find a calm point and build gentle focus.", descriptionHi: "एक बिंदु पर ध्यान रखकर सहज संतुलन बनाएँ।", steps: ["Stand tall near a wall or chair for support.", "Shift your weight onto one foot while keeping that knee soft.", "Place the other foot on your ankle or calf—never directly on your knee.", "Bring your hands together at your chest if comfortable and look at one steady point.", "Hold for a few breaths, then change sides. Skip the balance challenge if it feels unsafe."], stepsHi: [
        "सहारे के लिए दीवार या कुर्सी के पास सीधे खड़े हों।",
        "एक पैर पर अपना वज़न डालें और उस घुटने को सहज रखें।",
        "दूसरे पैर को टखने या पिंडली पर रखें—घुटने पर सीधे कभी न रखें।",
        "सहज लगे तो हाथों को छाती के सामने जोड़ें और किसी स्थिर बिंदु पर नज़र रखें।",
        "कुछ साँसों तक इसी स्थिति में रहें, फिर दूसरी तरफ से दोहराएँ। असुरक्षित लगे तो संतुलन वाला यह अभ्यास छोड़ दें।"
      ], },
  { id: "neck-release", title: "Easy Neck Release", hindi: "गर्दन को आराम", type: "Desk reset", typeHi: "डेस्क से छोटा विराम", duration: "1 min", durationHi: "1 मिनट", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=85&w=1600&auto=format&fit=crop", description: "Let your shoulders soften after a long day.", descriptionHi: "लंबे दिन के बाद कंधों को आराम दें।", steps: ["Sit or stand comfortably with your shoulders relaxed.", "Keep your face forward and slowly tilt one ear toward its shoulder.", "Hold for 2–3 easy breaths without pulling your head.", "Return to centre and repeat on the other side.", "Make small, pain-free movements only; stop if you feel pain, tingling or dizziness."], stepsHi: [
        "कंधों को ढीला रखते हुए आराम से बैठें या खड़े हों।",
        "चेहरा सामने रखें और धीरे-धीरे एक कान को उसी तरफ के कंधे की ओर झुकाएँ।",
        "सिर को खींचे बिना 2–3 सहज साँसों तक इसी स्थिति में रहें।",
        "सिर को वापस बीच में लाएँ और दूसरी तरफ दोहराएँ।",
        "केवल छोटे और दर्दरहित मूवमेंट करें। दर्द, झनझनाहट या चक्कर आने पर रुक जाएँ।"
      ], },
  { id: "legs-up-wall", title: "Legs Up the Wall", hindi: "दीवार के सहारे पैर", type: "Unwind", typeHi: "आराम", duration: "3 min", durationHi: "3 मिनट", image: "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?q=85&w=1600&auto=format&fit=crop", description: "Pause and give yourself a quiet moment.", descriptionHi: "रुकें और खुद को शांत पल दें।", steps: ["Sit sideways close to a wall, with a folded blanket nearby if needed.", "Lower your upper body to the floor as you gently swing your legs up the wall.", "Move farther from the wall if your hamstrings feel strained.", "Rest your arms by your sides and breathe naturally.", "Stay only while comfortable, then bend your knees and roll gently onto your side to get up. Avoid this pose if it is unsuitable for your medical condition."], stepsHi: [
        "दीवार के पास करवट लेकर बैठें। ज़रूरत हो तो पास में एक मुड़ा हुआ कंबल रखें।",
        "धीरे-से शरीर को फ़र्श पर लिटाएँ और पैरों को दीवार के सहारे ऊपर ले जाएँ।",
        "अगर जाँघों के पीछे खिंचाव महसूस हो, तो दीवार से थोड़ा दूर खिसक जाएँ।",
        "हाथों को शरीर के बगल में आराम से रखें और स्वाभाविक रूप से साँस लेते रहें।",
        "जब तक सहज लगे, इसी स्थिति में रहें। फिर घुटनों को मोड़ें, धीरे से करवट लें और उठें। यदि आपकी स्वास्थ्य स्थिति के लिए यह आसन उपयुक्त नहीं है, तो इसे न करें।"
      ], },
  { id: "cat-cow", title: "Cat–Cow Stretch", hindi: "मार्जरी आसन", type: "Gentle stretch", typeHi: "हल्का स्ट्रेच", duration: "2 min", durationHi: "2 मिनट", image: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=85&w=1600&auto=format&fit=crop", description: "Move slowly with the rhythm of your breath.", descriptionHi: "साँसों की लय के साथ धीरे-धीरे हिलें।", steps: ["Come onto hands and knees, with wrists under shoulders and knees under hips.", "As you breathe in, gently lift your chest and tailbone without forcing your back.", "As you breathe out, round your spine softly and let your head lower naturally.", "Repeat slowly for 5–8 comfortable cycles.", "Keep the movement small and stop if your wrists, neck or back hurt."], stepsHi: [
        "हाथों और घुटनों के बल आएँ। कलाइयाँ कंधों के नीचे और घुटने कूल्हों के नीचे रखें।",
        "साँस लेते समय पीठ पर ज़ोर डाले बिना छाती और रीढ़ के निचले हिस्से को धीरे-से ऊपर उठाएँ।",
        "साँस छोड़ते समय रीढ़ को धीरे से गोल करें और सिर को स्वाभाविक रूप से नीचे आने दें।",
        "आराम से 5–8 बार धीरे-धीरे दोहराएँ।",
        "मूवमेंट छोटा रखें और कलाइयों, गर्दन या पीठ में दर्द होने पर रुक जाएँ।"
      ], },
  { id: "mindful-walking", title: "Mindful Walking", hindi: "ध्यान से चलना", type: "Reset outdoors", typeHi: "बाहर एक नया विराम", duration: "5 min", durationHi: "5 मिनट", image: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=85&w=1600&auto=format&fit=crop", description: "Notice each step and the world around you.", descriptionHi: "हर कदम और आसपास की चीज़ों पर ध्यान दें।", steps: ["Choose a safe, familiar path and walk at an easy pace.", "Notice the feeling of your feet touching the ground.", "Let your arms move naturally and keep breathing normally.", "Gently notice sounds, colours and the air around you.", "When your mind wanders, return your attention to the next few steps without judging yourself."], stepsHi: [
        "एक सुरक्षित और परिचित रास्ता चुनें और आरामदायक गति से चलें।",
        "ज़मीन पर पड़ते अपने पैरों के स्पर्श को महसूस करें।",
        "हाथों को स्वाभाविक रूप से हिलने दें और सामान्य रूप से साँस लेते रहें।",
        "आसपास की आवाज़ों, रंगों और हवा को सहजता से महसूस करें।",
        "जब ध्यान भटके, तो खुद को दोष दिए बिना अगले कुछ कदमों पर ध्यान वापस लाएँ।"
      ], },
  { id: "savasana", title: "Savasana", hindi: "शवासन", type: "Deep rest", typeHi: "गहरा आराम", duration: "3 min", durationHi: "3 मिनट", image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=85&w=1600&auto=format&fit=crop", description: "Lie comfortably and let your body rest.", descriptionHi: "आराम से लेटें और शरीर को विश्राम दें।", steps: ["Lie on your back on a comfortable mat or bed.", "Let your legs rest naturally apart and arms rest by your sides.", "Adjust a pillow under your head or knees if that feels better.", "Soften your face and let your breathing return to its natural rhythm.", "Rest for a few minutes, then wiggle your fingers and toes and roll onto your side before sitting up."], stepsHi: [
        "आरामदायक मैट या बिस्तर पर पीठ के बल लेट जाएँ।",
        "पैरों को स्वाभाविक रूप से थोड़ा अलग रखें और हाथों को शरीर के बगल में रखें।",
        "आराम लगे तो सिर या घुटनों के नीचे तकिया रख लें।",
        "चेहरे की मांसपेशियों को ढीला छोड़ें और साँसों को उनकी स्वाभाविक गति में लौटने दें।",
        "कुछ मिनट आराम करें। फिर उँगलियों और पैरों की उँगलियों को धीरे-से हिलाएँ, करवट लें और उसके बाद बैठें।"
      ], }
];

const moods = [
  { label: "Low", emoji: "😔", value: 2, color: "#ffec9e" },
  { label: "Meh", emoji: "😕", value: 4, color: "#ffdfb5" },
  { label: "Okay", emoji: "😐", value: 6, color: "#ffbb70" },
  { label: "Good", emoji: "🙂", value: 8, color: "#ffd1a0" },
  { label: "Great", emoji: "😁", value: 10, color: "#ed9455" },
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

function MindfulPracticePage() {
  const { practiceId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [language] = useLanguage();
  const hi = language === "hi";
  const practice = mindfulPractices.find((item) => item.id === practiceId);

  if (!practice) {
    return <main className="practice-page"><button className="practice-back" onClick={() => navigate("/dashboard")}>← {hi ? "डैशबोर्ड पर वापस" : "Back to dashboard"}</button><h1>{hi ? "अभ्यास नहीं मिला" : "Practice not found"}</h1></main>;
  }

  const steps = hi ? (practice.stepsHi || practice.steps) : practice.steps;
  return (
    <main className="practice-page">
      <button className="practice-back" onClick={() => navigate("/dashboard")}>← {hi ? "डैशबोर्ड पर वापस" : "Back to dashboard"}</button>
      <div className="practice-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(18,35,25,.72), rgba(18,35,25,.08)), url("${practice.image}")` }}>
        <span className="practice-kicker">{hi ? "आपका निर्देशित अभ्यास" : "YOUR GUIDED PRACTICE"} · {hi ? practice.durationHi : practice.duration}</span>
        <h1>{hi ? practice.hindi : practice.title}</h1>
        <p>{hi ? practice.descriptionHi : practice.description}</p>
      </div>
      <section className="practice-instructions">
        <div className="practice-progress-row">
          <span>{hi ? `कदम ${step + 1} / ${steps.length}` : `STEP ${step + 1} OF ${steps.length}`}</span>
          <span>{Math.round(((step + 1) / steps.length) * 100)}%</span>
        </div>
        <div className="practice-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
        <div className="practice-step-number">{String(step + 1).padStart(2, "0")}</div>
        <h2>{hi ? "धीरे-धीरे करें" : "Take it one step at a time"}</h2>
        <p className="practice-step-text">{steps[step]}</p>
        <div className="practice-step-actions">
          <button className="practice-secondary" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>{hi ? "पिछला कदम" : "Previous step"}</button>
          {step < steps.length - 1
            ? <button className="practice-primary" onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))}>{hi ? "अगला कदम" : "Next step"} <ArrowRight size={16} /></button>
            : <button className="practice-primary" onClick={() => { setStep(0); navigate("/dashboard"); }}>{hi ? "अभ्यास पूरा · डैशबोर्ड" : "Finish practice · Dashboard"} <Check size={16} /></button>}
        </div>
        <p className="practice-safety">{hi ? "आराम से करें और दर्द या चक्कर आने पर रुक जाएँ। यह सामान्य wellness guidance है, चिकित्सा सलाह नहीं।" : "Move gently and stop if you feel pain, dizziness or discomfort. This is general wellness guidance, not medical advice."}</p>
      </section>
    </main>
  );
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
  const [language, setLanguage] = useLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const currentUser = (() => { try { return JSON.parse(localStorage.getItem("mindora-user") || "{}"); } catch { return {}; } })();
  const [bookPage, setBookPage] = useState(0);
  const t = (en, hi) => language === "hi" ? hi : en;

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

  function handleSearchSubmit(event) {
    if (event.key !== "Enter") return;
    const query = searchText.trim().toLowerCase();
    if (!query) return;
    const destinations = [
      { path: "/dashboard", keys: ["dashboard", "overview", "home", "डैशबोर्ड", "मुख्य पृष्ठ", "mood", "मूड", "check in", "check-in", "चेक इन", "चेक-इन"] },
      { path: "/journal", keys: ["journal", "diary", "diaries", "write", "writing", "notes", "डायरी", "जर्नल", "लिखना", "नोट्स"] },
      { path: "/insights", keys: ["insight", "insights", "chart", "average", "trend", "patterns", "history", "जानकारी", "मूड इतिहास", "चार्ट", "पैटर्न", "रुझान"] },
      { path: "/mindful-moments", keys: ["mindful", "breathing", "breath", "calm", "pause", "सुकून", "साँस", "सांस", "ध्यान", "विराम"] },
      { path: "/mindora-ai", keys: ["ai wellbeing", "wellbeing ai", "emotion companion", "coping suggestions", "ai", "भावनात्मक साथी", "सुझाव"] },
      { path: "/calm-corner", keys: ["calm corner", "comfort", "comfort box", "शांति", "सुकून कोना", "आराम"] },
      { path: "/profile", keys: ["profile", "account", "my profile", "प्रोफ़ाइल", "खाता"] },
      { path: "/settings", keys: ["settings", "setting", "सेटिंग", "सेटिंग्स"] },
    ];
    const match = destinations.find((item) => item.keys.some((key) => key.includes(query) || query.includes(key)));
    if (match) {
      if (match.path === "/settings") setShowSettings(true);
      else navigate(match.path);
      setSearchText("");
    } else {
      const activityMatch = filteredActivity.find((item) => item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query));
      if (activityMatch?.id.startsWith("journal-")) {
        navigate("/journal");
        setSearchText("");
      }
    }
  }

  function navigateTo(section) {
    setActiveNav(section);
    if (section === "Overview") navigate("/dashboard");
    if (section === "Journal") navigate("/journal");
    if (section === "Little Notes") navigate("/sticky-wall");
    if (section === "Insights") navigate("/insights");
    if (section === "Mindful moments") navigate("/mindful-moments");
    if (section === "AI wellbeing") navigate("/mindora-ai");
    if (section === "Calm Corner") navigate("/calm-corner");
    if (section === "My profile") navigate("/profile");
    if (section === "Play & Unwind") navigate("/games");
  }

  const navItems = [
    { label: t("Overview", "डैशबोर्ड"), icon: LayoutDashboard, routeLabel: "Overview" },
    { label: t("Journal", "डायरी"), icon: BookOpen, routeLabel: "Journal" },
    { label: t("Little Notes", "छोटे नोट्स"), icon: StickyNote, routeLabel: "Little Notes" },
    { label: t("Insights", "जानकारियाँ"), icon: BarChart3, routeLabel: "Insights" },
    { label: t("Mindful moments", "सुकून के पल"), icon: Wind, routeLabel: "Mindful moments" },
    { label: t("AI wellbeing", "AI वेलबीइंग"), icon: HeartHandshake, routeLabel: "AI wellbeing" },
    { label: t("Play & Unwind", "खेलें और सुकून पाएँ"), icon: Gamepad2, routeLabel: "Play & Unwind" },
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

        <div className="sidebar-label">{t("YOUR SPACE", "आपकी जगह")}</div>

        <nav className="sidebar-nav">
          {navItems.map(({ label, icon: Icon, routeLabel }) => (
            <button
              key={label}
              className={`nav-item ${activeNav === label ? "active" : ""}`}
              onClick={() => navigateTo(routeLabel)}
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
          <p>{t("You don\u2019t have to have it all figured out today.", "आज सब कुछ समझ लेना ज़रूरी नहीं है।")}</p>
          <span className="quote-caption">{t("A gentle reminder", "एक प्यारी-सी याद")}</span>
        </div>

        <button
          className="nav-item settings-link"
          onClick={() => setShowSettings((value) => !value)}
        >
          <Settings size={18} />
          <span>{t("Settings", "सेटिंग्स")}</span>
        </button>

        {showSettings && (
          <div className="settings-popover">
            <div className="settings-popover-heading">
              <strong>{t("Settings", "सेटिंग्स")}</strong>
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
              {darkMode ? t("Switch to light mode", "लाइट मोड करें") : t("Switch to dark mode", "डार्क मोड करें")}
            </button>
            <button className="theme-setting" onClick={() => { setShowSettings(false); navigate("/profile"); }}><Heart size={17}/>{t("My profile", "मेरी प्रोफ़ाइल")}</button><button className="theme-setting logout-setting" onClick={() => { localStorage.removeItem("mindora-token"); localStorage.removeItem("mindora-user"); setShowSettings(false); navigate("/login", { replace: true }); }}><X size={17}/>{t("Log out", "लॉग आउट")}</button>
          </div>
        )}

      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>{t("Your space", "आपकी जगह")}</span>
            <span className="breadcrumb-slash">/</span>
            <strong>{activeNav}</strong>
          </div>

          <div className="topbar-actions">
            <label className="search-box">
              <Search size={16} />
              <input
                type="search"
                placeholder={t("Search your space...", "अपनी जगह में खोजें...")}
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                onKeyDown={handleSearchSubmit}
                aria-label={t("Search your space", "अपनी जगह में खोजें")}
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

            <div className="language-picker">
              <button className="language-toggle" type="button" onClick={() => setShowLanguageMenu(value => !value)} aria-expanded={showLanguageMenu}>
                <span className="language-globe">文</span><span>{language === "hi" ? "हिन्दी" : "English"}</span><span className="language-chevron">⌄</span>
              </button>
              {showLanguageMenu && <div className="language-dropdown">
                <button type="button" className={language === "en" ? "selected" : ""} onClick={() => { setLanguage("en"); localStorage.setItem("mindora-language","en"); setShowLanguageMenu(false); }}>🇬🇧 English {language === "en" ? "✓" : ""}</button>
                <button type="button" className={language === "hi" ? "selected" : ""} onClick={() => { setLanguage("hi"); localStorage.setItem("mindora-language","hi"); setShowLanguageMenu(false); }}>🇮🇳 हिन्दी {language === "hi" ? "✓" : ""}</button>
              </div>}
            </div>
            <button className="icon-button theme-toggle" onClick={() => setDarkMode(value => !value)} aria-label="Toggle dark mode">
              {darkMode ? <Sun size={19} /> : <Moon size={19} />}
            </button>
          </div>

          {showNotifications && (
            <div className="notification-popover">
              <div className="popover-heading">
                <strong>{t("A little reminder", "एक छोटी-सी याद")}</strong>
                <button
                  className="plain-icon"
                  onClick={() => setShowNotifications(false)}
                  aria-label="Close notifications"
                >
                  <X size={16} />
                </button>
              </div>
              <p>{t("You deserve a moment of care today.", "आज आप देखभाल और सुकून के एक पल के हक़दार हैं।")}</p>
              <button
                className="text-action"
                onClick={() => {
                  setShowNotifications(false);
                  setShowBreathing(true);
                }}
              >{t("Take a breathing break", "साँसों के लिए एक विराम लें")}<ArrowRight size={14} />
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

              <h1>{t(getGreeting(), getGreeting() === "Good morning" ? "सुप्रभात" : getGreeting() === "Good afternoon" ? "नमस्कार" : "शुभ संध्या")}, <span>{t("beautiful soul.", "खूबसूरत इंसान।")}</span></h1>
              <p>
                {t("This is your space to pause, reflect, and reconnect with yourself. There's no right or wrong way to feel.", "यह आपकी जगह है—ठहरने, सोचने और खुद से फिर जुड़ने की। महसूस करने का कोई सही या गलत तरीका नहीं है।")}
              </p>
              <button
                className="welcome-button"
                onClick={() => {
                  document
                    .getElementById("daily-checkin")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
              >{t("Check in with yourself", "खुद का हाल जानें")}<ArrowRight size={16} />
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
              <span>{t("Small steps still move you forward.", "छोटे कदम भी आपको आगे बढ़ाते हैं।")}</span>
            </div>
          </section>

          <section
            className="section-block mood-section"
            id="daily-checkin"
          >
            <div className="section-heading mood-book-heading">
              <div>
                <div className="section-kicker">{t("A MOMENT JUST FOR YOU", "सिर्फ़ आपके लिए एक पल")}</div>
                <h2>{t("Your mood today", "आज आपका मूड")}</h2>
                <p>{t("Turn a page, take a breath, and meet yourself where you are.", "एक पन्ना पलटें, साँस लें और खुद को वैसे ही स्वीकारें जैसे आप हैं।")}</p>
              </div>
            </div>

            <div className="mood-book-wrap">
              <div className="mood-book">
                <div className="mood-book-spine" aria-hidden="true" />
                <div className="mood-book-page">
                  {bookPage === 0 ? (
                    <div className="book-cover-content">
                      <span className="book-eyebrow">{t("MINDORA · DAILY REFLECTION", "माइंडोरा · रोज़ाना आत्मचिंतन")}</span>
                      <span className="book-cover-icon"><BookOpen size={34} strokeWidth={1.4} /></span>
                      <h3>{t("Your mood today", "आज आपका मूड")}</h3>
                      <p>{t("There is no right way to feel.", "महसूस करने का कोई सही तरीका नहीं है।")}<br />{t("Let’s make a little room for yours.", "आपकी भावनाओं के लिए थोड़ी जगह बनाएँ।")}</p>
                      <span className="book-page-number">{t("A LITTLE CHECK-IN · 01", "एक छोटा हालचाल · ०१")}</span>
                    </div>
                  ) : bookPage <= moods.length ? (
                    <div className="mood-book-entry" key={bookPage}>
                      <span className="book-eyebrow">PAGE {String(bookPage + 1).padStart(2, "0")} · YOUR FEELINGS ARE WELCOME</span>
                      <span className="book-mood-emoji" style={{ backgroundColor: moods[bookPage - 1].color }}>
                        {moods[bookPage - 1].emoji}
                      </span>
                      <h3>{t(moods[bookPage - 1].label, ["कम", "ठीक-ठाक", "ठीक", "अच्छा", "बहुत अच्छा"][bookPage - 1])}</h3>
                      <p className="book-quote">
                        {[
                          t("You don’t have to be okay to deserve kindness. Take today one small breath at a time.", "आपको ठीक महसूस करना ज़रूरी नहीं, आप फिर भी दयालुता के हक़दार हैं। आज एक-एक साँस लेकर आगे बढ़ें।"),
                          t("It’s alright to feel a little out of sorts. You don’t need to have all the answers today.", "थोड़ा उलझा हुआ महसूस करना ठीक है। आज आपके पास हर जवाब होना ज़रूरी नहीं।"),
                          t("Some days are simply days. You can meet this moment exactly as it is.", "कुछ दिन बस ऐसे ही होते हैं। इस पल को जैसा है, वैसा स्वीकारें।"),
                          t("Let yourself enjoy the good that’s here, without needing to explain it or hold onto it.", "जो अच्छा है, उसे बिना समझाए या थामे रखने की कोशिश किए महसूस करें।"),
                          t("Let this moment be yours. You’re allowed to feel joy and let it gently fill your day.", "इस पल को अपना होने दें। आपको खुशी महसूस करने और उसे अपने दिन में जगह देने का हक़ है।")
                        ][bookPage - 1]}
                      </p>
                      <button
                        className={selectedMood?.label === moods[bookPage - 1].label ? "book-feeling-button selected" : "book-feeling-button"}
                        onClick={() => {
                          setSelectedMood(moods[bookPage - 1]);
                          setShowMoodMessage(false);
                        }}
                      >
                        {selectedMood?.label === moods[bookPage - 1].label ? <><Check size={16} />{t("This is how I feel", "मैं ऐसा ही महसूस कर रहा/रही हूँ")}</> : <>{t("This feels like me", "यह एहसास मेरा है")}<Heart size={16} /></>}
                      </button>
                      <span className="book-page-number">MINDORA · {String(bookPage + 1).padStart(2, "0")}</span>
                    </div>
                  ) : (
                    <div className="book-goodbye">
                      <span className="book-goodbye-heart"><Heart size={30} /></span>
                      <h3>{t("Thank you for showing up for yourself.", "खुद के लिए समय निकालने के लिए शुक्रिया।")}</h3>
                      <p>{t("Whatever today held, you made space for it.", "आज जो भी हुआ, आपने उसके लिए जगह बनाई।")}<br />{t("We’ll be right here when tomorrow comes.", "कल फिर मिलेंगे, हम यहीं होंगे।")}</p>
                      <span className="book-goodbye-script">{t("See you tomorrow.", "कल फिर मिलेंगे।")}</span>
                      <span className="book-page-number">{t("UNTIL NEXT TIME · 07", "अगली मुलाक़ात तक · ०७")}</span>
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
                  <ArrowRight className="book-back-arrow" size={16} />{t("Previous page", "पिछला पन्ना")}</button>
                {bookPage > 0 && bookPage <= moods.length && (
                  <button
                    className="book-save-button"
                    onClick={saveMood}
                    disabled={!selectedMood}
                    title={!selectedMood ? "Choose this feeling first" : "Save your daily check-in"}
                  >{t("Save check-in", "मूड सेव करें")}<Heart size={15} />
                  </button>
                )}
                <button
                  className="book-turn-button"
                  onClick={() => setBookPage((page) => page >= moods.length + 1 ? 0 : page + 1)}
                >
                  {bookPage === moods.length + 1 ? t("Read again", "फिर से पढ़ें") : t("Turn the page", "पन्ना पलटें")} <ArrowRight size={16} />
                </button>
              </div>
              {showMoodMessage && savedMood && (
                <div className="success-message book-success">
                  <Check size={16} />{t("Check-in saved. Thank you for taking a moment for yourself.", "आपका हाल सेव हो गया। खुद के लिए एक पल निकालने का शुक्रिया।")}</div>
              )}
            </div>
          </section>

          <section className="section-block">
            <div className="section-heading">
              <div>
                <div className="section-kicker">{t("LOOKING BACK WITH KINDNESS", "प्यार से पीछे मुड़कर देखें")}</div>
                <h2>{t("Your mood history", "आपके मूड का इतिहास")}</h2>
                <p>{t("Your previous check-ins, saved on this device.", "आपके पिछले मूड चेक-इन इस डिवाइस पर सेव हैं।")}</p>
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
                  <strong>{t("Your story starts with one check-in.", "आपकी कहानी एक छोटे से चेक-इन से शुरू होती है।")}</strong>
                  <p>{t("Choose a mood above and it will appear here.", "ऊपर अपना मूड चुनें, वह यहाँ दिखाई देगा।")}</p>
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
                <span className="stat-label">{t("Today's mood", "आज का मूड")}</span>
              </div>
              <div className="stat-value">
                {todayMood ? (
                  <>
                    <span className="stat-emoji">{todayMood.emoji}</span>
                    {todayMood.label}
                  </>
                ) : (
                  t("Not checked in", "अभी मूड नहीं बताया")
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
                <span className="stat-label">{t("Check-ins saved", "सेव किए गए चेक-इन")}</span>
              </div>
              <div className="stat-value">{moodHistory.length}</div>
              <span className="stat-footnote">{t("Every check-in counts.", "हर चेक-इन मायने रखता है।")}</span>
            </div>

            <div className="panel stat-card">
              <div className="stat-top">
                <span className="stat-icon lavender-icon">
                  <Heart size={19} />
                </span>
                <span className="stat-label">{t("Average mood", "औसत मूड")}</span>
              </div>
              <div className="stat-value">
                {averageMood}
                {averageMood !== "—" && (
                  <span className="stat-suffix"> / 10</span>
                )}
              </div>
              <span className="stat-footnote">{t("A reflection, not a rating.", "यह आत्मचिंतन है, कोई रेटिंग नहीं।")}</span>
            </div>
          </section>

          <section className="section-block" id="mood-insights">
            <div className="section-heading">
              <div>
                <div className="section-kicker">{t("GENTLE SELF-AWARENESS", "खुद को प्यार से समझें")}</div>
                <h2>{t("Your mood, over time", "समय के साथ आपका मूड")}</h2>
                <p>{t("Notice patterns without judging yourself.", "बिना खुद को आँके अपने मूड के पैटर्न समझें।")}</p>
              </div>
              <span className="step-label">
                <BarChart3 size={14} />{t("Mood insights", "मूड की जानकारी")}</span>
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
                          stopColor="#ed9455"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor="#ed9455"
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
                      tick={{ fill: "#806b61", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 10]}
                      ticks={[0, 2, 4, 6, 8, 10]}
                      tick={{ fill: "#806b61", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #e7ebdf",
                        fontSize: 12,
                      }}
                      formatter={(value) => [`${value}/10`, t("Mood", "मूड")]}
                    />
                    <Area
                      type="monotone"
                      dataKey="mood"
                      stroke="#ed9455"
                      strokeWidth={2.5}
                      fill="url(#moodFill)"
                      activeDot={{
                        r: 5,
                        fill: "#ed9455",
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
                    : t("Example mood pattern", "मूड का उदाहरण")}
                </span>
              </div>
            </div>
          </section>

          <section className="mindful-movement-section">
            <div className="section-heading mindful-movement-heading">
              <div>
                <div className="section-kicker">{t("MOVE GENTLY, FEEL BETTER", "धीरे चलें, बेहतर महसूस करें")}</div>
                <h2>{t("A little space to unwind", "सुकून पाने के लिए एक छोटा-सा पल")}</h2>
                <p>{t("Explore gentle yoga and calming movements. Choose what feels right for you today.", "हल्के योग और मन को शांत करने वाली गतिविधियाँ चुनें। आज जो अच्छा लगे, वही करें।")}</p>
              </div>
            </div>
            <div className="mindful-focus-grid">
              {mindfulPractices.map((card, index) => (
                <button
                  type="button"
                  className="mindful-focus-card"
                  key={card.id}
                  style={{ "--focus-image": `url("${card.image}")`, "--focus-delay": `${index * 35}ms` }}
                  onClick={() => navigate(`/practice/${card.id}`)}
                  aria-label={`${card.title}, ${card.duration}`}
                >
                  <span className="mindful-card-content">
                    <span className="mindful-card-type">{t(card.type, card.typeHi)} · {t(card.duration, card.durationHi)}</span>
                    <strong>{t(card.title, card.hindi)}</strong>
                    <span className="mindful-card-description">{t(card.description, card.descriptionHi)}</span>
                    <span className="mindful-card-action">{t("Explore practice", "अभ्यास देखें")} <ArrowRight size={15} /></span>
                  </span>
                </button>
              ))}
            </div>
          </section>
          <footer className="app-footer">
            <span>
              <Heart size={13} /> {t("Made for your softer days.", "आपके सुकून भरे दिनों के लिए।")}
            </span>
            <span>{t("Your feelings deserve space.", "आपकी भावनाओं को जगह मिलनी चाहिए।")}</span>
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

function GlobalPagePreferences() {
  const location = useLocation();
  const [language, setLanguage] = useLanguage();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("mindora-theme") === "dark");
  const [open, setOpen] = useState(false);
  const hi = language === "hi";
  // The landing page already has its own header; hide only this global duplicate there.
  useEffect(() => {
    // Landing and dashboard already provide their own language/theme controls.
    // Don't let this global component overwrite their selected settings.
    if (location.pathname === "/" || location.pathname === "/dashboard") return;
    localStorage.setItem("mindora-language", language);
    localStorage.setItem("mindora-theme", darkMode ? "dark" : "light");
    document.documentElement.dataset.mindoraTheme = darkMode ? "dark" : "light";
    document.documentElement.dataset.mindoraLanguage = language;
  }, [location.pathname, language, darkMode]);
  if (location.pathname === "/" || location.pathname === "/dashboard") return null;
  return <div className="global-page-preferences">
    <label><span>{hi ? "भाषा" : "Language"}</span><select aria-label={hi ? "भाषा" : "Language"} value={language} onChange={e => setLanguage(e.target.value)}><option value="en">English</option><option value="hi">हिन्दी</option></select></label>
    <button type="button" onClick={() => setDarkMode(v => !v)}>{darkMode ? <Sun size={16}/> : <Moon size={16}/>}<span>{darkMode ? (hi ? "लाइट मोड" : "Light mode") : (hi ? "डार्क मोड" : "Dark mode")}</span></button>
  </div>;
}

function App() {
  return (
    <BrowserRouter>
      <GlobalPagePreferences />
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Account pages */}
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="register" />} />

        {/* Main dashboard — existing features preserved */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/practice/:practiceId" element={<SharedSidebarLayout><MindfulPracticePage /></SharedSidebarLayout>} />
        <Route path="/journal" element={<SharedSidebarLayout><JournalPage /></SharedSidebarLayout>} />
        <Route path="/insights" element={<SharedSidebarLayout><InsightsPage /></SharedSidebarLayout>} />
        <Route path="/mindful-moments" element={<SharedSidebarLayout><MindfulMomentsPage /></SharedSidebarLayout>} />
        <Route path="/sticky-wall" element={<SharedSidebarLayout><StickyNoteWall /></SharedSidebarLayout>} />
        <Route path="/mood-heatmap" element={<Navigate to="/dashboard" replace />} />
        <Route path="/profile" element={<SharedSidebarLayout><ProfilePage /></SharedSidebarLayout>} />
        <Route path="/games" element={<SharedSidebarLayout><GamesZone /></SharedSidebarLayout>} />

        {/* Additive AI wellbeing tools */}
        <Route path="/mindora-ai" element={<SharedSidebarLayout><MindoraAI /></SharedSidebarLayout>} />

        {/* Mindora wellness pages */}
        <Route path="/calm-corner" element={<SharedSidebarLayout><CalmCorner /></SharedSidebarLayout>} />
        <Route path="/inner-garden" element={<SharedSidebarLayout><InnerGarden /></SharedSidebarLayout>} />
        <Route path="/soundscape" element={<SharedSidebarLayout><MoodSoundscape /></SharedSidebarLayout>} />
        <Route
          path="/comfort-box"
          element={<SharedSidebarLayout><LittleComfortBox /></SharedSidebarLayout>}
        />

        {/* Fallback for unknown routes */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;