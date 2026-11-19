(() => {
  const P = window.PARISH;
  const $ = (s, el = document) => el.querySelector(s);
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };

  /* ---------- Bind basic text ---------- */
  document.title = P.name;
  document.querySelectorAll("[data-bind]").forEach(el => { el.textContent = P[el.dataset.bind] ?? ""; });
  $("#phoneLink").href = "tel:" + P.phone.replace(/\s/g, "");
  $("#emailLink").href = "mailto:" + P.email;
  $("#dirLink").href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(P.mapQuery);

  /* ---------- Announcements ---------- */
  $("#announcements").innerHTML = P.announcements
    .map(a => `<li><strong>${esc(a.title)}</strong>${esc(a.text)}</li>`).join("");

  /* ---------- Weekly schedule ---------- */
  const today = new Date().getDay();
  const order = [1, 2, 3, 4, 5, 6, 0]; // Monday first
  $("#week").innerHTML = order.map(d => {
    const slots = P.services.filter(s => s.day === d).sort((a, b) => a.time.localeCompare(b.time));
    return `<div class="day${d === today ? " day--today" : ""}"><h3>${DAYS[d]}</h3>${
      slots.length
        ? slots.map(s => `<div class="slot"><b>${s.time}</b><span>${esc(s.title)}</span>${s.note ? `<small>${esc(s.note)}</small>` : ""}</div>`).join("")
        : `<p class="day__none">No Mass</p>`
    }</div>`;
  }).join("");

  /* ---------- Next Mass countdown ---------- */
  function nextService(now = new Date()) {
    let best = null;
    for (const s of P.services) {
      const [h, m] = s.time.split(":").map(Number);
      const d = new Date(now);
      d.setHours(h, m, 0, 0);
      d.setDate(d.getDate() + ((s.day - now.getDay() + 7) % 7));
      if (d <= now) d.setDate(d.getDate() + 7);
      if (!best || d < best.date) best = { ...s, date: d };
    }
    return best;
  }
  function tick() {
    const n = nextService();
    if (!n) return;
    const now = new Date();
    const isToday = n.date.toDateString() === now.toDateString();
    const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
    const label = isToday ? "Today" : n.date.toDateString() === tomorrow.toDateString() ? "Tomorrow" : DAYS[n.day];
    $("#nextTitle").textContent = n.title;
    $("#nextWhen").textContent = `${label} at ${n.time}${n.note ? " · " + n.note : ""}`;
    const mins = Math.round((n.date - now) / 60000);
    const d = Math.floor(mins / 1440), h = Math.floor((mins % 1440) / 60), m = mins % 60;
    $("#nextCount").textContent = "Starts in " + [d && `${d}d`, (d || h) && `${h}h`, `${m}m`].filter(Boolean).join(" ");
  }
  tick(); setInterval(tick, 30000);

  /* ---------- Events ---------- */
  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
  const upcoming = P.events
    .map(e => ({ ...e, d: new Date(e.date + "T" + (e.time || "00:00")) }))
    .filter(e => e.d >= startOfToday)
    .sort((a, b) => a.d - b.d);
  const cats = ["All", ...new Set(upcoming.map(e => e.category))];
  let active = "All";

  function renderFilters() {
    $("#filters").innerHTML = cats.map(c =>
      `<button type="button" class="chip" aria-pressed="${c === active}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
  }
  function renderEvents() {
    const list = upcoming.filter(e => active === "All" || e.category === active);
    $("#eventsEmpty").hidden = list.length > 0;
    $("#eventList").innerHTML = list.map((e, i) => `
      <li class="event">
        <div class="date"><b>${e.d.getDate()}</b><span>${e.d.toLocaleString("en", { month: "short" })}</span></div>
        <div>
          <h3>${esc(e.title)}<span class="tag">${esc(e.category)}</span></h3>
          <p>${esc(e.text)}</p>
          <p class="meta">${DAYS[e.d.getDay()]} · ${e.time}${e.end ? "–" + e.end : ""} · ${esc(e.place)}</p>
        </div>
        <button type="button" class="btn btn--ghost btn--sm" data-ics="${upcoming.indexOf(e)}" aria-label="Add ${esc(e.title)} to calendar">+ Calendar</button>
      </li>`).join("");
  }
  $("#filters").addEventListener("click", ev => {
    const b = ev.target.closest(".chip"); if (!b) return;
    active = b.dataset.cat; renderFilters(); renderEvents();
  });
  $("#eventList").addEventListener("click", ev => {
    const b = ev.target.closest("[data-ics]"); if (!b) return;
    downloadICS(upcoming[+b.dataset.ics]);
  });
  function downloadICS(e) {
    const fmt = (date, time) => date.replace(/-/g, "") + "T" + (time || "00:00").replace(":", "") + "00";
    const endTime = e.end || (() => { const [h, m] = e.time.split(":").map(Number); return String((h + 1) % 24).padStart(2, "0") + ":" + String(m).padStart(2, "0"); })();
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Parish Hub//EN", "BEGIN:VEVENT",
      "UID:" + e.date + "-" + e.title.replace(/\W+/g, "") + "@parishhub",
      "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z",
      "DTSTART:" + fmt(e.date, e.time), "DTEND:" + fmt(e.date, endTime),
      "SUMMARY:" + e.title, "LOCATION:" + e.place + ", " + P.name, "DESCRIPTION:" + e.text.replace(/\n/g, "\\n"),
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([ics], { type: "text/calendar" })),
      download: e.title.replace(/\W+/g, "-").toLowerCase() + ".ics"
    });
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  renderFilters(); renderEvents();

  /* ---------- Prayer wall (stored on this device) ---------- */
  const seed = [
    { id: "s1", name: "Maria", text: "For my mother, who starts treatment next week — for strength and peace.", t: Date.now() - 864e5 * 2, n: 7 },
    { id: "s2", name: "", text: "For everyone in our town spending Christmas alone this year.", t: Date.now() - 864e5 * 4, n: 12 },
    { id: "s3", name: "Joseph", text: "Thanksgiving — our son found work after a long, hard search.", t: Date.now() - 864e5 * 6, n: 9 }
  ];
  let wall = store.get("ph-wall", seed);
  let prayed = new Set(store.get("ph-prayed", []));

  const ago = t => {
    const s = (Date.now() - t) / 1000;
    if (s < 60) return "just now";
    if (s < 3600) return Math.floor(s / 60) + " min ago";
    if (s < 86400) return Math.floor(s / 3600) + " h ago";
    const d = Math.floor(s / 86400); return d + (d === 1 ? " day ago" : " days ago");
  };
  function renderWall() {
    $("#wall").innerHTML = wall.slice().sort((a, b) => b.t - a.t).map(p => `
      <li class="intention">
        <p>${esc(p.text)}</p>
        <footer>
          <span>${esc(p.name || "Anonymous")} · ${ago(p.t)}</span>
          <button type="button" class="pray" data-id="${p.id}" aria-pressed="${prayed.has(p.id)}">
            🙏 ${prayed.has(p.id) ? "Prayed" : "I prayed"} · <span class="n">${p.n}</span>
          </button>
        </footer>
      </li>`).join("");
  }
  $("#wall").addEventListener("click", ev => {
    const b = ev.target.closest(".pray"); if (!b) return;
    const p = wall.find(x => x.id === b.dataset.id);
    if (prayed.has(p.id)) { prayed.delete(p.id); p.n--; } else { prayed.add(p.id); p.n++; }
    store.set("ph-wall", wall); store.set("ph-prayed", [...prayed]); renderWall();
  });
  const pf = $("#prayerForm");
  pf.text.addEventListener("input", () => { $("#charCount").textContent = pf.text.value.length + " / 280"; });
  pf.addEventListener("submit", ev => {
    ev.preventDefault();
    const text = pf.text.value.trim(); if (!text) return;
    wall.push({ id: "p" + Date.now(), name: pf.name.value.trim(), text, t: Date.now(), n: 0 });
    store.set("ph-wall", wall); pf.reset(); $("#charCount").textContent = "0 / 280"; renderWall();
  });
  renderWall();

  /* ---------- Volunteer sign-up ---------- */
  $("#roles").innerHTML = P.volunteerRoles.map(r => `
    <label class="role"><input type="checkbox" name="role" value="${esc(r.title)}">
      <div><strong>${esc(r.title)}</strong><p>${esc(r.text)}</p></div>
    </label>`).join("");
  $("#serveForm").addEventListener("submit", ev => {
    ev.preventDefault();
    const f = ev.target;
    const roles = [...f.querySelectorAll("input[name=role]:checked")].map(i => i.value);
    if (!roles.length) { $("#serveMsg").textContent = "Please choose at least one way to help."; return; }
    const body = `Hello,\n\nI'd like to volunteer with: ${roles.join(", ")}.\n\nName: ${f.name.value}\nContact: ${f.contact.value}\n\nThank you!`;
    location.href = `mailto:${P.email}?subject=${encodeURIComponent("Volunteering: " + roles.join(", "))}&body=${encodeURIComponent(body)}`;
    $("#serveMsg").textContent = "Your email app should open with the message ready — just press send. Thank you!";
  });

  /* ---------- Offline support ---------- */
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
