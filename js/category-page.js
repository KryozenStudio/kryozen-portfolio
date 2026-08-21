(function(){
"use strict";
var cfg=window.SITE_CONFIG,root=document.querySelector(".category-page");

var configTest = document.createElement("pre");
configTest.style.cssText = "position:fixed;z-index:999999;top:80px;left:10px;right:10px;background:#111;color:#fff;padding:15px;font:14px monospace;white-space:pre-wrap;";
configTest.textContent = "SITE_CONFIG at category-page start: " + String(window.SITE_CONFIG);
document.body.appendChild(configTest);
console.log("[KRYOZEN DEBUG] SITE_CONFIG:", cfg);
console.log("[KRYOZEN DEBUG] projects:", cfg && cfg.projects);
var debugBox = document.createElement("pre");
debugBox.id = "kryozen-debug";
debugBox.style.cssText = "position:fixed;z-index:99999;left:10px;right:10px;bottom:10px;max-height:40vh;overflow:auto;background:#111;color:#0f0;padding:12px;font:12px monospace;white-space:pre-wrap;";
debugBox.textContent = "SITE_CONFIG exists: " + (!!cfg) + "\nProjects: " + JSON.stringify(cfg && cfg.projects, null, 2);
document.body.appendChild(debugBox);
if(!cfg||!root)return;
var category=root.getAttribute("data-category"),title=document.getElementById("category-title"),desc=document.getElementById("category-description"),grid=document.getElementById("category-grid"),count=document.getElementById("category-count"),search=document.getElementById("category-search"),filters=document.getElementById("category-filters");
var descriptions=cfg.categoryDescriptions||{};
if(title)title.textContent=category;
if(desc)desc.textContent=descriptions[category]||"Selected work from Kryozen Studio.";
var projects=[];
function source(){return Array.isArray(cfg.projects)?cfg.projects.slice():[]}
function setSource(list){projects=list.filter(function(p){return p&&p.category===category}).sort(function(a,b){return new Date(b.date)-new Date(a.date)});buildFilters();render();}
function card(p){
 var b=document.createElement("button");b.type="button";b.className="category-project";
 var media=document.createElement("span");media.className="category-project__media";
 if(p.thumbnail){var img=document.createElement("img");img.src=p.thumbnail;img.alt="";img.loading="lazy";media.appendChild(img)}else{media.classList.add("category-project__media--fallback")}
 var body=document.createElement("span");body.className="category-project__body";
 var t=document.createElement("span");t.className="category-project__title";t.textContent=p.title||"Untitled";body.appendChild(t);
 if(p.description){var dd=document.createElement("span");dd.className="category-project__desc";dd.textContent=p.description;body.appendChild(dd)}
 if(Array.isArray(p.software)&&p.software.length){var tags=document.createElement("span");tags.className="category-project__tags";tags.textContent=p.software.join(" · ");body.appendChild(tags)}
 b.appendChild(media);b.appendChild(body);b.addEventListener("click",function(){b.dispatchEvent(new CustomEvent("kryozen:project-open",{bubbles:true,detail:p}))});return b;
}
var activeFilter="All";
function filterOptions(){var set={"All":true};projects.forEach(function(p){(p.software||[]).forEach(function(s){if(s)set[s]=true})});return Object.keys(set)}
function buildFilters(){if(!filters)return;filters.innerHTML="";filterOptions().forEach(function(name){var b=document.createElement("button");b.type="button";b.className="category-page__filter";b.textContent=name;b.setAttribute("aria-pressed",name===activeFilter?"true":"false");b.addEventListener("click",function(){activeFilter=name;buildFilters();render()});filters.appendChild(b)})}
function render(){if(!grid)return;var q=(search?search.value:"").trim().toLowerCase();var list=projects.filter(function(p){var hay=((p.title||"")+" "+(p.description||"")+" "+(p.software||[]).join(" ")).toLowerCase();var matchQ=!q||hay.indexOf(q)!==-1;var matchF=activeFilter==="All"||(p.software||[]).indexOf(activeFilter)!==-1;return matchQ&&matchF});grid.innerHTML="";if(count)count.textContent=list.length+" project"+(list.length===1?"":"s");if(!list.length){var e=document.createElement("div");e.className="category-page__empty";e.textContent=projects.length?"No projects match this search.":"No projects published in this category yet.";grid.appendChild(e);return}list.forEach(function(p){grid.appendChild(card(p))})}
if(search)search.addEventListener("input",render);
setSource(source());
if(window.Kryozen&&typeof window.Kryozen.getProjects==="function"){window.Kryozen.getProjects().then(function(remote){if(Array.isArray(remote)){setSource(remote)}}).catch(function(){})}
})();
