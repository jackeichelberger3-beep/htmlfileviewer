const templates = [
  {
    name: "HTML5 Boilerplate",
    type: "html",
    code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Page</title>
  </head>
  <body>
    <h1>Hello world</h1>
  </body>
</html>`
  },
  {
    name: "CSS Reset",
    type: "css",
    code: `* { box-sizing: border-box; }
html, body {
  margin: 0;
  padding: 0;
}
body {
  font-family: Arial, sans-serif;
}
a {
  color: inherit;
  text-decoration: none;
}`
  },
  {
    name: "JS Starter",
    type: "javascript",
    code: `console.log("HTML Studio ready");
const app = { version: "1.0.0" };
app.run = () => console.log("Running");
app.run();`
  },
  {
    name: "Landing Page",
    type: "html",
    code: `<main class="hero">
  <section>
    <h1>Build faster</h1>
    <p>Launch your next idea.</p>
    <button>Get started</button>
  </section>
</main>`
  },
  {
    name: "Pricing Card",
    type: "html",
    code: `<div class="card">
  <h3>Pro</h3>
  <p class="price">$19/mo</p>
  <ul>
    <li>Unlimited projects</li>
    <li>Fast preview</li>
    <li>Rich snippets</li>
  </ul>
</div>`
  },
  {
    name: "Todo App",
    type: "javascript",
    code: `const items = ["Write", "Plan", "Launch"];
const list = document.createElement("ul");
items.forEach(item => {
  const li = document.createElement("li");
  li.textContent = item;
  list.appendChild(li);
});
document.body.appendChild(list);`
  },
  {
    name: "Memory Game",
    type: "html",
    code: `<div id="gameBoard">
  <button>1</button>
  <button>2</button>
  <button>3</button>
  <button>4</button>
</div>`
  },
  {
    name: "Canvas Demo",
    type: "javascript",
    code: `const canvas = document.createElement("canvas");
canvas.width = 400;
canvas.height = 200;
const ctx = canvas.getContext("2d");
ctx.fillStyle = "#38bdf8";
ctx.fillRect(0, 0, canvas.width, canvas.height);`
  },
  {
    name: "Blog Layout",
    type: "html",
    code: `<article class="post">
  <h2>Writing for the future</h2>
  <p>Thoughts, ideas, and personal progress.</p>
</article>`
  },
  {
    name: "Simple Form",
    type: "html",
    code: `<form>
  <input type="text" placeholder="Name" />
  <input type="email" placeholder="Email" />
  <button>Send</button>
</form>`
  },
  {
    name: "Game HUD",
    type: "html",
    code: `<div class="hud">
  <span>Score: 120</span>
  <span>Lives: 3</span>
  <span>Level: 8</span>
</div>`
  },
  {
    name: "Portfolio Card",
    type: "html",
    code: `<section class="portfolio-card">
  <h2>Jane Doe</h2>
  <p>Product designer</p>
  <a href="#">View work</a>
</section>`
  }
];

const state = {
  tabs: [],
  activeTabId: null,
  theme: localStorage.getItem("htmlStudioTheme") || "black",
  customThemes: JSON.parse(localStorage.getItem("htmlStudioCustomThemes") || "[]"),
  snippetLibrary: JSON.parse(localStorage.getItem("htmlStudioSnippets") || "[]"),
  plugins: [],
  folds: [],
  advancedUnlocked: false
};

const editor = document.getElementById("editor");
const tabStrip = document.getElementById("tabStrip");
const fileExplorer = document.getElementById("fileExplorer");
const pageList = document.getElementById("pageList");
const libraryList = document.getElementById("libraryList");
const pluginList = document.getElementById("pluginList");
const templateList = document.getElementById("templateList");
const settingsModal = document.getElementById("settingsModal");
const templatesModal = document.getElementById("templatesModal");
const terminalModal = document.getElementById("terminalModal");
const welcomeScreen = document.getElementById("welcomeScreen");
const consoleBody = document.getElementById("consoleBody");
const previewFrame = document.getElementById("previewFrame");
const contextMenu = document.getElementById("contextMenu");
const lineNumbers = document.getElementById("lineNumbers");
const minimapCanvas = document.getElementById("minimapCanvas");
const projectNameInput = document.getElementById("projectNameInput");
const showSidebarCheck = document.getElementById("showSidebarCheck");
const showMinimapCheck = document.getElementById("showMinimapCheck");
const showPreviewCheck = document.getElementById("showPreviewCheck");
const showRamCheck = document.getElementById("showRamCheck");
const showFpsCheck = document.getElementById("showFpsCheck");
const customThemeName = document.getElementById("customThemeName");
const customThemeColor = document.getElementById("customThemeColor");
const welcomeKeyInput = document.getElementById("welcomeKeyInput");
const terminalInput = document.getElementById("terminalInput");
const terminalOutput = document.getElementById("terminalOutput");

function log(message, type = "info") {
  const item = document.createElement("div");
  const map = {
    info: "#edf3ff",
    error: "#f78484",
    success: "#8ed98a",
    warn: "#ffcc66"
  };
  item.textContent = `${type === "info" ? "›" : type === "error" ? "✕" : type === "success" ? "✓" : "!"} ${message}`;
  item.style.color = map[type] || map.info;
  consoleBody.prepend(item);
}

function applyTheme(name) {
  state.theme = name;
  document.body.setAttribute("data-theme", name);
  localStorage.setItem("htmlStudioTheme", name);
  renderThemeButtons();
}

function renderThemeButtons() {
  const list = document.getElementById("themeList");
  list.innerHTML = "";

  ["black", "grey", "white", "retro"].forEach((theme) => {
    const btn = document.createElement("button");
    btn.className = "theme-pill" + (state.theme === theme ? " active" : "");
    btn.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
    btn.onclick = () => applyTheme(theme);
    list.appendChild(btn);
  });
}

function getActiveTab() {
  return state.tabs.find(tab => tab.id === state.activeTabId) || null;
}

function createTab({ name, content, type = "html", path = "" }) {
  const tab = {
    id: crypto.randomUUID(),
    name,
    content,
    type,
    path,
    pinned: false,
    dirty: false
  };
  state.tabs.push(tab);
  state.activeTabId = tab.id;
  renderTabs();
  syncEditorFromCurrentTab();
  return tab;
}

function renderTabs() {
  tabStrip.innerHTML = "";

  state.tabs.forEach((tab) => {
    const el = document.createElement("div");
    el.className = "tab" + (tab.id === state.activeTabId ? " active" : "");
    el.dataset.id = tab.id;

    const label = document.createElement("span");
    label.textContent = tab.name;

    const closeBtn = document.createElement("span");
    closeBtn.className = "close";
    closeBtn.textContent = "×";
    closeBtn.onclick = (event) => {
      event.stopPropagation();
      closeTab(tab.id);
    };

    const pinBtn = document.createElement("span");
    pinBtn.textContent = tab.pinned ? "📌" : "•";
    pinBtn.style.fontSize = "11px";
    pinBtn.onclick = (event) => {
      event.stopPropagation();
      pinTab(tab.id);
    };

    el.appendChild(pinBtn);
    el.appendChild(label);
    el.appendChild(closeBtn);

    el.onclick = () => {
      state.activeTabId = tab.id;
      syncEditorFromCurrentTab();
    };

    el.oncontextmenu = (event) => {
      event.preventDefault();
      showTabContextMenu(event, tab.id);
    };

    tabStrip.appendChild(el);
  });
}

function showTabContextMenu(event, id) {
  contextMenu.innerHTML = "";
  contextMenu.classList.remove("hidden");

  const actions = [
    { label: "Rename tab", fn: () => renameTab(id) },
    { label: "Pin tab", fn: () => pinTab(id) },
    { label: "Close tab", fn: () => closeTab(id) },
    { label: "Close pinned tabs", fn: () => closePinnedTabs() }
  ];

  actions.forEach((action) => {
    const row = document.createElement("div");
    row.className = "context-item";
    row.innerHTML = `<span>${action.label}</span>`;
    row.onclick = () => {
      action.fn();
      contextMenu.classList.add("hidden");
    };
    contextMenu.appendChild(row);
  });

  contextMenu.style.left = `${event.clientX}px`;
  contextMenu.style.top = `${event.clientY}px`;
}

function renameTab(id) {
  const tab = state.tabs.find((t) => t.id === id);
  if (!tab) return;
  const value = prompt("Rename tab:", tab.name);
  if (!value) return;
  tab.name = value.trim() || tab.name;
  renderTabs();
}

function pinTab(id) {
  const tab = state.tabs.find((t) => t.id === id);
  if (!tab) return;
  tab.pinned = !tab.pinned;
  renderTabs();
}

function closePinnedTabs() {
  state.tabs = state.tabs.filter((tab) => !tab.pinned);
  if (!state.tabs.length) {
    createTab({
      name: "untitled.html",
      content: "<!doctype html><html><body></body></html>",
      type: "html",
      path: "untitled.html"
    });
  }
  state.activeTabId = state.tabs[0].id;
  renderTabs();
  syncEditorFromCurrentTab();
}

function closeTab(id) {
  const idx = state.tabs.findIndex((tab) => tab.id === id);
  if (idx === -1) return;

  state.tabs.splice(idx, 1);

  if (!state.tabs.length) {
    createTab({
      name: "untitled.html",
      content: "<!doctype html><html><body></body></html>",
      type: "html",
      path: "untitled.html"
    });
  }

  state.activeTabId = state.tabs[Math.max(0, idx - 1)].id;
  renderTabs();
  syncEditorFromCurrentTab();
}

function syncEditorFromCurrentTab() {
  const tab = getActiveTab();
  if (!tab) return;

  editor.value = tab.content;
  updateLineNumbers();
  updateMinimap();
  updatePreview();
}

function updateLineNumbers() {
  const value = editor.value || "";
  const count = Math.max(1, value.split("\n").length);
  let str = "";
  for (let i = 1; i <= count; i++) {
    str += `${i}<br>`;
  }
  lineNumbers.innerHTML = str;
}

function updateMinimap() {
  const canvas = minimapCanvas;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  const lines = (editor.value || "").split("\n");
  const maxLen = Math.max(1, ...lines.map((line) => line.length));
  const density = Math.min(3, Math.max(1.2, maxLen / 80));

  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fillRect(0, 0, w, h);

  lines.forEach((line, i) => {
    const y = i * 5;
    const x = 0;
    if (y >= h) return;
    ctx.fillStyle = `rgba(138,180,255,${Math.min(0.75, 0.15 + (line.length / maxLen) * 0.5)})`;
    ctx.fillRect(x, y, w * 0.9, 2);
  });

  const viewportRatio = Math.max(0.08, Math.min(1, h / Math.max(1, editor.scrollHeight)));
  const viewportY = (editor.scrollTop / Math.max(1, editor.scrollHeight)) * (h - viewportRatio * h);

  ctx.fillStyle = "rgba(255,255,255,0.68)";
  ctx.fillRect(0, viewportY, w, 1.5 + viewportRatio * h);

  canvas.onclick = (event) => {
    const rect = canvas.getBoundingClientRect();
    const ratio = (event.clientY - rect.top) / rect.height;
    const target = ratio * editor.scrollHeight;
    editor.scrollTop = target;
  };
}

function updatePreview() {
  const tab = getActiveTab();
  if (!tab) return;

  let html = tab.content;

  if (tab.type === "html") {
    html = tab.content;
  } else if (tab.type === "css") {
    html = `<style>${tab.content}</style>`;
  } else if (tab.type === "javascript") {
    html = `<script>${tab.content}</script>`;
  }

  previewFrame.srcdoc = `
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          html, body { margin: 0; padding: 0; font-family: sans-serif; background: #fff; }
          body { padding: 16px; }
        </style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `;
}

function prettyFormat() {
  const tab = getActiveTab();
  if (!tab) return;

  let out = tab.content;

  if (tab.name.endsWith(".html") || tab.type === "html") {
    out = formatHTML(tab.content);
  } else if (tab.name.endsWith(".css") || tab.type === "css") {
    out = formatCSS(tab.content);
  } else if (tab.name.endsWith(".js") || tab.type === "javascript") {
    out = formatJS(tab.content);
  }

  editor.value = out;
  tab.content = out;
  updateLineNumbers();
  updateMinimap();
  log("Formatted current editor tab", "success");
}

function formatHTML(source) {
  const replacement = source
    .replace(/>\s+</g, "><")
    .split(/>(.*?)</g)
    .map((chunk, index, arr) => {
      let indent = 0;
      let text = "";
      const trimmed = chunk.trim();
      if (!trimmed) return "";
      if (chunk.startsWith("/")) {
        indent--;
      }
      if (!chunk.includes("<")) {
        text = trimmed;
        return "  ".repeat(Math.max(0, indent)) + text;
      }
      text = chunk.trim();
      return "  ".repeat(Math.max(0, indent)) + text;
    })
    .join("\n");

  return replacement.trim();
}

function formatCSS(source) {
  const lines = source.split("\n");
  let out = [];
  let indent = 0;

  lines.forEach((line) => {
    const clean = line.trim();
    if (!clean) return;

    if (clean.includes("{")) {
      out.push("  ".repeat(indent) + clean);
      indent++;
    } else if (clean.includes("}")) {
      indent = Math.max(0, indent - 1);
      out.push("  ".repeat(indent) + clean);
    } else {
      out.push("  ".repeat(indent) + clean);
    }
  });

  return out.join("\n");
}

function formatJS(source) {
  const lines = source.split("\n");
  let out = [];
  let indent = 0;

  lines.forEach((line) => {
    const clean = line.trim();
    if (!clean) return;

    if (clean.includes("{") || clean.includes("(") || clean.includes("[")) {
      out.push("  ".repeat(indent) + clean);
      indent++;
    } else if (clean.includes("}") || clean.includes(")") || clean.includes("]")) {
      indent = Math.max(0, indent - 1);
      out.push("  ".repeat(indent) + clean);
    } else {
      out.push("  ".repeat(indent) + clean);
    }
  });

  return out.join("\n");
}

function searchAndReplace() {
  const query = prompt("Find:");
  if (query === null) return;
  const replace = prompt("Replace with:");
  if (replace === null) return;

  const updated = editor.value.replaceAll(query, replace);
  editor.value = updated;
  const tab = getActiveTab();
  if (tab) tab.content = updated;
  updateLineNumbers();
  updateMinimap();
  log("Replace complete", "success");
}

function foldCurrentBlock() {
  const tab = getActiveTab();
  if (!tab) return;
  const pos = editor.selectionStart;
  const before = pos > 0 ? editor.value.slice(0, pos) : "";
  const after = pos > 0 ? editor.value.slice(pos) : "";
  const marker = "/* folded */";

  const start = Math.max(before.lastIndexOf("{"), before.lastIndexOf("<"), before.lastIndexOf("["), before.lastIndexOf("("));
  if (start === -1) return;

  const block = editor.value.slice(start, Math.min(editor.value.length, start + 200));
  const nextValue = editor.value.slice(0, start) + marker + editor.value.slice(start + block.length);
  editor.value = nextValue;
  tab.content = nextValue;
  updateLineNumbers();
  log("Folded a section", "success");
}

function renderFileExplorer() {
  fileExplorer.innerHTML = "";
  const entries = [
    { name: "index.html", type: "html", path: "index.html" },
    { name: "styles.css", type: "css", path: "styles.css" },
    { name: "script.js", type: "js", path: "script.js" },
    { name: "library", type: "folder", path: "library" }
  ];

  entries.forEach((entry) => {
    const item = document.createElement("div");
    item.className = "tree-item";
    item.innerHTML = `<span>${entry.type === "folder" ? "📁" : "📄"}</span> <span>${entry.name}</span>`;
    item.onclick = () => {
      if (entry.type === "folder") return;
      const existing = state.tabs.find((tab) => tab.name === entry.name);
      if (existing) {
        state.activeTabId = existing.id;
        syncEditorFromCurrentTab();
      } else {
        createTab({
          name: entry.name,
          content: "",
          type: entry.type === "js" ? "javascript" : entry.type,
          path: entry.path
        });
      }
    };
    fileExplorer.appendChild(item);
  });
}

function renderPageList() {
  pageList.innerHTML = "";
  ["Home", "About", "Projects", "Blog", "Store", "Docs"].forEach((page) => {
    const item = document.createElement("div");
    item.className = "tree-item";
    item.innerHTML = `<span>📄</span> <span>${page}</span>`;
    item.onclick = () => {
      const text = `<section><h2>${page}</h2><p>Page content for ${page}</p></section>`;
      const active = getActiveTab();
      if (active) {
        active.content = text;
        editor.value = text;
        updateLineNumbers();
        updatePreview();
      }
    };
    pageList.appendChild(item);
  });
}

function renderLibrary() {
  libraryList.innerHTML = "";

  state.snippetLibrary.forEach((snippet) => {
    const item = document.createElement("div");
    item.className = "tree-item";
    item.innerHTML = `<span>🧩</span> <span>${snippet.name}</span>`;
    item.onclick = () => {
      const active = getActiveTab();
      if (!active) return;

      active.content += `\n${snippet.code}`;
      editor.value = active.content;
      updatePreview();
      updateLineNumbers();
    };
    libraryList.appendChild(item);
  });

  const addBtn = document.createElement("button");
  addBtn.textContent = "Save current snippet";
  addBtn.className = "secondary-btn";
  addBtn.onclick = () => {
    const name = prompt("Snippet name:");
    if (!name) return;
    const snippet = { name, code: editor.value };
    state.snippetLibrary.push(snippet);
    localStorage.setItem("htmlStudioSnippets", JSON.stringify(state.snippetLibrary));
    renderLibrary();
  };
  libraryList.appendChild(addBtn);
}

function renderTemplates() {
  templateList.innerHTML = "";
  templates.forEach((template) => {
    const item = document.createElement("div");
    item.className = "tree-item";
    item.innerHTML = `<span>🧩</span> <span>${template.name}</span>`;
    item.onclick = () => {
      createTab({
        name: `${template.name.replace(/\s+/g, "-").toLowerCase()}.${template.type === "javascript" ? "js" : template.type}`,
        content: template.code,
        type: template.type,
        path: template.name
      });
    };
    templateList.appendChild(item);
  });
}

function renderPlugins() {
  pluginList.innerHTML = "";
  state.plugins.forEach((plugin) => {
    const item = document.createElement("div");
    item.className = "tree-item";
    item.innerHTML = `<span>⚙️</span> <span>${plugin.name}</span>`;
    item.onclick = () => {
      if (plugin.run) plugin.run();
    };
    pluginList.appendChild(item);
  });
}

function registerPlugin(plugin) {
  state.plugins.push(plugin);
  renderPlugins();
}

function loadBuiltInPlugin() {
  const script = document.createElement("script");
  script.src = "./plugins/example-plugin.js";
  script.onload = () => {
    console.log("Example plugin loaded");
  };
  document.body.appendChild(script);
}

function onFileOpen(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const text = String(reader.result || "");
    const ext = file.name.split(".").pop().toLowerCase();
    const typeMap = { html: "html", htm: "html", css: "css", js: "javascript", json: "json" };
    const type = typeMap[ext] || "text";
    createTab({
      name: file.name,
      content: text,
      type,
      path: file.name
    });
  };
  reader.readAsText(file);
}

function handleFiles(files) {
  Array.from(files).forEach(onFileOpen);
}

function openZipArchive(file) {
  if (!window.JSZip) {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
    script.onload = () => openZipArchive(file);
    document.body.appendChild(script);
    return;
  }

  JSZip.loadAsync(file)
    .then((zip) => {
      const entries = Object.keys(zip.files);

      entries.forEach((entry) => {
        if (zip.files[entry].dir) return;
        zip.files[entry].async("text").then((content) => {
          const fileName = entry.split("/").pop() || "unzipped-file";
          const type = fileName.endsWith(".html") ? "html" : fileName.endsWith(".css") ? "css" : fileName.endsWith(".js") ? "javascript" : "text";
          createTab({
            name: fileName,
            content: content,
            type,
            path: fileName
          });
        });
      });
    })
    .catch((error) => {
      log(`ZIP open failed: ${error.message}`, "error");
    });
}

function saveActiveFile() {
  const tab = getActiveTab();
  if (!tab) return;
  const blob = new Blob([tab.content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = tab.name || "untitled.txt";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  log("Saved file", "success");
}

function openNewPreviewTab() {
  const content = (getActiveTab() || { content: "<h1>Empty preview</h1>" }).content;
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(content);
  win.document.close();
}

function openAboutBlankPreview() {
  const content = (getActiveTab() || { content: "<h1>Empty preview</h1>" }).content;
  const win = window.open("about:blank", "_blank");
  if (!win) return;
  win.document.write(content);
  win.document.close();
}

function validateAccessKey(value) {
  const passwords = window.STUDIO_ACCESS_KEYS || [];
  return passwords.includes(String(value).trim());
}

function runTerminalCommand() {
  const command = terminalInput.value.trim();
  if (!command) return;

  terminalOutput.textContent += `\n> ${command}`;

  if (command === "help") {
    terminalOutput.textContent += "\nAvailable commands:\nhelp\nadmin\nclear\ntheme black|grey|white|retro\nformat\npreview\nplugin list";
  } else if (command === "admin") {
    welcomeScreen.classList.remove("hidden");
  } else if (command === "clear") {
    terminalOutput.textContent = "";
  } else if (command === "theme black" || command === "theme grey" || command === "theme white" || command === "theme retro") {
    const theme = command.split(" ")[1];
    applyTheme(theme);
    terminalOutput.textContent += `\nTheme changed to ${theme}.`;
  } else if (command === "format") {
    prettyFormat();
    terminalOutput.textContent += "\nFormatted current tab.";
  } else if (command === "preview") {
    updatePreview();
    terminalOutput.textContent += "\nPreview refreshed.";
  } else if (command === "plugin list") {
    terminalOutput.textContent += `\nPlugins: ${state.plugins.length ? state.plugins.map((p) => p.name).join(", ") : "No plugins loaded."}`;
  } else {
    terminalOutput.textContent += "\nUnknown command.";
  }

  terminalInput.value = "";
}

function unlockWelcomeScreen() {
  const value = welcomeKeyInput.value.trim();

  if (validateAccessKey(value)) {
    state.advancedUnlocked = true;
    welcomeScreen.classList.add("hidden");
    terminalModal.classList.remove("hidden");
    log("Advanced mode unlocked", "success");
  } else {
    const input = welcomeKeyInput;
    input.classList.add("shake");
    setTimeout(() => input.classList.remove("shake"), 300);
    log("Wrong password", "error");
  }
}

function saveSettings() {
  localStorage.setItem("htmlStudioTheme", state.theme);
  localStorage.setItem("htmlStudioCustomThemes", JSON.stringify(state.customThemes));
  localStorage.setItem("htmlStudioSnippets", JSON.stringify(state.snippetLibrary));
  localStorage.setItem("htmlStudioProjectName", projectNameInput.value);

  localStorage.setItem("htmlStudioShowSidebar", String(showSidebarCheck.checked));
  localStorage.setItem("htmlStudioShowMinimap", String(showMinimapCheck.checked));
  localStorage.setItem("htmlStudioShowPreview", String(showPreviewCheck.checked));
  localStorage.setItem("htmlStudioShowRam", String(showRamCheck.checked));
  localStorage.setItem("htmlStudioShowFps", String(showFpsCheck.checked));

  log("Settings saved", "success");
}

function resetSettings() {
  localStorage.clear();
  state.customThemes = [];
  state.snippetLibrary = [];
  applyTheme("black");
  projectNameInput.value = "HTML Studio";
  showSidebarCheck.checked = true;
  showMinimapCheck.checked = true;
  showPreviewCheck.checked = true;
  log("Settings reset", "warn");
}

function downloadLocalStorage() {
  const dump = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    dump[key] = localStorage.getItem(key);
  }

  const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "html-studio-local-storage.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importLocalStorage(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      Object.keys(data).forEach((key) => {
        localStorage.setItem(key, data[key]);
      });
      log("Imported local storage", "success");
    } catch (err) {
      log("Invalid local storage file", "error");
    }
  };
  reader.readAsText(file);
}

function createCustomTheme() {
  const name = customThemeName.value.trim();
  if (!name) {
    log("Theme name required", "warn");
    return;
  }

  const theme = { name, color: customThemeColor.value };
  state.customThemes.push(theme);
  localStorage.setItem("htmlStudioCustomThemes", JSON.stringify(state.customThemes));

  const button = document.createElement("button");
  button.className = "theme-pill";
  button.textContent = name;
  button.style.background = theme.color + "22";
  button.onclick = () => {
    document.body.style.setProperty("--accent", theme.color);
    applyTheme("black");
  };
  customThemesList.appendChild(button);
}

const customThemesList = document.getElementById("customThemesList");

function renderCustomThemes() {
  customThemesList.innerHTML = "";
  state.customThemes.forEach((theme) => {
    const button = document.createElement("button");
    button.className = "theme-pill";
    button.textContent = theme.name;
    button.style.background = theme.color + "22";
    button.onclick = () => {
      document.body.style.setProperty("--accent", theme.color);
      applyTheme("black");
    };
    customThemesList.appendChild(button);
  });
}

function initApp() {
  const initialTab = {
    name: "index.html",
    content: `<!doctype html>
<html>
  <body>
    <h1>Hello world</h1>
    <p>HTML Studio advanced editor</p>
  </body>
</html>`,
    type: "html",
    path: "index.html"
  };

  state.tabs = [initialTab];
  state.activeTabId = initialTab.id = crypto.randomUUID();
  renderTabs();
  renderFileExplorer();
  renderPageList();
  renderLibrary();
  renderTemplates();
  renderPlugins();
  renderCustomThemes();
  renderThemeButtons();
  syncEditorFromCurrentTab();

  document.getElementById("newFileBtn").addEventListener("click", () => {
    createTab({
      name: "untitled.html",
      content: "<!doctype html><html><body></body></html>",
      type: "html",
      path: "untitled.html"
    });
  });

  document.getElementById("templateBtn").addEventListener("click", () => templatesModal.classList.remove("hidden"));
  document.getElementById("closeTemplatesBtn").addEventListener("click", () => templatesModal.classList.add("hidden"));

  document.getElementById("openFileBtn").addEventListener("click", () => {
    document.getElementById("fileInput").click();
  });

  document.getElementById("zipOpenBtn").addEventListener("click", () => {
    document.getElementById("zipInput").click();
  });

  document.getElementById("fileInput").addEventListener("change", (event) => {
    handleFiles(event.target.files);
    event.target.value = "";
  });

  document.getElementById("zipInput").addEventListener("change", (event) => {
    openZipArchive(event.target.files[0]);
    event.target.value = "";
  });

  document.getElementById("saveBtn").addEventListener("click", saveActiveFile);
  document.getElementById("runBtn").addEventListener("click", updatePreview);
  document.getElementById("formatBtn").addEventListener("click", prettyFormat);
  document.getElementById("findBtn").addEventListener("click", searchAndReplace);
  document.getElementById("newTabBtn").addEventListener("click", () => createTab({ name: "untitled-" + Date.now() + ".html", content: "<!doctype html><html><body></body></html>", type: "html", path: "untitled.html" }));
  document.getElementById("terminalBtn").addEventListener("click", () => terminalModal.classList.remove("hidden"));
  document.getElementById("closeTerminalBtn").addEventListener("click", () => terminalModal.classList.add("hidden"));
  document.getElementById("terminalRunBtn").addEventListener("click", runTerminalCommand);
  terminalInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") runTerminalCommand();
  });

  document.getElementById("settingsBtn").addEventListener("click", () => settingsModal.classList.remove("hidden"));
  document.getElementById("closeSettingsBtn").addEventListener("click", () => settingsModal.classList.add("hidden"));
  document.getElementById("saveSettingsBtn").addEventListener("click", saveSettings);
  document.getElementById("resetSettingsBtn").addEventListener("click", resetSettings);

  document.getElementById("downloadStorageBtn").addEventListener("click", downloadLocalStorage);
  document.getElementById("importStorageBtn").addEventListener("click", () => document.getElementById("storageImportFile").click());
  document.getElementById("storageImportFile").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) importLocalStorage(file);
  });

  document.getElementById("saveCustomThemeBtn").addEventListener("click", createCustomTheme);

  document.getElementById("clearConsoleBtn").addEventListener("click", () => consoleBody.innerHTML = "");
  document.getElementById("newPreviewBtn").addEventListener("click", openNewPreviewTab);
  document.getElementById("blankPreviewBtn").addEventListener("click", openAboutBlankPreview);

  document.getElementById("collapseSidebarBtn").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("hidden");
  });

  document.getElementById("collapseEditorBtn").addEventListener("click", () => {
    document.querySelector(".editor-shell").classList.toggle("hidden");
  });

  document.getElementById("collapsePreviewBtn").addEventListener("click", () => {
    document.getElementById("previewShell").classList.toggle("hidden");
  });

  document.getElementById("unlockBtn").addEventListener("click", unlockWelcomeScreen);
  document.getElementById("welcomeKeyInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter") unlockWelcomeScreen();
  });

  document.addEventListener("click", (event) => {
    if (!contextMenu.contains(event.target)) {
      contextMenu.classList.add("hidden");
    }
  });

  document.addEventListener("dragover", (event) => {
    event.preventDefault();
  });

  document.addEventListener("drop", (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length) handleFiles(files);
  });

  document.getElementById("themeList").addEventListener("click", (event) => {
    const btn = event.target.closest(".theme-pill");
    if (!btn) return;
    applyTheme(btn.textContent.toLowerCase());
  });

  document.getElementById("pluginList").addEventListener("click", (event) => {
    const item = event.target.closest(".tree-item");
    if (!item) return;
    const plugin = state.plugins.find((p) => p.textContent.includes(p.name));
    if (plugin) plugin.run();
  });

  renderCustomThemes();
  loadBuiltInPlugin();
}

initApp();
