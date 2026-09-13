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
    a.innerHTML='<span class="category-strip__num">0'+(i+1)+'</span><span class="category-strip__name"></span><span class="category-strip__arrow" aria-hidden="true">↗</span>';
    a.querySelector(".category-strip__name").textContent=name;
    grid.appendChild(a);
  });
})();
