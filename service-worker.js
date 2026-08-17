const CACHE='spendwise-offline-v20';
const ASSETS=['./','./index.html','./manifest.json','./icon.svg','https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js'];
const CATEGORY_OLD="{name:'Room Rent',icon:'🏠'}, {name:'Clothing',icon:'👕'}, {name:'Souvenirs & Gifts',icon:'🎁'}, {name:'Aquascape & Fish',icon:'🐠'},";
const CATEGORY_NEW="{name:'Room Rent',icon:'🏠'}, {name:'Clothing',icon:'👕'}, {name:'Aquascape & Fish',icon:'🐠'}, {name:'Souvenirs & Gifts',icon:'🎁'}, {name:'Bus Ticket',icon:'🚌'}, {name:'Car Fuel',icon:'⛽'},";
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(fetch(event.request).then(async response=>{
    if(response.ok&&(event.request.mode==='navigate'||(response.headers.get('content-type')||'').includes('text/html'))){
      const text=await response.text();
      const updated=text.replace(CATEGORY_OLD,CATEGORY_NEW);
      const headers=new Headers(response.headers);headers.delete('content-length');
      const modified=new Response(updated,{status:response.status,statusText:response.statusText,headers});
      caches.open(CACHE).then(cache=>cache.put(event.request,modified.clone()));
      return modified;
    }
    const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response;
  }).catch(()=>caches.match(event.request).then(hit=>hit||caches.match('./index.html'))));
});
