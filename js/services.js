(function () {
  const el = document.getElementById("serviceList");
  if (!el || !window.api) return;

  const WA = (window.APP_CONFIG && window.APP_CONFIG.WA_NUMBER) || "";
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const rp = (n) => "Rp " + Number(n).toLocaleString("id-ID");
  const wa = (text) => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
  const COLOR = {
    "Digitalisasi & Aplikasi": "accent",
    "Data Science & Analytics": "amber",
    "Artificial Intelligence": "purple",
    "Academic Solutions": "green",
  };

  // Harga: kisaran (terendah – tertinggi) bila harga tertinggi diisi, kalau tidak "Mulai dari"
  const hasRange = (s) => Number(s.priceMax) > Number(s.startPrice);
  const priceHTML = (s) =>
    hasRange(s)
      ? `<small>Kisaran harga</small>${rp(s.startPrice)} – ${rp(s.priceMax)}`
      : `<small>Mulai dari</small>${rp(s.startPrice)}`;
  const priceText = (s) => (hasRange(s) ? `${rp(s.startPrice)} – ${rp(s.priceMax)}` : `mulai dari ${rp(s.startPrice)}`);
  const waLink = (s) =>
    wa(`Halo ARTech, saya tertarik dengan ${s.name} (${priceText(s)}). Boleh konsultasi?`);

  const main = document.getElementById("waMain");
  if (main) main.href = wa("Halo ARTech, saya ingin konsultasi tentang pembuatan website/aplikasi.");

  const byId = new Map();

  function cardHTML(s, cat) {
    const pills = [s.duration, s.revisions].filter(Boolean).map((t) => `<span class="pill">${esc(t)}</span>`).join("");
    return `
      <article class="svc-card spot" style="--c:var(--${COLOR[cat] || "accent"})">
        <div class="svc-name">${esc(s.name)}</div>
        <p class="svc-desc">${esc(s.description)}</p>
        ${pills ? `<div class="pill-row">${pills}</div>` : ""}
        <div class="svc-price${hasRange(s) ? " is-range" : ""}">${priceHTML(s)}</div>
        <div class="svc-actions">
          <button type="button" class="svc-btn svc-more" data-id="${s.id}">Lihat detail</button>
          <a class="svc-btn" href="${esc(waLink(s))}" target="_blank" rel="noopener noreferrer">WhatsApp ↗</a>
        </div>
      </article>`;
  }

  function render(list) {
    const groups = {};
    list.forEach((s) => {
      byId.set(Number(s.id), s);
      (groups[s.category] = groups[s.category] || []).push(s);
    });
    el.innerHTML = Object.entries(groups)
      .map(
        ([cat, items]) => `
      <div class="svc-group reveal">
        <div class="svc-cat">${esc(cat)}</div>
        <div class="svc-grid">${items.map((s) => cardHTML(s, cat)).join("")}</div>
      </div>`,
      )
      .join("");
    if (window.observeReveals) window.observeReveals(el);
  }

  /* ── Jendela detail (elemen <dialog>) ── */
  const dlg = document.createElement("dialog");
  dlg.className = "svc-dialog";
  dlg.setAttribute("aria-label", "Detail layanan");
  document.body.appendChild(dlg);

  const list = (items, kind) =>
    items.length ? `<ul class="svc-list ${kind}">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : "";

  function detailHTML(s) {
    const color = COLOR[s.category] || "accent";
    const facts = [
      ["Estimasi waktu", s.duration],
      ["Revisi", s.revisions],
      ["Cocok untuk", s.idealFor],
    ]
      .filter(([, v]) => v)
      .map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`)
      .join("");
    return `
      <div class="svc-d-body" style="--c:var(--${color})">
        <div class="svc-d-cat">${esc(s.category)}</div>
        <h3>${esc(s.name)}</h3>
        <p class="svc-d-desc">${esc(s.description)}</p>
        <div class="svc-d-price">${priceHTML(s)}</div>
        ${facts ? `<dl class="svc-facts">${facts}</dl>` : ""}
        ${s.includes && s.includes.length ? `<h4>Yang kamu dapat</h4>${list(s.includes, "yes")}` : ""}
        ${s.excludes && s.excludes.length ? `<h4>Tidak termasuk</h4>${list(s.excludes, "no")}` : ""}
        <p class="svc-note">Harga final ditentukan setelah konsultasi, sesuai kebutuhan dan kompleksitas proyek.</p>
        <div class="svc-d-actions">
          <a class="btn-primary" href="${esc(waLink(s))}" target="_blank" rel="noopener noreferrer">Konsultasi via WhatsApp</a>
          <button type="button" class="btn-ghost svc-close">Tutup</button>
        </div>
      </div>`;
  }

  el.addEventListener("click", (e) => {
    const btn = e.target.closest(".svc-more");
    if (!btn) return;
    const s = byId.get(Number(btn.dataset.id));
    if (!s) return;
    dlg.innerHTML = detailHTML(s);
    document.body.style.overflow = "hidden";
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "");
    dlg.scrollTop = 0;
  });

  // klik di area gelap (backdrop) atau tombol Tutup menutup jendela
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg || e.target.closest(".svc-close")) dlg.close();
  });
  dlg.addEventListener("close", () => {
    document.body.style.overflow = "";
  });

  api
    .request("/services")
    .then((rows) => {
      if (rows.length) render(rows);
      else el.innerHTML = `<p class="sec-sub">Daftar layanan segera hadir. Hubungi kami lewat WhatsApp.</p>`;
    })
    .catch(() => {
      el.innerHTML = `<p class="sec-sub">Daftar layanan belum bisa dimuat. Silakan hubungi kami lewat WhatsApp.</p>`;
    });
})();