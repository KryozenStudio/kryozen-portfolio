(function () {
  "use strict";
  var cfg = window.SITE_CONFIG;
  var list = document.getElementById("faq-list");
  if (!cfg || !list || !cfg.faq) return;
  function setText(id, value) { var el=document.getElementById(id); if(el && value!=null) el.textContent=value; }
  setText("faq-eyebrow-text", cfg.faq.eyebrow);
  setText("faq-title", cfg.faq.heading);
  setText("faq-subtitle", cfg.faq.subtitle);

  // Single-open accordion: every panel this file builds is tracked here so
  // opening one can close whichever other one is currently open. Each
  // entry's own click handler still only ever touches ITS OWN closed-over
  // btn/panel/answer — this array is just how "close the others" reaches
  // across items, not shared mutable animation state.
  var panels = [];
  var openPanel = null;

  function close(entry) {
    entry.btn.setAttribute("aria-expanded", "false");
    entry.panel.classList.remove("is-open");
    if (openPanel === entry) openPanel = null;
  }

  function open(entry) {
    if (openPanel && openPanel !== entry) close(openPanel);
    entry.btn.setAttribute("aria-expanded", "true");
    entry.answer.hidden = false;
    openPanel = entry;
    // Un-hiding and adding .is-open must NOT happen in the same tick.
    // hidden=false and the class change above both landed in this one
    // synchronous handler with no paint in between, so the browser has
    // no rendered "closed" frame to animate the grid-template-rows
    // transition FROM — worst case on some engines, that can leave the
    // answer looking stuck at its old state until something else forces
    // a style recalculation (e.g. a second tap). Splitting the class add
    // into its own animation frame guarantees the closed (hidden=false,
    // still 0fr) state actually gets rendered as a real frame first.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        // Guard: if this entry was closed again (or another entry was
        // opened, closing this one) during those two frames, don't add
        // .is-open back — openPanel !== entry means this open() call has
        // since been superseded.
        if (openPanel === entry) entry.panel.classList.add("is-open");
      });
    });
  }

  (Array.isArray(cfg.faq.items)?cfg.faq.items:[]).forEach(function(item,index){
    if(!item||!item.question||!item.answer) return;
    var panel=document.createElement("article"); panel.className="faq__item";
    var btn=document.createElement("button"); btn.type="button"; btn.className="faq__question"; btn.id="faq-question-"+index; btn.setAttribute("aria-expanded","false"); btn.setAttribute("aria-controls","faq-answer-"+index);
    var q=document.createElement("span"); q.className="faq__question-text"; q.textContent=item.question;
    var icon=document.createElement("span"); icon.className="faq__icon"; icon.setAttribute("aria-hidden","true"); icon.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M6 12h12"/><path d="M12 6v12"/></svg>';
    btn.append(q,icon);
    var answer=document.createElement("div"); answer.className="faq__answer"; answer.id="faq-answer-"+index; answer.setAttribute("role","region"); answer.setAttribute("aria-labelledby",btn.id); answer.hidden=true; answer.innerHTML="<div><p></p></div>"; answer.querySelector("p").textContent=item.answer;

    var entry = { btn: btn, panel: panel, answer: answer };
    panels.push(entry);

    btn.addEventListener("click",function(){
      var isOpen = btn.getAttribute("aria-expanded")==="true";
      if (isOpen) close(entry); else open(entry);
    });
    // No scrollHeight measurement, no inline max-height/style writes: the
    // reveal itself is pure CSS (grid-template-rows 0fr -> 1fr, see
    // faq.css), so opening/closing never forces a synchronous layout
    // read/write from JS. This listener only re-hides the answer from
    // assistive tech once the CSS collapse has actually finished.
    answer.addEventListener("transitionend",function(e){ if(e.propertyName==="grid-template-rows" && btn.getAttribute("aria-expanded")==="false") answer.hidden=true; });
    panel.append(btn,answer); list.appendChild(panel);
  });
})();
