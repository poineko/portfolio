(function () {
  const form = document.getElementById("contactForm");
  if (!form) return;
  const btn = document.getElementById("sendBtn");
  const BTN_TEXT = btn.textContent;

  function toast(msg, type = "success") {
    let wrap = document.querySelector(".toast-wrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "toast-wrap";
      wrap.setAttribute("aria-live", "polite");
      document.body.appendChild(wrap);
    }
    const t = document.createElement("div");
    t.className = "toast " + type;
    t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(() => t.remove(), 5000);
  }

  function clearErrors() {
    form.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));
    form.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
  }

  function showErrors(errs) {
    let first = null;
    Object.entries(errs).forEach(([name, msg]) => {
      const out = form.querySelector(`.field-error[data-for="${name}"]`);
      const input = form.elements[name];
      if (out) out.textContent = msg;
      if (input) {
        input.classList.add("invalid");
        if (!first) first = input;
      }
    });
    if (first) first.focus();
  }

  function validate(d) {
    const e = {};
    if (!d.senderName) e.senderName = "Nama wajib diisi";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.senderEmail)) e.senderEmail = "Email tidak valid";
    if (d.message.length < 5) e.message = "Pesan minimal 5 karakter";
    return e;
  }

  function setLoading(on) {
    btn.disabled = on;
    btn.classList.toggle("loading", on);
    btn.textContent = on ? "Mengirim..." : BTN_TEXT;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    const el = form.elements;
    const data = {
      senderName: el.senderName.value.trim(),
      senderEmail: el.senderEmail.value.trim(),
      subject: el.subject.value.trim(),
      message: el.message.value.trim(),
      website: el.website.value,
    };

    const errs = validate(data);
    if (Object.keys(errs).length) return showErrors(errs);

    setLoading(true);
    try {
      await api.sendContact(data);
      form.reset();
      toast("Pesan terkirim! Aku akan balas secepatnya.", "success");
    } catch (err) {
      if (err.status === 422 && Array.isArray(err.details)) {
        const map = {};
        err.details.forEach((d) => (map[d.field] = d.message));
        showErrors(map);
      } else if (err.status === 429) {
        toast(err.message, "error");
      } else {
        toast("Gagal mengirim pesan. Pastikan server aktif lalu coba lagi, atau email langsung ke eliteisan@gmail.com.", "error");
      }
    } finally {
      setLoading(false);
    }
  });
})();