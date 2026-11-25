const CACHE_NAME = "typing-jobs-pwa-v1.1";
const STATIC_ASSETS = [
    "./",
    "./index.html",
    "./app.js",
    "./manifest.json",
    "./logo.svg",
    "./icon-192.png",
    "./apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.allSettled(
                STATIC_ASSETS.map((url) => cache.add(url))
            );
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const req = event.request;
    if (req.method !== "GET") return;

    const url = new URL(req.url);

    // Firebase Realtime Database API রিকোয়েস্ট ক্যাশ না করে সরাসরি নেটওয়ার্কে পাঠানো
    if (url.hostname.includes("firebasedatabase.app")) {
        return;
    }

    if (req.mode === "navigate") {
        event.respondWith(
            fetch(req)
                .then((res) => {
                    const copy = res.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", copy));
                    return res;
                })
                .catch(() => caches.match("./index.html").then((cached) => cached || caches.match("./")))
        );
        return;
    }

    event.respondWith(
        caches.match(req).then((cached) => {
            if (cached) return cached;

            return fetch(req)
                .then((res) => {
                    if (!res || res.status !== 200 || res.type === "opaque") {
                        return res;
                    }
                    const copy = res.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
                    return res;
                })
                .catch(() => caches.match("./index.html"));
        })
    );
});
