// Al instalar el Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalado.');
});

// Al activar el Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activado.');
});
