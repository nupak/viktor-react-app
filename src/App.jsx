import { useEffect, useMemo, useRef, useState } from "react";
import PhotoCard3D from "./components/PhotoCard3D";
import photoStories from "./data/photoStories.json";

const TARGET_DATE_MSK = new Date("2026-04-09T00:00:00+03:00");
const CONTINUE_PATH = "/continue";
const WHEEL_PATH = "/wheel";

function toTimerParts(ms) {
  const totalSeconds = Math.floor(Math.abs(ms) / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60
  };
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function CountdownPage({ timer, isUnlocked, candleIndex, onSecretOpen, onTempOpen }) {
  const candles = ["one", "two", "three", "four", "five", "six"];

  return (
    <main className="countdown-page">
      <div className="fireworks left" aria-hidden="true"><span /><span /><span /></div>
      <div className="fireworks right" aria-hidden="true"><span /><span /><span /></div>
      <div className="confetti left" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <div className="confetti right" aria-hidden="true"><i /><i /><i /><i /><i /></div>

      <div className="candle-strip">
        {candles.map((name, index) => {
          const unlockedCandle = isUnlocked && index === candleIndex;
          const cakeCandle = index === 1 || index === 4;
          return (
            <button
              key={name}
              type="button"
              className={`candle ${name} ${cakeCandle ? "cake" : ""} ${unlockedCandle ? "active" : ""}`}
              onClick={unlockedCandle ? onSecretOpen : undefined}
              aria-label={unlockedCandle ? "Открыть страницу поздравления" : "Декоративная свеча"}
            >
              <span className="wick" />
              <span className="flame" />
            </button>
          );
        })}
      </div>

      <section className="countdown-card">
        <h1 className="countdown-title">Last Chance to Feel Young 🚨</h1>
        <div className="timer-grid">
          <article className="timer-block"><div className="timer-item"><strong>{timer.days}</strong></div><span>Days</span></article>
          <article className="timer-block"><div className="timer-item"><strong>{pad2(timer.hours)}</strong></div><span>Hrs</span></article>
          <article className="timer-block"><div className="timer-item"><strong>{pad2(timer.minutes)}</strong></div><span>Mins</span></article>
          <article className="timer-block"><div className="timer-item"><strong>{pad2(timer.seconds)}</strong></div><span>Secs</span></article>
        </div>
        <p className="timer-hint">
          {isUnlocked ? "Одна случайная свечка стала секретной. Нажми ее, чтобы открыть поздравление." : "Секретная свечка появится после нуля."}
        </p>
      </section>
    </main>
  );
}

function BirthdayPage({ stories, onOpenWheel }) {
  const [badgeConfettiBits, setBadgeConfettiBits] = useState([]);
  const [titleConfettiBits, setTitleConfettiBits] = useState([]);
  const [badgeClicks, setBadgeClicks] = useState(0);
  const badgeClearTimerRef = useRef(null);
  const titleClearTimerRef = useRef(null);

  useEffect(() => {
    const rows = document.querySelectorAll(".story-row");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("in-view");
        });
      },
      { threshold: 0.22 }
    );
    rows.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (badgeClearTimerRef.current) clearTimeout(badgeClearTimerRef.current);
      if (titleClearTimerRef.current) clearTimeout(titleClearTimerRef.current);
    };
  }, []);

  const popBadgeConfetti = () => {
    const colors = ["#f97316", "#22c55e", "#60a5fa", "#facc15", "#fb7185", "#a78bfa"];
    const bits = Array.from({ length: 26 }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      color: colors[Math.floor(Math.random() * colors.length)],
      drift: Math.random() * 120 - 60,
      driftY: 120 + Math.random() * 90,
      duration: 1000 + Math.random() * 700,
      delay: Math.random() * 120
    }));
    if (badgeClearTimerRef.current) clearTimeout(badgeClearTimerRef.current);
    setBadgeConfettiBits([]);
    requestAnimationFrame(() => {
      setBadgeConfettiBits(bits);
      badgeClearTimerRef.current = setTimeout(() => setBadgeConfettiBits([]), 2200);
    });
  };

  const handleBadgeClick = () => {
    popBadgeConfetti();
    setBadgeClicks((prev) => {
      const next = prev + 1;
      if (next >= 10) {
        onOpenWheel();
        return 0;
      }
      return next;
    });
  };

  const popTitleConfetti = () => {
    const colors = ["#f97316", "#22c55e", "#60a5fa", "#facc15", "#fb7185", "#a78bfa"];
    const bits = Array.from({ length: 42 }, (_, i) => ({
      id: `title-${Date.now()}-${i}`,
      color: colors[Math.floor(Math.random() * colors.length)],
      drift: Math.random() * 900 - 450,
      driftY: Math.random() * 600 - 300,
      duration: 2300 + Math.random() * 1800,
      delay: Math.random() * 220
    }));
    if (titleClearTimerRef.current) clearTimeout(titleClearTimerRef.current);
    setTitleConfettiBits([]);
    requestAnimationFrame(() => {
      setTitleConfettiBits(bits);
      titleClearTimerRef.current = setTimeout(() => setTitleConfettiBits([]), 4600);
    });
  };

  return (
    <main className="landing">
      <section className="hero">
        <button className="badge badge-classic" type="button" onClick={handleBadgeClick}>
          <span>30 LEVEL UNLOCKED</span>
        </button>
        <div className="hero-confetti-layer" aria-hidden="true">
          {badgeConfettiBits.map((bit) => (
            <i
              key={bit.id}
              className="hero-confetti-bit"
              style={{
                left: "50%",
                background: bit.color,
                "--drift": `${bit.drift}px`,
                "--drift-y": `${bit.driftY}px`,
                animationDuration: `${bit.duration}ms`,
                animationDelay: `${bit.delay}ms`
              }}
            />
          ))}
        </div>
        <h1 className="hero-title-clickable" onClick={popTitleConfetti}>С днём рождения, Виктор!</h1>
        <p className="hero-text">Поздравляю! Теперь и ты немножко 30-летний дед))</p>
      </section>
      <div className="screen-confetti-layer" aria-hidden="true">
        {titleConfettiBits.map((bit) => (
          <i
            key={bit.id}
            className="screen-confetti-bit"
            style={{
              left: "50vw",
              top: "50vh",
              background: bit.color,
              "--drift": `${bit.drift}px`,
              "--drift-y": `${bit.driftY}px`,
              animationDuration: `${bit.duration}ms`,
              animationDelay: `${bit.delay}ms`
            }}
          />
        ))}
      </div>

      <section className="story-feed">
        {stories.map((item, index) => {
          const left = index % 2 === 0;
          return (
            <article key={item.id} className={`story-row ${left ? "media-left" : "media-right"}`}>
              <div className={`story-media ${left ? "tilt-center-right" : "tilt-center-left"}`}>
                <PhotoCard3D photo={item} />
              </div>
              <div className="story-text">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="feature-cards">
        <div className="feature-cards-grid">
          {stories.slice(0, 3).map((item, idx) => (
            <article key={`feature-${item.id}`} className="feature-card">
              <div className="face face1">
                <div className="content">
                  <h2>{item.title}</h2>
                  <p>{item.text}</p>
                  {item.featureLink ? (
                    <a
                      className="feature-link"
                      href={item.featureLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Открыть ссылку
                    </a>
                  ) : null}
                </div>
              </div>
              <div className={`face face2 v${idx + 1}`}>
                <h2>{item.id}</h2>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function App() {
  const [nowMs, setNowMs] = useState(Date.now());
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const [tempUnlocked, setTempUnlocked] = useState(false);
  const candleIndex = useMemo(() => Math.floor(Math.random() * 6), []);

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const diff = TARGET_DATE_MSK.getTime() - nowMs;
  const timerParts = toTimerParts(diff);
  const isUnlocked = diff <= 0;

  useEffect(() => {
    if (!isUnlocked && !tempUnlocked && pathname === CONTINUE_PATH) {
      window.history.replaceState(null, "", "/");
      setPathname("/");
    }
  }, [isUnlocked, pathname, tempUnlocked]);

  const openContinue = () => {
    if (!isUnlocked) return;
    window.history.pushState(null, "", CONTINUE_PATH);
    setPathname(CONTINUE_PATH);
  };

  const openContinueTemporary = () => {
    setTempUnlocked(true);
    window.history.pushState(null, "", CONTINUE_PATH);
    setPathname(CONTINUE_PATH);
  };

  const openWheel = () => {
    window.history.pushState(null, "", WHEEL_PATH);
    setPathname(WHEEL_PATH);
  };

  const backFromWheel = () => {
    const target = isUnlocked || tempUnlocked ? CONTINUE_PATH : "/";
    window.history.pushState(null, "", target);
    setPathname(target);
  };

  if (pathname === WHEEL_PATH) {
    return <WheelPage onBack={backFromWheel} />;
  }

  if (pathname === CONTINUE_PATH && (isUnlocked || tempUnlocked)) {
    return <BirthdayPage stories={photoStories} onOpenWheel={openWheel} />;
  }

  return (
    <CountdownPage
      timer={{ ...timerParts, isBefore: !isUnlocked }}
      isUnlocked={isUnlocked}
      candleIndex={candleIndex}
      onSecretOpen={openContinue}
      onTempOpen={openContinueTemporary}
    />
  );
}

function WheelPage({ onBack }) {
  const sectors = [
    "Носки",
    "Косплей",
    "Латекс",
    "Очки",
    "Каблуки",
    "Ролевка",
    "Маски",
    "Тайна"
  ];
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState("");

  const spinWheel = () => {
    if (spinning) return;
    setSpinning(true);
    setResult("");
    const extra = 6 * 360 + Math.floor(Math.random() * 360);
    const nextRotation = rotation + extra;
    setRotation(nextRotation);

    setTimeout(() => {
      const normalized = ((nextRotation % 360) + 360) % 360;
      const sectorAngle = 360 / sectors.length;
      const pointerAngle = (360 - normalized + sectorAngle / 2) % 360;
      const index = Math.floor(pointerAngle / sectorAngle);
      setResult(sectors[index]);
      setSpinning(false);
    }, 4200);
  };

  return (
    <main className="wheel-page">
      <h1>Колесо фетишей</h1>
      <div className="wheel-wrap">
        <div className="wheel-pointer" />
        <div
          className={`wheel ${spinning ? "spinning" : ""}`}
          style={{
            transform: `rotate(${rotation}deg)`,
            background: `conic-gradient(
              #f97316 0deg 45deg,
              #a855f7 45deg 90deg,
              #22c55e 90deg 135deg,
              #0ea5e9 135deg 180deg,
              #f43f5e 180deg 225deg,
              #f59e0b 225deg 270deg,
              #6366f1 270deg 315deg,
              #14b8a6 315deg 360deg
            )`
          }}
        />
      </div>
      <div className="wheel-actions">
        <button className="wheel-btn" type="button" onClick={spinWheel} disabled={spinning}>
          {spinning ? "Крутится..." : "Запустить колесо"}
        </button>
        <button className="wheel-btn secondary" type="button" onClick={onBack}>
          Вернуться назад
        </button>
      </div>
      {result ? <p className="wheel-result">Выпало: {result}</p> : null}
    </main>
  );
}

export default App;
