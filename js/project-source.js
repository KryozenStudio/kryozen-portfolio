(function(){
"use strict";
window.Kryozen=window.Kryozen||{};
var localCfg=window.SITE_CONFIG||{};
window.Kryozen.getProjects=async function(){
  var fallback=Array.isArray(localCfg.projects)?localCfg.projects.slice():[];
  if(!window.Kryozen.backendReady) return fallback;
  try{
    var r=await window.Kryozen.supabase.from("projects").select("*").eq("published",true).order("date",{ascending:false});
    if(r.error||!Array.isArray(r.data)) return fallback;
    return r.data.map(function(p){return {
      id:p.id,title:p.title,category:p.category,thumbnail:p.thumbnail||"",video:p.video||"",
      description:p.description||"",software:Array.isArray(p.software)?p.software:[],date:p.date,featured:!!p.featured
    };});
  }catch(e){return fallback;}
};
})();
