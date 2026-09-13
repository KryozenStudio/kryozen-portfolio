(function(){
  "use strict";
  var cfg=window.SITE_CONFIG, grid=document.getElementById("category-strip-grid");
  if(!cfg) return;

  var workCfg=cfg.work||{};
  var eyebrowEl=document.getElementById("category-strip-eyebrow-text");
  var headingEl=document.getElementById("category-strip-title");
  if(eyebrowEl&&workCfg.eyebrow) eyebrowEl.textContent=workCfg.eyebrow;
  if(headingEl&&workCfg.heading) headingEl.textContent=workCfg.heading;

  if(!grid||!Array.isArray(cfg.categories)) return;
  var slugs=cfg.categoryPages||{};
  cfg.categories.forEach(function(name,i){
    var slug=slugs[name];
    if(!slug) return;
    var a=document.createElement("a");
    a.className="category-strip__item";
    a.href=slug;
    // .category-strip__mesh is a purely decorative hover reveal (see
    // css/category-strip.css) — an abstract animated gradient standing
    // in for a genuine per-category video preview, since real preview
    // clips for five categories aren't part of this codebase's asset
    // set. aria-hidden, no content of its own.
    a.innerHTML=
      '<span class="category-strip__mesh" aria-hidden="true"></span>' +
      '<span class="category-strip__top">' +
        '<span class="category-strip__num">// 0'+(i+1)+'</span>' +
        '<span class="category-strip__arrow" aria-hidden="true">↗</span>' +
      '</span>' +
      '<span class="category-strip__name"></span>';
    a.querySelector(".category-strip__name").textContent=name;
    grid.appendChild(a);
  });
})();
