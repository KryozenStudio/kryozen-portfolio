(function () {
  "use strict";
  var cfg = window.SITE_CONFIG;
  var list = document.getElementById("faq-list");
  if (!cfg || !list || !cfg.faq) return;
  function setText(id, value) { var el=document.getElementById(id); if(el && value!=null) el.textContent=value; }
  setText("faq-eyebrow-text", cfg.faq.eyebrow);
  setText("faq-title", cfg.faq.heading);
  setText("faq-subtitle", cfg.faq.subtitle);
  (Array.isArray(cfg.faq.items)?cfg.faq.items:[]).forEach(function(item,index){
    if(!item||!item.question||!item.answer) return;
    var panel=document.createElement("article"); panel.className="faq__item";
    var btn=document.createElement("button"); btn.type="button"; btn.className="faq__question"; btn.id="faq-question-"+index; btn.setAttribute("aria-expanded","false"); btn.setAttribute("aria-controls","faq-answer-"+index);
    var q=document.createElement("span"); q.className="faq__question-text"; q.textContent=item.question;
    var icon=document.createElement("span"); icon.className="faq__icon"; icon.setAttribute("aria-hidden","true"); icon.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M6 12h12"/><path d="M12 6v12"/></svg>';
    btn.append(q,icon);
    var answer=document.createElement("div"); answer.className="faq__answer"; answer.id="faq-answer-"+index; answer.setAttribute("role","region"); answer.setAttribute("aria-labelledby",btn.id); answer.hidden=true; answer.innerHTML="<p></p>"; answer.querySelector("p").textContent=item.answer;
    btn.addEventListener("click",function(){
      var open=btn.getAttribute("aria-expanded")==="true";
      btn.setAttribute("aria-expanded",String(!open)); panel.classList.toggle("is-open",!open);
      if(!open){ answer.hidden=false; requestAnimationFrame(function(){ answer.style.maxHeight=answer.scrollHeight+"px"; }); }
      else { answer.style.maxHeight=answer.scrollHeight+"px"; requestAnimationFrame(function(){ answer.style.maxHeight="0px"; }); }
    });
    answer.addEventListener("transitionend",function(e){ if(e.propertyName==="max-height" && btn.getAttribute("aria-expanded")==="false") answer.hidden=true; });
    panel.append(btn,answer); list.appendChild(panel);
  });
})();
