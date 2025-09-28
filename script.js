// ثبت اولیه Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js');
    });
}

// ابعاد واقعی عکس نقشه شما (عرض و ارتفاع به پیکسل)
const mapWidth = 2338;
const mapHeight = 1700;

// راه‌اندازی نقشه
const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -2
});

const bounds = [[0, 0], [-mapHeight, mapWidth]];
map.fitBounds(bounds);

// قرار دادن عکس نقشه روی صفحه
L.imageOverlay('map.jpg', bounds).addTo(map);

// خواندن اطلاعات از فایل locations.json و افزودن نشانگرها
fetch('locations.json')
    .then(response => response.json())
    .then(data => {
        data.forEach(location => {
            let popupContent = `<b>${location.name}</b><br>${location.category}`;
            L.marker(location.coords)
                .addTo(map)
                .bindPopup(popupContent);
        });
    });