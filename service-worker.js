try {
  importScripts('functions.js', 'background.js');
} catch (e) {
  console.error('Service Worker loading error:', e);
}
