// ثبت اولیه Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker: Registered'))
            .catch(err => console.log(`Service Worker: Error: ${err}`));
    });
}

// مختصات مرکز حرم امام رضا (ع)
const mapCenter = [36.288, 59.616];

// سطح زوم اولیه: عدد کمتر = نمای بازتر از شهر
// این همان خطی است که تغییر کرده است
const initialZoom = 13;

// راه‌اندازی نقشه
const map = L.map('map').setView(mapCenter, initialZoom);

// افزودن لایه نقشه از OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// خواندن اطلاعات از فایل locations.json و افزودن نشانگرها
fetch('locations.json')
    .then(response => response.json())
    .then(data => {
        data.forEach(location => {
            let popupContent = `<b>${location.name}</b><p>${location.category}</p>`;
            L.marker(location.coords)
                .addTo(map)
                .bindPopup(popupContent);
        });
    });

// نمایش موقعیت کاربر
map.locate({
    watch: true,
    setView: false, // نقشه به صورت خودکار روی کاربر زوم نکند
    enableHighAccuracy: true
});

let userMarker, userCircle;

function onLocationFound(e) {
    const radius = e.accuracy;
    const userLatLng = e.latlng;

    if (userMarker) {
        userMarker.setLatLng(userLatLng);
        userCircle.setLatLng(userLatLng).setRadius(radius);
    } else {
        userMarker = L.marker(userLatLng).addTo(map)
            .bindPopup(`شما اینجا هستید`).openPopup();
        userCircle = L.circle(userLatLng, radius, {
            color: '#136AEC',
            fillColor: '#136AEC',
            fillOpacity: 0.15,
            weight: 2
        }).addTo(map);
    }
}

function onLocationError(e) {
    alert("امکان دریافت موقعیت مکانی شما وجود ندارد.");
}

map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);
