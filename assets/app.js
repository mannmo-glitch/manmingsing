const getPath = (obj, path) => path.split(".").reduce((value, key) => value && value[key], obj);

const renderTextBindings = (data) => {
  document.querySelectorAll("[data-text]").forEach((node) => {
    const value = getPath(data, node.dataset.text);
    if (value !== undefined) node.textContent = value;
  });

  document.querySelectorAll("[data-bind]").forEach((node) => {
    const value = getPath(data, node.dataset.bind);
    if (!value) return;
    if (node.tagName === "IMG") node.src = value;
  });
};

const renderStats = (data) => {
  const target = document.querySelector('[data-render="stats"]');
  if (!target) return;
  target.innerHTML = data.stats.map((item) => `
    <div class="stat-item">
      <strong>${item.value}</strong>
      <span>${item.label}</span>
    </div>
  `).join("");
};

const serviceCard = (service) => `
  <article class="service-card">
    <h3>${service.title}</h3>
    <p>${service.summary}</p>
    <ul>${service.points.map((point) => `<li>${point}</li>`).join("")}</ul>
  </article>
`;

const renderServices = (data) => {
  const preview = document.querySelector('[data-render="servicePreview"]');
  if (preview) preview.innerHTML = data.services.slice(0, 4).map(serviceCard).join("");

  const all = document.querySelector('[data-render="services"]');
  if (all) all.innerHTML = data.services.map(serviceCard).join("");
};

const renderAbout = (data) => {
  const highlights = document.querySelector('[data-render="aboutHighlights"]');
  if (highlights) {
    highlights.innerHTML = data.about.highlights.map((item) => `<div class="highlight-item">${item}</div>`).join("");
  }

  const names = document.querySelector('[data-render="legalNames"]');
  if (names) {
    names.innerHTML = data.brand.legalNames.map((name) => `<span>${name}</span>`).join("");
  }
};

const renderFaq = (data) => {
  const target = document.querySelector('[data-render="faq"]');
  if (!target) return;
  target.innerHTML = data.faq.map((item, index) => `
    <article class="faq-item">
      <details ${index === 0 ? "open" : ""}>
        <summary>${item.q}</summary>
        <p>${item.a}</p>
      </details>
    </article>
  `).join("");
};

const setupMenu = () => {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
};

const setupMaps = (data) => {
  const query = encodeURIComponent(data.contact.mapQuery);
  const amap = document.querySelector('[data-map="amap"]');
  const baidu = document.querySelector('[data-map="baidu"]');
  if (amap) amap.href = `https://uri.amap.com/search?keyword=${query}`;
  if (baidu) baidu.href = `https://map.baidu.com/search/${query}`;
};

const setupInquiryForm = (data) => {
  const form = document.querySelector("#inquiryForm");
  if (!form) return;
  const status = form.querySelector(".form-status");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(form).entries());
    const subject = encodeURIComponent(`网站询盘：${fields.name || "客户"} - ${fields.service || "物流服务"}`);
    const body = encodeURIComponent([
      `公司/姓名：${fields.name || ""}`,
      `联系电话：${fields.phone || ""}`,
      `起运地：${fields.origin || ""}`,
      `目的地：${fields.destination || ""}`,
      `服务需求：${fields.service || ""}`,
      `货物资料：${fields.message || ""}`
    ].join("\n"));
    window.location.href = `mailto:${data.brand.email}?subject=${subject}&body=${body}`;
    status.textContent = "已打开邮件客户端，请发送邮件完成询盘。";
  });
};

const setupCms = (data) => {
  const editor = document.querySelector("#cmsEditor");
  if (!editor) return;
  const status = document.querySelector("#cmsStatus");
  editor.value = JSON.stringify(data, null, 2);

  document.querySelector("#formatCms").addEventListener("click", () => {
    try {
      editor.value = JSON.stringify(JSON.parse(editor.value), null, 2);
      status.textContent = "JSON 格式正确。";
    } catch (error) {
      status.textContent = `JSON 格式错误：${error.message}`;
    }
  });

  document.querySelector("#downloadCms").addEventListener("click", () => {
    try {
      const parsed = JSON.parse(editor.value);
      const blob = new Blob([JSON.stringify(parsed, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "cms-data.json";
      link.click();
      URL.revokeObjectURL(url);
      status.textContent = "已导出 cms-data.json。";
    } catch (error) {
      status.textContent = `JSON 格式错误：${error.message}`;
    }
  });
};

const boot = async () => {
  setupMenu();
  const response = await fetch("cms-data.json");
  const data = await response.json();
  renderTextBindings(data);
  renderStats(data);
  renderServices(data);
  renderAbout(data);
  renderFaq(data);
  setupMaps(data);
  setupInquiryForm(data);
  setupCms(data);
};

boot().catch((error) => {
  console.error("Unable to load website content", error);
});
