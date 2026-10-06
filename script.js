const intro = document.querySelector("#intro");
const introEnter = document.querySelector("#intro-enter");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const portraitFrame = document.querySelector(".portrait-frame");
const portraitImage = document.querySelector(".portrait-image");

function showPortraitWhenReady() {
  if (portraitImage.complete && portraitImage.naturalWidth > 0) {
    portraitFrame.classList.add("image-loaded");
  }
}

portraitImage.addEventListener("load", showPortraitWhenReady);
showPortraitWhenReady();

introEnter.addEventListener("click", () => {
  intro.classList.add("dismissed");
  document.body.classList.add("experience-live");
  window.setTimeout(() => intro.remove(), 900);
  setAmbientSound(true);
  if (!reducedMotion) {
    burstConfetti(window.innerWidth / 2, window.innerHeight * 0.28, 115);
    launchFirework(window.innerWidth * 0.28, window.innerHeight * 0.3);
    launchFirework(window.innerWidth * 0.72, window.innerHeight * 0.38);
    startEffects();
  }
});

const countdownNote = document.querySelector("#countdown-note");
const countdownToday = document.querySelector("#countdown-today");
const countdownTarget = new Date(2026, 9, 10);
const birthdayEnd = new Date(2026, 9, 11);
const countdownFields = {
  days: document.querySelector("#days"),
  hours: document.querySelector("#hours"),
  minutes: document.querySelector("#minutes"),
  seconds: document.querySelector("#seconds"),
};

function updateCountdown() {
  const now = new Date();
  let difference = countdownTarget.getTime() - now.getTime();
  if (now >= countdownTarget && now < birthdayEnd) {
    document.querySelector(".countdown-band").classList.add("is-birthday");
    countdownNote.textContent = "The moment we've been waiting for.";
    countdownToday.textContent = "TODAY IS THE DAY!";
    countdownToday.hidden = false;
    return;
  }
  if (now >= birthdayEnd) {
    document.querySelector(".countdown-band").classList.add("is-birthday");
    countdownNote.textContent = "A new chapter is underway.";
    countdownToday.textContent = "HAPPY BIRTHDAY, DAVID!";
    countdownToday.hidden = false;
    return;
  }
  document.querySelector(".countdown-band").classList.remove("is-birthday");
  countdownToday.hidden = true;
  countdownNote.textContent = "The countdown is on.";
  const values = [
    Math.floor(difference / 86400000),
    Math.floor((difference / 3600000) % 24),
    Math.floor((difference / 60000) % 60),
    Math.floor((difference / 1000) % 60),
  ];
  Object.values(countdownFields).forEach((field, index) => {
    field.textContent = String(values[index]).padStart(2, "0");
  });
}

updateCountdown();
window.setInterval(updateCountdown, 1000);

document.querySelectorAll(".timeline-item").forEach((milestone) => {
  const toggleMilestone = () => {
    const expanded = milestone.getAttribute("aria-expanded") === "true";
    milestone.setAttribute("aria-expanded", String(!expanded));
    milestone.querySelector(".timeline-detail").hidden = expanded;
  };
  milestone.addEventListener("click", toggleMilestone);
  milestone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleMilestone();
    }
  });
});

const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxCaption = document.querySelector("#lightbox-caption");

document.querySelectorAll(".photo-tile, .bloom-tile").forEach((tile) => {
  tile.addEventListener("click", () => {
    lightboxImage.src = tile.dataset.full;
    lightboxImage.alt = tile.querySelector("img").alt;
    lightboxCaption.textContent = tile.dataset.caption;
    lightbox.showModal();
  });
});

document.querySelectorAll(".birthday-bloom-card").forEach((card) => {
  card.addEventListener("click", () => {
    const wasExpanded = card.getAttribute("aria-expanded") === "true";
    document.querySelectorAll(".birthday-bloom-card").forEach((otherCard) => {
      otherCard.setAttribute("aria-expanded", "false");
      otherCard.setAttribute("aria-label", `Open birthday flower ${otherCard.querySelector(".bloom-card-number").textContent}`);
      otherCard.querySelector(".bloom-card-cover").hidden = false;
      otherCard.querySelector(".bloom-card-reveal").hidden = true;
    });
    if (!wasExpanded) {
      card.setAttribute("aria-expanded", "true");
      card.setAttribute("aria-label", `Close birthday flower ${card.querySelector(".bloom-card-number").textContent}`);
      card.querySelector(".bloom-card-cover").hidden = true;
      card.querySelector(".bloom-card-reveal").hidden = false;
    }
  });
});

document.querySelector("#lightbox-close").addEventListener("click", () => lightbox.close());
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});

let audioContext;
let masterGain;
const soundToggle = document.querySelector("#sound-toggle");

function setAmbientSound(enabled) {
  if (enabled && !audioContext) {
    audioContext = new window.AudioContext();
    masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(0, audioContext.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.035, audioContext.currentTime + 1.5);
    masterGain.connect(audioContext.destination);
    [110, 164.81, 220].forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = index === 1 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.value = index === 0 ? 0.22 : 0.12;
      oscillator.connect(gain);
      gain.connect(masterGain);
      oscillator.start();
    });
  }
  if (audioContext) {
    if (enabled) {
      audioContext.resume();
      masterGain.gain.cancelScheduledValues(audioContext.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.035, audioContext.currentTime + 0.5);
    } else {
      masterGain.gain.cancelScheduledValues(audioContext.currentTime);
      masterGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.35);
    }
  }
  soundToggle.setAttribute("aria-pressed", String(enabled));
  soundToggle.setAttribute("aria-label", enabled ? "Turn ambient sound off" : "Turn ambient sound on");
  soundToggle.querySelector(".sound-label").textContent = enabled ? "SOUND ON" : "SOUND OFF";
}

soundToggle.addEventListener("click", () => {
  setAmbientSound(soundToggle.getAttribute("aria-pressed") !== "true");
});

const canvas = document.querySelector("#effects-canvas");
const context = canvas.getContext("2d");
let canvasWidth = 0;
let canvasHeight = 0;
let fireworks = [];
let confetti = [];
let animationFrame;

function resizeCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  canvas.width = canvasWidth * pixelRatio;
  canvas.height = canvasHeight * pixelRatio;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function launchFirework(x, y) {
  const colors = ["#d9f268", "#f1785d", "#f1eee5", "#72c8c4"];
  for (let index = 0; index < 55; index += 1) {
    const angle = (Math.PI * 2 * index) / 55;
    const speed = 1.3 + Math.random() * 3.8;
    fireworks.push({
      x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      life: 1, color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
}

function renderEffects() {
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  fireworks = fireworks.filter((particle) => particle.life > 0.02);
  fireworks.forEach((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.035;
    particle.vx *= 0.99;
    particle.life *= 0.975;
    context.globalAlpha = particle.life;
    context.fillStyle = particle.color;
    context.beginPath();
    context.arc(particle.x, particle.y, 2.2 * particle.life, 0, Math.PI * 2);
    context.fill();
  });
  confetti = confetti.filter((piece) => piece.y < canvasHeight + 30 && piece.life > 0);
  confetti.forEach((piece) => {
    piece.x += piece.vx;
    piece.y += piece.vy;
    piece.vy += 0.045;
    piece.rotation += piece.spin;
    piece.life -= 0.002;
    context.globalAlpha = Math.min(1, piece.life * 2);
    context.fillStyle = piece.color;
    context.save();
    context.translate(piece.x, piece.y);
    context.rotate(piece.rotation);
    context.beginPath();
    context.moveTo(0, -piece.height / 2);
    context.quadraticCurveTo(piece.width / 2, -piece.height / 2, piece.width / 2, 0);
    context.quadraticCurveTo(piece.width / 2, piece.height / 2, 0, piece.height / 2);
    context.quadraticCurveTo(-piece.width / 2, piece.height / 2, -piece.width / 2, 0);
    context.quadraticCurveTo(-piece.width / 2, -piece.height / 2, 0, -piece.height / 2);
    context.closePath();
    context.fill();
    context.restore();
  });
  context.globalAlpha = 1;
  if (fireworks.length || confetti.length) {
    animationFrame = window.requestAnimationFrame(renderEffects);
  } else {
    animationFrame = null;
  }
}

function startEffects() {
  if (!animationFrame) animationFrame = window.requestAnimationFrame(renderEffects);
}

function burstConfetti(x, y, count = 55) {
  const colors = ["#d9f268", "#f1785d", "#f1eee5", "#72c8c4", "#e9a08d"];
  for (let index = 0; index < count; index += 1) {
    const angle = (Math.PI * 2 * index) / count;
    const speed = 1.4 + Math.random() * 4;
    confetti.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.7,
      width: 4 + Math.random() * 5,
      height: 6 + Math.random() * 7,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.12,
      life: 1,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
  startEffects();
}

const pointerFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const pointerGlow = document.querySelector(".pointer-glow");
let pointerFrame = 0;

if (pointerFine && !reducedMotion) {
  document.addEventListener("pointermove", (event) => {
    if (pointerFrame) return;
    pointerFrame = window.requestAnimationFrame(() => {
      document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);
      document.body.classList.add("pointer-active");
      pointerFrame = 0;
    });
  }, { passive: true });
  document.addEventListener("pointerleave", () => document.body.classList.remove("pointer-active"));
}

if (!reducedMotion && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });
  document.querySelectorAll("main > section:not(.hero)").forEach((section) => {
    section.classList.add("scroll-reveal");
    revealObserver.observe(section);
  });
}

document.querySelectorAll(".birthday-balloon").forEach((balloon) => {
  balloon.addEventListener("click", () => {
    if (balloon.classList.contains("balloon-popped")) return;
    const bounds = balloon.getBoundingClientRect();
    balloon.classList.add("balloon-popped");
    balloon.setAttribute("aria-label", "Balloon popped");
    if (!reducedMotion) burstConfetti(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2, 35);
  });
});

const birthdayReveal = document.querySelector("#reveal");
let finaleTriggered = false;

if ("IntersectionObserver" in window) {
  const finaleObserver = new IntersectionObserver((entries) => {
    if (finaleTriggered || !entries.some((entry) => entry.isIntersecting)) return;
    finaleTriggered = true;
    birthdayReveal.classList.add("finale-arrived");
    if (!reducedMotion) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight * 0.32;
      burstConfetti(centerX, centerY, 100);
      [0, 450, 950].forEach((delay, index) => {
        window.setTimeout(() => {
          launchFirework(window.innerWidth * (0.25 + index * 0.25), window.innerHeight * (0.22 + (index % 2) * 0.12));
          startEffects();
        }, delay);
      });
    }
    finaleObserver.disconnect();
  }, { threshold: 0.45 });
  finaleObserver.observe(birthdayReveal);
}

const celebrateButton = document.querySelector("#celebrate-button");
const celebrateStatus = document.querySelector("#celebrate-status");
let hasCelebrated = false;

celebrateButton.addEventListener("click", () => {
  if (hasCelebrated) return;
  hasCelebrated = true;
  const reveal = document.querySelector("#reveal");
  const bounds = reveal.getBoundingClientRect();
  reveal.classList.add("reveal-celebration");
  celebrateStatus.textContent = "HAPPY BIRTHDAY, DAVID. HERE'S TO WHAT'S NEXT.";
  burstConfetti(canvasWidth / 2, canvasHeight * 0.3, 160);
  if (!reducedMotion) {
    [0, 380, 760, 1160, 1550].forEach((delay) => {
      window.setTimeout(() => {
        launchFirework(canvasWidth * (0.2 + Math.random() * 0.6), canvasHeight * (0.15 + Math.random() * 0.35));
        startEffects();
      }, delay);
    });
    window.setTimeout(() => launchFirework(bounds.left + bounds.width * 0.72, bounds.top + bounds.height * 0.4), 300);
  } else {
    confetti = [];
  }
  startEffects();
});

const gameStars = [...document.querySelectorAll(".game-star")];
const gameScore = document.querySelector("#game-score");
const gameMessage = document.querySelector("#game-message");

function resetStarGame() {
  gameStars.forEach((star) => {
    star.disabled = false;
    star.classList.remove("collected");
    star.textContent = "✦";
  });
  gameScore.textContent = "00";
  gameMessage.textContent = "Tap each star to collect it.";
}

gameStars.forEach((star) => {
  star.addEventListener("click", () => {
    if (star.disabled) return;
    star.disabled = true;
    star.classList.add("collected");
    star.textContent = "✓";
    const score = gameStars.filter((item) => item.disabled).length;
    gameScore.textContent = String(score).padStart(2, "0");
    if (score === 10) {
      gameMessage.textContent = "10 STARS COLLECTED. 10/10, PERFECT.";
      launchFirework(window.innerWidth / 2, window.innerHeight / 3);
      startEffects();
    } else {
      gameMessage.textContent = `${10 - score} ${10 - score === 1 ? "star" : "stars"} left to find.`;
    }
  });
});

document.querySelector("#game-reset").addEventListener("click", resetStarGame);

const wishButton = document.querySelector("#wish-button");
const wishStatus = document.querySelector("#wish-status");
const shootingStar = document.querySelector("#shooting-star");

wishButton.addEventListener("click", () => {
  if (wishButton.disabled) return;
  wishButton.disabled = true;
  const countdown = ["3...", "2...", "1..."];
  let step = 0;
  wishStatus.textContent = countdown[step];
  const timer = window.setInterval(() => {
    step += 1;
    if (step < countdown.length) {
      wishStatus.textContent = countdown[step];
      return;
    }
    window.clearInterval(timer);
    wishStatus.textContent = "THE NEXT CHAPTER BEGINS.";
    shootingStar.classList.remove("shooting-star-active");
    void shootingStar.offsetWidth;
    shootingStar.classList.add("shooting-star-active");
    if (!reducedMotion) {
      launchFirework(window.innerWidth * 0.72, window.innerHeight * 0.25);
      startEffects();
    }
  }, 800);
});

document.querySelectorAll("a[href^='#']").forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    history.replaceState(null, "", link.getAttribute("href"));
  });
});