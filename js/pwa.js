// robust SW registration for GitHub Pages (project pages + user pages)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const parts = window.location.pathname.split('/').filter(Boolean);
    // project pages: ['', 'repo', ...] → base='/<repo>/' ; user pages: '/' → base='/'
    const base = parts.length ? `/${parts[0]}/` : '/';
    const swUrl = `${base}sw.js`;
    navigator.serviceWorker.register(swUrl, { scope: base }).catch(console.error);
  });
}
  