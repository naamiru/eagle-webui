declare let self: ServiceWorkerGlobalScope;

self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  console.log(`Fetched resource: ${url}`);
});

self.addEventListener("install", () => {
  console.log("PWD: install");
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  console.log("PWD: activate");
});

export {};
