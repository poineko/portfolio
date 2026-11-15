(function () {
  const BASE = window.APP_CONFIG.API_BASE_URL.replace(/\/$/, "");

  async function request(path, options = {}) {
    const res = await fetch(BASE + path, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    });
    let data = null;
    try { data = await res.json(); } catch { /* 204 / body kosong */ }
    if (!res.ok) {
      const err = new Error((data && data.error) || `Request gagal (${res.status})`);
      err.status = res.status;
      err.details = data && data.details;
      throw err;
    }
    return data;
  }

  window.api = {
    request,
    getProjects: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request("/projects" + (q ? `?${q}` : ""));
    },
    getProject: (slug) => request(`/projects/${encodeURIComponent(slug)}`),
    sendContact: (body) => request("/contact", { method: "POST", body: JSON.stringify(body) }),
  };
})();