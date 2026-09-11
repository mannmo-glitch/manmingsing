const state = {
  data: null,
  originalData: null,
  serverMode: false,
  activeTab: "brand",
  isEditing: false
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const get = (path) => path.split(".").reduce((value, key) => value?.[key], state.data);
const set = (path, value) => {
  const keys = path.split(".");
  const last = keys.pop();
  const target = keys.reduce((obj, key) => obj[key], state.data);
  target[last] = value;
};

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const cloneData = (data) => JSON.parse(JSON.stringify(data));

const tabMeta = {
  brand: ["品牌资料", "管理网站名称、电话、电邮、Logo 与公司名称。"],
  home: ["首页内容", "管理首页首屏文字、按钮、主图及数字卖点。"],
  services: ["服务项目", "新增、排序或修改网站展示的物流服务。"],
  about: ["关于我们", "管理公司介绍、优势亮点与路线覆盖内容。"],
  contact: ["联系资料", "管理地址、地图搜寻、微信二维码与联络方式。"],
  faq: ["FAQ", "新增或修改客户常见问题。"]
};

const field = ({ label, path, type = "text", rows = 3, placeholder = "" }) => {
  const value = escapeHtml(get(path) ?? "");
  const input = type === "textarea"
    ? `<textarea data-path="${path}" rows="${rows}" placeholder="${escapeHtml(placeholder)}">${value}</textarea>`
    : `<input data-path="${path}" type="${type}" value="${value}" placeholder="${escapeHtml(placeholder)}">`;
  return `<label class="field ${type === "textarea" ? "full" : ""}"><span>${label}</span>${input}</label>`;
};

const imageField = ({ label, path }) => `
  <label class="field image-field">
    <span>${label}</span>
    <input data-path="${path}" type="text" value="${escapeHtml(get(path) ?? "")}">
    <input data-upload-for="${path}" type="file" accept="image/*">
    <small>可填入 assets/xxx.jpg，或上传新图片。</small>
  </label>
`;

const stringList = ({ title, path, addText = "新增项目" }) => {
  const items = get(path) || [];
  return `
    <section class="cms-card full" data-list="${path}" data-list-type="string">
      <div class="cms-card-head">
        <h3>${title}</h3>
        <button class="btn ghost small" type="button" data-add-string="${path}">${addText}</button>
      </div>
      <div class="repeat-list">
        ${items.map((item, index) => `
          <div class="repeat-row">
            <input data-string-list="${path}" data-index="${index}" value="${escapeHtml(item)}">
            <button class="icon-btn danger" type="button" data-remove-string="${path}" data-index="${index}" aria-label="删除">×</button>
          </div>
        `).join("")}
      </div>
    </section>
  `;
};

const renderBrand = () => {
  $('[data-cms-panel="brand"]').innerHTML = `
    ${field({ label: "网站名称", path: "brand.name" })}
    ${field({ label: "深圳电话", path: "brand.phoneCn" })}
    ${field({ label: "香港电话", path: "brand.phoneHk" })}
    ${field({ label: "收件 Email", path: "brand.email", type: "email" })}
    ${field({ label: "微信客服标签", path: "brand.wechatLabel" })}
    ${imageField({ label: "Logo 图片", path: "brand.logo" })}
    ${field({ label: "品牌标语", path: "brand.tagline", type: "textarea", rows: 3 })}
    ${stringList({ title: "公司名称", path: "brand.legalNames", addText: "新增公司" })}
  `;
};

const renderHome = () => {
  $('[data-cms-panel="home"]').innerHTML = `
    ${field({ label: "首页小标题", path: "hero.eyebrow" })}
    ${field({ label: "首页大标题", path: "hero.title", type: "textarea", rows: 2 })}
    ${field({ label: "首页简介", path: "hero.intro", type: "textarea", rows: 4 })}
    ${field({ label: "主按钮文字", path: "hero.primaryCta" })}
    ${field({ label: "次按钮文字", path: "hero.secondaryCta" })}
    ${imageField({ label: "首页主图", path: "hero.image" })}
    <section class="cms-card full">
      <div class="cms-card-head">
        <h3>数字卖点</h3>
        <button class="btn ghost small" type="button" data-add-stat>新增卖点</button>
      </div>
      <div class="repeat-list">
        ${state.data.stats.map((item, index) => `
          <div class="repeat-grid">
            <input data-stat="${index}" data-key="value" value="${escapeHtml(item.value)}" placeholder="数值">
            <input data-stat="${index}" data-key="label" value="${escapeHtml(item.label)}" placeholder="说明">
            <button class="icon-btn danger" type="button" data-remove-stat="${index}" aria-label="删除">×</button>
          </div>
        `).join("")}
      </div>
    </section>
  `;
};

const renderServices = () => {
  $('[data-cms-panel="services"]').innerHTML = `
    <div class="repeat-list full">
      ${state.data.services.map((service, index) => `
        <section class="cms-card" data-service-card="${index}">
          <div class="cms-card-head">
            <h3>服务 ${index + 1}</h3>
            <button class="icon-btn danger" type="button" data-remove-service="${index}" aria-label="删除">×</button>
          </div>
          <label class="field full"><span>标题</span><input data-service="${index}" data-key="title" value="${escapeHtml(service.title)}"></label>
          <label class="field full"><span>简介</span><textarea data-service="${index}" data-key="summary" rows="3">${escapeHtml(service.summary)}</textarea></label>
          <label class="field full"><span>要点（每行一项）</span><textarea data-service="${index}" data-key="points" rows="4">${escapeHtml(service.points.join("\\n"))}</textarea></label>
        </section>
      `).join("")}
    </div>
    <button class="btn ghost" type="button" data-add-service>新增服务</button>
  `;
};

const renderAbout = () => {
  $('[data-cms-panel="about"]').innerHTML = `
    ${field({ label: "关于标题", path: "about.title" })}
    ${field({ label: "关于正文", path: "about.body", type: "textarea", rows: 6 })}
    ${stringList({ title: "优势亮点", path: "about.highlights", addText: "新增亮点" })}
    ${field({ label: "路线标题", path: "coverage.title" })}
    ${field({ label: "路线说明", path: "coverage.summary", type: "textarea", rows: 5 })}
    ${imageField({ label: "路线图片", path: "coverage.image" })}
  `;
};

const renderContact = () => {
  $('[data-cms-panel="contact"]').innerHTML = `
    ${field({ label: "深圳地址", path: "contact.addressCn", type: "textarea", rows: 3 })}
    ${field({ label: "深圳备用地址", path: "contact.officeCnAlt", type: "textarea", rows: 3 })}
    ${field({ label: "香港办公室", path: "contact.addressHk", type: "textarea", rows: 3 })}
    ${field({ label: "香港仓库", path: "contact.warehouseHk", type: "textarea", rows: 3 })}
    ${field({ label: "地图搜寻关键词", path: "contact.mapQuery", type: "textarea", rows: 2 })}
    ${imageField({ label: "微信二维码", path: "contact.wechatQr" })}
  `;
};

const renderFaq = () => {
  $('[data-cms-panel="faq"]').innerHTML = `
    <div class="repeat-list full">
      ${state.data.faq.map((item, index) => `
        <section class="cms-card">
          <div class="cms-card-head">
            <h3>问题 ${index + 1}</h3>
            <button class="icon-btn danger" type="button" data-remove-faq="${index}" aria-label="删除">×</button>
          </div>
          <label class="field full"><span>问题</span><input data-faq="${index}" data-key="q" value="${escapeHtml(item.q)}"></label>
          <label class="field full"><span>答案</span><textarea data-faq="${index}" data-key="a" rows="4">${escapeHtml(item.a)}</textarea></label>
        </section>
      `).join("")}
    </div>
    <button class="btn ghost" type="button" data-add-faq>新增 FAQ</button>
  `;
};

const renderAll = () => {
  renderBrand();
  renderHome();
  renderServices();
  renderAbout();
  renderContact();
  renderFaq();
  bindDynamicEvents();
  applyEditMode();
};

const applyEditMode = () => {
  const editButton = $("#editCms");
  const saveButton = $("#saveCms");
  const cancelButton = $("#cancelCms");
  if (editButton) editButton.hidden = state.isEditing;
  if (saveButton) saveButton.hidden = !state.isEditing;
  if (cancelButton) cancelButton.hidden = !state.isEditing;

  $$("#cmsForm input, #cmsForm textarea, #cmsForm select, #cmsForm button").forEach((control) => {
    control.disabled = !state.isEditing;
  });

  $("#cmsForm")?.classList.toggle("is-locked", !state.isEditing);
};

const syncInput = (input) => {
  if (input.dataset.path) set(input.dataset.path, input.value);
  if (input.dataset.stringList) {
    get(input.dataset.stringList)[Number(input.dataset.index)] = input.value;
  }
  if (input.dataset.stat) {
    state.data.stats[Number(input.dataset.stat)][input.dataset.key] = input.value;
  }
  if (input.dataset.service) {
    const service = state.data.services[Number(input.dataset.service)];
    service[input.dataset.key] = input.dataset.key === "points"
      ? input.value.split("\n").map((item) => item.trim()).filter(Boolean)
      : input.value;
  }
  if (input.dataset.faq) {
    state.data.faq[Number(input.dataset.faq)][input.dataset.key] = input.value;
  }
};

const uploadImage = async (input) => {
  if (!state.isEditing) return;
  const file = input.files?.[0];
  if (!file) return;
  const dataUrl = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });

  if (!state.serverMode) {
    $("#cmsStatus").textContent = "图片上传需要使用本地 CMS server。";
    return;
  }

  const response = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, dataUrl })
  });
  if (!response.ok) throw new Error("图片上传失败");
  const result = await response.json();
  set(input.dataset.uploadFor, result.path);
  renderAll();
  $("#cmsStatus").textContent = `已上传图片：${result.path}`;
};

const bindDynamicEvents = () => {
  $$("#cmsForm input[data-path], #cmsForm textarea[data-path], [data-string-list], [data-stat], [data-service], [data-faq]").forEach((input) => {
    input.addEventListener("input", () => syncInput(input));
  });

  $$("[data-upload-for]").forEach((input) => {
    input.addEventListener("change", () => uploadImage(input).catch((error) => {
      $("#cmsStatus").textContent = error.message;
    }));
  });
};

const delegateClicks = () => {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (!state.isEditing && button.closest("#cmsForm")) return;

    if (button.dataset.addString) get(button.dataset.addString).push("新项目");
    if (button.dataset.removeString) get(button.dataset.removeString).splice(Number(button.dataset.index), 1);
    if (button.dataset.addStat !== undefined) state.data.stats.push({ value: "新数值", label: "新卖点" });
    if (button.dataset.removeStat !== undefined) state.data.stats.splice(Number(button.dataset.removeStat), 1);
    if (button.dataset.addService !== undefined) state.data.services.push({ title: "新服务", summary: "服务简介", points: ["服务要点"] });
    if (button.dataset.removeService !== undefined) state.data.services.splice(Number(button.dataset.removeService), 1);
    if (button.dataset.addFaq !== undefined) state.data.faq.push({ q: "新问题", a: "答案内容" });
    if (button.dataset.removeFaq !== undefined) state.data.faq.splice(Number(button.dataset.removeFaq), 1);

    if (button.matches("[data-add-string], [data-remove-string], [data-add-stat], [data-remove-stat], [data-add-service], [data-remove-service], [data-add-faq], [data-remove-faq]")) {
      renderAll();
      $("#cmsStatus").textContent = "已更新表单。";
    }
  });
};

const setupTabs = () => {
  $$("[data-cms-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTab = button.dataset.cmsTab;
      $$("[data-cms-tab]").forEach((item) => item.classList.toggle("active", item === button));
      $$(".cms-panel").forEach((panel) => panel.classList.toggle("active", panel.dataset.cmsPanel === state.activeTab));
      const [title, hint] = tabMeta[state.activeTab];
      $("#cmsTitle").textContent = title;
      $("#cmsHint").textContent = hint;
    });
  });
};

const setupActions = () => {
  $("#editCms")?.addEventListener("click", () => {
    state.originalData = cloneData(state.data);
    state.isEditing = true;
    applyEditMode();
    $("#cmsStatus").textContent = "已进入编辑模式。";
  });

  $("#cancelCms")?.addEventListener("click", () => {
    state.data = cloneData(state.originalData);
    state.isEditing = false;
    renderAll();
    $("#cmsStatus").textContent = "已取消更改。";
  });

  const saveButton = $("#saveCms");
  if (saveButton) {
    saveButton.addEventListener("click", async () => {
      if (!state.serverMode) {
        $("#cmsStatus").textContent = "未连接 CMS server，无法直接更改。";
        return;
      }
      const response = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state.data)
      });
      if (!response.ok) {
        $("#cmsStatus").textContent = "保存失败，请检查 server。";
        return;
      }
      state.originalData = cloneData(state.data);
      state.isEditing = false;
      renderAll();
      $("#cmsStatus").textContent = "已儲存，前台网站刷新后会显示最新内容。";
    });
  }
};

const loadData = async () => {
  try {
    const apiResponse = await fetch("/api/content", { cache: "no-store" });
    if (apiResponse.ok) {
      state.serverMode = true;
      return apiResponse.json();
    }
  } catch {
    state.serverMode = false;
  }
  const response = await fetch("cms-data.json", { cache: "no-store" });
  return response.json();
};

const boot = async () => {
  setupTabs();
  setupActions();
  delegateClicks();
  state.data = await loadData();
  state.originalData = cloneData(state.data);
  $("#cmsServerWarning").hidden = state.serverMode;
  renderAll();
};

boot().catch((error) => {
  $("#cmsStatus").textContent = `后台载入失败：${error.message}`;
});
