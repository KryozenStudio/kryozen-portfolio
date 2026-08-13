(function(){
  "use strict";
  var STORAGE_KEY="kryozenIntroPlayed", root=document.documentElement;
  function buildWordmark(){
    var title=document.querySelector(".hero__title[data-wordmark]");
    if(!title||title.dataset.split==="true") return;
    var text=title.getAttribute("data-wordmark")||title.textContent||"";
    title.textContent="";
    Array.from(text.trim()).forEach(function(ch,i){
      var span=document.createElement("span");
      span.className="hero__title-char";
      span.style.setProperty("--i", i);
      span.textContent=ch === " " ? "\u00a0" : ch;
      title.appendChild(span);
    });
    title.dataset.split="true";
  }
  function markPlayed(){try{sessionStorage.setItem(STORAGE_KEY,"1")}catch(e){}}
  buildWordmark();
  if(root.classList.contains("no-intro")){markPlayed();return;}
  var scrollCue=document.querySelector(".hero__scroll");
  if(scrollCue) scrollCue.addEventListener("animationend",markPlayed,{once:true});
  window.setTimeout(markPlayed,3600);
})();
