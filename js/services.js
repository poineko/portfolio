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

  const main = document.getElementById("waMain");
  if (main) main.href = wa("Halo ARTech, saya ingin konsultasi tentang pembuatan website/aplikasi.");

  function render(list) {
    const groups = {};
    list.forEach((s) => (groups[s.category] = groups[s.category] || []).push(s));
    el.innerHTML = Object.entries(groups)
      .map(
        ([cat, items]) => `
      <div class="svc-group reveal">
        <div class="svc-cat">${esc(cat)}</div>
        <div class="svc-grid">${items
          .map(
            (s) => `
          <article class="svc-card spot" style="--c:var(--${COLOR[cat] || "accent"})">
            <div class="svc-name">${esc(s.name)}</div>
            <p class="svc-desc">${esc(s.description)}</p>
            ${s.duration ? `<div class="pill-row"><span class="pill">${esc(s.duration)}</span></div>` : ""}
            <div class="svc-price"><small>Mulai dari</small>${rp(s.startPrice)}</div>
            <a class="svc-btn" href="${esc(wa(`Halo ARTech, saya tertarik dengan ${s.name}. Boleh konsultasi?`))}" target="_blank" rel="noopener noreferrer">Tanya via WhatsApp ↗</a>
          </article>`,
          )
          .join("")}
        </div>
      </div>`,
      )
      .join("");
    if (window.observeReveals) window.observeReveals(el);
  }

  api
    .request("/services")
    .then((list) => {
      if (list.length) render(list);
      else el.innerHTML = `<p class="sec-sub">Daftar layanan segera hadir. Hubungi kami lewat WhatsApp.</p>`;
    })
    .catch(() => {
      el.innerHTML = `<p class="sec-sub">Daftar layanan belum bisa dimuat. Silakan hubungi kami lewat WhatsApp.</p>`;
    });
})();