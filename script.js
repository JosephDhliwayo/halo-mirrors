// Halo Mirrors site script

// Add the business WhatsApp number here (international format, digits only,
// e.g. "263771234567") so quote buttons open a chat with the message filled in.
// While it is empty, the message is copied and the WhatsApp catalogue opens.
const WHATSAPP_NUMBER = "";
const CATALOGUE_URL = "https://wa.me/c/159781977370794";

const $ = (id) => document.getElementById(id);

// Mobile menu
const nav = $("nav");
const toggle = $("menu-toggle");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  })
);

// Highlight the nav link for the section in view
const links = [...document.querySelectorAll('.nav ul a[href^="#"]')];
const sections = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
sections.forEach((s) => spy.observe(s));

// Send a message: open a chat when a number is set, otherwise copy and open the catalogue
async function sendMessage(text, noteEl) {
  if (WHATSAPP_NUMBER) {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    noteEl.textContent = "Opening WhatsApp with your message.";
    return;
  }
  const copied = await copyText(text);
  noteEl.textContent = copied
    ? "Message copied. Paste it into our WhatsApp chat, which is opening now."
    : "Copy the message above and send it to us on WhatsApp.";
  window.open(CATALOGUE_URL, "_blank", "noopener");
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// Quote bar
$("quote").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("q-name").value.trim();
  const size = $("q-size").value.trim();
  const desc = $("q-desc").value.trim();
  const lines = [
    `Hello Halo Mirrors${name ? `, my name is ${name}` : ""}. I'd like a quote:`,
    `• Shape: ${$("q-shape").value}`,
    size && `• Size: ${size} cm`,
    desc && `• Details: ${desc}`,
  ].filter(Boolean);
  sendMessage(lines.join("\n"), $("quote-note"));
});

// Planner
const shapeClass = { Rectangle: "g-rect", Round: "g-round", Oval: "g-oval", Arch: "g-arch", Organic: "g-pebble", Hexagon: "g-hex" };
const num = (el, def) => {
  const v = parseFloat(el.value);
  return isFinite(v) && v > 0 ? v : def;
};

function planMessage() {
  const shape = document.querySelector('input[name="shape"]:checked').value;
  const install = document.querySelector('input[name="install"]:checked').value;
  const w = num($("p-w"), 60);
  const h = shape === "Round" ? w : num($("p-h"), 120);
  const qty = Math.max(1, Math.round(num($("p-qty"), 1)));
  // Glass is cut from a rectangular sheet, so area uses the bounding rectangle
  const area = (w * h) / 10000;
  return { shape, install, w, h, qty, area };
}

function updatePlanner() {
  const p = planMessage();
  $("p-h").disabled = p.shape === "Round";
  if (p.shape === "Round") $("p-h").value = p.w;

  $("st-size").textContent = `${p.w} × ${p.h}`;
  $("st-area").textContent = `${p.area.toFixed(2)} m²`;
  $("st-total").textContent = `${(p.area * p.qty).toFixed(2)} m²`;

  const pv = $("pv");
  pv.className = "glass " + shapeClass[p.shape];
  const s = Math.min(240 / p.w, 220 / p.h);
  pv.style.width = Math.max(30, p.w * s) + "px";
  pv.style.height = Math.max(30, p.h * s) + "px";
  pv.style.aspectRatio = "auto";

  $("msg").textContent = [
    "Hello Halo Mirrors, I'd like a quote:",
    `• Shape: ${p.shape}`,
    `• Size: ${p.w} cm wide × ${p.h} cm high (${p.area.toFixed(2)} m²)`,
    `• Quantity: ${p.qty}`,
    `• Edge: ${$("p-edge").value}`,
    `• For: ${$("p-where").value}`,
    `• Installation: ${p.install}`,
  ].join("\n");
}

$("plan-form").addEventListener("input", updatePlanner);
$("plan-form").addEventListener("change", updatePlanner);
$("plan-form").addEventListener("submit", (e) => e.preventDefault());
$("send-plan").addEventListener("click", () => sendMessage($("msg").textContent, $("plan-note")));
$("copy-plan").addEventListener("click", async () => {
  const ok = await copyText($("msg").textContent);
  $("plan-note").textContent = ok ? "Message copied." : "Select the message above and copy it.";
});
updatePlanner();

$("year").textContent = new Date().getFullYear();

// ---------- Catalogue ----------
// price: current price (from the size line). was: listed catalogue price, shown crossed out when higher.
const PRODUCTS = [
  { id: "stand-alone-arch", name: "Stand Alone Arch Mirror", size: "1.7 m × 0.7 m", price: 170, was: 150, cat: "arch" },
  { id: "rock-collection", name: "Rock Collection", size: "Halo Mirrors Rock Collection", cat: "statement" },
  { id: "nine-piece-set", name: "9 Piece Set", size: "Set of nine panels", price: 375, cat: "arch" },
  { id: "slim-rectangle-framed", name: "Slim Rectangle Framed Mirrors", size: "Free delivery and installation", cat: "rect" },
  { id: "slim-arch-framed", name: "Slim Arch Framed Mirrors", size: "Sizes can be customised", cat: "arch" },
  { id: "kitchen", name: "Kitchen Mirrors", size: "Made to fit your kitchen", cat: "rect" },
  { id: "irregular-no-lights", name: "Irregular Shape Mirror", size: "Without lights", cat: "statement" },
  { id: "irregular-lights", name: "Irregular Shape Mirror with Lights", size: "With LED lights", cat: "led", led: true },
  { id: "framed-round", name: "Framed Round Mirror", size: "0.45 m diameter", price: 45, was: 70, cat: "round" },
  { id: "africa-map", name: "Africa Map Mirror", size: "75 cm × 60 cm", price: 170, was: 750, cat: "statement" },
  { id: "frameless-led-arch", name: "Frameless LED Arch Mirror", size: "1.4 m × 0.5 m", price: 80, cat: "led", led: true },
  { id: "human-face", name: "Human Face Mirror", size: "1.0 m × 0.6 m", price: 190, cat: "statement" },
  { id: "versace", name: "Versace Mirror", size: "1 m × 1 m", price: 170, was: 300, cat: "rect" },
  { id: "frameless-round", name: "Frameless Round Mirror", size: "0.45 m diameter", price: 20, was: 25, cat: "round" },
  { id: "arch-panel", name: "Arch Panel Mirror", size: "1.2 m × 0.6 m", price: 230, was: 350, cat: "arch" },
  { id: "zimbabwe-map", name: "Zimbabwe Map Mirror", size: "65 cm × 75 cm", price: 170, was: 600, cat: "statement" },
  { id: "rectangle", name: "Rectangle Mirror", size: "0.6 m × 0.4 m", price: 60, cat: "rect" },
  { id: "manhattan-panel", name: "Manhattan Panel Mirror", size: "1.2 m × 0.6 m", price: 130, was: 830, cat: "arch" },
  { id: "led-teddy-bear", name: "LED Teddy Bear Mirror", size: "1 m × 0.5 m (base size)", price: 150, was: 270, cat: "led", led: true },
  { id: "led-frameless-round", name: "LED Frameless Round Mirror", size: "55 cm diameter", price: 70, was: 150, cat: "led", led: true },
  { id: "half-moon", name: "Half Moon Mirror", size: "0.3 m × 0.55 m", price: 55, was: 90, cat: "round" },
];

const money = (n) => "$" + n.toLocaleString("en-US");
const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const grid = $("products");
grid.innerHTML = PRODUCTS.map((p) => {
  let price = '<span class="ask">Ask for price</span>';
  if (p.price) {
    price = `<b>${money(p.price)}</b>`;
    if (p.was && p.was > p.price) price += `<s>${money(p.was)}</s>`;
  }
  return `<article class="product" data-cat="${p.cat}">
    <div class="p-img"><img src="images/products/${p.id}.png" alt="${esc(p.name)}" width="91" height="91" loading="lazy"></div>
    <div class="p-body">
      ${p.led ? '<span class="p-tag">LED</span>' : ""}
      <h3>${esc(p.name)}</h3>
      <span class="p-size">${esc(p.size)}</span>
      <div class="p-price">${price}</div>
      <button type="button" class="p-order" data-id="${p.id}">Order on WhatsApp</button>
    </div>
  </article>`;
}).join("");

// Filter counts and behaviour
const filters = [...document.querySelectorAll(".filter")];
filters.forEach((b) => {
  const cat = b.dataset.cat;
  const n = cat === "all" ? PRODUCTS.length : PRODUCTS.filter((p) => p.cat === cat).length;
  b.insertAdjacentHTML("beforeend", `<span class="count">${n}</span>`);
  b.addEventListener("click", () => {
    filters.forEach((f) => f.classList.toggle("active", f === b));
    let i = 0;
    grid.querySelectorAll(".product").forEach((card) => {
      const show = cat === "all" || card.dataset.cat === cat;
      card.classList.toggle("hide", !show);
      card.classList.remove("pop");
      if (show) {
        void card.offsetWidth; // restart the animation
        card.style.setProperty("--pd", `${Math.min(i++, 10) * 0.05}s`);
        card.classList.add("pop");
      }
    });
  });
});

// Toast for order messages
let toastTimer;
const toastEl = $("toast");
const toast = {
  set textContent(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 4500);
  },
};

grid.addEventListener("click", (e) => {
  const btn = e.target.closest(".p-order");
  if (!btn) return;
  const p = PRODUCTS.find((x) => x.id === btn.dataset.id);
  const priceText = p.price ? `, ${money(p.price)}` : "";
  const sizeText = /d/.test(p.size) ? ` (${p.size}${priceText})` : priceText ? ` (${priceText.slice(2)})` : "";
  sendMessage(`Hello Halo Mirrors, I'm interested in the ${p.name}${sizeText}. Is it available?`, toast);
});

// ---------- Animations ----------
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Scroll reveal: elements fade up as they enter the screen, siblings staggered
if ("IntersectionObserver" in window && !reduceMotion) {
  const groups = [
    ".section-title",
    ".products .product",
    ".filters .filter",
    ".catalogue-foot > *",
    ".cards .card",
    ".uses li",
    ".banner-inner > *",
    ".shape-grid .shape",
    ".steps li",
    ".planner-form",
    ".planner-out",
    ".contact-text > *",
    ".contact-logo",
  ];
  const targets = [];
  groups.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add("reveal");
      el.style.setProperty("--d", `${Math.min(i, 8) * 0.1}s`);
      targets.push(el);
    });
  });
  document.documentElement.classList.add("js-reveal");
  const revealer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        revealer.unobserve(e.target);
        // once shown, drop the reveal styles so hover transitions are not delayed
        e.target.addEventListener("transitionend", () => e.target.classList.remove("reveal", "in"), { once: true });
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  targets.forEach((el) => revealer.observe(el));
} else {
  document.querySelectorAll(".section-title").forEach((el) => el.classList.add("in"));
}

// Nav shadow and back-to-top button on scroll
const toTop = $("to-top");
const onScroll = () => {
  const y = window.scrollY;
  nav.classList.toggle("scrolled", y > 160);
  toTop.classList.toggle("show", y > 600);
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

// Hero mirrors drift slightly with the mouse
const scene = document.querySelector(".hero-scene");
if (scene && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
  const hero = document.querySelector(".hero");
  hero.addEventListener("mousemove", (e) => {
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    scene.style.transform = `translate(${x * -14}px, ${y * -10}px)`;
  });
  hero.addEventListener("mouseleave", () => (scene.style.transform = ""));
}
