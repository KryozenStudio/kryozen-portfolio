/**
 * =============================================================================
 * PRIVATE PROJECT MANAGEMENT — LOGIC
 * This page is never linked from the public site (see PROJECT_RULES.md →
 * "Private Management System"). It is not password-protected and is not
 * a secure admin panel — it's a drafting tool that happens to live at an
 * unlisted URL. Nothing in this file should ever be mistaken for real
 * authentication or real persistence.
 *
 * STORAGE ABSTRACTION
 * `Storage` below is the seam a future backend integration would replace.
 * Every other function in this file talks to projects only through
 * `Storage.list()` / `Storage.save()` / `Storage.remove()` — none of them
 * know or care that the current implementation is localStorage. Swapping
 * in a real API later means rewriting the five functions in this object,
 * not the rest of the file.
 * =============================================================================
 */

(function () {
  "use strict";

  var cfg = window.SITE_CONFIG;
  if (!cfg) {
    console.warn("[Kryozen Admin] SITE_CONFIG not found — check that config/site.config.js loaded before admin.js.");
    return;
  }

  var STORAGE_KEY = "kryozenAdminDraftProjects";

  /* -----------------------------------------------------------------
     STORAGE ABSTRACTION
     Currently backed by localStorage — this device, this browser only.
     Nothing here writes to the repository or any server. See the
     top-of-file comment.
  ----------------------------------------------------------------- */
  var Storage = {
    /** Returns the draft project list, seeded from config.projects the
     *  first time this page is ever opened on a given browser. */
    list: function () {
      try {
        var raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch (err) {
        console.warn("[Kryozen Admin] Could not read draft projects from localStorage.", err);
      }
      // First run: seed from the live config so editing feels continuous.
      return Array.isArray(cfg.projects) ? cfg.projects.slice() : [];
    },

    /** Adds a new project or updates an existing one (matched by id). */
    save: function (project) {
      var projects = Storage.list();
      var index = projects.findIndex(function (p) {
        return p.id === project.id;
      });
      if (index === -1) {
        projects.push(project);
      } else {
        projects[index] = project;
      }
      Storage._write(projects);
      return projects;
    },

    remove: function (id) {
      var projects = Storage.list().filter(function (p) {
        return p.id !== id;
      });
      Storage._write(projects);
      return projects;
    },

    _write: function (projects) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      } catch (err) {
        console.warn("[Kryozen Admin] Could not save draft projects to localStorage.", err);
      }
    },
  };

  /* -----------------------------------------------------------------
     ELEMENT REFERENCES
  ----------------------------------------------------------------- */
  var form = document.getElementById("admin-form");
  var formTitle = document.getElementById("admin-form-title");
  var fieldId = document.getElementById("field-id");
  var fieldTitle = document.getElementById("field-title");
  var fieldCategory = document.getElementById("field-category");
  var fieldDescription = document.getElementById("field-description");
  var fieldDate = document.getElementById("field-date");
  var fieldTags = document.getElementById("field-tags");
  var fieldIndustry = document.getElementById("field-industry");
  var fieldThumbPath = document.getElementById("field-thumbnail-path");
  var fieldThumbFile = document.getElementById("field-thumbnail-file");
  var fieldVideoPath = document.getElementById("field-video-path");
  var fieldVideoFile = document.getElementById("field-video-file");
  var thumbPreviewImg = document.getElementById("thumb-preview-img");
  var softwareOptions = document.getElementById("software-options");
  var cancelEditBtn = document.getElementById("admin-cancel-edit");

  var previewCard = document.getElementById("admin-preview-card");
  var projectListEl = document.getElementById("admin-project-list");
  var projectEmptyEl = document.getElementById("admin-project-empty");
  var exportBox = document.getElementById("admin-export-box");
  var copyBtn = document.getElementById("admin-copy-btn");
  var toast = document.getElementById("admin-toast");

  var logoFileInput = document.getElementById("field-logo-file");
  var logoPreviewImg = document.getElementById("logo-preview-img");

  if (!form) return; // Markup not present — nothing to wire up.

  /* -----------------------------------------------------------------
     CATEGORY + SOFTWARE OPTIONS — generated from the real config, so
     the admin form can never drift out of sync with what the public
     filter chips actually support.
  ----------------------------------------------------------------- */
  (Array.isArray(cfg.categories) ? cfg.categories : []).forEach(function (category) {
    var option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    fieldCategory.appendChild(option);
  });

  (Array.isArray(cfg.software) ? cfg.software : []).forEach(function (tool) {
    if (!tool || !tool.name) return;
    var label = document.createElement("label");
    label.className = "admin__software-chip";
    var input = document.createElement("input");
    input.type = "checkbox";
    input.value = tool.name;
    label.appendChild(input);
    label.appendChild(document.createTextNode(tool.name));
    softwareOptions.appendChild(label);
  });

  /* -----------------------------------------------------------------
     FILE PICKERS — preview only. A file picked here can be shown on
     this page (via a temporary blob URL) but cannot be written into
     the repository from a static site. The real, permanent asset still
     has to be placed in assets/thumbnails/ or assets/videos/ by hand,
     and its path typed into the field below — see the notice banner in
     admin/index.html.
  ----------------------------------------------------------------- */
  fieldThumbFile.addEventListener("change", function () {
    var file = fieldThumbFile.files[0];
    if (!file) return;
    var url = URL.createObjectURL(file);
    thumbPreviewImg.src = url;
    thumbPreviewImg.hidden = false;
    if (!fieldThumbPath.value) {
      fieldThumbPath.value = "assets/thumbnails/" + file.name;
    }
    updatePreview();
  });

  fieldVideoFile.addEventListener("change", function () {
    var file = fieldVideoFile.files[0];
    if (!file || !fieldVideoPath.value) {
      if (file) fieldVideoPath.value = "assets/videos/" + file.name;
    }
  });

  if (logoFileInput) {
    logoFileInput.addEventListener("change", function () {
      var file = logoFileInput.files[0];
      if (!file) return;
      logoPreviewImg.src = URL.createObjectURL(file);
      logoPreviewImg.hidden = false;
    });
  }

  /* -----------------------------------------------------------------
     LIVE PREVIEW — builds a real .project-card element (same classes
     the public Work section uses) so what you see here is exactly what
     visitors would see, not an approximation.
  ----------------------------------------------------------------- */
  function updatePreview() {
    if (!previewCard) return;
    previewCard.innerHTML = "";

    var title = fieldTitle.value.trim() || "Untitled project";
    var category = fieldCategory.value || "";
    var thumbSrc = thumbPreviewImg.hidden ? "" : thumbPreviewImg.src;

    var card = document.createElement("div");
    card.className = "project-card";

    var thumb = document.createElement("span");
    thumb.className = "project-card__thumb";
    if (thumbSrc) {
      var img = document.createElement("img");
      img.src = thumbSrc;
      img.alt = "";
      thumb.appendChild(img);
    } else {
      thumb.classList.add("project-card__thumb--fallback");
      var fallbackLabel = document.createElement("span");
      fallbackLabel.className = "project-card__fallback-label";
      fallbackLabel.textContent = category;
      thumb.appendChild(fallbackLabel);
    }

    var meta = document.createElement("span");
    meta.className = "project-card__meta";
    var titleEl = document.createElement("span");
    titleEl.className = "project-card__title";
    titleEl.textContent = title;
    var tags = document.createElement("span");
    tags.className = "project-card__tags";
    var categoryTag = document.createElement("span");
    categoryTag.className = "project-card__category";
    categoryTag.textContent = category;
    tags.appendChild(categoryTag);
    meta.appendChild(titleEl);
    meta.appendChild(tags);

    card.appendChild(thumb);
    card.appendChild(meta);
    previewCard.appendChild(card);
  }

  [fieldTitle, fieldCategory].forEach(function (el) {
    el.addEventListener("input", updatePreview);
    el.addEventListener("change", updatePreview);
  });

  /* -----------------------------------------------------------------
     FORM ↔ DATA
  ----------------------------------------------------------------- */
  function slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "project";
  }

  function resetForm() {
    form.reset();
    fieldId.value = "";
    thumbPreviewImg.hidden = true;
    thumbPreviewImg.removeAttribute("src");
    softwareOptions.querySelectorAll("input").forEach(function (input) {
      input.checked = false;
    });
    formTitle.textContent = "Add Project";
    cancelEditBtn.hidden = true;
    updatePreview();
  }

  function fillForm(project) {
    fieldId.value = project.id || "";
    fieldTitle.value = project.title || "";
    fieldCategory.value = project.category || "";
    fieldDescription.value = project.description || "";
    fieldDate.value = project.date || "";
    fieldTags.value = Array.isArray(project.tags) ? project.tags.join(", ") : "";
    fieldIndustry.value = project.industry || "";
    fieldThumbPath.value = project.thumbnail || "";
    fieldVideoPath.value = project.video || "";

    if (project.thumbnail) {
      thumbPreviewImg.src = project.thumbnail;
      thumbPreviewImg.hidden = false;
      thumbPreviewImg.onerror = function () {
        thumbPreviewImg.hidden = true;
      };
    } else {
      thumbPreviewImg.hidden = true;
    }

    var software = Array.isArray(project.software) ? project.software : [];
    softwareOptions.querySelectorAll("input").forEach(function (input) {
      input.checked = software.indexOf(input.value) !== -1;
    });

    formTitle.textContent = "Edit Project";
    cancelEditBtn.hidden = false;
    updatePreview();
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var title = fieldTitle.value.trim();
    if (!title) {
      fieldTitle.focus();
      return;
    }

    var id = fieldId.value || slugify(title) + "-" + Date.now().toString(36);
    var software = Array.from(softwareOptions.querySelectorAll("input:checked")).map(function (input) {
      return input.value;
    });
    var tags = fieldTags.value
      .split(",")
      .map(function (t) {
        return t.trim();
      })
      .filter(Boolean);

    var project = {
      id: id,
      title: title,
      category: fieldCategory.value,
      thumbnail: fieldThumbPath.value.trim(),
      video: fieldVideoPath.value.trim(),
      description: fieldDescription.value.trim(),
      software: software,
      date: fieldDate.value || new Date().toISOString().slice(0, 10),
      tags: tags,
      industry: fieldIndustry.value.trim(),
    };

    Storage.save(project);
    resetForm();
    renderProjectList();
    renderExport();
    showToast("Saved as a local draft — remember to export and paste into config/site.config.js.");
  });

  cancelEditBtn.addEventListener("click", resetForm);

  /* -----------------------------------------------------------------
     PROJECT LIST
  ----------------------------------------------------------------- */
  var ICON_EDIT =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L18 10l-4-4L4 16v4z"/></svg>';
  var ICON_DELETE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13"/></svg>';

  function renderProjectList() {
    var projects = Storage.list().slice().sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });

    projectListEl.innerHTML = "";
    projectEmptyEl.hidden = projects.length !== 0;

    projects.forEach(function (project) {
      var row = document.createElement("div");
      row.className = "admin__project-row";

      var thumb = document.createElement("div");
      thumb.className = "admin__project-thumb";
      if (project.thumbnail) {
        var img = document.createElement("img");
        img.src = project.thumbnail;
        img.alt = "";
        img.onerror = function () {
          img.remove();
        };
        thumb.appendChild(img);
      }

      var meta = document.createElement("div");
      meta.className = "admin__project-meta";
      var titleEl = document.createElement("div");
      titleEl.className = "admin__project-title";
      titleEl.textContent = project.title || "Untitled";
      var subEl = document.createElement("div");
      subEl.className = "admin__project-sub";
      subEl.textContent = (project.category || "—") + " · " + (project.date || "no date");
      meta.appendChild(titleEl);
      meta.appendChild(subEl);

      var actions = document.createElement("div");
      actions.className = "admin__project-actions";

      var editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "admin__icon-btn";
      editBtn.setAttribute("aria-label", "Edit " + (project.title || "project"));
      editBtn.innerHTML = ICON_EDIT;
      editBtn.addEventListener("click", function () {
        fillForm(project);
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      });

      var deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "admin__icon-btn";
      deleteBtn.setAttribute("aria-label", "Delete " + (project.title || "project"));
      deleteBtn.innerHTML = ICON_DELETE;
      deleteBtn.addEventListener("click", function () {
        if (!window.confirm('Delete "' + (project.title || "this project") + '"? This only removes it from the local draft.')) return;
        Storage.remove(project.id);
        renderProjectList();
        renderExport();
        showToast("Deleted from the local draft.");
      });

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);

      row.appendChild(thumb);
      row.appendChild(meta);
      row.appendChild(actions);
      projectListEl.appendChild(row);
    });
  }

  /* -----------------------------------------------------------------
     EXPORT — the actual "save" mechanism this static architecture
     supports: generate the real config.js array text, ready to paste.
  ----------------------------------------------------------------- */
  function renderExport() {
    var projects = Storage.list().slice().sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });

    var lines = projects.map(function (p) {
      return (
        "  {\n" +
        '    id: "' + p.id + '",\n' +
        '    title: "' + (p.title || "").replace(/"/g, '\\"') + '",\n' +
        '    category: "' + (p.category || "") + '",\n' +
        '    thumbnail: "' + (p.thumbnail || "") + '",\n' +
        '    video: "' + (p.video || "") + '",\n' +
        '    description: "' + (p.description || "").replace(/"/g, '\\"') + '",\n' +
        "    software: [" + p.software.map(function (s) { return '"' + s + '"'; }).join(", ") + "],\n" +
        '    date: "' + (p.date || "") + '",\n' +
        (p.tags && p.tags.length ? "    tags: [" + p.tags.map(function (t) { return '"' + t + '"'; }).join(", ") + "],\n" : "") +
        (p.industry ? '    industry: "' + p.industry + '",\n' : "") +
        "  }"
      );
    });

    exportBox.value = "projects: [\n" + lines.join(",\n") + (lines.length ? "\n" : "") + "],";
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      exportBox.select();
      try {
        navigator.clipboard.writeText(exportBox.value);
        showToast("Copied — paste this into config/site.config.js.");
      } catch (err) {
        showToast("Select-all worked, but auto-copy didn't. Copy manually with Cmd/Ctrl+C.");
      }
    });
  }

  /* -----------------------------------------------------------------
     TOAST
  ----------------------------------------------------------------- */
  var toastTimer = null;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 3200);
  }

  /* -----------------------------------------------------------------
     INIT
  ----------------------------------------------------------------- */
  resetForm();
  renderProjectList();
  renderExport();
})();
