import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ArrowRight, Gauge, Volume2 } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
//  AVATAR CATALOGUE  — 6 diverse child-explorer portraits via DiceBear (transparent bg)
// ═══════════════════════════════════════════════════════════════════════════
const BASE = "https://api.dicebear.com/7.x/adventurer/svg";
const AVATAR_OPTIONS = [
  { id: "1", url: `${BASE}?seed=Mia&backgroundColor=transparent`   },
  { id: "2", url: `${BASE}?seed=Felix&backgroundColor=transparent` },
  { id: "3", url: `${BASE}?seed=Luna&backgroundColor=transparent`  },
  { id: "4", url: `${BASE}?seed=Omar&backgroundColor=transparent`  },
  { id: "5", url: `${BASE}?seed=Zara&backgroundColor=transparent`  },
  { id: "6", url: `${BASE}?seed=Kai&backgroundColor=transparent`   },
];

/** HUB + passport + photo journal — shared violet → purple → pink → coral → gold magic sky */
const MAGIC_BOOK_GRADIENT =
  "linear-gradient(160deg, #1a0533 0%, #3b0f6e 22%, #6d2fa0 44%, #c2549a 64%, #f4845f 82%, #fcd38a 100%)";

// ─── Reusable Avatar component — always reads from localStorage ──────────
function Avatar({ size = 60, className = "" }) {
  const url = localStorage.getItem("kidAvatar") || AVATAR_OPTIONS[0].url;
  return (
    <img
      src={url}
      alt="Your explorer"
      className={`rounded-full object-cover border-4 border-white shadow-xl ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  SPEECH ENGINE
// ═══════════════════════════════════════════════════════════════════════════
function useSpeech() {
  const [subtitle, setSubtitle] = useState("");
  const [lastSpokenText, setLastSpokenText] = useState("");
  const lastSpokenRef = useRef("");

  useEffect(() => {
    const load = () => window.speechSynthesis.getVoices();
    load();
    window.speechSynthesis.addEventListener?.("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", load);
      window.speechSynthesis.cancel();
    };
  }, []);

  const getBestVoice = useCallback(() => {
    const list = window.speechSynthesis.getVoices();
    for (const name of [
      "Microsoft Zira", "Microsoft Jenny", "Google UK English Female",
      "Samantha", "Victoria", "Karen", "Moira", "Tessa",
    ]) {
      const v = list.find((v) => v.name.includes(name));
      if (v) return v;
    }
    const f = list.find(
      (v) => v.lang?.startsWith("en") && /female|woman|girl|zira|jenny/i.test(v.name ?? "")
    );
    return f || list.find((v) => v.lang === "en-US") || list.find((v) => v.lang?.startsWith("en")) || list[0];
  }, []);

  const speak = useCallback(
    (text, onDone) => {
      if (!text) return;
      lastSpokenRef.current = text;
      setLastSpokenText(text);
      window.speechSynthesis.cancel();
      const fire = () => {
        const u = new SpeechSynthesisUtterance(text);
        const v = getBestVoice();
        if (v) u.voice = v;
        u.pitch = 1.3; u.rate = 0.82; u.volume = 1;
        u.onstart = () => setSubtitle(text);
        u.onend = () => { setSubtitle(""); onDone?.(); };
        u.onerror = () => { setSubtitle(""); onDone?.(); };
        window.speechSynthesis.speak(u);
      };
      window.speechSynthesis.getVoices().length > 0
        ? fire()
        : window.speechSynthesis.addEventListener("voiceschanged", function h() {
            fire();
            window.speechSynthesis.removeEventListener("voiceschanged", h);
          });
    },
    [getBestVoice]
  );

  const replay = useCallback(() => {
    if (lastSpokenRef.current) speak(lastSpokenRef.current);
  }, [speak]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setSubtitle("");
  }, []);

  return { subtitle, speak, stop, replay, lastSpokenText };
}

// ═══════════════════════════════════════════════════════════════════════════
//  SVG CHARACTER LIBRARY
// ═══════════════════════════════════════════════════════════════════════════

function PenguinSVG({ scale = 1, className = "" }) {
  return (
    <svg viewBox="0 0 80 110" width={80 * scale} height={110 * scale} className={className}>
      <ellipse cx="40" cy="74" rx="30" ry="34" fill="#1a1a2e" />
      <ellipse cx="40" cy="80" rx="19" ry="25" fill="#f0f8ff" />
      <circle cx="40" cy="33" r="24" fill="#1a1a2e" />
      <ellipse cx="40" cy="36" rx="15" ry="17" fill="#f0f8ff" />
      <circle cx="33" cy="29" r="5.5" fill="white" /><circle cx="47" cy="29" r="5.5" fill="white" />
      <circle cx="34" cy="29" r="3.5" fill="#111" /><circle cx="48" cy="29" r="3.5" fill="#111" />
      <circle cx="35" cy="28" r="1.2" fill="white" /><circle cx="49" cy="28" r="1.2" fill="white" />
      <polygon points="40,37 33,46 47,46" fill="#FF8C00" />
      <circle cx="26" cy="38" r="5" fill="#FFB6C1" opacity="0.45" />
      <circle cx="54" cy="38" r="5" fill="#FFB6C1" opacity="0.45" />
      <ellipse cx="11" cy="72" rx="10" ry="26" fill="#0d0d20" transform="rotate(-18 11 72)" />
      <ellipse cx="69" cy="72" rx="10" ry="26" fill="#0d0d20" transform="rotate(18 69 72)" />
      <ellipse cx="28" cy="107" rx="14" ry="6" fill="#FF8C00" />
      <ellipse cx="52" cy="107" rx="14" ry="6" fill="#FF8C00" />
    </svg>
  );
}

function SnowmanSVG({ className = "" }) {
  return (
    <svg viewBox="0 0 120 210" width="110" height="193" className={className}>
      <ellipse cx="60" cy="202" rx="40" ry="8" fill="#b0c8d8" opacity="0.35" />
      <circle cx="60" cy="164" r="38" fill="white" stroke="#d8eef8" strokeWidth="2" />
      <circle cx="60" cy="107" r="28" fill="white" stroke="#d8eef8" strokeWidth="2" />
      <circle cx="60" cy="60" r="22" fill="white" stroke="#d8eef8" strokeWidth="2" />
      <rect x="37" y="36" width="46" height="6" rx="2" fill="#2c3e50" />
      <rect x="43" y="12" width="34" height="26" rx="3" fill="#2c3e50" />
      <rect x="43" y="29" width="34" height="7" fill="#c0392b" />
      <circle cx="52" cy="54" r="4" fill="#2c3e50" /><circle cx="68" cy="54" r="4" fill="#2c3e50" />
      <circle cx="53" cy="53" r="1.5" fill="white" /><circle cx="69" cy="53" r="1.5" fill="white" />
      <polygon points="60,59 54,70 66,70" fill="#FF8C00" />
      <circle cx="50" cy="68" r="2.5" fill="#2c3e50" /><circle cx="56" cy="72" r="2.5" fill="#2c3e50" />
      <circle cx="64" cy="72" r="2.5" fill="#2c3e50" /><circle cx="70" cy="68" r="2.5" fill="#2c3e50" />
      <circle cx="43" cy="62" r="7" fill="#FFB6C1" opacity="0.4" />
      <circle cx="77" cy="62" r="7" fill="#FFB6C1" opacity="0.4" />
      <path d="M 34 85 Q 60 77 86 85" fill="none" stroke="#e74c3c" strokeWidth="9" strokeLinecap="round" />
      <path d="M 76 84 L 82 104 L 71 108" fill="none" stroke="#e74c3c" strokeWidth="7" strokeLinecap="round" />
      <circle cx="60" cy="97" r="3.5" fill="#2c3e50" /><circle cx="60" cy="112" r="3.5" fill="#2c3e50" />
      <circle cx="60" cy="127" r="3.5" fill="#2c3e50" />
      <line x1="32" y1="104" x2="2" y2="82" stroke="#8B5E3C" strokeWidth="5" strokeLinecap="round" />
      <line x1="88" y1="104" x2="118" y2="82" stroke="#8B5E3C" strokeWidth="5" strokeLinecap="round" />
      <line x1="10" y1="88" x2="2" y2="75" stroke="#8B5E3C" strokeWidth="3" strokeLinecap="round" />
      <line x1="10" y1="88" x2="4" y2="98" stroke="#8B5E3C" strokeWidth="3" strokeLinecap="round" />
      <line x1="110" y1="88" x2="118" y2="75" stroke="#8B5E3C" strokeWidth="3" strokeLinecap="round" />
      <line x1="110" y1="88" x2="116" y2="98" stroke="#8B5E3C" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// Fluffy polar bear
function PolarBearSVG({ scale = 1, className = "" }) {
  return (
    <svg viewBox="0 0 100 120" width={100 * scale} height={120 * scale} className={className}>
      {/* Ground shadow */}
      <ellipse cx="50" cy="116" rx="36" ry="6" fill="#00000018" />
      {/* Back legs */}
      <ellipse cx="32" cy="98" rx="12" ry="17" fill="#e8f4fc" />
      <ellipse cx="68" cy="98" rx="12" ry="17" fill="#dceef8" />
      {/* Feet */}
      <ellipse cx="32" cy="113" rx="13" ry="5" fill="#d0e8f6" />
      <ellipse cx="68" cy="113" rx="13" ry="5" fill="#c8e2f2" />
      {/* Body */}
      <ellipse cx="50" cy="80" rx="30" ry="26" fill="#f0f8ff" />
      <ellipse cx="50" cy="78" rx="24" ry="20" fill="#f8fcff" />
      {/* Front arms */}
      <ellipse cx="19" cy="76" rx="11" ry="17" fill="#e8f4fc" transform="rotate(-14 19 76)" />
      <ellipse cx="81" cy="76" rx="11" ry="17" fill="#dceef8" transform="rotate(14 81 76)" />
      {/* Paws */}
      <ellipse cx="14" cy="88" rx="9" ry="5" fill="#d8eef8" transform="rotate(-10 14 88)" />
      <ellipse cx="86" cy="88" rx="9" ry="5" fill="#d0e8f4" transform="rotate(10 86 88)" />
      {/* Head */}
      <circle cx="50" cy="46" r="26" fill="#f0f8ff" />
      <circle cx="50" cy="46" r="20" fill="#f8fcff" />
      {/* Ears */}
      <circle cx="29" cy="25" r="9" fill="#e8f4fc" />
      <circle cx="29" cy="25" r="5" fill="#f0f8ff" />
      <circle cx="71" cy="25" r="9" fill="#dceef8" />
      <circle cx="71" cy="25" r="5" fill="#f8fcff" />
      {/* Snout */}
      <ellipse cx="50" cy="54" rx="13" ry="9" fill="#e0eef8" />
      {/* Eyes */}
      <circle cx="40" cy="42" r="4.5" fill="#1a2a3a" />
      <circle cx="60" cy="42" r="4.5" fill="#1a2a3a" />
      <circle cx="38" cy="40" r="1.6" fill="white" />
      <circle cx="58" cy="40" r="1.6" fill="white" />
      {/* Nose */}
      <ellipse cx="50" cy="51" rx="4.5" ry="3" fill="#2a3a4a" />
      {/* Smile */}
      <path d="M 44 56 Q 50 61 56 56" fill="none" stroke="#2a3a4a" strokeWidth="1.4" strokeLinecap="round" />
      {/* Cheeks */}
      <circle cx="35" cy="50" r="5.5" fill="#b8d8f0" opacity="0.4" />
      <circle cx="65" cy="50" r="5.5" fill="#b8d8f0" opacity="0.4" />
    </svg>
  );
}

function IglooSVG() {
  return (
    <svg viewBox="0 0 220 150" width="220" height="150">
      <ellipse cx="110" cy="144" rx="95" ry="10" fill="#b0c8d8" opacity="0.3" />
      <path d="M 10 120 A 100 100 0 0 1 210 120 Z" fill="#e8f4fc" stroke="#c4dced" strokeWidth="2" />
      <path d="M 14 100 Q 110 89 206 100" fill="none" stroke="#c4dced" strokeWidth="1.5" />
      <path d="M 24 80 Q 110 67 196 80" fill="none" stroke="#c4dced" strokeWidth="1.5" />
      <path d="M 42 60 Q 110 46 178 60" fill="none" stroke="#c4dced" strokeWidth="1.5" />
      <path d="M 65 42 Q 110 30 155 42" fill="none" stroke="#c4dced" strokeWidth="1.5" />
      <line x1="65" y1="100" x2="61" y2="120" stroke="#c4dced" strokeWidth="1" />
      <line x1="110" y1="100" x2="110" y2="120" stroke="#c4dced" strokeWidth="1" />
      <line x1="155" y1="100" x2="159" y2="120" stroke="#c4dced" strokeWidth="1" />
      <path d="M 64 120 L 60 94 Q 110 76 160 94 L 156 120 Z" fill="#d0e8f6" stroke="#c4dced" strokeWidth="1.5" />
      <ellipse cx="110" cy="108" rx="32" ry="22" fill="#1a3a5c" />
      <ellipse cx="110" cy="115" rx="28" ry="12" fill="#0f2840" />
      <ellipse cx="110" cy="121" rx="100" ry="14" fill="#f0f8ff" stroke="#dceef8" strokeWidth="1" />
      <polygon points="30,120 35,136 24,136" fill="#d0ecf8" />
      <polygon points="55,116 60,130 50,130" fill="#d0ecf8" />
      <polygon points="165,116 170,130 160,130" fill="#d0ecf8" />
      <polygon points="188,120 193,136 183,136" fill="#d0ecf8" />
    </svg>
  );
}

function GiraffeSVG({ scale = 1, className = "" }) {
  return (
    <svg viewBox="0 0 130 300" width={130 * scale} height={300 * scale} className={className}>
      <ellipse cx="65" cy="298" rx="50" ry="8" fill="#00000018" />
      <rect x="68" y="218" width="20" height="76" rx="9" fill="#C88A0A" />
      <rect x="90" y="222" width="20" height="72" rx="9" fill="#B07808" />
      <rect x="22" y="213" width="20" height="82" rx="9" fill="#C88A0A" />
      <rect x="44" y="216" width="20" height="79" rx="9" fill="#B07808" />
      <rect x="22" y="288" width="20" height="9" rx="4" fill="#4a2e00" />
      <rect x="44" y="288" width="20" height="9" rx="4" fill="#4a2e00" />
      <rect x="68" y="286" width="20" height="9" rx="4" fill="#4a2e00" />
      <rect x="90" y="286" width="20" height="9" rx="4" fill="#4a2e00" />
      <ellipse cx="62" cy="208" rx="48" ry="36" fill="#DDA020" />
      <ellipse cx="52" cy="190" rx="13" ry="9" fill="#B07808" opacity="0.55" />
      <ellipse cx="78" cy="205" rx="11" ry="8" fill="#B07808" opacity="0.55" />
      <ellipse cx="38" cy="210" rx="9" ry="7" fill="#B07808" opacity="0.55" />
      <ellipse cx="65" cy="228" rx="12" ry="8" fill="#B07808" opacity="0.55" />
      <path d="M 104 205 Q 120 225 112 248" fill="none" stroke="#C88A0A" strokeWidth="5" strokeLinecap="round" />
      <line x1="112" y1="248" x2="106" y2="258" stroke="#8B5E0A" strokeWidth="3" strokeLinecap="round" />
      <line x1="112" y1="248" x2="116" y2="260" stroke="#8B5E0A" strokeWidth="3" strokeLinecap="round" />
      <rect x="46" y="50" width="34" height="165" rx="17" fill="#DDA020" />
      <rect x="50" y="78" width="14" height="20" rx="7" fill="#B07808" opacity="0.5" />
      <rect x="64" y="115" width="13" height="18" rx="6" fill="#B07808" opacity="0.5" />
      <rect x="49" y="150" width="15" height="20" rx="7" fill="#B07808" opacity="0.5" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <ellipse key={i} cx="45" cy={65 + i * 20} rx="5" ry="8" fill="#B07808" />
      ))}
      <ellipse cx="63" cy="40" rx="27" ry="22" fill="#DDA020" />
      <ellipse cx="78" cy="50" rx="18" ry="12" fill="#C88A0A" />
      <ellipse cx="91" cy="52" rx="3" ry="2" fill="#7a4e00" />
      <ellipse cx="83" cy="55" rx="3" ry="2" fill="#7a4e00" />
      <circle cx="52" cy="33" r="9" fill="white" />
      <circle cx="53" cy="33" r="6" fill="#2c1600" />
      <circle cx="51" cy="31" r="2" fill="white" />
      <line x1="45" y1="26" x2="43" y2="22" stroke="#2c1600" strokeWidth="1.5" />
      <line x1="50" y1="24" x2="49" y2="20" stroke="#2c1600" strokeWidth="1.5" />
      <line x1="56" y1="24" x2="56" y2="20" stroke="#2c1600" strokeWidth="1.5" />
      <rect x="50" y="13" width="8" height="20" rx="4" fill="#8B5E0A" />
      <circle cx="54" cy="13" r="5" fill="#6B4510" />
      <rect x="67" y="11" width="8" height="22" rx="4" fill="#8B5E0A" />
      <circle cx="71" cy="11" r="5" fill="#6B4510" />
      <ellipse cx="39" cy="42" rx="9" ry="13" fill="#C88A0A" />
      <ellipse cx="39" cy="42" rx="5" ry="9" fill="#FFB6C1" opacity="0.45" />
    </svg>
  );
}

function BabyElephantSVG({ scale = 1, trunkDown = false, className = "" }) {
  const trunkPath = trunkDown
    ? "M 70 62 Q 75 95 68 118 Q 65 128 70 132"
    : "M 70 62 Q 78 75 82 90 Q 85 100 82 108";
  return (
    <svg viewBox="0 0 140 140" width={140 * scale} height={140 * scale} className={className}>
      <ellipse cx="70" cy="132" rx="50" ry="10" fill="#00000018" />
      <ellipse cx="70" cy="95" rx="42" ry="38" fill="#8B7355" />
      <ellipse cx="70" cy="92" rx="32" ry="28" fill="#A08060" />
      <ellipse cx="70" cy="48" rx="35" ry="32" fill="#8B7355" />
      <ellipse cx="70" cy="46" rx="28" ry="24" fill="#A08060" />
      <ellipse cx="38" cy="52" rx="18" ry="22" fill="#8B7355" />
      <ellipse cx="38" cy="52" rx="12" ry="16" fill="#9A7B5B" />
      <ellipse cx="102" cy="52" rx="18" ry="22" fill="#8B7355" />
      <ellipse cx="102" cy="52" rx="12" ry="16" fill="#9A7B5B" />
      <circle cx="58" cy="42" r="8" fill="white" />
      <circle cx="82" cy="42" r="8" fill="white" />
      <circle cx="60" cy="42" r="5" fill="#2c1600" />
      <circle cx="84" cy="42" r="5" fill="#2c1600" />
      <circle cx="58" cy="40" r="2" fill="white" />
      <circle cx="82" cy="40" r="2" fill="white" />
      <path d={trunkPath} fill="none" stroke="#8B7355" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      <path d={trunkPath} fill="none" stroke="#A08060" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="42" y="108" width="18" height="32" rx="8" fill="#7A6348" />
      <rect x="80" y="108" width="18" height="32" rx="8" fill="#7A6348" />
      <rect x="55" y="112" width="16" height="28" rx="7" fill="#7A6348" />
      <rect x="87" y="112" width="16" height="28" rx="7" fill="#7A6348" />
    </svg>
  );
}

function FullElephantSVG({ scale = 1, trunkDown = false, className = "" }) {
  const trunkPath = trunkDown
    ? "M 85 90 Q 92 130 80 165 Q 72 180 85 188"
    : "M 85 90 Q 105 115 115 145 Q 120 165 110 175";
  return (
    <svg viewBox="0 0 220 230" width={220 * scale} height={230 * scale} className={className}>
      {/* Shadow */}
      <ellipse cx="110" cy="218" rx="90" ry="12" fill="#00000020" />
      {/* Back legs */}
      <rect x="140" y="145" width="30" height="75" rx="12" fill="#6B5A48" />
      <rect x="165" y="145" width="26" height="70" rx="10" fill="#6B5A48" />
      {/* Body - large oval */}
      <ellipse cx="130" cy="120" rx="75" ry="55" fill="#8B7355" />
      <ellipse cx="130" cy="115" rx="65" ry="45" fill="#9A8060" />
      {/* Front legs */}
      <rect x="60" y="145" width="28" height="70" rx="12" fill="#7A6850" />
      <rect x="85" y="148" width="26" height="68" rx="10" fill="#7A6850" />
      {/* Feet */}
      <ellipse cx="74" cy="215" rx="18" ry="8" fill="#5A4A38" />
      <ellipse cx="98" cy="216" rx="16" ry="7" fill="#5A4A38" />
      <ellipse cx="155" cy="218" rx="18" ry="8" fill="#5A4A38" />
      <ellipse cx="178" cy="215" rx="16" ry="7" fill="#5A4A38" />
      {/* Tail */}
      <path d="M 200 110 Q 215 130 210 160 Q 208 172 214 178" fill="none" stroke="#7A6850" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="214" cy="180" rx="6" ry="8" fill="#5A4A38" />
      {/* Head */}
      <ellipse cx="70" cy="75" rx="50" ry="45" fill="#8B7355" />
      <ellipse cx="70" cy="72" rx="42" ry="38" fill="#9A8060" />
      {/* Left ear */}
      <ellipse cx="25" cy="70" rx="28" ry="40" fill="#8B7355" />
      <ellipse cx="25" cy="70" rx="20" ry="30" fill="#A89080" />
      {/* Right ear (behind head) */}
      <ellipse cx="110" cy="65" rx="22" ry="35" fill="#7A6348" />
      <ellipse cx="110" cy="65" rx="15" ry="26" fill="#8B7355" />
      {/* Eyes */}
      <circle cx="55" cy="62" r="10" fill="white" />
      <circle cx="90" cy="62" r="10" fill="white" />
      <circle cx="57" cy="62" r="6" fill="#2c1600" />
      <circle cx="92" cy="62" r="6" fill="#2c1600" />
      <circle cx="55" cy="60" r="2.5" fill="white" />
      <circle cx="90" cy="60" r="2.5" fill="white" />
      {/* Trunk */}
      <path d={trunkPath} fill="none" stroke="#8B7355" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
      <path d={trunkPath} fill="none" stroke="#9A8060" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      {/* Tusk */}
      <ellipse cx="45" cy="105" rx="4" ry="20" fill="#F5F0E6" transform="rotate(-20 45 105)" />
      <ellipse cx="100" cy="100" rx="4" ry="18" fill="#F5F0E6" transform="rotate(20 100 100)" />
    </svg>
  );
}

function LogSVG({ scale = 1, className = "" }) {
  return (
    <svg viewBox="0 0 140 55" width={140 * scale} height={55 * scale} className={className}>
      {/* Shadow */}
      <ellipse cx="70" cy="50" rx="62" ry="6" fill="#00000025" />
      {/* Main log body — cylindrical shape */}
      <rect x="10" y="14" width="120" height="28" rx="14" fill="#5D4037" />
      {/* Top highlight */}
      <rect x="12" y="16" width="116" height="12" rx="6" fill="#7B5544" />
      {/* Center wood grain */}
      <rect x="14" y="22" width="112" height="8" rx="4" fill="#6D4C41" />
      {/* Left end cap */}
      <ellipse cx="10" cy="28" rx="8" ry="14" fill="#4E342E" />
      <ellipse cx="10" cy="28" rx="5" ry="10" fill="#5D4037" />
      <ellipse cx="10" cy="28" rx="3" ry="6" fill="#795548" />
      {/* Right end cap */}
      <ellipse cx="130" cy="28" rx="8" ry="14" fill="#4E342E" />
      <ellipse cx="130" cy="28" rx="5" ry="10" fill="#5D4037" />
      <ellipse cx="130" cy="28" rx="3" ry="6" fill="#795548" />
      {/* Wood grain lines */}
      <path d="M 25 20 Q 50 17 80 20 Q 110 23 120 20" fill="none" stroke="#4E342E" strokeWidth="1.5" opacity="0.5" />
      <path d="M 20 32 Q 45 35 75 32 Q 105 29 125 32" fill="none" stroke="#4E342E" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

function BaobabSVG({ scale = 1 }) {
  return (
    <svg viewBox="0 0 140 230" width={140 * scale} height={230 * scale}>
      <ellipse cx="70" cy="226" rx="45" ry="8" fill="#00000018" />
      <path d="M 44 228 Q 28 212 12 220 Q 28 198 44 205 Z" fill="#7A5015" />
      <path d="M 96 228 Q 112 212 128 220 Q 112 198 96 205 Z" fill="#7A5015" />
      <path d="M 44 228 L 38 152 Q 50 108 70 100 Q 90 108 102 152 L 96 228 Z" fill="#9B6E20" />
      <path d="M 56 228 L 52 158 Q 58 124 64 112" fill="none" stroke="#7A5015" strokeWidth="2.5" opacity="0.5" />
      <path d="M 82 228 L 84 158 Q 78 124 73 112" fill="none" stroke="#7A5015" strokeWidth="2.5" opacity="0.5" />
      <ellipse cx="70" cy="62" rx="60" ry="48" fill="#4A8A3C" />
      <ellipse cx="42" cy="72" rx="30" ry="22" fill="#3D7A30" />
      <ellipse cx="98" cy="70" rx="28" ry="20" fill="#3D7A30" />
      <ellipse cx="70" cy="32" rx="28" ry="22" fill="#4A8A3C" />
      <ellipse cx="50" cy="48" rx="20" ry="16" fill="#5AA042" />
      <ellipse cx="90" cy="48" rx="18" ry="14" fill="#5AA042" />
    </svg>
  );
}

// Improved sled — metal runners, wooden slats, flag
function AntarcticaSledSVG({ avatarUrl }) {
  return (
    <div className="relative inline-block select-none">
      <svg viewBox="0 0 220 110" width="240" height="120">
        {/* Shadow */}
        <ellipse cx="110" cy="107" rx="88" ry="7" fill="#00000020" />
        {/* Runner blades — curved dark metal */}
        <path d="M 8 88 Q 20 72 55 76 Q 120 82 185 74 Q 205 70 214 80 L 210 92 Q 188 98 118 92 Q 48 97 12 96 Z" fill="#4a5a6a" />
        <path d="M 10 86 Q 50 78 120 82 Q 178 76 212 80" fill="none" stroke="#7a8a9a" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        {/* Second runner edge */}
        <path d="M 18 94 Q 55 88 120 90 Q 174 86 208 88" fill="none" stroke="#3a4a5a" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        {/* Wooden deck */}
        <rect x="28" y="50" width="164" height="30" rx="5" fill="#7a3e10" stroke="#5a2e08" strokeWidth="1.5" />
        {/* Slat lines */}
        {[48, 66, 84, 102, 120, 138, 156, 174].map((x, i) => (
          <line key={i} x1={x} y1="52" x2={x} y2="78" stroke="#5a2e08" strokeWidth="1.2" opacity="0.5" />
        ))}
        {/* Top highlight on deck */}
        <rect x="28" y="50" width="164" height="5" rx="3" fill="#9a5020" opacity="0.6" />
        {/* Gold side rails */}
        <rect x="24" y="46" width="172" height="7" rx="3" fill="#C8920A" stroke="#AA7A08" strokeWidth="1.5" />
        <rect x="24" y="71" width="172" height="7" rx="3" fill="#C8920A" stroke="#AA7A08" strokeWidth="1.5" />
        {/* Vertical struts */}
        {[40, 78, 116, 154, 192].map((x, i) => (
          <rect key={i} x={x - 3} y="77" width="6" height="14" rx="2" fill="#8B5E3C" />
        ))}
        {/* Red cushion */}
        <rect x="52" y="42" width="112" height="18" rx="7" fill="#c0392b" stroke="#a93226" strokeWidth="1.5" />
        <rect x="58" y="45" width="100" height="10" rx="5" fill="#e74c3c" opacity="0.75" />
        {/* Front bow handle */}
        <path d="M 24 54 Q 10 48 6 40 Q 5 32 12 30" fill="none" stroke="#8B5E3C" strokeWidth="5" strokeLinecap="round" />
        <circle cx="12" cy="30" r="4" fill="#6B4510" />
        {/* Flag pole + triangle */}
        <line x1="174" y1="46" x2="174" y2="20" stroke="#6B4510" strokeWidth="2.5" strokeLinecap="round" />
        <polygon points="174,20 194,27 174,34" fill="#e74c3c" />
      </svg>
      {/* Avatar in center of cushion */}
      <div className="absolute flex items-center justify-center" style={{ top: 4, left: 74, width: 78, height: 46 }}>
        <img src={avatarUrl} alt="explorer"
          className="rounded-full object-cover border-2 border-amber-200 shadow-lg"
          style={{ width: 42, height: 42 }} />
      </div>
    </div>
  );
}

function SafariJeepSVG({ avatarUrl }) {
  return (
    <div className="relative inline-block select-none">
      <svg viewBox="0 0 210 130" width="230" height="143">
        <ellipse cx="52" cy="124" rx="28" ry="8" fill="#00000020" />
        <ellipse cx="160" cy="124" rx="28" ry="8" fill="#00000020" />
        <rect x="12" y="55" width="186" height="52" rx="12" fill="#C8920A" />
        <rect x="30" y="18" width="120" height="44" rx="10" fill="#D4A828" />
        {/* Windshield/driver cabin - left side */}
        <rect x="40" y="22" width="48" height="30" rx="6" fill="#87CEEB" opacity="0.78" />
        <rect x="100" y="26" width="40" height="24" rx="5" fill="#87CEEB" opacity="0.75" />
        {/* Seat back visible behind driver */}
        <rect x="38" y="28" width="28" height="22" rx="4" fill="#8B6914" opacity="0.6" />
        <rect x="30" y="14" width="120" height="6" rx="3" fill="#AA7A08" />
        <line x1="55" y1="14" x2="55" y2="10" stroke="#888" strokeWidth="3" />
        <line x1="90" y1="14" x2="90" y2="10" stroke="#888" strokeWidth="3" />
        <line x1="125" y1="14" x2="125" y2="10" stroke="#888" strokeWidth="3" />
        <rect x="48" y="7" width="84" height="5" rx="2" fill="#aaa" />
        <line x1="92" y1="55" x2="92" y2="107" stroke="#AA7A08" strokeWidth="2" />
        <rect x="74" y="77" width="13" height="4" rx="2" fill="#AA7A08" />
        <rect x="4" y="70" width="14" height="22" rx="6" fill="#AA7A08" />
        <rect x="192" y="70" width="14" height="22" rx="6" fill="#AA7A08" />
        <rect x="12" y="68" width="186" height="8" fill="#AA7A08" rx="2" />
        <circle cx="15" cy="66" r="7" fill="#FFF5CC" opacity="0.9" />
        <circle cx="195" cy="66" r="7" fill="#FFE4B5" opacity="0.8" />
        <circle cx="52" cy="112" r="22" fill="#2c2c2c" />
        <circle cx="52" cy="112" r="13" fill="#444" />
        <circle cx="52" cy="112" r="5" fill="#777" />
        <circle cx="160" cy="112" r="22" fill="#2c2c2c" />
        <circle cx="160" cy="112" r="13" fill="#444" />
        <circle cx="160" cy="112" r="5" fill="#777" />
      </svg>
      {/* Avatar seated in jeep - positioned inside cabin with seat effect */}
      <div
        className="absolute flex items-end justify-center overflow-hidden"
        style={{
          top: 18,
          left: 72,
          width: 52,
          height: 50,
          transform: "perspective(120px) rotateY(-8deg)",
        }}
      >
        {/* Seat cushion shadow */}
        <div
          className="absolute bottom-0 left-0 right-0 rounded-t-full opacity-40"
          style={{ height: 8, background: "linear-gradient(to top, #5a4a2a, transparent)" }}
        />
        <img
          src={avatarUrl}
          alt="explorer"
          className="relative rounded-full object-cover border-2 border-amber-200 shadow-lg"
          style={{ width: 38, height: 38, marginBottom: 2 }}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function Sparkles({ count = 18 }) {
  const particles = useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      id: i, x: (Math.random() - 0.5) * 320, y: (Math.random() - 0.5) * 320,
      scale: 0.5 + Math.random(), duration: 0.6 + Math.random() * 0.8,
      delay: Math.random() * 0.3, rotate: Math.random() * 360,
    })),
    [count]
  );
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-50">
      {particles.map((p) => (
        <motion.div key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, scale: 0, rotate: 0 }}
          animate={{ opacity: [1, 1, 0], x: p.x, y: p.y, scale: [0, p.scale, 0], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
          className="absolute text-2xl">
          ✨
        </motion.div>
      ))}
    </div>
  );
}

function Confetti() {
  const pieces = useMemo(
    () => Array.from({ length: 55 }, (_, i) => ({
      id: i, x: Math.random() * 100,
      color: ["#FF6B6B","#4ECDC4","#FFE66D","#A78BFA","#F472B6","#34D399"][Math.floor(Math.random() * 6)],
      delay: Math.random() * 2, duration: 2 + Math.random() * 3,
      size: 6 + Math.random() * 8, rotation: Math.random() * 720,
    })),
    []
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <motion.div key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, rotate: 0, opacity: 1 }}
          animate={{ y: "110vh", rotate: p.rotation, opacity: [1, 1, 0.5] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
          className="absolute rounded-sm"
          style={{ width: p.size, height: p.size * 0.6, backgroundColor: p.color }}
        />
      ))}
    </div>
  );
}

function SubtitleBar({ text, dark = true }) {
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!text) { setDisplayed(""); setTyping(false); return; }
    setDisplayed("");
    setTyping(true);
    let i = 0;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(intervalRef.current); setTyping(false); }
    }, 32);
    return () => clearInterval(intervalRef.current);
  }, [text]);

  const bgStyle = dark
    ? "bg-gray-900/92 border-gray-700"
    : "bg-white/95 border-gray-300";
  const textStyle = dark ? "text-white" : "text-gray-900";
  const cursorStyle = dark ? "text-cyan-400" : "text-amber-500";

  return (
    <AnimatePresence>
      {text && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="fixed bottom-0 left-0 right-0 z-[100] px-3 sm:px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2"
          style={{ pointerEvents: "none" }}
        >
          <div className={`backdrop-blur-md rounded-2xl shadow-2xl border-2 px-5 sm:px-8 py-4 sm:py-5 min-h-[80px] max-h-[32vh] overflow-y-auto ${bgStyle}`}>
            <p className={`text-base sm:text-lg md:text-xl font-bold text-center leading-[1.55] break-words drop-shadow-sm ${textStyle}`}>
              {displayed}
              {typing && <span className={`${cursorStyle} animate-pulse`}>|</span>}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SpeechReplayButton({ onReplay, show, dark = true }) {
  if (!show) return null;
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onReplay}
      className={`fixed top-20 right-4 z-[99] flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg font-bold text-sm cursor-pointer border-2 ${
        dark ? "bg-gray-900/90 text-white border-amber-500/60 hover:bg-gray-800" : "bg-white/95 text-gray-900 border-amber-300 hover:bg-white"
      }`}
      aria-label="Listen again"
    >
      <Volume2 size={20} />
      <span>Listen again</span>
    </motion.button>
  );
}

function PageFlip({ children, pageKey }) {
  return (
    <div key={pageKey} className="w-full h-full">
      {children}
    </div>
  );
}

function PulsingButton({ children, onClick, className = "", disabled = false }) {
  return (
    <motion.button
      whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
      animate={{
        scale: [1, 1.05, 1],
        boxShadow: ["0 0 0 0 rgba(251,191,36,0)","0 0 20px 8px rgba(251,191,36,0.4)","0 0 0 0 rgba(251,191,36,0)"],
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      onClick={onClick} disabled={disabled}
      className={`font-bold text-xl px-8 py-4 rounded-2xl shadow-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${className}`}>
      {children}
    </motion.button>
  );
}

function DragPuzzle({ itemSVG, itemEmoji, targetLabel, onSolve }) {
  const [solved, setSolved] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const constraintsRef = useRef(null);
  const handleSolve = () => {
    if (solved) return;
    setSolved(true); setShowSparkles(true);
    setTimeout(() => onSolve?.(), 900);
  };
  return (
    <div ref={constraintsRef} className="relative flex flex-col items-center gap-3">
      {showSparkles && <Sparkles count={22} />}
      {!solved ? (
        <>
          <motion.div drag dragConstraints={constraintsRef} dragElastic={0.5}
            onDragEnd={(_, i) => { if (Math.abs(i.offset.x) > 55 || Math.abs(i.offset.y) > 55) handleSolve(); }}
            onClick={handleSolve} whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.92 }}
            className="cursor-grab active:cursor-grabbing select-none z-10">
            {itemSVG || <span className="text-7xl">{itemEmoji}</span>}
          </motion.div>
          <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}
            className="text-sm font-bold text-white bg-black/40 rounded-full px-3 py-1">
            Drag or tap {targetLabel}!
          </motion.p>
        </>
      ) : (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl">✅</motion.div>
      )}
    </div>
  );
}

function CameraFlash({ onComplete }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 0.3, times: [0, 0.33, 1] }}
      onAnimationComplete={onComplete}
      className="fixed inset-0 bg-white z-[200]" />
  );
}

// Rich Savanna background — shared between all Africa screens
function SavannaBackground() {
  const tufts = useMemo(() =>
    [4,10,17,24,32,40,48,56,63,71,79,86,92,97].map((x, i) => ({ x, d: i * 0.14, dur: 1.8 + i * 0.2, size: 16 + (i % 4) * 5 })),
  []);
  const birds = useMemo(() =>
    [6, 20, 42, 65, 82].map((x, i) => ({ x, top: 7 + (i * 3) % 12, dur: 5.5 + i * 0.9, delay: i * 1.2 })),
  []);
  const rocks = useMemo(() =>
    [9, 28, 48, 66, 82].map((x, i) => ({ x, w: 12 + i % 3 * 4, h: 7 + i % 3 * 2 })),
  []);
  const flowers = useMemo(() =>
    [{ x: 14, color: "#FFD700" }, { x: 34, color: "#FF8C00" }, { x: 58, color: "#FF6B6B" }, { x: 76, color: "#FFB6C1" }],
  []);

  return (
    <>
      {/* Sun — larger with glow ring and 15 rays */}
      <motion.div animate={{ scale: [1,1.05,1] }} transition={{ duration: 4.5, repeat: Infinity }}
        className="absolute top-5 right-10 z-10">
        <svg viewBox="0 0 130 130" width="110" height="110">
          <circle cx="65" cy="65" r="52" fill="#FFE135" opacity="0.1" />
          <circle cx="65" cy="65" r="40" fill="#FFE135" opacity="0.08" />
          {[0,24,48,72,96,120,144,168,192,216,240,264,288,312,336].map((a, i) => (
            <motion.line key={i} x1="65" y1="65"
              x2={65 + 58 * Math.cos((a * Math.PI) / 180)} y2={65 + 58 * Math.sin((a * Math.PI) / 180)}
              stroke="#FFD700" strokeWidth="3.2" strokeLinecap="round"
              animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.06 }} />
          ))}
          <circle cx="65" cy="65" r="28" fill="#FFE550" />
          <circle cx="65" cy="65" r="21" fill="#FFD700" />
        </svg>
      </motion.div>

      {/* Cloud 1 — drifting slowly */}
      <motion.div className="absolute pointer-events-none z-8" style={{ top: "5%", left: "-8%" }}
        animate={{ x: [0, 110, 0] }} transition={{ duration: 45, repeat: Infinity, ease: "linear" }}>
        <svg viewBox="0 0 150 58" width="135" height="52">
          <ellipse cx="75" cy="38" rx="65" ry="22" fill="white" opacity="0.5" />
          <ellipse cx="52" cy="28" rx="36" ry="24" fill="white" opacity="0.48" />
          <ellipse cx="92" cy="24" rx="42" ry="26" fill="white" opacity="0.5" />
          <ellipse cx="118" cy="34" rx="28" ry="18" fill="white" opacity="0.46" />
        </svg>
      </motion.div>

      {/* Cloud 2 */}
      <motion.div className="absolute pointer-events-none z-8" style={{ top: "3%", right: "5%" }}
        animate={{ x: [0, -75, 0] }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}>
        <svg viewBox="0 0 120 50" width="108" height="44">
          <ellipse cx="60" cy="32" rx="52" ry="18" fill="white" opacity="0.38" />
          <ellipse cx="40" cy="24" rx="30" ry="20" fill="white" opacity="0.36" />
          <ellipse cx="76" cy="20" rx="36" ry="22" fill="white" opacity="0.38" />
        </svg>
      </motion.div>

      {/* Flying birds */}
      {birds.map((b, i) => (
        <motion.div key={i} className="absolute pointer-events-none z-9"
          style={{ top: `${b.top}%`, left: `${b.x}%` }}
          animate={{ x: [0, 55, 110], y: [0, -5, 0] }}
          transition={{ duration: b.dur, repeat: Infinity, delay: b.delay, ease: "linear" }}>
          <svg viewBox="0 0 26 11" width="22" height="9">
            <path d="M0,5.5 Q6.5,0 13,5.5 Q19.5,0 26,5.5" fill="none" stroke="#4a3520" strokeWidth="1.8" />
          </svg>
        </motion.div>
      ))}

      {/* Heat shimmer near horizon */}
      <motion.div className="absolute pointer-events-none z-1" style={{ bottom: "34%", left: 0, right: 0, height: "6%" }}
        animate={{ opacity: [0, 0.14, 0, 0.1, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
        <svg viewBox="0 0 800 40" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0,20 Q100,8 200,24 Q300,38 400,16 Q500,4 600,22 Q700,36 800,18" fill="none" stroke="white" strokeWidth="2.5" opacity="0.35" />
        </svg>
      </motion.div>

      {/* Distant hills */}
      <div className="absolute z-0" style={{ bottom: "34%", left: 0, right: 0 }}>
        <svg viewBox="0 0 800 100" className="w-full" preserveAspectRatio="none">
          <path d="M0,100 Q90,22 200,58 Q350,10 490,50 Q630,12 760,42 L800,35 L800,100 Z" fill="#8a4010" opacity="0.38" />
          <path d="M0,100 Q140,38 290,65 Q450,22 610,58 Q730,30 800,50 L800,100 Z" fill="#a85018" opacity="0.28" />
          <path d="M0,100 Q180,58 380,72 Q570,45 800,68 L800,100 Z" fill="#c87828" opacity="0.2" />
        </svg>
      </div>

      {/* Ground layers */}
      <div className="absolute bottom-0 left-0 right-0 z-0" style={{ height: "38%" }}>
        <svg viewBox="0 0 800 240" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0,45 Q100,22 200,38 Q340,10 460,35 Q580,14 700,28 Q760,20 800,26 L800,240 L0,240 Z" fill="#B87008" />
          <path d="M0,65 Q180,48 360,60 Q540,42 720,56 L800,53 L800,240 L0,240 Z" fill="#C8900A" />
          <path d="M0,82 Q200,68 400,78 Q600,65 800,76 L800,240 L0,240 Z" fill="#D4A020" />
          <path d="M0,98 Q220,88 440,96 Q660,84 800,94 L800,240 L0,240 Z" fill="#DCAA28" />
          {/* Mud cracks */}
          <path d="M58,138 Q96,132 138,142 Q168,135 205,145" fill="none" stroke="#B87008" strokeWidth="1.4" opacity="0.5" />
          <path d="M390,120 Q435,113 478,124" fill="none" stroke="#B87008" strokeWidth="1.2" opacity="0.42" />
          <path d="M600,132 Q648,125 692,136" fill="none" stroke="#B87008" strokeWidth="1.2" opacity="0.4" />
        </svg>

        {/* Grass tufts — more varied */}
        {tufts.map((g, i) => (
          <motion.div key={i} className="absolute" style={{ left: `${g.x}%`, bottom: `${50 + (i % 5)}%` }}
            animate={{ scaleX: [1, 1.08, 0.94, 1], rotate: [0, 4, -3, 0] }}
            transition={{ duration: g.dur, repeat: Infinity, delay: g.d }}>
            <svg viewBox="0 0 36 36" width={g.size} height={g.size}>
              <line x1="18" y1="36" x2="8" y2="4" stroke={i % 3 === 0 ? "#6a9a10" : "#5a8810"} strokeWidth="2.8" strokeLinecap="round" />
              <line x1="18" y1="36" x2="18" y2="2" stroke={i % 2 === 0 ? "#7aaa18" : "#6a9a10"} strokeWidth="3.2" strokeLinecap="round" />
              <line x1="18" y1="36" x2="28" y2="4" stroke="#5a8810" strokeWidth="2.8" strokeLinecap="round" />
              {i % 3 === 0 && <line x1="18" y1="36" x2="4" y2="14" stroke="#5a8810" strokeWidth="2" strokeLinecap="round" />}
              {i % 4 === 1 && <line x1="18" y1="36" x2="32" y2="14" stroke="#4a7808" strokeWidth="1.8" strokeLinecap="round" />}
            </svg>
          </motion.div>
        ))}

        {/* Rocks/stones */}
        {rocks.map((r, i) => (
          <div key={i} className="absolute pointer-events-none"
            style={{ left: `${r.x}%`, bottom: `${51 + i % 3}%` }}>
            <svg viewBox={`0 0 ${r.w} ${r.h}`} width={r.w} height={r.h}>
              <ellipse cx={r.w/2} cy={r.h*0.6} rx={r.w/2-1} ry={r.h/2-1} fill={["#8B6914","#9a7a22","#7a5910"][i % 3]} opacity="0.7" />
              <ellipse cx={r.w/2} cy={r.h*0.4} rx={r.w/2-3} ry={r.h/2-3} fill={["#9a7a22","#aa8a30","#8a6918"][i % 3]} opacity="0.5" />
            </svg>
          </div>
        ))}

        {/* Wildflowers */}
        {flowers.map((f, i) => (
          <div key={i} className="absolute pointer-events-none z-1"
            style={{ bottom: `${52 + i % 3}%`, left: `${f.x}%` }}>
            <svg viewBox="0 0 14 18" width="12" height="16">
              <line x1="7" y1="18" x2="7" y2="6" stroke="#5a8010" strokeWidth="1.5" />
              <circle cx="7" cy="5" r="4" fill={f.color} opacity="0.88" />
              <circle cx="7" cy="5" r="2" fill="white" opacity="0.75" />
            </svg>
          </div>
        ))}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  APP  — 9-state machine
// ═══════════════════════════════════════════════════════════════════════════
const STATES = {
  ONBOARDING: "ONBOARDING",
  HUB: "HUB",
  FLIGHT_TRANSITION: "FLIGHT_TRANSITION",
  ANTARCTICA_SLED: "ANTARCTICA_SLED",
  ANTARCTICA_VILLAGE: "ANTARCTICA_VILLAGE",
  ANTARCTICA_RESCUE: "ANTARCTICA_RESCUE",
  AFRICA_SAFARI: "AFRICA_SAFARI",
  AFRICA_GIRAFFE: "AFRICA_GIRAFFE",
  AFRICA_WATERING_HOLE: "AFRICA_WATERING_HOLE",
  CAMERA_PROMPT: "CAMERA_PROMPT",
};

export default function App() {
  const [state, setState] = useState(STATES.ONBOARDING);
  const [kidName, setKidName] = useState(() => localStorage.getItem("kidName") || "");
  const [path, setPath] = useState(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const { subtitle, speak, stop, replay, lastSpokenText } = useSpeech();

  const avatarUrl = localStorage.getItem("kidAvatar") || AVATAR_OPTIONS[0].url;

  const goTo = useCallback((s) => { stop(); setState(s); }, [stop]);

  useEffect(() => {
    if (!audioUnlocked) return;
    const timers = [];
    const delay = (fn, ms = 700) => { const t = setTimeout(fn, ms); timers.push(t); };
    switch (state) {
      case STATES.HUB:
        delay(() => speak(`Welcome, ${kidName}! Look at your beautiful Adventure Book. Where do you want to go today? Tap the blue card for Antarctica, or the orange card for Africa!`));
        break;
      case STATES.FLIGHT_TRANSITION:
        /* No narration or subtitles during map transition */
        break;
      case STATES.ANTARCTICA_SLED:
        delay(() => speak(`Welcome to Antarctica, ${kidName}! Hop on this cute sled for a ride through the snow! Tap the sled to zoom to the village!`));
        break;
      case STATES.ANTARCTICA_VILLAGE:
        delay(() => speak(`It is super cold here! See this igloo? It keeps us humans warm. Penguins huddle together to stay warm! Tap the snowman to say hello!`));
        break;
      case STATES.ANTARCTICA_RESCUE:
        delay(() => speak(`Oh no! A baby penguin is stuck on floating ice! Can you drag the ice block to make a bridge?`));
        break;
      case STATES.AFRICA_SAFARI:
        delay(() => speak(`Wooooow! Welcome to the African Savanna, ${kidName}! The savanna is a big grassy land. Baobab trees store lots of water! Tap the Go Button to start driving!`));
        break;
      case STATES.AFRICA_GIRAFFE:
        delay(() => speak(`Giraffes have the longest necks of any animal so they can reach the tallest leaves! Tap the giraffe to say hello!`));
        break;
      case STATES.AFRICA_WATERING_HOLE:
        delay(() => speak(`Animals come to watering holes to drink. Elephants use their trunks like straws! A big log is blocking the way. Can you move it?`));
        break;
      case STATES.CAMERA_PROMPT:
        delay(() => speak(`You did it, ${kidName}! Tap the camera in the middle to save your memory in your book!`));
        break;
      default:
        break;
    }
    return () => timers.forEach(clearTimeout);
  }, [state, audioUnlocked, kidName, speak]);

  const handleStart = () => {
    const silent = new SpeechSynthesisUtterance(""); silent.volume = 0;
    window.speechSynthesis.speak(silent);
    setAudioUnlocked(true);
    goTo(STATES.HUB);
  };

  const subtitleDark = [
    STATES.AFRICA_SAFARI,
    STATES.AFRICA_GIRAFFE,
    STATES.AFRICA_WATERING_HOLE,
    STATES.FLIGHT_TRANSITION,
  ].includes(state);

  const showReplay = lastSpokenText && !subtitle && state !== STATES.ONBOARDING;

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <SubtitleBar text={subtitle} dark={subtitleDark} />
      <AnimatePresence>
        <SpeechReplayButton key="replay" onReplay={replay} show={showReplay} dark={subtitleDark} />
      </AnimatePresence>
      <PageFlip pageKey={state}>
        {state === STATES.ONBOARDING && (
          <OnboardingScreen kidName={kidName} setKidName={setKidName} onStart={handleStart} />
        )}
        {state === STATES.HUB && (
          <HubScreen kidName={kidName} avatarUrl={avatarUrl}
            onPickAntarctica={() => { setPath("antarctica"); goTo(STATES.FLIGHT_TRANSITION); }}
            onPickAfrica={() => { setPath("africa"); goTo(STATES.FLIGHT_TRANSITION); }}
          />
        )}
        {state === STATES.FLIGHT_TRANSITION && (
          <FlightTransitionScreen
            destination={path}
            onComplete={() => goTo(path === "antarctica" ? STATES.ANTARCTICA_SLED : STATES.AFRICA_SAFARI)}
          />
        )}
        {state === STATES.ANTARCTICA_SLED && (
          <AntarcticaSledScreen avatarUrl={avatarUrl} onNext={() => goTo(STATES.ANTARCTICA_VILLAGE)} onBack={() => goTo(STATES.HUB)} />
        )}
        {state === STATES.ANTARCTICA_VILLAGE && (
          <AntarcticaVillageScreen onNext={() => goTo(STATES.ANTARCTICA_RESCUE)} onBack={() => goTo(STATES.ANTARCTICA_SLED)} />
        )}
        {state === STATES.ANTARCTICA_RESCUE && (
          <AntarcticaRescueScreen onNext={() => goTo(STATES.CAMERA_PROMPT)} onBack={() => goTo(STATES.ANTARCTICA_VILLAGE)} />
        )}
        {state === STATES.AFRICA_SAFARI && (
          <AfricaSafariScreen avatarUrl={avatarUrl} onNext={() => goTo(STATES.AFRICA_GIRAFFE)} onBack={() => goTo(STATES.HUB)} />
        )}
        {state === STATES.AFRICA_GIRAFFE && (
          <AfricaGiraffeScreen avatarUrl={avatarUrl} onNext={() => goTo(STATES.AFRICA_WATERING_HOLE)} onBack={() => goTo(STATES.AFRICA_SAFARI)} />
        )}
        {state === STATES.AFRICA_WATERING_HOLE && (
          <AfricaWateringHoleScreen onNext={() => goTo(STATES.CAMERA_PROMPT)} onBack={() => goTo(STATES.AFRICA_GIRAFFE)} />
        )}
        {state === STATES.CAMERA_PROMPT && (
          <CameraMemoryJournalScreen
            path={path}
            kidName={kidName}
            avatarUrl={avatarUrl}
            speak={speak}
            stop={stop}
            onBack={() => goTo(STATES.HUB)}
          />
        )}
      </PageFlip>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  STATE 1: ONBOARDING
// ═══════════════════════════════════════════════════════════════════════════
function OnboardingScreen({ kidName, setKidName, onStart }) {
  const [selectedId, setSelectedId] = useState(() => {
    const saved = localStorage.getItem("kidAvatar");
    return AVATAR_OPTIONS.find((a) => a.url === saved)?.id || null;
  });

  const stars = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: 5 + (i * 11) % 88,
        y: 4 + (i * 13) % 35,
        size: 4 + (i * 2) % 10,
        dur: 3.5 + (i * 0.4) % 3,
        delay: (i * 0.35) % 2.5,
      })),
    []
  );

  const handleSelect = (av) => {
    setSelectedId(av.id);
    localStorage.setItem("kidAvatar", av.url);
  };

  const handleStart = () => {
    localStorage.setItem("kidName", kidName);
    onStart();
  };

  const ready = kidName.trim().length > 0 && selectedId;

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0" style={{ background: MAGIC_BOOK_GRADIENT }} />

      {/* Twinkling stars — same vibe as HUB */}
      {stars.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white pointer-events-none z-[1]"
          style={{ width: p.size * 0.45, height: p.size * 0.45, top: `${p.y}%`, left: `${p.x}%` }}
          animate={{ opacity: [0.25, 1, 0.25], scale: [0.85, 1.25, 0.85] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}

      {/* Soft magic orbs — violet / pink / blue (HUB palette) */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none z-[1]"
          style={{
            width: 70 + i * 40,
            height: 70 + i * 40,
            background: [
              "radial-gradient(circle, #f9a8d4, transparent)",
              "radial-gradient(circle, #a5f3fc, transparent)",
              "radial-gradient(circle, #c4b5fd, transparent)",
              "radial-gradient(circle, #fde68a, transparent)",
            ][i],
            top: `${10 + i * 16}%`,
            left: `${6 + i * 20}%`,
            opacity: 0.22,
          }}
          animate={{ x: [0, 14, -10, 0], y: [0, -12, 16, 0], scale: [1, 1.12, 0.94, 1] }}
          transition={{ duration: 7 + i * 2, repeat: Infinity, ease: "easeInOut", delay: i * 1.2 }}
        />
      ))}

      {/* Passport card */}
      <motion.div initial={{ scale: 0.82, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 90, delay: 0.15 }}
        className="relative z-10 w-[92%] max-w-lg bg-white/93 backdrop-blur-xl rounded-3xl shadow-2xl border-4 border-fuchsia-300/90 overflow-hidden ring-2 ring-purple-500/30">

        {/* Passport header — violet / pink / indigo */}
        <div
          className="px-8 py-4 flex items-center gap-3"
          style={{
            background: "linear-gradient(115deg, #5b21b6 0%, #7c3aed 28%, #a855f7 52%, #db2777 78%, #4f46e5 100%)",
          }}
        >
          <div className="text-3xl drop-shadow-md">✈️</div>
          <div>
            <p className="text-white font-black text-xl tracking-wide drop-shadow-sm">My Travel Passport</p>
            <p className="text-fuchsia-100/90 text-xs tracking-wider">Adventure Travel Document</p>
          </div>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5 bg-gradient-to-b from-violet-50/80 to-fuchsia-50/50">
          {/* Name input */}
          <div>
            <label className="block text-sm font-black text-violet-900 uppercase tracking-wide mb-2">
              Your Name
            </label>
            <input type="text" placeholder="Type your name here..."
              value={kidName} onChange={(e) => setKidName(e.target.value)} maxLength={20}
              className="w-full text-2xl font-bold text-center rounded-xl border-2 border-purple-300 focus:border-fuchsia-500 focus:ring-2 focus:ring-purple-300/50 focus:outline-none py-3 px-4 bg-white/90 text-violet-900 placeholder-violet-300"
            />
          </div>

          {/* Avatar grid */}
          <div>
            <label className="block text-sm font-black text-violet-900 uppercase tracking-wide mb-3">
              Pick Your Explorer
            </label>
            <div className="grid grid-cols-3 gap-3">
              {AVATAR_OPTIONS.map((av) => {
                const isSelected = selectedId === av.id;
                return (
                  <motion.button key={av.id} onClick={() => handleSelect(av)}
                    whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
                    className={`relative flex items-center justify-center p-2 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? "border-4 border-fuchsia-500 bg-fuchsia-50 shadow-lg shadow-purple-200/80"
                        : "border-2 border-purple-200 bg-white/90 hover:bg-violet-50"
                    }`}>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-fuchsia-500 to-indigo-600 rounded-full flex items-center justify-center z-10 shadow">
                        <span className="text-white text-xs font-bold">✓</span>
                      </motion.div>
                    )}
                    <motion.img src={av.url} alt="avatar"
                      animate={isSelected ? { boxShadow: "0 0 0 4px rgba(192, 132, 252, 0.55)" } : {}}
                      className={`w-18 h-18 md:w-20 md:h-20 rounded-full object-cover border-3 bg-gradient-to-br from-violet-100 to-fuchsia-100 ${isSelected ? "border-fuchsia-500" : "border-purple-200"}`}
                      style={{ width: 72, height: 72 }}
                    />
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <PulsingButton onClick={handleStart} disabled={!ready}
            className="w-full bg-gradient-to-r from-fuchsia-500 via-purple-600 to-indigo-600 text-white mt-1 shadow-lg shadow-purple-500/35 border-2 border-white/30">
            Start Magic
          </PulsingButton>
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  FLIGHT TRANSITION — World map flight animation between HUB and destinations
// ═══════════════════════════════════════════════════════════════════════════
function FlightTransitionScreen({ destination, onComplete }) {
  const isAntarctica = destination === "antarctica";

  // All coordinates are in SVG viewBox space: 0 0 800 450
  const INDIA  = { x: 590, y: 220 };
  const AFRICA = { x: 430, y: 250 };
  const ANTAR  = { x: 390, y: 432 };
  const destPt = isAntarctica ? ANTAR : AFRICA;
  // Quadratic bezier control points — arc over the ocean for each route
  const CP     = isAntarctica ? { x: 470, y: 380 } : { x: 500, y: 118 };
  // Rotation of the airplane to match travel direction (clockwise from East)
  const planeRot = isAntarctica ? 133 : 170;

  const pathD = `M ${INDIA.x} ${INDIA.y} Q ${CP.x} ${CP.y} ${destPt.x} ${destPt.y}`;

  // Ref for native rAF airplane animation (avoids SVG coordinate-space issues)
  const planeRef = useRef(null);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // Animate the airplane along the quadratic bezier with rAF
  useEffect(() => {
    const DELAY = 1000;
    const DURATION = 2500;
    let startTime = null;
    let rafId;
    const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const tick = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime - DELAY;
      if (elapsed < 0) { rafId = requestAnimationFrame(tick); return; }

      const raw = Math.min(elapsed / DURATION, 1);
      const t   = easeInOut(raw);
      const mt  = 1 - t;

      const x = mt * mt * INDIA.x + 2 * mt * t * CP.x + t * t * destPt.x;
      const y = mt * mt * INDIA.y + 2 * mt * t * CP.y + t * t * destPt.y;

      if (planeRef.current) {
        planeRef.current.setAttribute("transform", `translate(${x}, ${y})`);
        const opacity = raw < 0.05 ? raw / 0.05 : raw > 0.9 ? (1 - raw) / 0.1 : 1;
        planeRef.current.style.opacity = opacity;
      }

      if (raw < 1) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAntarctica]);

  // Auto-advance after map animation (no narration during this screen)
  useEffect(() => {
    const t = setTimeout(() => onCompleteRef.current?.(), 4200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ background: "linear-gradient(160deg, #001540 0%, #0b3d8e 28%, #1565c0 58%, #1976d2 80%, #26a4d4 100%)" }}
    >
      {/* Starfield */}
      {Array.from({ length: 22 }, (_, i) => (
        <motion.div key={i}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{ width: 1.5 + (i % 3), height: 1.5 + (i % 3), top: `${4 + (i * 13) % 55}%`, left: `${2 + (i * 17) % 96}%` }}
          animate={{ opacity: [0.15, 0.85, 0.15] }}
          transition={{ duration: 1.6 + (i % 5) * 0.4, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}

      {/* World Map SVG — fades and scales in */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 0.82, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.25, ease: "easeOut" }}
      >
        <svg viewBox="0 0 800 450" className="w-full h-full"
          style={{ filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.55))" }}>

          {/* Faint lat/lon grid */}
          {[1, 2, 3].map(i => (
            <line key={`h${i}`} x1="0" y1={i * 112} x2="800" y2={i * 112} stroke="white" strokeWidth="0.5" opacity="0.07" />
          ))}
          {[1, 2, 3, 4, 5].map(i => (
            <line key={`v${i}`} x1={i * 133} y1="0" x2={i * 133} y2="450" stroke="white" strokeWidth="0.5" opacity="0.07" />
          ))}

          {/* ── CONTINENTS — redrawn from dotted world map reference ── */}

          {/* North America (Alaska, Canada, USA, Mexico, Central America) */}
          <path d="M 44,50 L 62,40 L 88,36 L 118,28 L 148,22 L 170,26 L 196,38 L 212,32 L 230,42 L 236,56 L 244,62 L 252,80 L 244,94 L 238,108 L 232,118 L 224,128 L 216,138 L 206,150 L 196,164 L 188,172 L 184,188 L 178,198 L 172,210 L 164,218 L 156,216 L 148,212 L 140,214 L 130,218 L 128,228 L 134,236 L 142,240 L 148,250 L 146,258 L 138,264 L 130,258 L 124,250 L 116,242 L 108,230 L 98,218 L 88,204 L 80,192 L 74,180 L 66,168 L 56,148 L 48,128 L 42,110 L 38,90 L 36,72 L 40,58 Z"
            fill="#2d6a1a" stroke="#3d8a22" strokeWidth="1.2" opacity="0.85" />

          {/* Greenland */}
          <path d="M 218,10 L 250,6 L 276,10 L 290,22 L 288,38 L 276,48 L 260,52 L 240,48 L 224,40 L 214,28 L 212,18 Z"
            fill="#c4e4ff" stroke="#90cce8" strokeWidth="1" opacity="0.7" />

          {/* South America */}
          <path d="M 152,264 L 170,258 L 188,252 L 202,254 L 218,262 L 228,272 L 234,282 L 240,296 L 242,314 L 240,332 L 234,348 L 226,362 L 216,376 L 206,388 L 196,398 L 186,406 L 178,412 L 170,414 L 162,410 L 156,402 L 150,392 L 144,378 L 140,362 L 134,344 L 128,326 L 124,308 L 122,290 L 126,276 L 134,268 L 142,264 Z"
            fill="#3a7a20" stroke="#4a9a28" strokeWidth="1.2" opacity="0.85" />

          {/* Europe (including Scandinavia, British Isles, Iberia, Italy, Balkans) */}
          <path d="M 338,32 L 350,24 L 368,22 L 382,28 L 392,18 L 406,14 L 418,18 L 426,28 L 432,40 L 440,50 L 448,58 L 444,66 L 436,72 L 430,78 L 426,88 L 420,96 L 416,106 L 408,114 L 398,120 L 388,118 L 378,122 L 368,124 L 360,120 L 352,114 L 346,106 L 340,94 L 334,82 L 330,68 L 328,52 L 332,40 Z"
            fill="#2d6a1a" stroke="#3d8a22" strokeWidth="1.2" opacity="0.85" />
          {/* British Isles */}
          <path d="M 330,44 L 336,38 L 342,42 L 340,50 L 334,52 Z"
            fill="#2d6a1a" stroke="#3d8a22" strokeWidth="0.8" opacity="0.78" />
          {/* Iceland */}
          <path d="M 302,18 L 316,14 L 324,20 L 318,28 L 306,28 Z"
            fill="#2d6a1a" stroke="#3d8a22" strokeWidth="0.8" opacity="0.72" />

          {/* Africa — prominent (West Africa bulge, Horn of Africa, southern tip) */}
          <path d="M 354,124 L 372,118 L 394,120 L 416,124 L 438,122 L 460,130 L 478,142 L 490,156 L 496,170 L 500,186 L 502,204 L 498,222 L 494,240 L 488,258 L 480,274 L 472,290 L 462,306 L 452,322 L 440,338 L 428,352 L 418,362 L 408,370 L 398,374 L 388,370 L 378,362 L 368,350 L 360,336 L 354,318 L 348,298 L 344,278 L 340,258 L 338,238 L 336,216 L 336,196 L 338,176 L 340,158 L 344,142 L 348,132 Z"
            fill="#3a8020" stroke="#52a830" strokeWidth="1.5" opacity="0.9" />
          {/* Madagascar */}
          <path d="M 502,282 L 510,274 L 516,280 L 520,296 L 518,314 L 512,324 L 504,318 L 500,302 L 500,290 Z"
            fill="#3a8020" stroke="#52a830" strokeWidth="0.8" opacity="0.8" />

          {/* Asia — Russia, Middle East, Central Asia, China, Korea, Japan */}
          <path d="M 450,58 L 468,50 L 492,42 L 520,36 L 552,28 L 580,22 L 612,18 L 648,16 L 680,18 L 710,24 L 736,30 L 756,38 L 772,48 L 782,58 L 788,72 L 792,88 L 790,104 L 784,120 L 776,134 L 764,146 L 752,156 L 738,164 L 722,170 L 706,176 L 688,180 L 670,182 L 652,180 L 636,176 L 622,170 L 610,164 L 596,156 L 582,148 L 566,140 L 550,134 L 536,130 L 520,128 L 506,130 L 496,134 L 486,140 L 478,148 L 470,140 L 462,130 L 456,118 L 450,106 L 446,92 L 444,78 L 446,66 Z"
            fill="#2d6a1a" stroke="#3d8a22" strokeWidth="1.2" opacity="0.85" />
          {/* Middle East / Arabian Peninsula */}
          <path d="M 468,138 L 486,130 L 504,128 L 520,130 L 530,138 L 536,148 L 538,160 L 536,172 L 528,180 L 518,186 L 506,190 L 494,188 L 482,182 L 474,172 L 468,160 L 464,148 Z"
            fill="#2d6a1a" stroke="#3d8a22" strokeWidth="1" opacity="0.82" />
          {/* India — highlighted subcontinent */}
          <path d="M 562,162 L 578,156 L 596,154 L 612,160 L 622,170 L 628,184 L 630,200 L 628,218 L 622,234 L 612,248 L 598,260 L 584,268 L 572,264 L 562,254 L 554,240 L 548,224 L 544,208 L 544,192 L 546,178 L 552,168 Z"
            fill="#52a030" stroke="#74d040" strokeWidth="2" opacity="0.95" />
          {/* SE Asia peninsula (Thailand, Vietnam, Malaysia) */}
          <path d="M 644,184 L 660,178 L 672,186 L 678,198 L 680,212 L 676,228 L 668,242 L 658,252 L 648,256 L 640,250 L 636,238 L 634,222 L 634,206 L 638,194 Z"
            fill="#2d6a1a" stroke="#3d8a22" strokeWidth="1" opacity="0.82" />
          {/* Japan */}
          <path d="M 740,76 L 748,68 L 756,72 L 760,84 L 756,98 L 748,106 L 740,102 L 736,90 Z"
            fill="#2d6a1a" stroke="#3d8a22" strokeWidth="0.8" opacity="0.78" />
          {/* Korean Peninsula */}
          <path d="M 722,80 L 730,74 L 736,80 L 734,92 L 728,100 L 720,96 L 718,88 Z"
            fill="#2d6a1a" stroke="#3d8a22" strokeWidth="0.8" opacity="0.78" />
          {/* Sri Lanka */}
          <path d="M 600,272 L 610,268 L 614,278 L 608,286 L 600,282 Z"
            fill="#3a7a20" stroke="#4a9a28" strokeWidth="0.6" opacity="0.75" />

          {/* Indonesia / Malay Archipelago */}
          <path d="M 662,262 L 678,258 L 696,260 L 712,264 L 724,270 L 718,278 L 706,280 L 690,278 L 674,274 L 664,270 Z"
            fill="#2d6a1a" stroke="#3d8a22" strokeWidth="0.8" opacity="0.78" />
          <path d="M 698,282 L 716,278 L 728,284 L 720,292 L 704,290 Z"
            fill="#2d6a1a" stroke="#3d8a22" strokeWidth="0.8" opacity="0.72" />

          {/* Australia */}
          <path d="M 676,306 L 698,296 L 724,290 L 748,292 L 768,300 L 780,314 L 784,332 L 780,350 L 770,364 L 756,374 L 738,380 L 718,382 L 698,378 L 682,370 L 670,356 L 664,340 L 662,324 L 666,312 Z"
            fill="#3a7a20" stroke="#4a9a28" strokeWidth="1.2" opacity="0.85" />
          {/* New Zealand */}
          <path d="M 792,362 L 798,354 L 800,364 L 796,376 L 790,372 Z"
            fill="#3a7a20" stroke="#4a9a28" strokeWidth="0.6" opacity="0.72" />

          {/* Antarctica — ice shelf */}
          <path d="M 0,424 Q 60,414 120,420 Q 180,430 240,422 Q 300,414 360,422 Q 420,432 480,424 Q 540,416 600,424 Q 660,434 720,426 Q 760,418 800,424 L 800,450 L 0,450 Z"
            fill="#c4e4ff" stroke="#90cce8" strokeWidth="1.2" opacity="0.82" />
          <ellipse cx="380" cy="436" rx="52" ry="8" fill="white" opacity="0.45" />
          <ellipse cx="190" cy="434" rx="34" ry="6" fill="white" opacity="0.35" />
          <ellipse cx="610" cy="433" rx="38" ry="6" fill="white" opacity="0.32" />

          {/* ── FLIGHT PATH ── */}

          {/* Ghost / full-route reference (dashed) */}
          <path d={pathD} fill="none" stroke="white" strokeWidth="2.5" opacity="0.13" strokeDasharray="9 7" />

          {/* Animated drawing path (solid gold, pathLength 0→1) */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="#FFD700"
            strokeWidth="4.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              pathLength: { duration: 2.5, delay: 1.0, ease: "easeInOut" },
              opacity:    { duration: 0.4, delay: 0.9 },
            }}
          />

          {/* ── LOCATION MARKERS ── */}

          {/* India dot + pulse ring */}
          <motion.g
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.55, type: "spring", stiffness: 220 }}
            style={{ transformOrigin: `${INDIA.x}px ${INDIA.y}px` }}
          >
            <circle cx={INDIA.x} cy={INDIA.y} r="9" fill="#FF4500" stroke="white" strokeWidth="3" />
          </motion.g>
          <motion.circle cx={INDIA.x} cy={INDIA.y} r="9" fill="none" stroke="#FF4500" strokeWidth="2"
            animate={{ r: [9, 24, 9], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: 0.9 }} />

          {/* Destination dot + pulse ring (appears as plane arrives) */}
          <motion.g
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 3.65, type: "spring", stiffness: 200 }}
            style={{ transformOrigin: `${destPt.x}px ${destPt.y}px` }}
          >
            <circle cx={destPt.x} cy={destPt.y} r="9" fill="#00E676" stroke="white" strokeWidth="3" />
          </motion.g>
          <motion.circle cx={destPt.x} cy={destPt.y} r="9" fill="none" stroke="#00E676" strokeWidth="2"
            initial={{ opacity: 0 }}
            animate={{ r: [9, 26, 9], opacity: [0, 0.8, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 3.85 }} />

          {/* Labels */}
          <motion.text
            x={INDIA.x + 13} y={INDIA.y - 8}
            fill="white" fontSize="17" fontWeight="bold"
            paintOrder="stroke" stroke="rgba(0,0,0,0.7)" strokeWidth="3.5" strokeLinejoin="round"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
          >🇮🇳 India</motion.text>

          <motion.text
            x={destPt.x + 13} y={destPt.y - 8}
            fill="white" fontSize="17" fontWeight="bold"
            paintOrder="stroke" stroke="rgba(0,0,0,0.7)" strokeWidth="3.5" strokeLinejoin="round"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
          >{isAntarctica ? "🧊 Antarctica" : "🌍 Africa"}</motion.text>

          {/* ── AIRPLANE (driven by rAF via ref) ── */}
          <g ref={planeRef} style={{ opacity: 0 }}>
            {/* Inner g rotated to point in direction of travel */}
            <g transform={`rotate(${planeRot})`}>
              {/* Fuselage */}
              <ellipse cx="0" cy="0" rx="16" ry="4.5" fill="white" />
              {/* Main wings */}
              <polygon points="-2,-14 11,0 -2,14 -6,0" fill="white" opacity="0.92" />
              {/* Tail fin */}
              <polygon points="-16,-7 -10,0 -16,7" fill="white" opacity="0.82" />
              {/* Cockpit */}
              <ellipse cx="9" cy="0" rx="4.5" ry="2.8" fill="#90caf9" />
              {/* Engine glow dots */}
              <circle cx="-1" cy="-9.5" r="2.2" fill="#FFD700" opacity="0.85" />
              <circle cx="-1" cy="9.5"  r="2.2" fill="#FFD700" opacity="0.85" />
            </g>
          </g>

          {/* Decorative twinkling stars on the ocean */}
          {[{x:142,y:92},{x:285,y:60},{x:512,y:70},{x:670,y:108},{x:735,y:50},{x:60,y:258}].map((s, i) => (
            <motion.circle key={i} cx={s.x} cy={s.y} r="2.5" fill="#FFD700"
              animate={{ opacity: [0.12, 0.9, 0.12], scale: [0.7, 1.6, 0.7] }}
              transition={{ duration: 1.4 + i * 0.32, repeat: Infinity, delay: i * 0.35 }}
              style={{ transformOrigin: `${s.x}px ${s.y}px` }}
            />
          ))}
        </svg>
      </motion.div>

      {/* Arrival flash */}
      <motion.div className="absolute inset-0 bg-yellow-200 pointer-events-none z-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0.6, 0] }}
        transition={{ duration: 0.55, delay: 4.75, ease: "easeInOut" }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  STATE 2: HUB
// ═══════════════════════════════════════════════════════════════════════════
function HubScreen({ kidName, avatarUrl, onPickAntarctica, onPickAfrica }) {
  // Stable floating particles for the sky
  const particles = useMemo(() =>
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      x: 5 + (i * 7) % 92,
      y: 4 + (i * 11) % 38,
      size: 5 + (i * 3) % 14,
      dur: 4 + (i * 0.7) % 5,
      delay: (i * 0.4) % 4,
    })),
  []);

  return (
    <div className="relative w-full h-full overflow-hidden">

      {/* ── Sky ── deep dusk-to-magic gradient (shared with passport & photo journal) */}
      <div className="absolute inset-0" style={{ background: MAGIC_BOOK_GRADIENT }} />

      {/* ── Stars twinkling */}
      {particles.map((p) => (
        <motion.div key={p.id}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{ width: p.size * 0.45, height: p.size * 0.45, top: `${p.y}%`, left: `${p.x}%` }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.3, 0.8] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}

      {/* ── Floating magic sparkle orbs */}
      {[0,1,2,3].map((i) => (
        <motion.div key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 80 + i * 45,
            height: 80 + i * 45,
            background: ["radial-gradient(circle, #f9a8d4, transparent)",
              "radial-gradient(circle, #a5f3fc, transparent)",
              "radial-gradient(circle, #fde68a, transparent)",
              "radial-gradient(circle, #c4b5fd, transparent)"][i],
            top: `${12 + i * 18}%`,
            left: `${8 + i * 22}%`,
            opacity: 0.25,
          }}
          animate={{ x: [0, 18, -14, 0], y: [0, -16, 22, 0], scale: [1, 1.15, 0.9, 1] }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "easeInOut", delay: i * 1.5 }}
        />
      ))}

      {/* ── Central book panel */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 gap-5">

        {/* Avatar + name header */}
        <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 70, delay: 0.1 }}
          className="flex flex-col items-center gap-3">
          {/* Glowing ring around avatar */}
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: "radial-gradient(circle, #fde68a, transparent)", transform: "scale(1.6)" }}
              animate={{ opacity: [0.4, 0.9, 0.4], scale: [1.5, 1.9, 1.5] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <img src={avatarUrl} alt="explorer"
              className="relative w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-amber-300 shadow-2xl z-10"
            />
          </div>
          <div className="text-center">
            <h1 className="font-black text-3xl md:text-4xl text-white drop-shadow-lg leading-tight tracking-tight"
              style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
              {kidName}'s Adventure Book
            </h1>
            <p className="text-amber-200 font-semibold text-sm md:text-base mt-1 tracking-wide">
              Where will you explore today?
            </p>
          </div>
        </motion.div>

        {/* Destination cards (blue / orange) */}
        <div className="w-full max-w-2xl flex flex-row gap-3 md:gap-5">

          {/* Antarctica — blue card */}
          <motion.div className="flex-1"
            initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.25, type: "spring", stiffness: 55 }}>
            <motion.button
              onClick={onPickAntarctica}
              whileHover={{ scale: 1.04, y: -4 }} whileTap={{ scale: 0.96 }}
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(147,210,255,0)",
                  "0 8px 40px 8px rgba(147,210,255,0.45)",
                  "0 0 0 0 rgba(147,210,255,0)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="cursor-pointer w-full overflow-hidden rounded-3xl shadow-2xl border-0 relative"
              style={{ minHeight: 190 }}>

              {/* Ice scenery background */}
              <div className="absolute inset-0 rounded-3xl"
                style={{ background: "linear-gradient(135deg, #0d2a5c 0%, #1a4a8a 40%, #3b8fd0 75%, #87ceeb 100%)" }}>
                {/* Stars inside card */}
                {[0,1,2,3,4,5].map((i) => (
                  <motion.div key={i} className="absolute rounded-full bg-white"
                    style={{ width: 2.5, height: 2.5, top: `${12 + (i * 14) % 60}%`, left: `${15 + (i * 17) % 70}%`, opacity: 0.7 }}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.25 }}
                  />
                ))}
              </div>

              {/* Card text */}
              <div className="relative z-10 flex flex-col items-center justify-center gap-2 py-8 px-4 h-full">
                <span className="text-5xl md:text-6xl drop-shadow-lg">❄️</span>
                <span className="font-black text-2xl md:text-3xl text-white tracking-wide drop-shadow-lg">Antarctica</span>
                <span className="text-blue-100 text-sm font-bold text-center tracking-wide mt-1">
                  Penguins and Ice
                </span>
              </div>
            </motion.button>
          </motion.div>

          {/* Africa — orange card */}
          <motion.div className="flex-1"
            initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.35, type: "spring", stiffness: 55 }}>
            <motion.button
              onClick={onPickAfrica}
              whileHover={{ scale: 1.04, y: -4 }} whileTap={{ scale: 0.96 }}
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(251,191,36,0)",
                  "0 8px 40px 8px rgba(251,191,36,0.45)",
                  "0 0 0 0 rgba(251,191,36,0)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              className="cursor-pointer w-full overflow-hidden rounded-3xl shadow-2xl border-0 relative"
              style={{ minHeight: 190 }}>

              {/* Savanna background */}
              <div className="absolute inset-0 rounded-3xl"
                style={{ background: "linear-gradient(135deg, #7a2e00 0%, #c45a00 35%, #e88a20 65%, #ffc94d 100%)" }}>
                {/* Sun in corner */}
                <motion.div className="absolute top-4 right-4"
                  animate={{ scale: [1,1.08,1] }} transition={{ duration: 3.5, repeat: Infinity }}>
                  <svg viewBox="0 0 50 50" width="36" height="36">
                    {[0,45,90,135,180,225,270,315].map((a,i) => (
                      <motion.line key={i} x1="25" y1="25"
                        x2={25 + 22 * Math.cos((a * Math.PI) / 180)} y2={25 + 22 * Math.sin((a * Math.PI) / 180)}
                        stroke="#FFD700" strokeWidth="2" strokeLinecap="round"
                        animate={{ opacity: [0.4,1,0.4] }} transition={{ duration: 2, repeat: Infinity, delay: i*0.12 }} />
                    ))}
                    <circle cx="25" cy="25" r="10" fill="#FFE135" />
                  </svg>
                </motion.div>
              </div>

              {/* Card text */}
              <div className="relative z-10 flex flex-col items-center justify-center gap-2 py-8 px-4 h-full">
                <span className="text-5xl md:text-6xl drop-shadow-lg">🌅</span>
                <span className="font-black text-2xl md:text-3xl text-white drop-shadow-lg tracking-wide"
                  style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>Africa</span>
                <span className="text-amber-100 text-sm font-bold text-center tracking-wide mt-1">
                  Giraffes and Safari
                </span>
              </div>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  STATE 2b: ANTARCTICA SLED RIDE  — sled with avatar, tap to zoom to village
// ═══════════════════════════════════════════════════════════════════════════
function AntarcticaSledScreen({ avatarUrl, onNext, onBack }) {
  const [riding, setRiding] = useState(false);

  const handleSledTap = () => {
    if (riding) return;
    setRiding(true);
    setTimeout(() => onNext(), 3200);
  };

  const snowParticles = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({ id: i, left: Math.random() * 100, size: 3 + Math.random() * 4, duration: 4 + Math.random() * 4, delay: Math.random() * 4 })),
  []);

  return (
    <div className="relative w-full h-full overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #0d1f4a 0%, #1a3a7a 25%, #2a6aaa 55%, #80b8dc 85%, #cce8f4 100%)" }}>
      {/* Back button */}
      <motion.button initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 60 }}
        onClick={onBack}
        className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold px-3 py-2 rounded-full shadow-lg cursor-pointer border border-white/30 transition-colors">
        <ArrowRight size={16} className="rotate-180" />
        <span className="text-sm">Back</span>
      </motion.button>
      {/* Snowy sky */}
      {[...Array(16)].map((_, i) => (
        <motion.div key={i} className="absolute rounded-full bg-white pointer-events-none"
          style={{ width: 2 + i % 2, height: 2 + i % 2, top: `${3 + (i * 6) % 40}%`, left: `${5 + (i * 11) % 90}%` }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2 + i * 0.2, repeat: Infinity, delay: i * 0.15 }} />
      ))}
      {/* Snow ground */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: "45%" }}>
        <svg viewBox="0 0 800 280" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0,80 Q100,40 250,65 Q450,30 600,55 Q700,45 800,60 L800,280 L0,280 Z" fill="#c8e8f6" />
          <path d="M0,100 Q150,70 350,90 Q550,60 800,85 L800,280 L0,280 Z" fill="#e0f2fc" />
          <path d="M0,120 Q200,100 500,115 Q750,95 800,110 L800,280 L0,280 Z" fill="#f0f8ff" />
        </svg>
      </div>
      {snowParticles.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full bg-white pointer-events-none"
          style={{ width: p.size, height: p.size, left: `${p.left}%`, top: -8, opacity: 0.8 }}
          animate={{ y: "110vh", x: [0, 12, -12, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }} />
      ))}
      {/* Sled */}
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: riding ? "115vw" : 0 }}
        transition={{ duration: 2.8, ease: [0.4, 0, 0.6, 1] }}
        style={{ position: "absolute", bottom: "26%", left: "4%", zIndex: 10 }}>
        <motion.div animate={!riding ? { y: [0, -4, 0] } : {}} transition={{ duration: 1.5, repeat: Infinity }}>
          <AntarcticaSledSVG avatarUrl={avatarUrl} />
        </motion.div>
      </motion.div>
      {/* Zoom button — overlaid on the sled */}
      <AnimatePresence>
        {!riding && (
          <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
            className="absolute z-20 flex flex-col items-center gap-1"
            style={{ bottom: "38%", left: "5%" }}>
            <motion.p animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="text-black font-bold text-sm drop-shadow bg-white/80 px-2 py-0.5 rounded-full">
              Tap to ride!
            </motion.p>
            <motion.button
              whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.88 }}
              animate={{
                scale: [1, 1.08, 1],
                boxShadow: ["0 0 0 0 rgba(147,210,255,0)", "0 0 20px 8px rgba(147,210,255,0.6)", "0 0 0 0 rgba(147,210,255,0)"],
              }}
              transition={{ duration: 1.4, repeat: Infinity }}
              onClick={handleSledTap}
              className="cursor-pointer px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-black text-sm shadow-xl border-2 border-cyan-200">
              🛷 Zoom!
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  STATE 3: ANTARCTICA VILLAGE
// ═══════════════════════════════════════════════════════════════════════════
function AntarcticaVillageScreen({ onNext }) {
  const [tapped, setTapped] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  const snowParticles = useMemo(() =>
    Array.from({ length: 35 }, (_, i) => ({ id: i, left: Math.random() * 100, size: 3 + Math.random() * 6, duration: 4 + Math.random() * 6, delay: Math.random() * 5 })),
  []);
  const stars = useMemo(() =>
    Array.from({ length: 28 }, (_, i) => ({ id: i, top: Math.random() * 42, left: Math.random() * 100, size: 1.5 + Math.random() * 3.5, dur: 1.8 + Math.random() * 3, delay: Math.random() * 2.5 })),
  []);

  const handleSnowman = () => {
    if (tapped) return;
    setTapped(true); setShowSparkles(true);
    setTimeout(() => onNext?.(), 1100);
  };

  return (
    <div className="relative w-full h-full overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #060e2a 0%, #0d1f4a 18%, #1a3a7a 42%, #2a6aaa 65%, #80b8dc 83%, #cce8f4 100%)" }}>

      {/* Stars — more varied */}
      {stars.map((s) => (
        <motion.div key={s.id} className="absolute rounded-full bg-white pointer-events-none"
          style={{ width: s.size, height: s.size, top: `${s.top}%`, left: `${s.left}%` }}
          animate={{ opacity: [0.2,1,0.2], scale: [0.8,1.2,0.8] }}
          transition={{ duration: s.dur, repeat: Infinity, delay: s.delay }} />
      ))}

      {/* Aurora borealis — vivid SVG curtains */}
      <motion.div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: "48%", zIndex: 1 }}
        animate={{ opacity: [0.1, 0.28, 0.06, 0.22, 0.1] }}
        transition={{ duration: 12, repeat: Infinity }}>
        <svg viewBox="0 0 800 300" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0,0 Q200,190 400,120 Q600,55 800,200 L800,0 Z" fill="#00ffaa" opacity="0.18" />
          <path d="M0,0 Q150,220 350,140 Q550,75 800,240 L800,0 Z" fill="#0088ff" opacity="0.12" />
          <path d="M0,0 Q280,170 460,100 Q660,45 800,180 L800,0 Z" fill="#44ffcc" opacity="0.13" />
        </svg>
      </motion.div>

      {/* Hanging icicles at top */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none z-2">
        <svg viewBox="0 0 800 45" className="w-full" preserveAspectRatio="none">
          {[25,65,115,165,225,285,350,420,490,560,630,700,760].map((x, i) => (
            <polygon key={i} points={`${x-6},0 ${x+6},0 ${x},${18+i%5*6}`} fill="#c8e8f6" opacity="0.55" />
          ))}
        </svg>
      </div>

      {/* Distant mountain range with snow caps */}
      <div className="absolute z-2 pointer-events-none" style={{ bottom: "33%", left: 0, right: 0 }}>
        <svg viewBox="0 0 800 160" className="w-full" preserveAspectRatio="none">
          <polygon points="0,160 65,38 135,98 210,12 295,72 380,8 465,68 555,18 635,58 720,10 800,50 800,160" fill="#1a4570" opacity="0.65" />
          <polygon points="0,160 90,58 165,108 255,30 345,80 438,22 525,70 615,24 710,65 800,35 800,160" fill="#26618f" opacity="0.5" />
          {/* Snow caps */}
          <polygon points="210,12 196,40 224,40" fill="#c8e8f6" opacity="0.72" />
          <polygon points="380,8 364,36 396,36" fill="#c8e8f6" opacity="0.72" />
          <polygon points="555,18 540,44 570,44" fill="#c8e8f6" opacity="0.72" />
          <polygon points="720,10 705,38 735,38" fill="#c8e8f6" opacity="0.72" />
        </svg>
      </div>

      {/* Ice/snow ground with cracks */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: "36%" }}>
        <svg viewBox="0 0 800 230" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0,65 Q90,32 200,52 Q330,18 410,46 Q530,12 610,40 Q710,22 800,38 L800,230 L0,230 Z" fill="#b8d8f0" />
          <path d="M0,85 Q140,62 300,76 Q460,55 620,70 Q720,58 800,68 L800,230 L0,230 Z" fill="#cce6f6" />
          <path d="M0,100 Q200,88 400,96 Q600,84 800,94 L800,230 L0,230 Z" fill="#e0f2fc" />
          <path d="M0,115 Q200,108 400,112 Q600,105 800,112 L800,230 L0,230 Z" fill="#f0f8ff" />
          {/* Ice crack lines */}
          <path d="M45,130 Q80,124 125,134 Q158,127 195,138" fill="none" stroke="#98c8e0" strokeWidth="1.5" opacity="0.5" />
          <path d="M310,112 Q358,106 405,118 Q445,110 485,120" fill="none" stroke="#98c8e0" strokeWidth="1.2" opacity="0.45" />
          <path d="M590,125 Q638,118 682,130 Q722,122 762,130" fill="none" stroke="#98c8e0" strokeWidth="1.2" opacity="0.4" />
        </svg>
        {/* Small fish frozen in ice */}
        <div className="absolute pointer-events-none" style={{ bottom: "32%", left: "16%" }}>
          <svg viewBox="0 0 32 14" width="28" height="12">
            <ellipse cx="14" cy="7" rx="10" ry="5" fill="#5ab8e0" opacity="0.55" />
            <polygon points="24,7 31,3 31,11" fill="#5ab8e0" opacity="0.5" />
            <circle cx="8" cy="6" r="1.4" fill="#1a5a80" opacity="0.65" />
          </svg>
        </div>
        <div className="absolute pointer-events-none" style={{ bottom: "28%", right: "20%" }}>
          <svg viewBox="0 0 28 12" width="24" height="10">
            <ellipse cx="12" cy="6" rx="8" ry="4" fill="#7acce8" opacity="0.5" />
            <polygon points="20,6 27,3 27,9" fill="#7acce8" opacity="0.45" />
            <circle cx="7" cy="5" r="1.2" fill="#1a5a80" opacity="0.6" />
          </svg>
        </div>
        {/* Footprints */}
        <div className="absolute pointer-events-none" style={{ bottom: "26%", left: "40%" }}>
          <svg viewBox="0 0 80 18" width="70" height="16">
            {[0,18,36,54].map((x, i) => (
              <ellipse key={i} cx={x + (i%2===0 ? 0 : 8)} cy={i%2===0 ? 5 : 13} rx="4.5" ry="2.8" fill="#98c8e0" opacity="0.5" />
            ))}
          </svg>
        </div>
      </div>

      {/* Falling snow */}
      {snowParticles.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full bg-white pointer-events-none"
          style={{ width: p.size, height: p.size, left: `${p.left}%`, top: -12, opacity: 0.8 }}
          animate={{ y: "115vh", x: [0,18,-15,8,0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }} />
      ))}

      {/* Scene row */}
      <div className="absolute bottom-[22%] left-0 right-0 flex items-end justify-around px-4 md:px-8 z-10">
        {/* Igloo */}
        <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 55 }}>
          <IglooSVG />
        </motion.div>

        {/* Avatar + Snowman group — interactive */}
        <div className="relative flex items-end gap-3">
          {showSparkles && <Sparkles count={20} />}
          
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.35, type: "spring", stiffness: 50 }}
            className="relative"
          >
            <Avatar size={68} className="z-10" />
            <motion.div
              className="absolute -right-1 top-0 text-2xl"
              animate={tapped ? { rotate: [0, 25, -15, 20, -10, 15, 0], y: [0,-4,0,-3,0] } : { rotate: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              👋
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }} animate={tapped ? { rotate: [0,-16,16,-10,10,-5,5,0], scale: [1,1.12,1] } : { scale: 1, opacity: 1 }}
            whileHover={!tapped ? { scale: 1.08 } : {}} whileTap={!tapped ? { scale: 0.9 } : {}}
            onClick={handleSnowman} className="cursor-pointer"
            transition={tapped ? { duration: 0.65 } : { delay: 0.5, type: "spring" }}>
            <SnowmanSVG />
          </motion.div>
          
          {!tapped && (
            <motion.div animate={{ opacity: [0.6,1,0.6], y: [0,-4,0] }} transition={{ duration: 1.4, repeat: Infinity }}
              className="absolute -top-9 right-1/3 bg-white/90 rounded-full px-3 py-1 text-xs font-bold text-blue-900 whitespace-nowrap shadow-lg">
              Tap the snowman!
            </motion.div>
          )}
        </div>

        {/* Penguin trio + Polar Bear */}
        <div className="flex items-end gap-2">
          {[0,1,2].map((i) => (
            <motion.div key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.65 + i * 0.18 }}>
              <motion.div
                animate={{ rotate: i % 2 === 0 ? [0,9,-9,0] : [0,-9,9,0], y: [0,-6,0] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}>
                <PenguinSVG scale={0.52 + i * 0.07} />
              </motion.div>
            </motion.div>
          ))}
          {/* Polar Bear */}
          <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.9, type: "spring", stiffness: 45 }}>
            <motion.div animate={{ y: [0,-4,0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
              <PolarBearSVG scale={0.72} />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  STATE 4: ANTARCTICA RESCUE  — ice bridge scenario
// ═══════════════════════════════════════════════════════════════════════════
function AntarcticaRescueScreen({ onNext, onBack }) {
  const [stage, setStage] = useState("blocked"); // blocked | bridging | crossing | reunited
  const [showSparkles, setShowSparkles] = useState(false);
  const constraintsRef = useRef(null);

  const handleIceBlock = () => {
    if (stage !== "blocked") return;
    setStage("bridging");
    setTimeout(() => {
      setStage("crossing");
      setTimeout(() => {
        setStage("reunited");
        setShowSparkles(true);
        setTimeout(() => onNext(), 1400);
      }, 1600);
    }, 600);
  };

  return (
    <div ref={constraintsRef} className="relative w-full h-full overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #0d1f4a 0%, #1a3a7a 25%, #2a6aaa 50%, #60a8d0 75%, #a8d4ec 100%)" }}>

      {/* Back button */}
      <motion.button initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 60 }}
        onClick={onBack}
        className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold px-3 py-2 rounded-full shadow-lg cursor-pointer border border-white/30 transition-colors">
        <ArrowRight size={16} className="rotate-180" />
        <span className="text-sm">Back</span>
      </motion.button>
      
      {/* Stars */}
      {[...Array(14)].map((_, i) => (
        <motion.div key={i} className="absolute rounded-full bg-white pointer-events-none"
          style={{ width: 1.5 + i % 3, height: 1.5 + i % 3, top: `${4 + (i * 6) % 36}%`, left: `${6 + (i * 9) % 86}%` }}
          animate={{ opacity: [0.2,1,0.2] }}
          transition={{ duration: 2 + i * 0.25, repeat: Infinity, delay: i * 0.18 }} />
      ))}

      {/* Water gap — wider, darker, dramatic arctic water */}
      <div className="absolute z-5" style={{ bottom: "17%", left: "28%", right: "28%", height: "20%" }}>
        <motion.div className="w-full h-full"
          style={{ background: "linear-gradient(to bottom, #0d47a1, #1565c0, #1e88e5)", borderRadius: "4px" }}
          animate={{ opacity: [0.88, 1, 0.88] }}
          transition={{ duration: 2.5, repeat: Infinity }} />
        {/* Animated waves */}
        <motion.svg viewBox="0 0 200 35" className="absolute top-2 w-full"
          animate={{ x: [0, -18, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
          <path d="M-10,18 Q20,6 50,18 Q80,30 110,18 Q140,6 170,18 Q200,30 230,18" fill="none" stroke="#42a5f5" strokeWidth="2" opacity="0.65" />
          <path d="M-10,28 Q25,16 55,28 Q85,40 115,28 Q145,16 175,28" fill="none" stroke="#1e88e5" strokeWidth="1.5" opacity="0.4" />
        </motion.svg>
        {/* Floating ice fragments */}
        <motion.div className="absolute" style={{ top: "18%", left: "10%", width: "24%", height: "32%" }}
          animate={{ x: [0, 5, 0], y: [0, 2, 0] }} transition={{ duration: 3.2, repeat: Infinity }}>
          <svg viewBox="0 0 40 18" className="w-full h-full">
            <ellipse cx="20" cy="9" rx="17" ry="7" fill="#b8ddf0" opacity="0.75" />
            <ellipse cx="20" cy="7" rx="12" ry="4" fill="#d8eef8" opacity="0.65" />
          </svg>
        </motion.div>
        <motion.div className="absolute" style={{ top: "42%", right: "10%", width: "18%", height: "26%" }}
          animate={{ x: [0, -4, 0], y: [0, 3, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 0.8 }}>
          <svg viewBox="0 0 32 14" className="w-full h-full">
            <ellipse cx="16" cy="7" rx="14" ry="6" fill="#b8ddf0" opacity="0.7" />
            <ellipse cx="16" cy="5" rx="9" ry="3.5" fill="#d8eef8" opacity="0.6" />
          </svg>
        </motion.div>
      </div>

      {/* Left ice platform — with edge cracks */}
      <div className="absolute z-10" style={{ bottom: 0, left: 0, width: "36%", height: "40%" }}>
        <svg viewBox="0 0 300 270" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0,270 L0,75 Q60,45 125,65 Q185,38 250,58 Q278,52 300,62 L300,270 Z" fill="#b8d8f0" />
          <path d="M0,270 L0,108 Q82,83 165,100 Q245,78 300,93 L300,270 Z" fill="#cce6f6" />
          <path d="M0,270 L0,138 Q102,118 204,133 Q265,122 300,128 L300,270 Z" fill="#e0f2fc" />
          <path d="M0,270 L0,162 Q120,150 240,160 L300,155 L300,270 Z" fill="#f0f8ff" />
          {/* Edge cracks */}
          <path d="M282,62 L290,88 L278,104" fill="none" stroke="#8ab8d8" strokeWidth="2" opacity="0.55" />
          <path d="M262,58 L270,76 L258,88" fill="none" stroke="#8ab8d8" strokeWidth="1.5" opacity="0.45" />
          <path d="M295,78 L300,95" fill="none" stroke="#8ab8d8" strokeWidth="1.5" opacity="0.4" />
        </svg>
      </div>

      {/* Right ice platform — with edge cracks */}
      <div className="absolute z-10" style={{ bottom: 0, right: 0, width: "36%", height: "40%" }}>
        <svg viewBox="0 0 300 270" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0,62 Q22,52 50,58 Q118,38 178,65 Q240,45 300,75 L300,270 L0,270 Z" fill="#b8d8f0" />
          <path d="M0,93 Q58,78 138,100 Q218,83 300,108 L300,270 L0,270 Z" fill="#cce6f6" />
          <path d="M0,128 Q40,120 100,133 Q202,118 300,135 L300,270 L0,270 Z" fill="#e0f2fc" />
          <path d="M0,155 L60,150 Q180,148 300,155 L300,270 L0,270 Z" fill="#f0f8ff" />
          {/* Edge cracks */}
          <path d="M18,62 L10,88 L22,104" fill="none" stroke="#8ab8d8" strokeWidth="2" opacity="0.55" />
          <path d="M38,58 L30,76 L42,88" fill="none" stroke="#8ab8d8" strokeWidth="1.5" opacity="0.45" />
          <path d="M5,78 L0,95" fill="none" stroke="#8ab8d8" strokeWidth="1.5" opacity="0.4" />
        </svg>
      </div>

      {/* ICE BRIDGE — animates scaleX from 0→1 when block is placed */}
      <AnimatePresence>
        {(stage === "bridging" || stage === "crossing" || stage === "reunited") && (
          <motion.div
            className="absolute z-12"
            style={{ bottom: "22%", left: "28%", right: "28%", height: "10%", transformOrigin: "left center" }}
            initial={{ scaleX: 0, opacity: 0.7 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}>
            <svg viewBox="0 0 200 38" className="w-full h-full" preserveAspectRatio="none">
              <rect x="0" y="4" width="200" height="26" rx="5" fill="#c8e8f6" stroke="#90c8e8" strokeWidth="2" />
              <rect x="2" y="6" width="196" height="10" rx="3" fill="#e0f4fc" opacity="0.8" />
              <path d="M8,18 Q50,12 100,18 Q150,24 192,18" fill="none" stroke="white" strokeWidth="1.2" opacity="0.5" />
              <circle cx="28" cy="13" r="2.5" fill="white" opacity="0.55" />
              <circle cx="100" cy="11" r="2" fill="white" opacity="0.45" />
              <circle cx="172" cy="13" r="2.5" fill="white" opacity="0.55" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title at top */}
      <div className="absolute top-6 left-0 right-0 z-20 text-center px-4">
        <h2 className="font-bold text-xl sm:text-2xl text-white drop-shadow-lg">
          {stage === "reunited" ? "Yay! The penguin family is together!" : "Help the baby penguin reach its mommy!"}
        </h2>
      </div>

      {/* Baby penguin on left platform */}
      <motion.div
        className="absolute z-20"
        style={{ bottom: "32%" }}
        animate={{
          left: stage === "crossing" ? "72%" : stage === "reunited" ? "70%" : "10%",
          y: stage === "crossing" ? [0, -8, 0, -5, 0] : [0, -4, 0],
        }}
        transition={{
          left: { duration: 1.8, ease: "easeInOut" },
          y: { duration: stage === "crossing" ? 0.38 : 1.5, repeat: stage === "crossing" ? 3 : Infinity },
        }}
      >
        <PenguinSVG scale={0.7} />
      </motion.div>

      {/* Mother penguin on right platform */}
      <motion.div
        className="absolute z-20"
        style={{ bottom: "32%", right: "10%" }}
        animate={{
          y: [0, -5, 0],
          rotate: stage === "reunited" ? [0, 8, -8, 5, -5, 0] : 0,
        }}
        transition={{ duration: stage === "reunited" ? 0.6 : 2, repeat: stage === "reunited" ? 1 : Infinity }}
      >
        <PenguinSVG scale={0.85} />
        {stage === "reunited" && (
          <motion.div
            initial={{ scale: 0, y: 0 }}
            animate={{ scale: [0, 1.3, 1], y: -30 }}
            transition={{ duration: 0.5 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 text-3xl"
          >
            ❤️
          </motion.div>
        )}
      </motion.div>

      {/* Ice block */}
      <motion.div
        className={`absolute z-15 ${stage === "blocked" ? "cursor-grab active:cursor-grabbing" : ""}`}
        style={{ bottom: "38%", left: "38%" }}
        drag={stage === "blocked"}
        dragConstraints={constraintsRef}
        dragElastic={0.25}
        onDragEnd={(_, info) => {
          if (stage === "blocked" && (Math.abs(info.offset.x) > 35 || Math.abs(info.offset.y) > 25)) handleIceBlock();
        }}
        onClick={stage === "blocked" ? handleIceBlock : undefined}
        animate={
          stage === "bridging" || stage === "crossing" || stage === "reunited"
            ? { x: -55, y: 80, rotate: 0, scale: 1.12 }
            : { y: [0, -4, 0], rotate: [-2, 2, -2] }
        }
        transition={stage === "blocked" ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.45, ease: "easeOut" }}
        whileHover={stage === "blocked" ? { scale: 1.1 } : {}}
        whileTap={stage === "blocked" ? { scale: 0.94 } : {}}
      >
        <svg viewBox="0 0 130 58" width="148" height="66" className="drop-shadow-xl">
          <defs>
            <linearGradient id="iceGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#dff4ff" stopOpacity="0.98" />
              <stop offset="45%" stopColor="#b8e6fc" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#7ac8f0" stopOpacity="0.95" />
            </linearGradient>
          </defs>
          <path d="M 8 48 L 4 22 Q 6 10 18 8 L 112 6 Q 124 8 126 18 L 124 46 Q 122 54 112 54 L 18 54 Q 8 54 8 48 Z"
            fill="url(#iceGrad2)" stroke="#90d0f0" strokeWidth="2" />
          <path d="M 18 8 L 112 6 L 126 18 L 18 14 Z" fill="white" fillOpacity="0.3" />
          <path d="M 25 18 L 55 30 L 85 18" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.55" />
          <path d="M 45 32 L 65 38 L 95 28" fill="none" stroke="#c8e8fc" strokeWidth="1" strokeOpacity="0.4" />
          <path d="M 35 12 L 42 30 L 38 44" fill="none" stroke="#a0d0ec" strokeWidth="1.2" strokeOpacity="0.5" />
          <path d="M 82 10 L 88 26" fill="none" stroke="#a0d0ec" strokeWidth="1" strokeOpacity="0.4" />
          <circle cx="28" cy="36" r="3.5" fill="white" fillOpacity="0.25" />
          <circle cx="70" cy="42" r="3" fill="white" fillOpacity="0.2" />
          <circle cx="105" cy="30" r="2.5" fill="white" fillOpacity="0.28" />
          <circle cx="15" cy="16" r="2.2" fill="white" fillOpacity="0.7" />
          <circle cx="115" cy="14" r="2" fill="white" fillOpacity="0.65" />
          <circle cx="62" cy="8" r="1.8" fill="white" fillOpacity="0.6" />
        </svg>
      </motion.div>

      {/* Tap hint */}
      {stage === "blocked" && (
        <motion.div
          className="absolute z-25"
          style={{ bottom: "46%", left: "50%", transform: "translateX(-50%)" }}
          animate={{ opacity: [0.6, 1, 0.6], y: [0, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <p className="text-sm font-bold text-white bg-gray-900/70 rounded-full px-4 py-2 shadow-lg whitespace-nowrap">
            Drag the ice block to bridge the gap!
          </p>
        </motion.div>
      )}

      {/* Sparkles on success */}
      {showSparkles && <Sparkles count={28} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  STATE 5: AFRICA SAFARI  — Go Button drives the jeep
// ═══════════════════════════════════════════════════════════════════════════
function AfricaSafariScreen({ avatarUrl, onNext, onBack }) {
  const [driving, setDriving] = useState(false);

  const handleGasPedal = () => {
    if (driving) return;
    setDriving(true);
    setTimeout(() => onNext(), 3400);
  };

  return (
    <div className="relative w-full h-full overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #b34700 0%, #d45f00 18%, #e88010 35%, #f5a830 55%, #f8c85a 72%, #fef3c7 100%)" }}>
      <SavannaBackground />
      {/* Back button */}
      <motion.button initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 60 }}
        onClick={onBack}
        className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-black/25 hover:bg-black/35 text-white font-bold px-3 py-2 rounded-full shadow-lg cursor-pointer border border-white/20 transition-colors">
        <ArrowRight size={16} className="rotate-180" />
        <span className="text-sm">Back</span>
      </motion.button>

      {/* Static Baobab trees — stay as scenery */}
      <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
        style={{ transformOrigin: "bottom center", position: "absolute", bottom: "34%", left: "55%", zIndex: 5 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 45 }}>
        <motion.div animate={{ rotate: [0,1.5,-1.5,0] }} transition={{ duration: 4, repeat: Infinity }}>
          <BaobabSVG scale={0.9} />
        </motion.div>
      </motion.div>
      <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
        style={{ transformOrigin: "bottom center", position: "absolute", bottom: "34%", right: "8%", zIndex: 5 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 45 }}>
        <BaobabSVG scale={0.65} />
      </motion.div>

      {/* Animated jeep */}
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: driving ? "110vw" : 0 }}
        transition={{ duration: 3, ease: [0.4, 0, 0.6, 1] }}
        style={{ position: "absolute", bottom: "28%", left: "6%", zIndex: 10 }}>
        <motion.div animate={!driving ? { y: [0,-3,0] } : {}} transition={{ duration: 1.8, repeat: Infinity }}>
          <SafariJeepSVG avatarUrl={avatarUrl} />
        </motion.div>
      </motion.div>

      {/* Go Button — overlaid on the jeep */}
      <AnimatePresence>
        {!driving && (
          <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
            className="absolute z-20 flex flex-col items-center gap-1"
            style={{ bottom: "38%", left: "5%" }}>
            <motion.p animate={{ opacity: [0.6,1,0.6] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="text-white font-bold text-sm drop-shadow bg-black/40 px-2 py-0.5 rounded-full">
              Tap to go!
            </motion.p>
            <motion.button
              whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
              animate={{
                scale: [1,1.08,1],
                boxShadow: ["0 0 0 0 rgba(239,68,68,0)","0 0 22px 10px rgba(239,68,68,0.55)","0 0 0 0 rgba(239,68,68,0)"],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              onClick={handleGasPedal}
              className="cursor-pointer w-16 h-16 rounded-full bg-gradient-to-b from-red-400 to-red-700 shadow-2xl flex flex-col items-center justify-center gap-0.5 border-3 border-red-300">
              <Gauge size={22} className="text-white" />
              <span className="text-white font-black text-xs">GO!</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  STATE 6: AFRICA GIRAFFE  — jeep drives in, tap giraffe, jeep drives out
// ═══════════════════════════════════════════════════════════════════════════
function AfricaGiraffeScreen({ avatarUrl, onNext, onBack }) {
  const [stage, setStage] = useState("arriving"); // arriving | idle | tapped | leaving
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    if (stage === "arriving") {
      const t = setTimeout(() => setStage("idle"), 1800);
      return () => clearTimeout(t);
    }
  }, [stage]);

  const handleGiraffe = () => {
    if (stage !== "idle") return;
    setStage("tapped");
    setShowSparkles(true);
    setTimeout(() => setStage("leaving"), 1000);
    setTimeout(() => onNext(), 2600);
  };

  return (
    <div className="relative w-full h-full overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #b34700 0%, #d45f00 18%, #e88010 35%, #f5a830 55%, #f8c85a 72%, #fef3c7 100%)" }}>
      <SavannaBackground />
      {/* Back button */}
      <motion.button initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 60 }}
        onClick={onBack}
        className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-black/25 hover:bg-black/35 text-white font-bold px-3 py-2 rounded-full shadow-lg cursor-pointer border border-white/20 transition-colors">
        <ArrowRight size={16} className="rotate-180" />
        <span className="text-sm">Back</span>
      </motion.button>

      {/* Baobab tree as scenery */}
      <div className="absolute z-5" style={{ bottom: "34%", left: "8%" }}>
        <BaobabSVG scale={0.85} />
      </div>

      {/* Giraffe — stays in scene */}
      <div className="relative z-10" style={{ position: "absolute", bottom: "27%", right: "8%" }}>
        {showSparkles && <Sparkles count={20} />}
        <motion.div
          animate={stage === "tapped" ? { y: [0,-24,0,-14,0] } : !["leaving"].includes(stage) ? { rotate: [0,1.5,-1.5,0] } : {}}
          transition={stage === "tapped" ? { duration: 0.75 } : { duration: 3, repeat: Infinity }}
          whileHover={stage === "idle" ? { scale: 1.05 } : {}}
          whileTap={stage === "idle" ? { scale: 0.95 } : {}}
          onClick={handleGiraffe}
          className={stage === "idle" ? "cursor-pointer" : ""}>
          <GiraffeSVG scale={0.82} />
        </motion.div>
        {stage === "idle" && (
          <motion.div animate={{ opacity: [0.6,1,0.6], y: [0,-4,0] }} transition={{ duration: 1.4, repeat: Infinity }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white/85 rounded-full px-3 py-1 text-xs font-bold text-amber-900 whitespace-nowrap shadow">
            Tap me!
          </motion.div>
        )}
      </div>

      {/* Jeep animates in, then leaves */}
      <motion.div
        initial={{ x: "-35vw" }}
        animate={{
          x: stage === "leaving" ? "110vw" : stage === "arriving" ? 0 : 0,
        }}
        style={{ position: "absolute", bottom: "28%", left: "10%", zIndex: 10 }}
        transition={{ duration: stage === "leaving" ? 1.8 : 1.6, ease: "easeInOut" }}>
        <motion.div animate={stage === "idle" ? { y: [0,-3,0] } : {}} transition={{ duration: 1.8, repeat: Infinity }}>
          <SafariJeepSVG avatarUrl={avatarUrl} />
        </motion.div>
      </motion.div>
    </div>
  );
}

// Zebra SVG
function ZebraSVG({ scale = 1 }) {
  return (
    <svg viewBox="0 0 80 70" width={80 * scale} height={70 * scale}>
      <ellipse cx="40" cy="38" rx="28" ry="18" fill="white" />
      {[15, 25, 35, 45, 55].map((x, i) => (
        <rect key={i} x={x} y="24" width="4" height="30" fill="#222" rx="1" transform={`rotate(${-5 + i*3} ${x+2} 38)`} />
      ))}
      <ellipse cx="68" cy="32" rx="10" ry="12" fill="white" />
      <rect x="64" y="24" width="2" height="18" fill="#222" rx="0.5" />
      <rect x="68" y="26" width="2" height="16" fill="#222" rx="0.5" />
      <rect x="72" y="28" width="2" height="14" fill="#222" rx="0.5" />
      <circle cx="74" cy="28" r="2" fill="#222" />
      <ellipse cx="76" cy="36" rx="4" ry="2" fill="#222" />
      <rect x="20" y="48" width="6" height="20" rx="2" fill="white" /><rect x="18" y="52" width="6" height="4" fill="#222" />
      <rect x="30" y="50" width="6" height="18" rx="2" fill="white" /><rect x="28" y="54" width="6" height="4" fill="#222" />
      <rect x="44" y="50" width="6" height="18" rx="2" fill="white" /><rect x="42" y="54" width="6" height="4" fill="#222" />
      <rect x="54" y="48" width="6" height="20" rx="2" fill="white" /><rect x="52" y="52" width="6" height="4" fill="#222" />
      <ellipse cx="22" cy="68" rx="5" ry="3" fill="#333" />
      <ellipse cx="32" cy="68" rx="5" ry="3" fill="#333" />
      <ellipse cx="46" cy="68" rx="5" ry="3" fill="#333" />
      <ellipse cx="56" cy="68" rx="5" ry="3" fill="#333" />
    </svg>
  );
}

// Flamingo SVG
function FlamingoSVG({ scale = 1 }) {
  return (
    <svg viewBox="0 0 38 80" width={38 * scale} height={80 * scale}>
      <line x1="17" y1="58" x2="13" y2="78" stroke="#e8607a" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="21" y1="58" x2="25" y2="78" stroke="#e8607a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 9 78 Q 13 76 17 78" fill="none" stroke="#e8607a" strokeWidth="2" strokeLinecap="round" />
      <path d="M 21 78 Q 25 76 29 78" fill="none" stroke="#e8607a" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="19" cy="48" rx="11" ry="15" fill="#f4a0b8" />
      <ellipse cx="19" cy="45" rx="8" ry="11" fill="#f8b8ca" />
      <ellipse cx="27" cy="48" rx="9" ry="7" fill="#f09ab2" transform="rotate(18 27 48)" />
      <path d="M 19 32 Q 27 20 23 10" fill="none" stroke="#f4a0b8" strokeWidth="5.5" strokeLinecap="round" />
      <circle cx="22" cy="8" r="6.5" fill="#f4a0b8" />
      <path d="M 27 8 Q 35 10 33 14 Q 29 12 25 10 Z" fill="#e87000" />
      <path d="M 27 8 Q 35 6 33 10" fill="none" stroke="#2a1a00" strokeWidth="1" strokeLinecap="round" />
      <circle cx="24" cy="7" r="1.8" fill="#1a1a1a" />
      <circle cx="23" cy="6.5" r="0.65" fill="white" />
    </svg>
  );
}

// Water lily SVG
function WaterLilySVG({ scale = 1 }) {
  return (
    <svg viewBox="0 0 42 32" width={42 * scale} height={32 * scale}>
      <ellipse cx="21" cy="24" rx="19" ry="7" fill="#2e7d32" opacity="0.82" />
      <path d="M 21 24 L 3 24" fill="none" stroke="#388e3c" strokeWidth="1.8" />
      {[0,45,90,135,180,225,270,315].map((a, i) => (
        <ellipse key={i} cx={21 + 9 * Math.cos(a * Math.PI / 180)} cy={13 + 5 * Math.sin(a * Math.PI / 180)}
          rx="4.5" ry="2.8" fill={["#f48fb1","#f06292","#ec407a","#f8bbd0","#f48fb1","#f06292","#ec407a","#f8bbd0"][i]}
          opacity="0.92" transform={`rotate(${a} ${21 + 9*Math.cos(a*Math.PI/180)} ${13 + 5*Math.sin(a*Math.PI/180)})`} />
      ))}
      <circle cx="21" cy="13" r="4" fill="#FFD700" />
      <circle cx="21" cy="13" r="2.5" fill="#FFC500" />
    </svg>
  );
}

// Reeds / papyrus
function ReedsSVG({ scale = 1 }) {
  return (
    <svg viewBox="0 0 30 62" width={30 * scale} height={62 * scale}>
      <line x1="8" y1="62" x2="8" y2="15" stroke="#5a8010" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="8" cy="12" rx="4" ry="8" fill="#6a7800" />
      <line x1="15" y1="62" x2="15" y2="10" stroke="#6a9010" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="15" cy="7" rx="4" ry="9" fill="#7a8800" />
      <line x1="22" y1="62" x2="22" y2="18" stroke="#5a8010" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="22" cy="15" rx="3" ry="7" fill="#6a7800" />
    </svg>
  );
}

function BirdSVG({ x, delay = 0 }) {
  return (
    <motion.svg viewBox="0 0 24 12" width="18" height="9"
      className="absolute"
      style={{ top: `${10 + Math.random() * 8}%`, left: `${x}%` }}
      animate={{ x: [0, 40, 80], y: [0, -8, 0] }}
      transition={{ duration: 5 + Math.random() * 2, repeat: Infinity, delay, ease: "linear" }}>
      <path d="M0,6 Q6,0 12,6 Q18,0 24,6" fill="none" stroke="#333" strokeWidth="2" />
    </motion.svg>
  );
}

function AfricaWateringHoleScreen({ onNext, onBack }) {
  const [stage, setStage] = useState("blocked");
  const [showSparkles, setShowSparkles] = useState(false);
  const constraintsRef = useRef(null);

  const handleLogInteract = () => {
    if (stage !== "blocked") return;
    setStage("logMoving");
    setTimeout(() => {
      setStage("elephantWalking");
      setTimeout(() => {
        setStage("drinking");
        setShowSparkles(true);
        setTimeout(() => {
          setStage("done");
          setTimeout(() => onNext(), 1200);
        }, 1800);
      }, 1400);
    }, 800);
  };

  return (
    <div ref={constraintsRef} className="relative w-full h-full overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #c85000 0%, #e07010 15%, #f0a030 38%, #e8b840 60%, #d4a020 80%, #b88010 100%)" }}>

      {/* Back button */}
      <motion.button initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 60 }}
        onClick={onBack}
        className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-black/25 hover:bg-black/35 text-white font-bold px-3 py-2 rounded-full shadow-lg cursor-pointer border border-white/20 transition-colors">
        <ArrowRight size={16} className="rotate-180" />
        <span className="text-sm">Back</span>
      </motion.button>

      {/* Sun */}
      <motion.div className="absolute top-4 right-8 z-5"
        animate={{ scale: [1,1.06,1] }} transition={{ duration: 4, repeat: Infinity }}>
        <svg viewBox="0 0 68 68" width="62" height="62">
          <circle cx="34" cy="34" r="27" fill="#FFE135" opacity="0.12" />
          {[0,40,80,120,160,200,240,280,320].map((a,i) => (
            <motion.line key={i} x1="34" y1="34"
              x2={34 + 30 * Math.cos((a * Math.PI) / 180)} y2={34 + 30 * Math.sin((a * Math.PI) / 180)}
              stroke="#FFD700" strokeWidth="2.8" strokeLinecap="round"
              animate={{ opacity: [0.4,1,0.4] }} transition={{ duration: 2.2, repeat: Infinity, delay: i*0.1 }} />
          ))}
          <circle cx="34" cy="34" r="15" fill="#FFE550" />
          <circle cx="34" cy="34" r="11" fill="#FFD700" />
        </svg>
      </motion.div>

      {/* Cloud */}
      <motion.div className="absolute pointer-events-none z-5" style={{ top: "4%", left: "4%" }}
        animate={{ x: [0, 45, 0] }} transition={{ duration: 48, repeat: Infinity, ease: "linear" }}>
        <svg viewBox="0 0 130 50" width="115" height="44">
          <ellipse cx="65" cy="34" rx="55" ry="18" fill="white" opacity="0.38" />
          <ellipse cx="45" cy="26" rx="32" ry="20" fill="white" opacity="0.35" />
          <ellipse cx="80" cy="22" rx="38" ry="22" fill="white" opacity="0.38" />
        </svg>
      </motion.div>

      {/* Flying birds — 4 of them */}
      <BirdSVG x={5} delay={0} />
      <BirdSVG x={22} delay={1.6} />
      <BirdSVG x={58} delay={0.7} />
      <BirdSVG x={78} delay={2.4} />

      {/* Distant savanna hills */}
      <div className="absolute z-0" style={{ top: "12%", left: 0, right: 0 }}>
        <svg viewBox="0 0 800 130" className="w-full" preserveAspectRatio="none">
          <path d="M0,130 Q80,52 185,80 Q325,30 475,70 Q625,32 770,62 L800,55 L800,130 Z" fill="#8a4010" opacity="0.42" />
          <path d="M0,130 Q120,68 285,90 Q445,42 605,80 Q725,50 800,70 L800,130 Z" fill="#a05018" opacity="0.32" />
          <path d="M0,130 Q165,88 360,102 Q565,70 800,92 L800,130 Z" fill="#c07828" opacity="0.22" />
        </svg>
      </div>

      {/* Acacia tree silhouettes */}
      <div className="absolute z-2 pointer-events-none" style={{ bottom: "44%", left: "20%" }}>
        <svg viewBox="0 0 80 95" width="68" height="80">
          <rect x="36" y="38" width="9" height="57" rx="4" fill="#5a3808" />
          <ellipse cx="40" cy="32" rx="36" ry="16" fill="#3a7018" opacity="0.88" />
          <ellipse cx="20" cy="38" rx="20" ry="11" fill="#2e6010" opacity="0.82" />
          <ellipse cx="60" cy="36" rx="18" ry="10" fill="#2e6010" opacity="0.82" />
          <ellipse cx="40" cy="26" rx="28" ry="13" fill="#4a8020" opacity="0.78" />
        </svg>
      </div>
      <div className="absolute z-2 pointer-events-none" style={{ bottom: "43%", right: "20%" }}>
        <svg viewBox="0 0 80 95" width="58" height="68">
          <rect x="36" y="40" width="9" height="55" rx="4" fill="#5a3808" />
          <ellipse cx="40" cy="34" rx="33" ry="14" fill="#3a7018" opacity="0.84" />
          <ellipse cx="18" cy="40" rx="18" ry="10" fill="#2e6010" opacity="0.78" />
          <ellipse cx="62" cy="38" rx="17" ry="9" fill="#2e6010" opacity="0.78" />
          <ellipse cx="40" cy="28" rx="26" ry="12" fill="#4a8020" opacity="0.74" />
        </svg>
      </div>

      {/* Baobab trees */}
      <div className="absolute z-2" style={{ bottom: "44%", left: "3%" }}>
        <BaobabSVG scale={0.52} />
      </div>
      <div className="absolute z-2" style={{ bottom: "46%", right: "6%" }}>
        <BaobabSVG scale={0.38} />
      </div>

      {/* Background zebras */}
      <motion.div className="absolute z-3" style={{ bottom: "40%", right: "20%" }}
        animate={{ x: [0, -5, 0] }} transition={{ duration: 4.5, repeat: Infinity }}>
        <ZebraSVG scale={0.58} />
      </motion.div>
      <motion.div className="absolute z-3" style={{ bottom: "42%", right: "34%" }}
        animate={{ y: [0, 2, 0] }} transition={{ duration: 3.2, repeat: Infinity, delay: 0.5 }}>
        <ZebraSVG scale={0.48} />
      </motion.div>

      {/* Savanna ground */}
      <div className="absolute z-4" style={{ bottom: 0, left: 0, right: 0, height: "50%" }}>
        <svg viewBox="0 0 800 360" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0,360 L0,28 Q140,-2 340,22 Q540,8 800,18 L800,360 Z" fill="#b87808" />
          <path d="M0,360 L0,65 Q200,45 400,58 Q600,42 800,52 L800,360 Z" fill="#c89018" />
          <path d="M0,360 L0,102 Q250,88 500,98 Q700,85 800,95 L800,360 Z" fill="#d4a028" />
          <path d="M0,360 L0,138 Q300,125 600,135 Q750,122 800,130 L800,360 Z" fill="#daa830" />
          <path d="M55,155 Q95,148 138,158 Q172,150 210,160" fill="none" stroke="#b87808" strokeWidth="1.5" opacity="0.5" />
          <path d="M415,142 Q462,135 508,145" fill="none" stroke="#b87808" strokeWidth="1.2" opacity="0.42" />
          <path d="M618,152 Q668,144 715,155" fill="none" stroke="#b87808" strokeWidth="1.2" opacity="0.4" />
        </svg>
        {/* Grass tufts near water edge */}
        {[8, 16, 25, 35, 44, 52, 62, 70, 80].map((x, i) => (
          <motion.div key={i} className="absolute pointer-events-none"
            style={{ left: `${x}%`, bottom: `${51 + i % 4}%` }}
            animate={{ rotate: [0, 4, -3, 0] }}
            transition={{ duration: 2.2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}>
            <svg viewBox="0 0 26 28" width={16 + i % 3 * 4} height={16 + i % 3 * 4}>
              <line x1="13" y1="28" x2="5" y2="4" stroke="#5a9010" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="13" y1="28" x2="13" y2="2" stroke="#6aaa18" strokeWidth="3" strokeLinecap="round" />
              <line x1="13" y1="28" x2="21" y2="4" stroke="#5a9010" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </motion.div>
        ))}
        {/* Small rocks */}
        {[12, 30, 50, 68, 85].map((x, i) => (
          <div key={i} className="absolute pointer-events-none"
            style={{ left: `${x}%`, bottom: `${51 + i % 3}%` }}>
            <svg viewBox="0 0 16 10" width={10 + i%3*3} height={7 + i%3*2}>
              <ellipse cx="8" cy="6" rx="7" ry="4" fill={["#8B6914","#9a7a22","#7a5910"][i % 3]} opacity="0.7" />
            </svg>
          </div>
        ))}
      </div>

      {/* WATER HOLE — rounder, deeper, richer */}
      <div className="absolute z-7 overflow-visible" style={{ bottom: "6%", right: "3%", width: "56%", height: "37%" }}>
        {/* Natural irregular shape using SVG */}
        <svg viewBox="0 0 520 230" className="w-full h-full" preserveAspectRatio="none">
          {/* Muddy shore */}
          <ellipse cx="260" cy="115" rx="258" ry="112" fill="#7a5010" />
          <ellipse cx="260" cy="115" rx="248" ry="102" fill="#8a6018" />
          {/* Water layers — 5 for depth */}
          <ellipse cx="260" cy="118" rx="232" ry="90" fill="#0d47a1" />
          <ellipse cx="260" cy="114" rx="215" ry="78" fill="#1565c0" />
          <ellipse cx="260" cy="110" rx="192" ry="65" fill="#1976d2" />
          <ellipse cx="260" cy="106" rx="166" ry="53" fill="#1e88e5" />
          <ellipse cx="258" cy="102" rx="138" ry="42" fill="#2196f3" />
          <ellipse cx="254" cy="98" rx="108" ry="32" fill="#42a5f5" />
        </svg>
        {/* Animated ripple rings */}
        <motion.div className="absolute inset-0 flex items-center justify-center"
          animate={{ opacity: [0.25, 0.65, 0.25], scale: [0.94, 1.03, 0.94] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
          <svg viewBox="0 0 420 130" className="w-[90%]">
            <ellipse cx="210" cy="65" rx="195" ry="58" fill="none" stroke="#90caf9" strokeWidth="2.5" opacity="0.5" />
            <ellipse cx="210" cy="65" rx="158" ry="44" fill="none" stroke="#bbdefb" strokeWidth="2" opacity="0.44" />
            <ellipse cx="210" cy="65" rx="118" ry="30" fill="none" stroke="#90caf9" strokeWidth="1.5" opacity="0.35" />
            <ellipse cx="210" cy="65" rx="75" ry="18" fill="none" stroke="#bbdefb" strokeWidth="1" opacity="0.28" />
          </svg>
        </motion.div>
        {/* Light reflection */}
        <motion.div className="absolute" style={{ top: "12%", left: "22%", width: "55%", height: "28%" }}
          animate={{ opacity: [0.08, 0.28, 0.08], x: [0, 8, 0] }}
          transition={{ duration: 4.5, repeat: Infinity }}>
          <svg viewBox="0 0 220 50" className="w-full h-full">
            <path d="M20,25 Q65,10 110,25 Q155,38 200,22" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.38" />
          </svg>
        </motion.div>
        {/* Water lilies */}
        <div className="absolute z-8 pointer-events-none" style={{ top: "22%", left: "10%", transform: "rotate(-14deg)" }}>
          <WaterLilySVG scale={0.92} />
        </div>
        <div className="absolute z-8 pointer-events-none" style={{ top: "44%", right: "16%", transform: "rotate(18deg)" }}>
          <WaterLilySVG scale={0.76} />
        </div>
        <div className="absolute z-8 pointer-events-none" style={{ top: "14%", right: "28%", transform: "rotate(-6deg)" }}>
          <WaterLilySVG scale={0.65} />
        </div>
        {/* Mud shore edge */}
        <div className="absolute -top-4 left-0 right-0">
          <svg viewBox="0 0 520 50" className="w-full" preserveAspectRatio="none">
            <path d="M0,50 Q75,28 172,36 Q295,20 398,30 Q462,22 520,34 L520,50 Z" fill="#7a5010" />
            <path d="M0,50 Q95,38 215,44 Q348,30 492,40 L520,50 Z" fill="#8a6018" />
          </svg>
        </div>
      </div>

      {/* Reeds at water edges */}
      <div className="absolute z-9 pointer-events-none" style={{ bottom: "35%", right: "57%" }}>
        <ReedsSVG scale={1.1} />
      </div>
      <div className="absolute z-9 pointer-events-none" style={{ bottom: "33%", right: "54%" }}>
        <ReedsSVG scale={0.85} />
      </div>
      <div className="absolute z-9 pointer-events-none" style={{ bottom: "35%", right: "4%" }}>
        <ReedsSVG scale={0.9} />
      </div>

      {/* Flamingos at water's edge */}
      <motion.div className="absolute z-9 pointer-events-none" style={{ bottom: "28%", right: "12%" }}
        animate={{ y: [0, -3, 0] }} transition={{ duration: 2.6, repeat: Infinity }}>
        <FlamingoSVG scale={0.88} />
      </motion.div>
      <motion.div className="absolute z-9 pointer-events-none" style={{ bottom: "27%", right: "18%" }}
        animate={{ y: [0, -2, 0] }} transition={{ duration: 3.1, repeat: Infinity, delay: 0.8 }}>
        <FlamingoSVG scale={0.72} />
      </motion.div>

      {/* Elephant */}
      <motion.div className="absolute z-20" style={{ bottom: "18%", left: "5%" }}
        initial={{ x: 0, rotate: 0 }}
        animate={{
          x: stage === "elephantWalking" || stage === "drinking" || stage === "done" ? 140 : 0,
          rotate: stage === "drinking" || stage === "done" ? 8 : 0,
        }}
        transition={{ duration: 1.2, ease: "easeOut" }}>
        <motion.div
          animate={stage === "blocked" ? { y: [0,-5,0] } : stage === "drinking" || stage === "done" ? { y: [0,-2,0] } : {}}
          transition={{ duration: stage === "drinking" || stage === "done" ? 0.6 : 2, repeat: Infinity }}>
          <FullElephantSVG scale={0.75} trunkDown={stage === "drinking" || stage === "done"} />
        </motion.div>
      </motion.div>

      {/* Log */}
      <motion.div
        className={`absolute z-15 select-none ${stage === "blocked" ? "cursor-grab active:cursor-grabbing" : ""}`}
        style={{ bottom: "25%", left: "32%" }}
        drag={stage === "blocked"}
        dragConstraints={constraintsRef}
        dragElastic={0.3}
        onDragEnd={(_, info) => {
          if (stage === "blocked" && (Math.abs(info.offset.x) > 50 || Math.abs(info.offset.y) > 40)) handleLogInteract();
        }}
        onClick={stage === "blocked" ? handleLogInteract : undefined}
        initial={{ x: 0, rotate: -8 }}
        animate={
          stage === "logMoving" || stage === "elephantWalking" || stage === "drinking" || stage === "done"
            ? { x: -220, y: 80, rotate: -60, opacity: 0.5 }
            : { rotate: [-8, -4, -8] }
        }
        transition={stage === "blocked" ? { duration: 2.5, repeat: Infinity } : { duration: 0.8, ease: "easeOut" }}
        whileHover={stage === "blocked" ? { scale: 1.08, rotate: 0 } : {}}
        whileTap={stage === "blocked" ? { scale: 0.95 } : {}}>
        <LogSVG scale={1.4} />
      </motion.div>

      {/* Tap hint */}
      {stage === "blocked" && (
        <motion.div className="absolute z-25"
          style={{ top: "55%", left: "50%", transform: "translateX(-50%)" }}
          animate={{ opacity: [0.6, 1, 0.6], y: [0,-5,0] }}
          transition={{ duration: 1.5, repeat: Infinity }}>
          <p className="text-sm font-bold text-white bg-gray-900/80 rounded-full px-4 py-2 shadow-lg whitespace-nowrap">
            Drag or tap the log!
          </p>
        </motion.div>
      )}

      {/* Title */}
      <div className="absolute top-5 left-0 right-0 z-10 text-center px-4">
        <h2 className="font-bold text-xl sm:text-2xl text-white drop-shadow-lg"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
          {stage === "drinking" || stage === "done" ? "The elephant is drinking! Yay!" : "Help the elephant reach the water!"}
        </h2>
      </div>

      {showSparkles && <Sparkles count={28} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  SAFARI / ANTARCTICA “MEMORY” SCENE — camera + journal polaroid
// ═══════════════════════════════════════════════════════════════════════════
function SafariPhotoMemoryScene({ avatarUrl, compact = false }) {
  const zMid = compact ? "z-[6]" : "z-[8]";
  const zHi = compact ? "z-[10]" : "z-[12]";
  return (
    <div className={`relative w-full overflow-hidden ${compact ? "h-full min-h-[11rem] rounded-lg" : "absolute inset-0"}`}>
      <div className="absolute inset-0 pointer-events-none">
        <SavannaBackground />
      </div>
      {/* Acacia / baobab trees */}
      <div className={`absolute ${compact ? "left-0 bottom-[12%]" : "left-[1%] bottom-[16%]"} ${zMid} pointer-events-none`}>
        <BaobabSVG scale={compact ? 0.22 : 0.38} />
      </div>
      <div className={`absolute ${compact ? "right-0 bottom-[14%]" : "right-[1%] bottom-[18%]"} ${zMid} pointer-events-none`}>
        <BaobabSVG scale={compact ? 0.2 : 0.34} />
      </div>
      {/* Giraffe — background */}
      <motion.div
        className={`absolute ${compact ? "left-[6%] bottom-[18%]" : "left-[8%] bottom-[24%]"} ${zMid} pointer-events-none`}
        animate={{ y: compact ? [0, -3, 0] : [0, -6, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <GiraffeSVG scale={compact ? 0.22 : 0.42} />
      </motion.div>
      {/* Elephant family */}
      <motion.div
        className={`absolute ${compact ? "right-[4%] bottom-[16%]" : "right-[6%] bottom-[22%]"} ${zHi} pointer-events-none`}
        animate={{ x: compact ? [0, 2, 0] : [0, 4, 0] }}
        transition={{ duration: 3.2, repeat: Infinity }}
      >
        <FullElephantSVG scale={compact ? 0.26 : 0.48} trunkDown={false} />
      </motion.div>
      <div className={`absolute ${compact ? "right-[18%] bottom-[14%]" : "right-[22%] bottom-[20%]"} ${zMid} pointer-events-none opacity-90`}>
        <BabyElephantSVG scale={compact ? 0.16 : 0.28} trunkDown />
      </div>
      {/* Explorer — large portrait */}
      <motion.div
        className={`absolute ${compact ? "left-[4%] bottom-[26%]" : "left-[3%] bottom-[32%]"} ${zHi} flex flex-col items-center gap-0.5 pointer-events-none`}
        animate={{ y: compact ? [0, -2, 0] : [0, -4, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div
          className={`rounded-2xl border-[3px] border-amber-800 bg-amber-100/90 shadow-xl overflow-hidden ${compact ? "w-14 h-14 rounded-xl border-2" : "w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32"}`}
        >
          <img src={avatarUrl} alt="You" className="w-full h-full object-cover" />
        </div>
        {!compact && <span className="text-[10px] sm:text-xs font-black text-amber-950 drop-shadow-sm">Explorer</span>}
      </motion.div>
      {/* Safari jeep with kid in cabin */}
      <motion.div
        className={`absolute left-1/2 -translate-x-1/2 ${compact ? "bottom-[10%] scale-[0.42]" : "bottom-[12%] sm:bottom-[14%]"} ${zHi} pointer-events-none origin-bottom`}
        animate={{ y: compact ? [0, -1, 0] : [0, -3, 0] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        <SafariJeepSVG avatarUrl={avatarUrl} />
      </motion.div>
    </div>
  );
}

function AntarcticaPhotoMemoryScene({ avatarUrl, compact = false }) {
  const snow = useMemo(
    () => Array.from({ length: compact ? 18 : 32 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      dur: 3 + Math.random() * 4,
      delay: Math.random() * 4,
      size: 2 + Math.random() * 4,
    })),
    [compact]
  );
  return (
    <div
      className={`relative w-full overflow-hidden ${compact ? "h-full min-h-[11rem] rounded-lg" : "absolute inset-0"}`}
      style={{
        background: "linear-gradient(to bottom, #060e2a 0%, #0d1f4a 22%, #1a3a7a 48%, #6aa8d8 78%, #d8eef8 100%)",
      }}
    >
      {snow.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white pointer-events-none opacity-80 z-[2]"
          style={{ width: p.size, height: p.size, left: `${p.left}%`, top: "-4%" }}
          animate={{ y: ["0vh", "105vh"] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: "linear" }}
        />
      ))}
      {/* Mountains */}
      <div className="absolute bottom-[28%] left-0 right-0 z-[3] pointer-events-none opacity-70">
        <svg viewBox="0 0 800 120" className="w-full" preserveAspectRatio="none">
          <polygon points="0,120 100,40 200,90 320,25 450,80 580,35 720,70 800,50 800,120" fill="#1a4570" />
          <polygon points="0,120 140,55 260,100 400,45 540,95 680,55 800,75 800,120" fill="#26618f" opacity="0.85" />
        </svg>
      </div>
      {/* Sun (cold glow) */}
      <div className={`absolute ${compact ? "top-1 right-2" : "top-4 right-6"} z-[4] pointer-events-none`}>
        <svg viewBox="0 0 80 80" width={compact ? 36 : 64} height={compact ? 36 : 64}>
          <circle cx="40" cy="40" r="22" fill="#fff8e8" opacity="0.35" />
          <circle cx="40" cy="40" r="14" fill="#ffeaa7" opacity="0.55" />
        </svg>
      </div>
      {/* Ice trees silhouette */}
      <div className={`absolute ${compact ? "left-0 bottom-[12%]" : "left-[2%] bottom-[18%]"} z-[6] pointer-events-none opacity-60`}>
        <svg viewBox="0 0 40 70" width={compact ? 22 : 38} height={compact ? 40 : 68}>
          <path d="M20,4 L32,28 L26,28 L38,52 L22,52 L22,68 L18,68 L18,52 L2,52 L14,28 L8,28 Z" fill="#2a5080" />
        </svg>
      </div>
      <div className={`absolute ${compact ? "right-0 bottom-[14%]" : "right-[3%] bottom-[20%]"} z-[6] pointer-events-none opacity-60`}>
        <svg viewBox="0 0 40 70" width={compact ? 20 : 36} height={compact ? 38 : 64}>
          <path d="M20,6 L34,30 L28,30 L40,54 L22,54 L22,70 L18,70 L18,54 L0,54 L12,30 L6,30 Z" fill="#2a5080" />
        </svg>
      </div>
      {/* Explorer */}
      <motion.div
        className={`absolute ${compact ? "left-[6%] bottom-[28%]" : "left-[5%] bottom-[34%]"} z-[10] flex flex-col items-center pointer-events-none`}
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2.2, repeat: Infinity }}
      >
        <div
          className={`rounded-2xl border-[3px] border-sky-200 bg-white/95 shadow-xl overflow-hidden ${compact ? "w-14 h-14 rounded-xl border-2" : "w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32"}`}
        >
          <img src={avatarUrl} alt="You" className="w-full h-full object-cover" />
        </div>
      </motion.div>
      <motion.div className={`absolute ${compact ? "left-[22%] bottom-[20%]" : "left-[18%] bottom-[26%]"} z-[8] pointer-events-none`} animate={{ y: [0, -4, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
        <PenguinSVG scale={compact ? 0.35 : 0.55} />
      </motion.div>
      <motion.div className={`absolute ${compact ? "right-[20%] bottom-[22%]" : "right-[16%] bottom-[28%]"} z-[8] pointer-events-none`} animate={{ y: [0, -5, 0] }} transition={{ duration: 1.9, repeat: Infinity, delay: 0.3 }}>
        <PenguinSVG scale={compact ? 0.32 : 0.5} />
      </motion.div>
      <div className={`absolute left-1/2 -translate-x-1/2 ${compact ? "bottom-[16%] scale-[0.42]" : "bottom-[22%]"} z-[9] pointer-events-none`}>
        <SnowmanSVG />
      </div>
      {/* Sled hint */}
      <div className={`absolute ${compact ? "right-[4%] bottom-[10%] opacity-70 scale-[0.32]" : "right-[6%] bottom-[14%]"} z-[7] pointer-events-none opacity-80`}>
        <AntarcticaSledSVG avatarUrl={avatarUrl} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  STATE: CAMERA + JOURNAL — one page: scene → tap center camera → flash → polaroid on same view
// ═══════════════════════════════════════════════════════════════════════════
function CameraMemoryJournalScreen({ path, kidName, avatarUrl, speak, stop, onBack }) {
  const [saved, setSaved] = useState(false);
  const [flash, setFlash] = useState(false);
  const isAntarctica = path === "antarctica";

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => {
      speak(
        `What a fantastic picture! I am pasting it right into your book. You are an amazing explorer, ${kidName}. Let us go back and pick another adventure!`
      );
    }, 450);
    return () => clearTimeout(t);
  }, [saved, kidName, speak]);

  const handleCamera = () => {
    stop();
    setFlash(true);
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {flash && <CameraFlash onComplete={() => { setFlash(false); setSaved(true); }} />}

      {/* Magic book sky — same palette as HUB (shows at edges / peeks through atmosphere) */}
      <div className="absolute inset-0 z-0" style={{ background: MAGIC_BOOK_GRADIENT }} />

      <div className="absolute inset-0 z-[2]">
        {isAntarctica ? (
          <AntarcticaPhotoMemoryScene avatarUrl={avatarUrl} compact={false} />
        ) : (
          <SafariPhotoMemoryScene avatarUrl={avatarUrl} compact={false} />
        )}
      </div>

      {/* Subtle violet–pink wash so the page feels tied to the book palette */}
      <div
        className="absolute inset-0 z-[14] pointer-events-none opacity-[0.18] mix-blend-soft-light"
        style={{ background: MAGIC_BOOK_GRADIENT }}
        aria-hidden
      />

      <div className="pointer-events-none absolute inset-0 z-[18] overflow-hidden">
        <Sparkles count={saved ? 20 : 12} />
      </div>

      {/* Before save: centered camera — magic overlay */}
      {!saved && (
        <div
          className="absolute inset-0 z-[25] flex flex-col items-center justify-center gap-6 px-4 pointer-events-none"
          style={{
            background:
              "linear-gradient(165deg, rgba(26,5,51,0.72) 0%, rgba(107,47,160,0.5) 45%, rgba(194,84,154,0.48) 100%)",
          }}
        >
          <h2 className="font-black text-xl sm:text-2xl md:text-3xl text-white text-center max-w-lg drop-shadow-[0_2px_14px_rgba(26,5,51,0.9)]">
            Smile! Tap the camera to save this memory in your book!
          </h2>
          <motion.button
            whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
            animate={{
              scale: [1, 1.08, 1],
              boxShadow: [
                "0 0 0 0 rgba(192,132,252,0)",
                "0 0 36px 18px rgba(236,72,153,0.55)",
                "0 0 0 0 rgba(192,132,252,0)",
              ],
            }}
            transition={{ duration: 1.6, repeat: Infinity }}
            onClick={handleCamera}
            className="pointer-events-auto cursor-pointer rounded-full p-6 sm:p-7 shadow-2xl border-4 border-white/60 text-white bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-600"
            aria-label="Save memory photo"
          >
            <Camera size={52} className="sm:w-14 sm:h-14" />
          </motion.button>
        </div>
      )}

      {/* After save — journal polaroid (magic palette) */}
      {saved && (
        <>
          <div
            className="absolute inset-0 z-[22] pointer-events-none"
            style={{
              background:
                "linear-gradient(170deg, rgba(26,5,51,0.78) 0%, rgba(59,15,110,0.65) 40%, rgba(109,47,160,0.55) 70%, rgba(194,84,154,0.5) 100%)",
            }}
            aria-hidden
          />
          <Confetti />
          <motion.button
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.35, type: "spring", stiffness: 60 }}
            onClick={onBack}
            className="absolute top-4 left-4 z-[35] flex items-center gap-2 bg-white/95 hover:bg-white text-violet-800 font-bold px-4 py-2.5 rounded-full shadow-lg cursor-pointer border-2 border-fuchsia-300 transition-colors"
          >
            <ArrowRight size={18} className="rotate-180" />
            <span className="text-sm">Back</span>
          </motion.button>

          <div className="absolute inset-0 z-[30] flex flex-col items-center justify-center px-4 py-20 overflow-y-auto pointer-events-none">
            <div className="pointer-events-auto flex flex-col items-center gap-5 max-w-md w-full">
              <motion.h1
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 80 }}
                className="font-black text-2xl sm:text-3xl md:text-4xl text-center text-white drop-shadow-[0_2px_16px_rgba(26,5,51,0.95)]"
              >
                {kidName}&apos;s Amazing Adventure
              </motion.h1>

              <motion.div
                initial={{ rotate: -12, scale: 0.4, opacity: 0, y: 40 }}
                animate={{ rotate: 3, scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 52, damping: 14, delay: 0.08 }}
                className="rounded-xl p-3 sm:p-4 shadow-2xl w-full max-w-sm border-4 border-fuchsia-300/90 bg-gradient-to-b from-violet-50 to-fuchsia-50 ring-2 ring-purple-500/25"
              >
                <div className="relative w-full h-52 sm:h-56 rounded-lg overflow-hidden border-2 border-purple-300 shadow-inner bg-violet-100/50">
                  {isAntarctica ? (
                    <AntarcticaPhotoMemoryScene avatarUrl={avatarUrl} compact />
                  ) : (
                    <SafariPhotoMemoryScene avatarUrl={avatarUrl} compact />
                  )}
                </div>
                <p className="text-center font-bold text-base sm:text-lg text-violet-900 mt-3">
                  {kidName}&apos;s memory — {isAntarctica ? "Antarctica" : "African safari"}!
                </p>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
