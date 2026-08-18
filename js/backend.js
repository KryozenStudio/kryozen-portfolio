(function(){
  "use strict";
  var cfg=window.KRYOZEN_BACKEND||{};
  window.Kryozen=window.Kryozen||{};
  window.Kryozen.backendReady=false;
  if(!cfg.supabaseUrl||!cfg.supabaseAnonKey||!window.supabase) return;
  try{
    window.Kryozen.supabase=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey);
    window.Kryozen.backendReady=true;
  }catch(e){console.warn("[Kryozen] Backend init failed.",e);}
})();
