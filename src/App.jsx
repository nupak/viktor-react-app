import { useEffect, useState } from "react";

const TARGET_DATE_MSK = new Date("2026-04-09T00:00:00+03:00");
const CONTINUE_PATH = "/continue";

const photos = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  src: `https://picsum.photos/seed/viktor-30-${i + 1}/900/600`,
  caption: `Кадр ${i + 1}: уровень взрослости +${i + 1}`
}));

const jokes = [
  "30 лет - это когда свечек больше, чем желания их считать.",
  "Возраст 30+: гарантия закончилась, но харизма еще на максималках.",
  "Виктор, теперь ты не просто легенда, ты коллекционный экспонат.",
  "30 - это 20, только с опытом, мемами и правильной посадкой спины."
];

function formatRemaining(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function CountdownPage({ remaining }) {
  return (
    <main className="countdown-page">
      <div className="fireworks left" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="fireworks right" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="confetti left" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="confetti right" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <section className="countdown-card">
        <h1 className="countdown-title">Last Chance to Feel Young 🚨</h1>
        <div className="timer-grid">
          <article className="timer-block">
            <div className="timer-item">
              <strong>{remaining.days}</strong>
            </div>
            <span>Days</span>
          </article>
          <article className="timer-block">
            <div className="timer-item">
              <strong>{pad2(remaining.hours)}</strong>
            </div>
            <span>Hrs</span>
          </article>
          <article className="timer-block">
            <div className="timer-item">
              <strong>{pad2(remaining.minutes)}</strong>
            </div>
            <span>Mins</span>
          </article>
          <article className="timer-block">
            <div className="timer-item">
              <strong>{pad2(remaining.seconds)}</strong>
            </div>
            <span>Secs</span>
          </article>
        </div>
      </section>
    </main>
  );
}

function BirthdayPage() {
  useEffect(() => {
    const items = document.querySelectorAll(".photo-card");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.15 }
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="landing">
      <section className="hero">
        <p className="badge">30 LEVEL UNLOCKED</p>
        <h1>С днём рождения, Виктор!</h1>
        <p className="hero-text">
          поздравляю теперь и ты не множко 30-летний дед
        </p>
      </section>

      <section className="jokes">
        {jokes.map((joke) => (
          <article className="joke-card" key={joke}>
            {joke}
          </article>
        ))}
      </section>

      <section className="album">
        <h2>Фотоальбом 30-летнего деда</h2>
        <p>Листай вниз: карточки будут выезжать сверху, справа и снизу.</p>
        <div className="photo-list">
          {photos.map((photo, i) => {
            const direction = i % 3 === 0 ? "from-top" : i % 3 === 1 ? "from-right" : "from-bottom";
            return (
              <figure className={`photo-card ${direction}`} key={photo.id}>
                <img src={photo.src} alt={`Фото Виктора ${photo.id}`} loading="lazy" />
                <figcaption>{photo.caption}</figcaption>
              </figure>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function App() {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isUnlocked = nowMs >= TARGET_DATE_MSK.getTime();
  const remaining = formatRemaining(TARGET_DATE_MSK.getTime() - nowMs);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const currentPath = window.location.pathname;
    if (!isUnlocked && currentPath === CONTINUE_PATH) {
      window.history.replaceState(null, "", "/");
      return;
    }

    if (isUnlocked && currentPath !== CONTINUE_PATH) {
      window.history.replaceState(null, "", CONTINUE_PATH);
    }
  }, [isUnlocked]);

  if (!isUnlocked) {
    return <CountdownPage remaining={remaining} />;
  }

  return <BirthdayPage />;
}

export default App;
