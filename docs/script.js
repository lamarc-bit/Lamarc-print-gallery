/* LaMaRC — wheel scroll (iPod-ish) + visible gallery */

function svgDataUri(label, seed) {
  const a = (seed * 37) % 360;
  const b = (a + 80) % 360;
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="hsl(${a},70%,35%)"/>
        <stop offset="100%" stop-color="hsl(${b},70%,25%)"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="1200" fill="url(#g)"/>
    <rect x="40" y="40" width="1120" height="1120"
      fill="none" stroke="rgba(255,255,255,.18)" stroke-width="2"/>
    <text x="60" y="1100" fill="rgba(255,255,255,.8)"
      font-family="system-ui" font-size="56" font-weight="800">${label}</text>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.trim());
}

const PRINTS = Array.from({ length: 50 }, (_, i) => ({
  title: `Print ${i + 1}`,
  meta: `Edition ${i + 1} • €${80 + (i % 4) * 20}`,
  image: svgDataUri(`PRINT ${i + 1}`, i + 1),
  buy: "https://example.com"
}));

const rail = document.getElementById("rail");
const wheelEl = document.getElementById("wheel");
const dialTitle = document.getElementById("dialTitle");
const dialMeta = document.getElementById("dialMeta");
const buyBtn = document.getElementById("buyBtn");

rail.innerHTML = "";
PRINTS.forEach((p) => {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.title = p.title;
  card.dataset.meta = p.meta;
  card.dataset.buy = p.buy;
  card.innerHTML = `<img class="cover" src="${p.image}" alt="${p.title}">`;
  rail.appendChild(card);
});

const cards = [...document.querySelectorAll(".card")];

function centeredIndex() {
  const rr = rail.getBoundingClientRect();
  const mid = rr.left + rr.width / 2;
  let best = 0, dist = Infinity;
  cards.forEach((c, i) => {
    const r = c.getBoundingClientRect();
    const d = Math.abs((r.left + r.right) / 2 - mid);
    if (d < dist) { dist = d; best = i; }
  });
  return best;
}

function updateOverlay(i) {
  const c = cards[i];
  if (!c) return;
  dialTitle.textContent = c.dataset.title || "";
  dialMeta.textContent = c.dataset.meta || "";
}

function scrollToIndex(i, behavior = "smooth") {
  const c = cards[Math.max(0, Math.min(cards.length - 1, i))];
  c?.scrollIntoView({ inline: "center", block: "nearest", behavior });
}

rail.addEventListener("scroll", () => {
  updateOverlay(centeredIndex());
}, { passive: true });

updateOverlay(0);

/* BUY opens centered item link */
buyBtn.addEventListener("click", () => {
  const url = cards[centeredIndex()]?.dataset.buy;
  if (url) window.open(url, "_blank", "noopener,noreferrer");
});

/* ===== Wheel rotation -> scrolling (iPod-ish accel) ===== */
const BASE_STEP = Math.PI / 8;   // base "click" size
const DEADZONE = 0.02;
let dragging = false;
let lastAngle = 0;
let lastTime = 0;
let acc = 0;

function angleFromPointer(e) {
  const r = wheelEl.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  return Math.atan2(e.clientY - cy, e.clientX - cx);
}

function step(dir) {
  const cur = centeredIndex();
  scrollToIndex(cur + dir, "smooth");
}

wheelEl.addEventListener("pointerdown", (e) => {
  // ignore clicks on BUY area
  if (e.target === buyBtn) return;
  dragging = true;
  lastAngle = angleFromPointer(e);
  lastTime = performance.now();
  acc = 0;
  wheelEl.setPointerCapture?.(e.pointerId);
});

wheelEl.addEventListener("pointermove", (e) => {
  if (!dragging) return;

  const now = performance.now();
  const a = angleFromPointer(e);
  let da = a - lastAngle;

  if (da > Math.PI) da -= Math.PI * 2;
  if (da < -Math.PI) da += Math.PI * 2;

  const dt = Math.max(1, now - lastTime);
  lastAngle = a;
  lastTime = now;

  if (Math.abs(da) < DEADZONE) return;

  const speed = Math.min(0.10, Math.abs(da) / dt); // rad/ms
  const accelFactor = 1 + speed * 45;              // faster spin => smaller stepAngle => more steps
  const stepAngle = BASE_STEP / accelFactor;

  acc += da;

  while (Math.abs(acc) >= stepAngle) {
    step(acc > 0 ? +1 : -1);
    acc += acc > 0 ? -stepAngle : stepAngle;
  }
});

function endWheel() { dragging = false; acc = 0; }
wheelEl.addEventListener("pointerup", endWheel);
wheelEl.addEventListener("pointercancel", endWheel);
