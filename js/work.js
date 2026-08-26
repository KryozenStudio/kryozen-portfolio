/* Home work section is now a category gateway. Project search/filtering lives on each category page. */
(function(){
  "use strict";
  var cfg=window.SITE_CONFIG||{};
  window.Kryozen=window.Kryozen||{};
  var projects=Array.isArray(cfg.projects)?cfg.projects.slice().sort(function(a,b){return new Date(b.date)-new Date(a.date)}):[];
  window.Kryozen.projects=projects;
  window.Kryozen.getLatestProject=function(){return projects.length?projects[0]:null};
})();
