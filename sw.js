/* JJ Gestão: funciona sem internet e recebe comprovantes do app do banco */
const V="jj-gestao-v3-1",SHARE="jj-share";
const SHELL=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./firebase-config.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!==SHARE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const req=e.request,u=new URL(req.url);
  if(req.method==="POST"&&u.pathname.endsWith("/compartilhar")){
    e.respondWith((async()=>{
      try{const f=await req.formData();let file=f.get("comprovante");if(!(file instanceof File))file=[...f.values()].find(v=>v instanceof File);
        if(file){const c=await caches.open(SHARE);await c.put(new URL("shared-file",self.registration.scope).href,new Response(file,{headers:{"content-type":file.type||"application/octet-stream","x-name":encodeURIComponent(file.name||"comprovante")}}))}}catch(err){}
      return Response.redirect(new URL("./?compartilhado=1",self.registration.scope).href,303);
    })());return;
  }
  if(req.method!=="GET")return;
  if(req.mode==="navigate"){
    e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(V).then(c=>c.put("./index.html",cp));return r}).catch(()=>caches.match("./index.html")));return;
  }
  if(u.origin===location.origin||/(^|\.)cdnjs\.cloudflare\.com$|^cdn\.jsdelivr\.net$|fonts\.googleapis\.com$|fonts\.gstatic\.com$/.test(u.hostname)){
    e.respondWith(caches.match(req).then(m=>{const net=fetch(req).then(r=>{if(r&&(r.ok||r.type==="opaque")){const cp=r.clone();caches.open(V).then(c=>c.put(req,cp))}return r}).catch(()=>m);return m||net}));
  }
});
