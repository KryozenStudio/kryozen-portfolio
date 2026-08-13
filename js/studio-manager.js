(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};
  var DB_NAME = "kryozenStudioManager";
  var DB_VERSION = 1;
  var PROJECT_STORE = "projects";
  var BRAND_STORE = "brand";
  var PASS_KEY = "kryozenManagerPassHash";
  var dbPromise;
  var initialized = false;

  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      var request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = function () {
        var db = request.result;
        if (!db.objectStoreNames.contains(PROJECT_STORE)) db.createObjectStore(PROJECT_STORE, { keyPath: "id" });
        if (!db.objectStoreNames.contains(BRAND_STORE)) db.createObjectStore(BRAND_STORE, { keyPath: "id" });
      };
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { reject(request.error); };
    });
    return dbPromise;
  }

  function store(name, mode) {
    return openDb().then(function (db) {
      return db.transaction(name, mode).objectStore(name);
    });
  }

  function put(name, value) {
    return store(name, "readwrite").then(function (s) {
      return new Promise(function (resolve, reject) {
        var request = s.put(value);
        request.onsuccess = resolve;
        request.onerror = function () { reject(request.error); };
      });
    });
  }

  function remove(name, key) {
    return store(name, "readwrite").then(function (s) {
      return new Promise(function (resolve, reject) {
        var request = s.delete(key);
        request.onsuccess = resolve;
        request.onerror = function () { reject(request.error); };
      });
    });
  }

  function getAll(name) {
    return store(name, "readonly").then(function (s) {
      return new Promise(function (resolve, reject) {
        var request = s.getAll();
        request.onsuccess = function () { resolve(request.result || []); };
        request.onerror = function () { reject(request.error); };
      });
    });
  }

  function getOne(name, key) {
    return store(name, "readonly").then(function (s) {
      return new Promise(function (resolve, reject) {
        var request = s.get(key);
        request.onsuccess = function () { resolve(request.result || null); };
        request.onerror = function () { reject(request.error); };
      });
    });
  }

  async function hash(text) {
    var buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buffer)).map(function (byte) {
      return byte.toString(16).padStart(2, "0");
    }).join("");
  }

  function downloadBlob(blob, filename) {
    if (!blob) return;
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename || "download";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function downloadText(text, filename, type) {
    downloadBlob(new Blob([text], { type: type || "text/plain" }), filename);
  }

  var gate = document.getElementById("gate-card");
  var app = document.getElementById("manager-app");
  var gateForm = document.getElementById("gate-form");
  var gatePass = document.getElementById("gate-pass");
  var gateCopy = document.getElementById("gate-copy");
  var savedHash = localStorage.getItem(PASS_KEY);

  var form = document.getElementById("project-form");
  var list = document.getElementById("project-list");
  var count = document.getElementById("project-count");
  var categorySelect = document.getElementById("project-category");
  var featuredInput = document.getElementById("project-featured");
  var previewWrap = document.getElementById("manager-preview");
  var previewCard = document.getElementById("preview-card");
  var categories = Array.isArray(cfg.categories) ? cfg.categories : [];

  categories.forEach(function (category) {
    var option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  function resetForm() {
    form.reset();
    document.getElementById("project-id").value = "";
    document.getElementById("project-software").value = "Node Video";
    if (categories[0]) categorySelect.value = categories[0];
    if (featuredInput) featuredInput.checked = false;
    closePreview();
  }

  function readForm() {
    return {
      id: document.getElementById("project-id").value || ("project-" + Date.now()),
      title: document.getElementById("project-title").value.trim(),
      category: categorySelect.value,
      date: document.getElementById("project-date").value,
      description: document.getElementById("project-description").value.trim(),
      software: [document.getElementById("project-software").value.trim() || "Node Video"],
      featured: !!(featuredInput && featuredInput.checked)
    };
  }

  function renderProjectPreview(project, thumbnail) {
    if (!previewWrap || !previewCard) return;
    previewCard.innerHTML = "";
    var media = document.createElement("div");
    media.className = "manager-preview-card__media";
    if (thumbnail) {
      var img = document.createElement("img");
      img.src = URL.createObjectURL(thumbnail);
      img.alt = "";
      img.onload = function () { URL.revokeObjectURL(img.src); };
      media.appendChild(img);
    } else {
      media.classList.add("manager-preview-card__media--empty");
      media.textContent = project.category || "Project";
    }
    var body = document.createElement("div");
    body.className = "manager-preview-card__body";
    var meta = document.createElement("p");
    meta.className = "manager-item__meta";
    meta.textContent = (project.featured ? "Featured • " : "") + (project.category || "Uncategorized");
    var title = document.createElement("h3");
    title.textContent = project.title || "Untitled project";
    var description = document.createElement("p");
    description.textContent = project.description || "No description yet.";
    body.append(meta, title, description);
    previewCard.append(media, body);
    previewWrap.hidden = false;
    previewWrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function closePreview() {
    if (previewWrap) previewWrap.hidden = true;
  }

  function render() {
    getAll(PROJECT_STORE).then(function (items) {
      count.textContent = String(items.length);
      list.innerHTML = "";
      if (!items.length) {
        list.innerHTML = '<p class="manager-note">No local projects saved yet.</p>';
        return;
      }

      items.sort(function (a, b) {
        return String(b.date || "").localeCompare(String(a.date || ""));
      });

      items.forEach(function (item) {
        var row = document.createElement("div");
        row.className = "manager-item";

        var media = document.createElement(item.thumbnail ? "img" : "div");
        media.className = "manager-item__media";
        if (item.thumbnail) {
          media.src = URL.createObjectURL(item.thumbnail);
          media.alt = "";
          media.onload = function () { URL.revokeObjectURL(media.src); };
        } else {
          media.textContent = item.category || "";
        }

        var info = document.createElement("div");
        var title = document.createElement("p");
        title.className = "manager-item__title";
        title.textContent = item.title;
        var meta = document.createElement("p");
        meta.className = "manager-item__meta";
        meta.textContent = (item.featured ? "Featured • " : "") + (item.category || "") + (item.date ? " • " + item.date : "");
        info.append(title, meta);

        var actions = document.createElement("div");
        actions.className = "manager-item__actions";

        var edit = document.createElement("button");
        edit.className = "manager-btn";
        edit.type = "button";
        edit.textContent = "Edit";
        edit.onclick = function () { fill(item); window.scrollTo({ top: 0, behavior: "smooth" }); };

        var preview = document.createElement("button");
        preview.className = "manager-btn";
        preview.type = "button";
        preview.textContent = "Preview";
        preview.onclick = function () { renderProjectPreview(item, item.thumbnail); };

        var removeButton = document.createElement("button");
        removeButton.className = "manager-btn";
        removeButton.type = "button";
        removeButton.textContent = "Delete";
        removeButton.onclick = function () {
          if (!confirm("Delete this local project and its stored media?")) return;
          remove(PROJECT_STORE, item.id).then(render);
        };

        actions.append(edit, preview, removeButton);

        if (item.video) {
          var videoButton = document.createElement("button");
          videoButton.className = "manager-btn";
          videoButton.type = "button";
          videoButton.textContent = "Download video";
          videoButton.onclick = function () { downloadBlob(item.video, item.videoName || "project-video"); };
          actions.appendChild(videoButton);
        }
        if (item.thumbnail) {
          var thumbButton = document.createElement("button");
          thumbButton.className = "manager-btn";
          thumbButton.type = "button";
          thumbButton.textContent = "Download thumb";
          thumbButton.onclick = function () { downloadBlob(item.thumbnail, item.thumbnailName || "thumbnail"); };
          actions.appendChild(thumbButton);
        }

        row.append(media, info, actions);
        list.appendChild(row);
      });
    });
  }

  function fill(item) {
    document.getElementById("project-id").value = item.id;
    document.getElementById("project-title").value = item.title || "";
    categorySelect.value = item.category || categories[0] || "";
    document.getElementById("project-date").value = item.date || "";
    document.getElementById("project-description").value = item.description || "";
    document.getElementById("project-software").value = (item.software || ["Node Video"])[0] || "Node Video";
    if (featuredInput) featuredInput.checked = !!item.featured;
    closePreview();
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    var data = readForm();
    var old = await getOne(PROJECT_STORE, data.id);
    var thumbnailFile = document.getElementById("project-thumbnail").files[0];
    var videoFile = document.getElementById("project-video").files[0];

    var item = Object.assign({}, data, {
      thumbnail: thumbnailFile || (old && old.thumbnail) || null,
      thumbnailName: thumbnailFile ? thumbnailFile.name : ((old && old.thumbnailName) || "thumbnail"),
      video: videoFile || (old && old.video) || null,
      videoName: videoFile ? videoFile.name : ((old && old.videoName) || "video")
    });

    await put(PROJECT_STORE, item);
    resetForm();
    render();
  });

  document.getElementById("reset-project").addEventListener("click", resetForm);
  document.getElementById("preview-project").addEventListener("click", async function () {
    var data = readForm();
    var old = data.id ? await getOne(PROJECT_STORE, data.id) : null;
    var thumbnail = document.getElementById("project-thumbnail").files[0] || (old && old.thumbnail) || null;
    renderProjectPreview(data, thumbnail);
  });
  document.getElementById("close-preview").addEventListener("click", closePreview);

  document.getElementById("save-logo").addEventListener("click", async function () {
    var file = document.getElementById("logo-file").files[0];
    if (!file) return;
    await put(BRAND_STORE, { id: "current", file: file, name: file.name });
    renderLogo();
  });

  document.getElementById("download-logo").addEventListener("click", async function () {
    var current = await getOne(BRAND_STORE, "current");
    if (current && current.file) {
      downloadBlob(current.file, current.name || "kryozen-logo");
      return;
    }
    var response = await fetch(cfg.logo && cfg.logo.path ? cfg.logo.path : "assets/images/logo/logo.svg");
    if (response.ok) downloadBlob(await response.blob(), "kryozen-logo.svg");
  });

  document.getElementById("reset-logo").addEventListener("click", async function () {
    await remove(BRAND_STORE, "current");
    renderLogo();
  });

  function renderLogo() {
    getOne(BRAND_STORE, "current").then(function (value) {
      var img = document.querySelector("#brand-preview img");
      if (!img) return;
      if (value && value.file) {
        img.src = URL.createObjectURL(value.file);
        img.onload = function () { URL.revokeObjectURL(img.src); };
      } else {
        img.src = (cfg.logo && cfg.logo.path) || "assets/images/logo/logo.svg";
      }
    });
  }

  function cleanProject(item) {
    return {
      id: item.id,
      title: item.title,
      category: item.category,
      thumbnail: item.thumbnailName ? "assets/thumbnails/" + item.thumbnailName : "",
      video: item.videoName ? "assets/videos/" + item.videoName : "",
      description: item.description,
      software: item.software,
      featured: !!item.featured,
      date: item.date
    };
  }

  document.getElementById("export-json").addEventListener("click", async function () {
    var items = await getAll(PROJECT_STORE);
    downloadText(JSON.stringify({ projects: items.map(cleanProject) }, null, 2), "kryozen-projects-export.json", "application/json");
  });

  document.getElementById("export-snippet").addEventListener("click", async function () {
    var items = await getAll(PROJECT_STORE);
    var snippet = "projects: " + JSON.stringify(items.map(cleanProject), null, 2) + ",\n";
    downloadText(snippet, "kryozen-projects-config-snippet.txt", "text/plain");
  });

  document.getElementById("clear-library").addEventListener("click", async function () {
    if (!confirm("Clear every locally saved project and media file?")) return;
    var items = await getAll(PROJECT_STORE);
    await Promise.all(items.map(function (item) { return remove(PROJECT_STORE, item.id); }));
    render();
  });

  async function startManager() {
    if (initialized) return;
    initialized = true;
    gate.hidden = true;
    app.hidden = false;
    resetForm();
    render();
    renderLogo();
  }

  var resetPasscode = document.getElementById("reset-passcode");
  if (resetPasscode) {
    resetPasscode.addEventListener("click", function () {
      if (!confirm("Forget the passcode saved in this browser?")) return;
      localStorage.removeItem(PASS_KEY);
      savedHash = null;
      document.getElementById("gate-title").textContent = "Create a local passcode";
      gateCopy.textContent = "This convenience gate is not a security boundary; GitHub Pages is static.";
      gatePass.value = "";
      gatePass.setAttribute("autocomplete", "new-password");
    });
  }

  async function initGate() {
    if (savedHash) {
      document.getElementById("gate-title").textContent = "Enter your local passcode";
      gateCopy.textContent = "Convenience gate only — this static site has no secure server-side authentication.";
      gatePass.setAttribute("autocomplete", "current-password");
    }

    gateForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      var hashValue = await hash(gatePass.value);
      if (!savedHash) {
        localStorage.setItem(PASS_KEY, hashValue);
        savedHash = hashValue;
        await startManager();
      } else if (hashValue === savedHash) {
        await startManager();
      } else {
        gateCopy.textContent = "That passcode does not match this browser.";
      }
    });
  }

  initGate();
})();
