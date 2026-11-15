(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const grid = $("#projectsGrid");

  const CATS = {
    "ai-ds": "AI & Data Science",
    fullstack: "Full Stack & Mobile",
    iot: "IoT & Hardware",
  };

  const THUMBS = {
    "ai-ds": `<svg width="44" height="44" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="10" stroke="#B89BF5" stroke-width="1.5"/><circle cx="24" cy="24" r="4" fill="#B89BF5" opacity=".35"/><circle cx="8" cy="24" r="3" fill="#B89BF5" opacity=".25"/><circle cx="40" cy="24" r="3" fill="#B89BF5" opacity=".25"/><circle cx="24" cy="8" r="3" fill="#B89BF5" opacity=".25"/><circle cx="24" cy="40" r="3" fill="#B89BF5" opacity=".25"/></svg>`,
    fullstack: `<svg width="44" height="44" viewBox="0 0 48 48" fill="none"><rect x="14" y="4" width="20" height="36" rx="4" stroke="#7EB3FF" stroke-width="1.5"/><rect x="18" y="8" width="12" height="18" rx="2" fill="#7EB3FF" opacity=".12"/><circle cx="24" cy="34" r="2" fill="#7EB3FF" opacity=".4"/></svg>`,
    iot: `<svg width="44" height="44" viewBox="0 0 48 48" fill="none"><rect x="12" y="12" width="24" height="24" rx="3" stroke="#F5BE71" stroke-width="1.5"/><rect x="19" y="19" width="10" height="10" rx="1" fill="#F5BE71" opacity=".35"/><path d="M18 6v6M24 6v6M30 6v6M18 36v6M24 36v6M30 36v6M6 18h6M6 24h6M6 30h6M36 18h6M36 24h6M36 30h6" stroke="#F5BE71" stroke-width="1.5" stroke-linecap="round" opacity=".6"/></svg>`,
  };

  let all = [];
  let activeCat = "all";

  /* ── helpers ── */
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const safeUrl = (u) => {
    try {
      const x = new URL(u);
      return /^https?:$/.test(x.protocol) ? x.href : "";
    } catch { return ""; }
  };

  function toEmbedUrl(u) {
    const url = safeUrl(u);
    if (!url) return "";
    const x = new URL(url);
    let id = "";
    if (x.hostname === "youtu.be") id = x.pathname.slice(1);
    else if (x.hostname.endsWith("youtube.com") && x.pathname === "/watch") id = x.searchParams.get("v") || "";
    return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : url;
  }

  const repoLabel = (u) => (/kaggle\.com/i.test(u) ? "Kaggle" : "GitHub");
  const isImg = (m) => m.mediaType !== "video" && safeUrl(m.url);
  const IFRAME_ATTRS =
    'loading="lazy" allowfullscreen allow="fullscreen; clipboard-write; autoplay" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"';

  /* ── grid ── */
  function renderSkeleton(n = 6) {
    grid.innerHTML = Array.from({ length: n }, () =>
      `<div class="project-card skeleton-card" aria-hidden="true">
        <div class="project-thumb skeleton"></div>
        <div class="project-body">
          <div class="skeleton sk-line sk-sm"></div>
          <div class="skeleton sk-line"></div>
          <div class="skeleton sk-line sk-lg"></div>
          <div class="skeleton sk-line sk-lg"></div>
        </div>
      </div>`).join("");
  }

  function cardHTML(p) {
    const label = CATS[p.category] || p.category;
    const thumbUrl = safeUrl(p.thumbnailUrl);
    const demo = safeUrl(p.demoUrl);
    const repo = safeUrl(p.repoUrl);
    const tags = (p.techStack || []).map((t) => `<span class="project-tag">${esc(t)}</span>`).join("");
    return `<article class="project-card${p.isFeatured ? " featured" : ""}" data-slug="${esc(p.slug)}" tabindex="0">
      <div class="project-thumb thumb-${esc(p.category)}">
        <div class="thumb-fallback">${THUMBS[p.category] || ""}</div>
        ${thumbUrl ? `<img src="${esc(thumbUrl)}" alt="${esc(p.title)}" loading="lazy" onerror="this.remove()">` : ""}
      </div>
      <div class="project-body">
        <span class="project-cat-badge badge-${esc(p.category)}">${esc(label)}</span>
        <div class="project-title">${esc(p.title)}</div>
        <div class="project-desc">${esc(p.summary)}</div>
        <div class="project-tags">${tags}</div>
        <div class="project-footer">
          <button type="button" class="proj-link primary">Case Study →</button>
          ${demo ? `<a class="proj-link" href="${esc(demo)}" target="_blank" rel="noopener noreferrer">Live Demo ↗</a>` : ""}
          ${repo ? `<a class="proj-link" href="${esc(repo)}" target="_blank" rel="noopener noreferrer">${repoLabel(repo)} ↗</a>` : ""}
        </div>
      </div>
    </article>`;
  }

  function render() {
    const list = activeCat === "all" ? all : all.filter((p) => p.category === activeCat);
    grid.innerHTML = list.length
      ? list.map(cardHTML).join("")
      : `<div class="state-box"><p>Belum ada project di kategori ini.</p></div>`;
  }

  function renderError() {
    grid.innerHTML = `<div class="state-box">
      <p>Server belum aktif atau tidak bisa dijangkau.<br>Coba lagi sebentar, server gratisan butuh beberapa detik untuk bangun.</p>
      <button type="button" class="btn-ghost" id="retryBtn">Coba lagi</button>
    </div>`;
    $("#retryBtn").addEventListener("click", load);
  }

  async function load() {
    renderSkeleton();
    try {
      all = await api.getProjects();
      render();
    } catch (err) {
      console.error(err);
      renderError();
    }
  }

  document.querySelectorAll(".filter-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeCat = btn.dataset.cat;
      if (all.length) render();
    })
  );

  grid.addEventListener("click", (e) => {
    if (e.target.closest("a")) return;
    const card = e.target.closest(".project-card[data-slug]");
    if (card) openModal(card.dataset.slug);
  });
  grid.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.matches(".project-card[data-slug]")) openModal(e.target.dataset.slug);
  });

  /* ── modal ── */
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.hidden = true;
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "modalTitle");
  modal.innerHTML = `
    <div class="modal-backdrop" data-close></div>
    <div class="modal-panel">
      <button type="button" class="modal-close" data-close aria-label="Tutup">✕</button>
      <div class="modal-scroll"><div id="modalContent"></div></div>
    </div>`;
  document.body.appendChild(modal);

  const content = $("#modalContent", modal);
  const scroller = $(".modal-scroll", modal);
  const closeBtn = $(".modal-close", modal);

  const MODAL_SKELETON = `
    <div class="skeleton sk-line sk-sm"></div>
    <div class="skeleton sk-line" style="height:34px;width:60%"></div>
    <div class="skeleton sk-line sk-lg"></div>
    <div class="skeleton sk-line sk-lg"></div>
    <div class="skeleton" style="aspect-ratio:16/9;margin-top:24px"></div>`;

  let reqId = 0;
  let lastFocus = null;
  let gallery = [];

  function detailHTML(p) {
    const demo = safeUrl(p.demoUrl);
    const repo = safeUrl(p.repoUrl);
    const embed = toEmbedUrl(p.embedUrl);
    const media = p.media || [];
    const videos = media.filter((m) => m.mediaType === "video" && safeUrl(m.url));
    const tags = (p.techStack || []).map((t) => `<span class="project-tag">${esc(t)}</span>`).join("");

    const videoHTML = (m) => {
      const url = safeUrl(m.url);
      const body = /\.(mp4|webm|ogg)(\?|$)/i.test(url)
        ? `<video controls preload="metadata" src="${esc(url)}"></video>`
        : `<iframe src="${esc(toEmbedUrl(url))}" title="${esc(m.caption || "Video")}" ${IFRAME_ATTRS}></iframe>`;
      return `<div><div class="embed-wrap">${body}</div>${m.caption ? `<div class="gallery-cap">${esc(m.caption)}</div>` : ""}</div>`;
    };

    return `
      <header>
        <span class="project-cat-badge badge-${esc(p.category)}">${esc(CATS[p.category] || p.category)}</span>
        <h3 class="md-title" id="modalTitle">${esc(p.title)}</h3>
        <p class="md-summary">${esc(p.summary)}</p>
        <div class="project-tags">${tags}</div>
        <div class="md-actions">
          ${demo ? `<a class="btn-primary" href="${esc(demo)}" target="_blank" rel="noopener noreferrer">Live Demo ↗</a>` : ""}
          ${repo ? `<a class="btn-ghost" href="${esc(repo)}" target="_blank" rel="noopener noreferrer">${repoLabel(repo)} ↗</a>` : ""}
        </div>
      </header>
      ${embed ? `<section class="md-sec">
        <div class="md-label">Interactive Demo</div>
        <div class="embed-wrap"><iframe src="${esc(embed)}" title="Demo ${esc(p.title)}" ${IFRAME_ATTRS}></iframe></div>
        <a class="md-ext" href="${esc(embed)}" target="_blank" rel="noopener noreferrer">Buka di tab baru ↗</a>
      </section>` : ""}
      ${p.problemSolution ? `<section class="md-sec"><div class="md-label">Problem &amp; Solution</div><div class="md-text">${esc(p.problemSolution)}</div></section>` : ""}
      ${p.architectureNotes ? `<section class="md-sec"><div class="md-label">System Architecture</div><div class="md-text">${esc(p.architectureNotes)}</div></section>` : ""}
      ${gallery.length ? `<section class="md-sec"><div class="md-label">Gallery</div><div class="gallery">
        ${gallery.map((m, i) => `<figure class="gallery-item">
          <button type="button" data-lb="${i}"><img src="${esc(safeUrl(m.url))}" alt="${esc(m.caption || p.title)}" loading="lazy"></button>
          ${m.caption ? `<figcaption>${esc(m.caption)}</figcaption>` : ""}
        </figure>`).join("")}
      </div></section>` : ""}
      ${videos.length ? `<section class="md-sec"><div class="md-label">Video</div><div class="md-videos">${videos.map(videoHTML).join("")}</div></section>` : ""}`;
  }

  async function openModal(slug) {
    const id = ++reqId;
    lastFocus = document.activeElement;
    content.innerHTML = MODAL_SKELETON;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    scroller.scrollTop = 0;
    closeBtn.focus();
    try {
      const p = await api.getProject(slug);
      if (id !== reqId) return;
      gallery = (p.media || []).filter(isImg);
      content.innerHTML = detailHTML(p);
    } catch (err) {
      if (id !== reqId) return;
      console.error(err);
      content.innerHTML = `<div class="state-box"><p>Gagal memuat detail project. Coba lagi.</p></div>`;
    }
  }

  function closeModal() {
    reqId++;
    modal.hidden = true;
    content.innerHTML = ""; // menghentikan iframe/video
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  modal.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) return closeModal();
    const b = e.target.closest("[data-lb]");
    if (b) showLb(Number(b.dataset.lb));
  });

  /* ── lightbox ── */
  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.hidden = true;
  lb.innerHTML = `
    <button type="button" class="lb-close" aria-label="Tutup">✕</button>
    <button type="button" class="lb-nav lb-prev" aria-label="Sebelumnya">‹</button>
    <figure><img alt=""><figcaption></figcaption></figure>
    <button type="button" class="lb-nav lb-next" aria-label="Berikutnya">›</button>`;
  document.body.appendChild(lb);

  const lbImg = $("img", lb);
  const lbCap = $("figcaption", lb);
  let lbIdx = 0;

  function showLb(i) {
    if (!gallery.length) return;
    lbIdx = (i + gallery.length) % gallery.length;
    const m = gallery[lbIdx];
    lbImg.src = safeUrl(m.url);
    lbImg.alt = m.caption || "";
    lbCap.textContent = m.caption || "";
    lb.classList.toggle("single", gallery.length < 2);
    lb.hidden = false;
  }
  function closeLb() {
    lb.hidden = true;
    lbImg.removeAttribute("src");
  }

  lb.addEventListener("click", (e) => {
    if (e.target === lb || e.target.closest(".lb-close")) closeLb();
    else if (e.target.closest(".lb-prev")) showLb(lbIdx - 1);
    else if (e.target.closest(".lb-next")) showLb(lbIdx + 1);
  });

  document.addEventListener("keydown", (e) => {
    if (!lb.hidden) {
      if (e.key === "Escape") closeLb();
      else if (e.key === "ArrowRight") showLb(lbIdx + 1);
      else if (e.key === "ArrowLeft") showLb(lbIdx - 1);
      return;
    }
    if (!modal.hidden && e.key === "Escape") closeModal();
  });

  load();
})();