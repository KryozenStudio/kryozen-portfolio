(function(){
  "use strict";
  var overlay=document.getElementById("category-intro");
  if(!overlay)return;
  if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches){overlay.classList.add("is-complete");return;}
  window.setTimeout(function(){overlay.classList.add("is-complete");},1350);
})();
