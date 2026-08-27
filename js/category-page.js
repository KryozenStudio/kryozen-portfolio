(function(){
"use strict";
var cfg=window.SITE_CONFIG,root=document.querySelector(".category-page");
if(!cfg||!root)return;
var category=root.getAttribute("data-category"),title=document.getElementById("category-title"),desc=document.getElementById("category-description"),grid=document.getElementById("category-grid"),count=document.getElementById("category-count"),search=document.getElementById("category-search"),filters=document.getElementById("category-filters");
var descriptions=cfg.categoryDescriptions||{};
if(title)title.textContent=category;
if(desc)desc.textContent=descriptions[category]||"Selected work from Kryozen Studio.";
var projects=[];
function source(){return Array.isArray(cfg.projects)?cfg.projects.slice():[]}
function setSource(list){projects=list.filter(function(p){return p&&p.category===category}).sort(function(a,b){return new Date(b.date)-new Date(a.date)});buildFilters();render();}
/** Same pattern/regex as js/player.js's extractYouTubeId() — duplicated
 *  rather than shared because this file and player.js are loaded in
 *  script-order-dependent positions on different pages and this project
 *  has no shared-utility script or build step (see PROJECT_RULES.md §6).
 *  IMPORTANT: if the YouTube URL matching logic ever needs to change,
 *  update both copies together — otherwise a project's thumbnail (this
 *  file) and its player (js/player.js) will disagree about whether a
 *  given youtubeUrl is valid. */
function extractYouTubeId(url){if(!url||typeof url!=="string")return null;var m=url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);return m?m[1]:null}
function card(p){
 var b=document.createElement("button");b.type="button";b.className="category-project";
 var media=document.createElement("span");media.className="category-project__media";
 // Thumbnail priority: a manually supplied project.thumbnail always wins;
 // otherwise, a valid youtubeUrl derives one from YouTube's own thumbnail
 // CDN (hqdefault — the one size guaranteed to exist for any video,
 // unlike maxresdefault which only exists for HD uploads); otherwise the
 // gradient fallback state below.
 var thumbSrc=p.thumbnail||"";
 if(!thumbSrc&&p.youtubeUrl){var ytId=extractYouTubeId(p.youtubeUrl);if(ytId)thumbSrc="https://i.ytimg.com/vi/"+ytId+"/hqdefault.jpg"}
 if(thumbSrc){
   var img=document.createElement("img");img.src=thumbSrc;img.alt="";img.loading="lazy";
   // A derived YouTube thumbnail can 404 on rare/edge-case videos even
   // when hqdefault normally exists — fail into the same gradient
   // fallback rather than a broken image icon.
   img.addEventListener("error",function(){media.classList.add("category-project__media--fallback");img.remove()},{once:true});
   media.appendChild(img);
 }else{media.classList.add("category-project__media--fallback")}
 var body=document.createElement("span");body.className="category-project__body";
 var t=document.createElement("span");t.className="category-project__title";t.textContent=p.title||"Untitled";body.appendChild(t);
 if(p.description){var dd=document.createElement("span");dd.className="category-project__desc";dd.textContent=p.description;body.appendChild(dd)}
 if(Array.isArray(p.software)&&p.software.length){var tags=document.createElement("span");tags.className="category-project__tags";tags.textContent=p.software.join(" · ");body.appendChild(tags)}
 b.appendChild(media);b.appendChild(body);b.addEventListener("click",function(){b.dispatchEvent(new CustomEvent("kryozen:project-open",{bubbles:true,detail:p}))});return b;
}
var activeFilter="All";
var hasRenderedOnce=false;
function filterOptions(){var set={"All":true};projects.forEach(function(p){(p.software||[]).forEach(function(s){if(s)set[s]=true})});return Object.keys(set)}
function buildFilters(){if(!filters)return;filters.innerHTML="";filterOptions().forEach(function(name){var b=document.createElement("button");b.type="button";b.className="category-page__filter";b.textContent=name;b.setAttribute("aria-pressed",name===activeFilter?"true":"false");b.addEventListener("click",function(){activeFilter=name;buildFilters();render()});filters.appendChild(b)})}
function render(){if(!grid)return;var q=(search?search.value:"").trim().toLowerCase();var list=projects.filter(function(p){var hay=((p.title||"")+" "+(p.description||"")+" "+(p.software||[]).join(" ")).toLowerCase();var matchQ=!q||hay.indexOf(q)!==-1;var matchF=activeFilter==="All"||(p.software||[]).indexOf(activeFilter)!==-1;return matchQ&&matchF});grid.innerHTML="";if(count)count.textContent=list.length+" project"+(list.length===1?"":"s");if(!list.length){var e=document.createElement("div");e.className="category-page__empty";e.textContent=projects.length?"No projects match this search.":"No projects published in this category yet.";grid.appendChild(e);return}
 // Stagger only the grid's very first paint (the "arriving at this page"
 // moment) — search/filter re-renders skip it so typing/filtering feels
 // immediate rather than waiting through a restagger on every keystroke.
 // Capped rather than index*delay unbounded, so a large catalog doesn't
 // stretch the entrance out to something that reads as slow.
 list.forEach(function(p,i){var c=card(p);if(!hasRenderedOnce)c.style.animationDelay=(Math.min(i,10)*35)+"ms";grid.appendChild(c)});
 hasRenderedOnce=true;
}
if(search)search.addEventListener("input",render);
setSource(source());
// A second setSource() via window.Kryozen.getProjects() used to live
// here from when project-source.js was Supabase-backed and could
// return different data than the static config fallback. Now that it's
// gone (see PROJECT_RULES.md → "Video Hosting"), getProjects() always
// resolves to an identical copy of the same array setSource(source())
// above already used — calling it again did nothing but immediately
// re-render the grid with the exact same cards, which silently
// cancelled the first render's entrance stagger before anyone could
// ever see it play. Removed rather than left as harmless-seeming dead
// weight, since it wasn't harmless.
})();
