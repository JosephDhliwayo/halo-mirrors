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

// ---------- Animations ----------
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Scroll reveal: elements fade up as they enter the screen, siblings staggered
if ("IntersectionObserver" in window && !reduceMotion) {
  const groups = [
    ".section-title",
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
