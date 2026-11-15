(function () {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = (u) => { try { const x = new URL(u); return /^https?:$/.test(x.protocol) ? x.href : ""; } catch { return ""; } };
  const col = (c) => (["accent", "green", "amber", "purple"].includes(c) ? c : "accent");

  const svg = (d) => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const ICONS = {
    ai: svg('<circle cx="12" cy="12" r="3"/><circle cx="4.5" cy="6" r="1.6"/><circle cx="19.5" cy="6" r="1.6"/><circle cx="4.5" cy="18" r="1.6"/><circle cx="19.5" cy="18" r="1.6"/><path d="M9.8 10.6 5.8 7M14.2 10.6l4-3.6M9.8 13.4l-4 3.6M14.2 13.4l4 3.6"/>'),
    data: svg('<path d="M4 20h16M7 20v-8M12 20V6M17 20v-5"/>'),
    web: svg('<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/>'),
    mobile: svg('<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>'),
    cloud: svg('<path d="M7 18a4 4 0 0 1-.6-7.96A5.5 5.5 0 0 1 17 8.5a4.5 4.5 0 0 1 .5 9H7z"/>'),
    iot: svg('<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/>'),
    code: svg('<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 6l-3 12"/>'),
  };

  const TYPE = { work: "Work", contract: "Contract", internship: "Internship", education: "Education" };

  const GROUPS = {
    google: { c: "accent", b: "G", l: "Google" },
    aws: { c: "amber", b: "aws", l: "AWS" },
    microsoft: { c: "green", b: "M", l: "Microsoft" },
    bnsp: { c: "green", b: "BN", l: "BNSP" },
    other: { c: "purple", b: "", l: "Other" },
  };
  // grup yang belum terdaftar di atas tetap tampil (warna ungu, label dari nama grup)
  const groupOf = (k) => GROUPS[k] || { c: "purple", b: "", l: k ? k.charAt(0).toUpperCase() + k.slice(1) : "Other" };

  /* ── Skills ── */
  function skillsHTML(groups) {
    return groups.map((g) => `
      <article class="stack-card spot reveal" style="--c:var(--${col(g.color)})">
        <div class="stack-head">
          <div class="stack-ico">${ICONS[g.icon] || ICONS.code}</div>
          <div><div class="stack-title">${esc(g.name)}</div><div class="stack-sub">${g.items.length} skill${g.items.length === 1 ? "" : "s"}</div></div>
        </div>
        <div class="stack-list">${g.items.map((i) => `
          <div class="stack-skill">
            <div class="stack-top"><span class="stack-name">${esc(i.name)}</span><span class="stack-pct">${Number(i.level) || 0}%</span></div>
            <div class="stack-bar"><i style="width:${Math.min(100, Number(i.level) || 0)}%"></i></div>
          </div>`).join("")}
        </div>
      </article>`).join("");
  }

  /* ── Experience ── */
  function expHTML(list) {
    return list.map((e) => `
      <article class="xp-item reveal" style="--c:var(--${col(e.color)})">
        <span class="xp-dot"></span>
        <div class="xp-card spot">
          <div class="xp-meta"><span class="xp-type">${esc(TYPE[e.type] || e.type)}</span><span class="xp-period">${esc(e.period)}</span></div>
          <h3 class="xp-role">${esc(e.role)}</h3>
          <div class="xp-org">${esc(e.organization)}</div>
          ${e.points.length ? `<ul class="xp-points">${e.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
          ${e.tags.length ? `<div class="pill-row xp-tags">${e.tags.map((t) => `<span class="pill${/^gpa/i.test(t) ? " hl" : ""}">${esc(t)}</span>`).join("")}</div>` : ""}
        </div>
      </article>`).join("");
  }

  /* ── Certifications ── */
  const badgeOf = (c, g) => c.badge || g.b || (c.issuer || "?").slice(0, 2);

  function certsHTML(list) {
    return list.map((c) => {
      const g = groupOf(c.group);
      const link = safeUrl(c.url);
      const inner = `
        <div class="cred-badge">${esc(badgeOf(c, g))}</div>
        <div>
          <div class="cred-issuer">${esc(c.issuer)}</div>
          <div class="cred-name">${esc(c.name)}</div>
          ${c.year ? `<span class="cred-year">${esc(c.year)}</span>` : ""}
          ${link ? `<span class="cred-link">Lihat kredensial ↗</span>` : ""}
        </div>`;
      const attrs = `class="cred-card spot reveal" data-g="${esc(c.group)}" style="--c:var(--${g.c})"`;
      return link
        ? `<a ${attrs} href="${esc(link)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(c.name)}, buka kredensial">${inner}</a>`
        : `<article ${attrs}>${inner}</article>`;
    }).join("");
  }

  function filterHTML(list) {
    const counts = {};
    list.forEach((c) => (counts[c.group] = (counts[c.group] || 0) + 1));
    const keys = [...Object.keys(GROUPS), ...Object.keys(counts).filter((k) => !GROUPS[k])].filter((k) => counts[k]);
    const chips = keys
      .map((k) => `<button class="cred-chip" data-g="${esc(k)}" type="button">${esc(groupOf(k).l)} <span>${counts[k]}</span></button>`)
      .join("");
    return `<button class="cred-chip active" data-g="all" type="button">All <span>${list.length}</span></button>${chips}`;
  }

  function swap(id, html) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = html;
    if (window.observeReveals) window.observeReveals(el);
  }

  async function init() {
    if (!window.api) return;
    const [sk, ex, ce] = await Promise.allSettled([
      api.request("/skills"),
      api.request("/experiences"),
      api.request("/certifications"),
    ]);
    // gagal / kosong -> biarkan HTML statis sebagai cadangan
    if (sk.status === "fulfilled" && sk.value.length) swap("stackGrid", skillsHTML(sk.value));
    if (ex.status === "fulfilled" && ex.value.length) swap("xpList", expHTML(ex.value));
    if (ce.status === "fulfilled" && ce.value.length) {
      swap("credGrid", certsHTML(ce.value));
      document.getElementById("credFilter").innerHTML = filterHTML(ce.value);
    }
  }
  init();
})();