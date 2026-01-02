/* ========================================
   AUTHENTICATION SYSTEM (In-Memory Storage)
   ======================================== */

// Demo user database
const users = {
    admin: { password: 'admin123', role: 'Administrator', name: 'Admin User' },
    driver: { password: 'driver123', role: 'Ambulance Driver', name: 'Driver User' }
};

// In-memory storage for current user (replaces sessionStorage)
let currentUser = null;

/* ========================================
   DATA: Real Malad Area Locations
   ======================================== */

const hospitals = [
    {
        name: 'Shree Sai Hospital',
        lat: 19.1861,
        lng: 72.8362,
        beds: 15,
        status: 'available',
        address: 'Malad West, Mumbai',
        phone: '+91 22 2844 5566'
    },
    {
        name: 'Oscar Hospital',
        lat: 19.1779,
        lng: 72.8345,
        beds: 8,
        status: 'available',
        address: 'Orlem, Malad West',
        phone: '+91 22 2888 2233'
    },
    {
        name: 'Bhaktivedanta Hospital',
        lat: 19.1955,
        lng: 72.8389,
        beds: 20,
        status: 'available',
        address: 'Mith Chowky, Malad East',
        phone: '+91 22 2880 8900'
    },
    {
        name: 'Apex Hospital',
        lat: 19.1734,
        lng: 72.8313,
        beds: 5,
        status: 'limited',
        address: 'Mindspace, Malad',
        phone: '+91 22 2844 7788'
    },
    {
        name: 'Lifeline Hospital',
        lat: 19.1912,
        lng: 72.8425,
        beds: 12,
        status: 'available',
        address: 'Malad East, Mumbai',
        phone: '+91 22 2888 5544'
    },
    {
        name: 'Riddhi Vinayak Hospital',
        lat: 19.1668,
        lng: 72.8285,
        beds: 10,
        status: 'available',
        address: 'Marve Road, Malad',
        phone: '+91 22 2844 9900'
    }
];

const ambulances = [
    {
        id: 'AMB-001',
        driver: 'Rajesh Kumar',
        phone: '+91 98765 43210',
        status: 'emergency',
        lat: 19.1850,
        lng: 72.8370,
        location: 'Near Infinity Mall, Malad',
        destination: 'Shree Sai Hospital',
        speed: 65,
        eta: '4 min'
    },
    {
        id: 'AMB-002',
        driver: 'Priya Sharma',
        phone: '+91 98765 43211',
        status: 'available',
        lat: 19.1780,
        lng: 72.8350,
        location: 'Orlem Church Area',
        destination: null,
        speed: 0,
        eta: null
    },
    {
        id: 'AMB-003',
        driver: 'Amit Patel',
        phone: '+91 98765 43212',
        status: 'emergency',
        lat: 19.1920,
        lng: 72.8400,
        location: 'Malad East Market',
        destination: 'Bhaktivedanta Hospital',
        speed: 55,
        eta: '6 min'
    }
];

/* ========================================
   LOGIN HANDLER
   ======================================== */

function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Check credentials
    if (users[username] && users[username].password === password) {
        // Store user in memory
        currentUser = {
            username: username,
            role: users[username].role,
            name: users[username].name
        };

        // Show main app
        document.getElementById('loginContainer').classList.add('hidden');
        document.getElementById('appContainer').style.display = 'flex';

        // Update profile
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userRole').textContent = currentUser.role;

        // Initialize map
        setTimeout(initMap, 100);
    } else {
        alert('Invalid credentials! Please try again.');
    }
}

/* ========================================
   LOGOUT HANDLER
   ======================================== */

function handleLogout() {
    currentUser = null;
    document.getElementById('loginContainer').classList.remove('hidden');
    document.getElementById('appContainer').style.display = 'none';
    document.getElementById('loginForm').reset();
}

/* ========================================
   MAP INITIALIZATION
   ======================================== */

let map;
let markers = [];

function initMap() {
    if (map) {
        map.remove();
    }

    // Create map centered on Malad
    map = L.map('map').setView([19.1860, 72.8360], 14);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Add hospital markers
    hospitals.forEach(hospital => {
        const marker = L.marker([hospital.lat, hospital.lng], {
            icon: L.divIcon({
                className: 'custom-hospital-icon',
                html: '<div style="background: #00e096; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 12px rgba(0, 224, 150, 0.5);">🏥</div>',
                iconSize: [30, 30]
            })
        }).addTo(map);

        marker.bindPopup(`
            <div class="popup-content">
                <div class="popup-title">${hospital.name}</div>
                <div class="popup-info">📍 ${hospital.address}</div>
                <div class="popup-info">🛏️ ${hospital.beds} beds available</div>
                <div class="popup-info">📞 ${hospital.phone}</div>
            </div>
        `, { className: 'custom-popup' });

        markers.push(marker);
    });

    // Add ambulance markers
    ambulances.forEach(ambulance => {
        const marker = L.marker([ambulance.lat, ambulance.lng], {
            icon: L.divIcon({
                className: 'custom-ambulance-icon',
                html: '<div style="background: #ff3d71; width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 4px 12px rgba(255, 61, 113, 0.6); animation: pulse 2s infinite;">🚑</div>',
                iconSize: [35, 35]
            })
        }).addTo(map);

        marker.bindPopup(`
            <div class="popup-content">
                <div class="popup-title">${ambulance.id}</div>
                <div class="popup-info">👤 Driver: ${ambulance.driver}</div>
                <div class="popup-info">📍 ${ambulance.location}</div>
                <div class="popup-info">📞 ${ambulance.phone}</div>
                ${ambulance.destination ? `<div class="popup-info">🎯 Going to: ${ambulance.destination}</div>` : ''}
                ${ambulance.eta ? `<div class="popup-info">⏱️ ETA: ${ambulance.eta}</div>` : ''}
            </div>
        `, { className: 'custom-popup' });

        markers.push(marker);
    });
}

/* ========================================
   NAVIGATION SYSTEM
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Setup login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    // Setup logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Setup navigation
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all
            navItems.forEach(i => i.classList.remove('active'));

            // Add active to clicked
            item.classList.add('active');

            // Get page to show
            const page = item.getAttribute('data-page');

            // Hide all pages
            document.querySelectorAll('.page-section').forEach(section => {
                section.classList.remove('active');
            });

            // Show selected page
            document.getElementById(page).classList.add('active');

            // Refresh map if needed
            if (page === 'live-map' && map) {
                setTimeout(() => {
                    map.invalidateSize();
                }, 100);
            }
        });
    });

    // Start clock
    updateClock();
    setInterval(updateClock, 1000);

    // Render cards
    renderAmbulances();
    renderHospitals();
});

/* ========================================
   CLOCK UPDATE
   ======================================== */

function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const element = document.getElementById('currentTime');
    if (element) {
        element.textContent = timeString;
    }
}

/* ========================================
   RENDER AMBULANCES
   ======================================== */

function renderAmbulances() {
    const grid = document.getElementById('ambulanceGrid');

    grid.innerHTML = ambulances.map(amb => `
        <div class="ambulance-card">
            <div class="card-header">
                <div>
                    <div class="card-title">${amb.id}</div>
                    <div class="card-subtitle">${amb.driver}</div>
                </div>
                <span class="status-badge ${amb.status}">${amb.status.toUpperCase()}</span>
            </div>
            
            <div class="card-info">
                <div class="info-row">
                    <span class="info-icon">📍</span>
                    <span>${amb.location}</span>
                </div>
                <div class="info-row">
                    <span class="info-icon">📞</span>
                    <span>${amb.phone}</span>
                </div>
                ${amb.destination ? `
                    <div class="info-row">
                        <span class="info-icon">🎯</span>
                        <span>Destination: ${amb.destination}</span>
                    </div>
                ` : ''}
                ${amb.eta ? `
                    <div class="info-row">
                        <span class="info-icon">⏱️</span>
                        <span>ETA: ${amb.eta}</span>
                    </div>
                ` : ''}
                <div class="info-row">
                    <span class="info-icon">🚀</span>
                    <span>Speed: ${amb.speed} km/h</span>
                </div>
            </div>
        </div>
    `).join('');
}

/* ========================================
   RENDER HOSPITALS
   ======================================== */

function renderHospitals() {
    const grid = document.getElementById('hospitalGrid');

    grid.innerHTML = hospitals.map(hospital => `
        <div class="hospital-card">
            <div class="card-header">
                <div>
                    <div class="card-title">${hospital.name}</div>
                    <div class="card-subtitle">${hospital.address}</div>
                </div>
                <span class="status-badge ${hospital.status}">${hospital.status.toUpperCase()}</span>
            </div>
            
            <div class="card-info">
                <div class="info-row">
                    <span class="info-icon">🛏️</span>
                    <span>${hospital.beds} beds available</span>
                </div>
                <div class="info-row">
                    <span class="info-icon">📞</span>
                    <span>${hospital.phone}</span>
                </div>
                <div class="info-row">
                    <span class="info-icon">📍</span>
                    <span>${hospital.address}</span>
                </div>
            </div>
        </div>
    `).join('');
}

