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
/** Fine pointer + no reduced-motion gate, checked once rather than per
 *  card — touch/coarse-pointer devices (and reduced-motion users) get
 *  zero tilt-related JS at all, not just a disabled effect; the CSS
 *  hover/active fallback already defined in css/category-page.css
 *  covers them completely on its own. */
var TILT_ENABLED =
  window.matchMedia &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
var TILT_MAX_DEG = 7; // brief calls for restraint ("avoid extreme rotation") — kept well short of a gimmicky spin
var TILT_LIFT = "-6px";
var TILT_SCALE = 1.015;

/** Attaches the pointer-tracked 3D tilt + glare sweep to one card.
 *  Kept entirely separate from card()'s own DOM-building responsibility
 *  so TILT_ENABLED only needs checking once, not threaded through every
 *  card() call. */
function attachTilt(b, glare) {
  var raf = null;
  var resetTimer = null;

  function apply(clientX, clientY) {
    var rect = b.getBoundingClientRect();
    var px = (clientX - rect.left) / rect.width;
    var py = (clientY - rect.top) / rect.height;
    px = Math.min(1, Math.max(0, px));
    py = Math.min(1, Math.max(0, py));
    var rotateY = (px - 0.5) * (TILT_MAX_DEG * 2);
    var rotateX = (0.5 - py) * (TILT_MAX_DEG * 2);
    b.style.transition = "none";
    b.style.transform =
      "perspective(900px) rotateX(" + rotateX.toFixed(2) + "deg) rotateY(" + rotateY.toFixed(2) + "deg) " +
      "translateY(" + TILT_LIFT + ") scale(" + TILT_SCALE + ")";
    glare.style.background =
      "radial-gradient(circle at " + (px * 100).toFixed(1) + "% " + (py * 100).toFixed(1) + "%, rgba(255,255,255,.14), transparent 62%)";
  }

  b.addEventListener("pointerenter", function (e) {
    if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
    window.clearTimeout(resetTimer);
    glare.classList.add("is-active");
  });

  b.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
    if (raf) window.cancelAnimationFrame(raf);
    raf = window.requestAnimationFrame(function () { apply(e.clientX, e.clientY); });
  });

  b.addEventListener("pointerleave", function (e) {
    if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
    if (raf) window.cancelAnimationFrame(raf);
    glare.classList.remove("is-active");
    // Spring back to neutral, then hand control back to the CSS
    // transition (280ms ease-out) that governs the plain hover/active
    // states — a lingering long inline transition would otherwise make
    // the *next* hover's first movement feel sluggish.
    b.style.transition = "transform 500ms var(--ease-spring)";
    b.style.transform = "";
    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(function () { b.style.transition = ""; }, 520);
  });
}

function card(p,i){
 var b=document.createElement("button");b.type="button";b.className="category-project";
 if(typeof i==="number")b.setAttribute("data-index",String(i+1).padStart(2,"0"));
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
 b.appendChild(media);b.appendChild(body);
 if(TILT_ENABLED){
   var glare=document.createElement("span");glare.className="category-project__glare";glare.setAttribute("aria-hidden","true");
   b.appendChild(glare);
   attachTilt(b,glare);
 }
 // detail carries the origin element alongside the project data — see
 // js/player.js's openPlayer(), which uses this element's on-screen
 // position/size to animate the player expanding out of the clicked
 // card rather than just fading in centered. The event's own shape
 // ({project, originEl}) is a contract shared with player.js, the only
 // listener (see its file-top comment) — both are updated together.
 b.addEventListener("click",function(){b.dispatchEvent(new CustomEvent("kryozen:project-open",{bubbles:true,detail:{project:p,originEl:b}}))});
 return b;
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
 list.forEach(function(p,i){var c=card(p,i);if(!hasRenderedOnce)c.style.animationDelay=(Math.min(i,10)*35)+"ms";grid.appendChild(c)});
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
