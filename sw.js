const CACHE="industools-v7-seo";
const ASSETS=["./", "./index.html", "./style.css", "./script.js", "./privacy.html", "./legal.html", "./offline.html", "./favicon-32.png", "./apple-touch-icon.png", "./icon-192.png", "./icon-512.png", "./calculadora-4-20-ma.html", "./escalado-siemens-27648.html", "./pt100-resistencia-temperatura.html", "./modbus-float.html", "./s5time-step7.html", "./calculadora-ipv4-cidr.html", "./potencia-trifasica.html", "./par-motor.html", "./ley-ohm.html", "./conversor-binario-decimal-hex.html"];

self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match("./offline.html"))))});
