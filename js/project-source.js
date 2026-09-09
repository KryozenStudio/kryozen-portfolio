(function(){
"use strict";
window.Kryozen=window.Kryozen||{};
var localCfg=window.SITE_CONFIG||{};
/* Projects now live entirely in config/site.config.js (edited directly,
   committed, pushed — see PROJECT_RULES.md). There is no backend: this
   stays a Promise-returning function only because js/category-page.js
   and js/work.js already call it that way, so neither needed to change
   when the Supabase-backed version of this file was removed. */
window.Kryozen.getProjects=async function(){
  return Array.isArray(localCfg.projects)?localCfg.projects.slice():[];
};
})();
