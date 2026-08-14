(function(){
  "use strict";
  var KEY="kryozenIntroPlayed", root=document.documentElement;
  function mark(){try{sessionStorage.setItem(KEY,"1")}catch(e){}}
  if(root.classList.contains("no-intro")){mark();return;}
  window.setTimeout(mark,3150);
})();
