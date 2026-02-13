/* =========================================================
   LaMaRC Prints — Infinite carousel + iPod-ish wheel accel
========================================================= */

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
      font-family="system-ui" font-size="56" font-weight="800">
      ${label}
    </text>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

const PRINTS = Array.from({ length: 50 }, (_, i) => ({
  title: `Print ${i + 1}`,
  meta: `Edition ${i + 1} • €${80 + (i % 4) * 20}`,
  image: svgDataUri(`PRINT ${i + 1}`, i + 1),
  buy: "https://example.com"
}));

const rail = document.getElementById("rail");
const wheel = document.getElementById("wheel");
const dialTitle = document.getElementById("dialTitle");
const dialMeta = document.getElementById("dialMeta");
const buyBtn = document.getElementById("buyBtn");

PRINTS.forEach(p => {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `<img class="cover" src="${p.image}" />`;
  card.dataset.title = p.title;
  card.dataset.meta = p.meta;
  card.dataset.buy = p.buy;
  rail.appendChild(card);
});

const cards = [...document.querySelectorAll(".card")];

function updateOverlay(idx) {
  const c = cards[idx];
  dialTitle.textContent = c.dataset.title;
  dialMeta.textContent = c.dataset.meta;
}

function centeredIndex() {
  const mid = window.innerWidth / 2;
  let best = 0, dist = Infinity;
  cards.forEach((c, i) => {
    const r = c.getBoundingClientRect();
    const d = Math.abs((r.left + r.right) / 2 - mid);
    if (d < dist) { dist = d; best = i; }
  });
  return best;
}

rail.addEventListener("scroll", () => {
  updateOverlay(centeredIndex());
});

updateOverlay(0);

buyBtn.addEventListener("click", () => {
  window.open(cards[centeredIndex()].dataset.buy, "_blank");
});
