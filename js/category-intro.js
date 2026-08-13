(function(){
  "use strict";
  var overlay=document.getElementById("category-intro");
  if(!overlay) return;
  var title=overlay.querySelector("[data-intro-wordmark]");
  if(title && !title.dataset.split){
    var text=title.getAttribute("data-intro-wordmark") || title.textContent || "KRYOZEN STUDIO";
    title.textContent="";
    Array.from(text).forEach(function(ch,i){
      var span=document.createElement("span");
      span.className="category-intro__char";
      span.style.setProperty("--i", i);
      span.textContent=ch === " " ? "\u00a0" : ch;
      title.appendChild(span);
    });
    title.dataset.split="true";
  }
  if(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches){
    overlay.classList.add("is-complete");
    return;
  }
  window.setTimeout(function(){ overlay.classList.add("is-complete"); }, 2100);
})();
