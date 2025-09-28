// ثبت اولیه Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js');
    });
}

const mapCenter = [36.288, 59.616];
const initialZoom = 13;

const map = L.map('map').setView(mapCenter, initialZoom);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// متغیرهایی برای ذخیره موقعیت کاربر و کنترل مسیریابی
let userLatLng = null;
let routingControl = null;

// خواندن اطلاعات اماکن و افزودن نشانگرها
fetch('locations.json')
    .then(response => response.json())
    .then(data => {
        data.forEach(location => {
            let marker = L.marker(location.coords).addTo(map);
            
            const popupContent = `
                <b>${location.name}</b>
                <p>${location.category}</p>
                <button class="route-button" data-lat="${location.coords[0]}" data-lng="${location.coords[1]}">مسیریابی به اینجا</button>
            `;
            marker.bindPopup(popupContent);
        });
    });

// تابع برای شروع یا به‌روزرسانی مسیریابی
function startRouting(start, end) {
    if (routingControl) {
        map.removeControl(routingControl);
    }

    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(start),
            L.latLng(end)
        ],
        routeWhileDragging: false,
        language: 'fa',
        geocoder: null,
        router: L.Routing.osrmv1({
            serviceUrl: `https://router.project-osrm.org/route/v1`
        }),
        createMarker: function() { return null; }
    }).addTo(map);
}

// ---- بخش مدیریت موقعیت کاربر ----
let userMarker = null;

function onLocationFound(e) {
    userLatLng = e.latlng;

    if (!userMarker) {
        let userIcon = L.divIcon({
            className: 'user-location-marker',
            iconSize: [20, 20]
        });
        userMarker = L.marker(userLatLng, { icon: userIcon }).addTo(map);
    } else {
        userMarker.setLatLng(userLatLng);
    }
}

function onLocationError(e) {
    alert("امکان دریافت موقعیت مکانی شما وجود ندارد. لطفا GPS را فعال کنید.");
}

// درخواست مداوم موقعیت کاربر
map.locate({
    watch: true,
    setView: false,
    enableHighAccuracy: true
}).on('locationfound', onLocationFound).on('locationerror', onLocationError);

// ---- کد جدید برای دکمه موقعیت من ----
const locateBtn = document.getElementById('locate-btn');
locateBtn.addEventListener('click', () => {
    if (userLatLng) {
        // با یک انیمیشن نرم، به موقعیت کاربر برو
        map.flyTo(userLatLng, 17); // عدد 17 سطح زوم است
    } else {
        alert("هنوز موقعیت شما پیدا نشده است. لطفا کمی صبر کنید.");
    }
});

// رویداد برای دکمه‌های مسیریابی داخل پاپ‌آپ‌ها
map.on('popupopen', function(e) {
    const btn = e.popup._container.querySelector('.route-button');
    if (btn) {
        btn.addEventListener('click', function() {
            if (userLatLng) {
                const lat = this.dataset.lat;
                const lng = this.dataset.lng;
                startRouting(userLatLng, [lat, lng]);
                map.closePopup();
            } else {
                alert("ابتدا باید موقعیت مکانی شما پیدا شود.");
            }
        });
    }
});
