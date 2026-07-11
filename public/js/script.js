(() => {
  'use strict';
  document.querySelectorAll('.needs-validation').forEach((form) => {
    form.addEventListener('submit', (event) => {
      if (!form.checkValidity()) { event.preventDefault(); event.stopPropagation(); }
      form.classList.add('was-validated');
    }, false);
  });

  const root = document.documentElement;
  const savedTheme = localStorage.getItem('havennest-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const setTheme = (theme) => { root.dataset.theme = theme; document.querySelectorAll('[data-theme-toggle] i').forEach((icon) => { icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon'; }); };
  setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => button.addEventListener('click', () => { const next = root.dataset.theme === 'dark' ? 'light' : 'dark'; localStorage.setItem('havennest-theme', next); setTheme(next); }));

  const favorites = new Set(JSON.parse(localStorage.getItem('havennest-favorites') || '[]'));
  const syncFavoriteButtons = () => document.querySelectorAll('[data-favorite-id]').forEach((button) => { const active = favorites.has(button.dataset.favoriteId); button.classList.toggle('is-favorite', active); button.setAttribute('aria-pressed', String(active)); button.querySelector('i').className = active ? 'fa-solid fa-heart' : 'fa-regular fa-heart'; });
  document.addEventListener('click', (event) => { const button = event.target.closest('[data-favorite-id]'); if (!button) return; event.preventDefault(); event.stopPropagation(); const id = button.dataset.favoriteId; favorites.has(id) ? favorites.delete(id) : favorites.add(id); localStorage.setItem('havennest-favorites', JSON.stringify([...favorites])); syncFavoriteButtons(); });
  syncFavoriteButtons();

  const mapElement = document.getElementById('map');
  if (mapElement && window.L) {
    const location = mapElement.dataset.location;
    const fallback = [20.5937, 78.9629];
    const createMap = (coords) => {
      const map = L.map(mapElement, { scrollWheelZoom: false }).setView(coords, 9);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
      L.marker(coords).addTo(map).bindPopup('Exact location will be provided after booking').openPopup();
    };
    fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(location)}`)
      .then((response) => response.ok ? response.json() : [])
      .then((data) => createMap(data && data[0] ? [Number(data[0].lat), Number(data[0].lon)] : fallback))
      .catch(() => createMap(fallback));
  }
})();
