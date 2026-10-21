// Old cache eviction and redirect
if ('caches' in window) {
  caches.keys().then(names => Promise.all(names.map(name => caches.delete(name)))).then(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        for (let r of regs) r.unregister();
        window.location.reload(true);
      });
    } else {
      window.location.reload(true);
    }
  });
} else {
  window.location.reload(true);
}
