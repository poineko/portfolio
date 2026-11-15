(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // reveal saat scroll (bisa dipanggil ulang untuk konten dinamis)
  const io = "IntersectionObserver" in window && !reduce
    ? new IntersectionObserver(
        (entries) => entries.forEach((en) => {
          if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        }),
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      )
    : null;

  function stagger(p) {
    [...p.children].forEach((c, i) => c.style.setProperty("--d", i * 70 + "ms"));
  }

  window.observeReveals = function (root) {
    root = root || document;
    if (root.matches && root.matches("[data-stagger]")) stagger(root);
    root.querySelectorAll("[data-stagger]").forEach(stagger);
    root.querySelectorAll(".reveal").forEach((el) => (io ? io.observe(el) : el.classList.add("in")));
  };
  window.observeReveals(document);

  // spotlight kursor
  document.addEventListener("pointermove", (e) => {
    const c = e.target.closest && e.target.closest(".spot");
    if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty("--mx", e.clientX - r.left + "px");
    c.style.setProperty("--my", e.clientY - r.top + "px");
  });

  // highlight menu navbar sesuai section
  const links = [...document.querySelectorAll(".nav-links a[href^='#']")];
  const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  const secs = [...map.keys()].map((id) => document.getElementById(id)).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const so = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((l) => l.classList.remove("active"));
        const a = map.get(en.target.id);
        if (a) a.classList.add("active");
      }),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    secs.forEach((s) => so.observe(s));
  }

  // filter sertifikat
  const cf = document.getElementById("credFilter");
  if (cf) {
    cf.addEventListener("click", (e) => {
      const b = e.target.closest(".cred-chip");
      if (!b) return;
      cf.querySelectorAll(".cred-chip").forEach((x) => x.classList.toggle("active", x === b));
      const g = b.dataset.g;
      document.querySelectorAll("#credGrid .cred-card").forEach((c) => {
        const show = g === "all" || c.dataset.g === g;
        c.hidden = !show;
        if (show) c.classList.add("in");
      });
    });
  }
})();