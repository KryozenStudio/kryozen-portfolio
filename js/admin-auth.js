(function(){
"use strict";
var cfg=window.SITE_CONFIG||{}, backend=window.Kryozen||{};
var setup=document.getElementById("setup-card"), authCard=document.getElementById("auth-card"), dash=document.getElementById("dashboard"), msg=document.getElementById("admin-message");
if(!backend.backendReady){setup.hidden=false;document.getElementById("google-login").disabled=true;msg.textContent="Backend is not connected yet.";return;}
var sb=backend.supabase, categories=Array.isArray(cfg.categories)?cfg.categories:[];
var form=document.getElementById("project-form"), list=document.getElementById("project-list"), count=document.getElementById("project-count");
var cat=document.getElementById("project-category"), idEl=document.getElementById("project-id");
categories.forEach(function(c){var o=document.createElement("option");o.value=c;o.textContent=c;cat.appendChild(o);});
function message(t){msg.textContent=t;}
function resetForm(){form.reset();idEl.value="";document.getElementById("project-date").value=new Date().toISOString().slice(0,10);document.getElementById("project-software").value="Node Video";document.getElementById("project-published").checked=true;document.getElementById("form-title").textContent="Add project";document.getElementById("delete-project").hidden=true;}
function fill(p){idEl.value=p.id;document.getElementById("project-title").value=p.title||"";cat.value=p.category||categories[0]||"";document.getElementById("project-date").value=p.date||"";document.getElementById("project-description").value=p.description||"";document.getElementById("project-thumbnail").value=p.thumbnail||"";document.getElementById("project-video").value=p.video||"";document.getElementById("project-software").value=Array.isArray(p.software)?p.software.join(", "):"";document.getElementById("project-featured").checked=!!p.featured;document.getElementById("project-published").checked=!!p.published;document.getElementById("form-title").textContent="Edit project";document.getElementById("delete-project").hidden=false;}
async function load(){
 var r=await sb.from("projects").select("*").order("date",{ascending:false});
 if(r.error){message(r.error.message);return;}
 count.textContent=(r.data||[]).length;list.innerHTML="";
 (r.data||[]).forEach(function(p){var b=document.createElement("button");b.type="button";b.className="admin-project-item";b.innerHTML="<span><strong></strong><small></small></span><span>→</span>";b.querySelector("strong").textContent=p.title;b.querySelector("small").textContent=p.category+" · "+(p.published?"Published":"Draft");b.addEventListener("click",function(){fill(p);});list.appendChild(b);});
}
async function check(){
 var s=await sb.auth.getSession(); var session=s.data.session;
 if(!session){authCard.hidden=false;dash.hidden=true;document.getElementById("logout").hidden=true;return;}
 var r=await sb.from("admin_users").select("user_id,active").eq("user_id",session.user.id).eq("active",true).maybeSingle();
 if(r.error||!r.data){await sb.auth.signOut();authCard.hidden=false;dash.hidden=true;document.getElementById("logout").hidden=true;message("Access denied — this Google account is not authorized to access the Kryozen Studio admin dashboard.");return;}
 authCard.hidden=false;document.getElementById("google-login").hidden=true;document.getElementById("logout").hidden=false;dash.hidden=false;document.getElementById("security-status").innerHTML='<span class="admin-status-dot"></span>Authenticated and authorized.';await load();resetForm();
}
document.getElementById("google-login").addEventListener("click",async function(){message("Opening Google authentication…");var r=await sb.auth.signInWithOAuth({provider:"google",options:{redirectTo:window.location.origin+window.location.pathname}});if(r.error)message(r.error.message);});
document.getElementById("logout").addEventListener("click",async function(){await sb.auth.signOut();window.location.reload();});
document.getElementById("new-project").addEventListener("click",resetForm);
form.addEventListener("submit",async function(e){e.preventDefault();var payload={title:document.getElementById("project-title").value.trim(),category:cat.value,date:document.getElementById("project-date").value,description:document.getElementById("project-description").value.trim(),thumbnail:document.getElementById("project-thumbnail").value.trim(),video:document.getElementById("project-video").value.trim(),software:document.getElementById("project-software").value.split(",").map(function(x){return x.trim();}).filter(Boolean),featured:document.getElementById("project-featured").checked,published:document.getElementById("project-published").checked};
var id=idEl.value;var r=id?await sb.from("projects").update(payload).eq("id",id):await sb.from("projects").insert(payload);
if(r.error){message(r.error.message);return;}message(id?"Project updated.":"Project created.");await load();resetForm();});
document.getElementById("delete-project").addEventListener("click",async function(){var id=idEl.value;if(!id||!confirm("Delete this project?"))return;var r=await sb.from("projects").delete().eq("id",id);if(r.error){message(r.error.message);return;}message("Project deleted.");await load();resetForm();});
sb.auth.onAuthStateChange(function(){check();});
check();
})();
