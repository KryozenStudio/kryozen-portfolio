(function(){
"use strict";
var cfg=window.SITE_CONFIG, root=document.querySelector(".category-page");
if(!cfg||!root)return;
var category=root.getAttribute("data-category");
var title=document.getElementById("category-title"), desc=document.getElementById("category-description"), grid=document.getElementById("category-grid"), count=document.getElementById("category-count");
var descriptions=cfg.categoryDescriptions||{};
if(title)title.textContent=category;
if(desc)desc.textContent=descriptions[category]||"Selected work from Kryozen Studio.";
var projects=(Array.isArray(cfg.projects)?cfg.projects:[]).filter(function(p){return p.category===category;}).sort(function(a,b){return new Date(b.date)-new Date(a.date);});
if(count)count.textContent=projects.length+" project"+(projects.length===1?"":"s");
function card(p){
 var b=document.createElement("button"); b.type="button"; b.className="category-project";
 var media=document.createElement("span"); media.className="category-project__media";
 if(p.thumbnail){var img=document.createElement("img");img.src=p.thumbnail;img.alt="";img.loading="lazy";media.appendChild(img);}
 else {media.style.background="radial-gradient(circle at 30% 20%, var(--color-accent-glow-soft), var(--color-bg-elevated) 65%)";}
 var body=document.createElement("span");body.className="category-project__body";
 var t=document.createElement("span");t.className="category-project__title";t.textContent=p.title||"Untitled";
 var d=document.createElement("span");d.className="category-project__desc";d.textContent=p.description||"";
 var tags=document.createElement("span");tags.className="category-project__tags";tags.textContent=(p.software||[]).join(" · ");
 body.appendChild(t);if(p.description)body.appendChild(d);if(p.software)body.appendChild(tags);b.appendChild(media);b.appendChild(body);
 b.addEventListener("click",function(){b.dispatchEvent(new CustomEvent("kryozen:project-open",{bubbles:true,detail:p}));});
 return b;
}
function render(list){
 grid.innerHTML="";
 if(count)count.textContent=list.length+" project"+(list.length===1?"":"s");
 list.forEach(function(p){grid.appendChild(card(p));});
 if(!list.length){var e=document.createElement("div");e.className="category-page__empty";e.textContent="No published projects in this category yet.";grid.appendChild(e);}
}
render(projects);
if(window.Kryozen&&typeof window.Kryozen.getProjects==="function"){
 window.Kryozen.getProjects().then(function(remote){
   if(Array.isArray(remote)){render(remote.filter(function(p){return p.category===category;}));}
 });
}
})();
