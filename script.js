// DATA
const ambulances = [
    {
        id: 'AMB-001',
        driver: 'Rajesh Kumar',
        phone: '+91 98765 43210',
        status: 'emergency',
        location: { lat: 22.07, lng: 82.15, name: 'Sector 6, Bilaspur' },
        destination: 'Apollo Hospital',
        speed: 65,
        eta: '4 min',
        patient: 'Heart Attack - Male, 58',
        assignedHospital: 'Apollo Hospital',
        route: [
            { name: 'Ring Road Junction', status: 'cleared', time: '2 min' },
            { name: 'Main Square Signal', status: 'priority', time: '3 min' },
            { name: 'Hospital Gate', status: 'pending', time: '4 min' }
        ]
    },
    {
        id: 'AMB-002',
        driver: 'Priya Sharma',
        phone: '+91 98765 43211',
        status: 'active',
        location: { lat: 22.09, lng: 82.17, name: 'Civil Lines' },
        destination: 'City Hospital',
        speed: 45,
        eta: '7 min',
        patient: 'Accident - Female, 32',
        assignedHospital: 'City Hospital',
        route: [
            { name: 'Railway Crossing', status: 'cleared', time: '3 min' },
            { name: 'Gandhi Chowk', status: 'priority', time: '5 min' },
            { name: 'Hospital Road', status: 'pending', time: '7 min' }
        ]
    },
    {
        id: 'AMB-003',
        driver: 'Amit Patel',
        phone: '+91 98765 43212',
        status: 'available',
        location: { lat: 22.05, lng: 82.13, name: 'Station Road' },
        destination: null,
        speed: 0,
        eta: null,
        patient: null,
        assignedHospital: null,
        route: []
    },
    {
        id: 'AMB-004',
        driver: 'Sunita Verma',
        phone: '+91 98765 43213',
        status: 'active',
        location: { lat: 22.11, lng: 82.19, name: 'Vyapar Vihar' },
        destination: 'Max Hospital',
        speed: 50,
        eta: '6 min',
        patient: 'Stroke - Male, 65',
        assignedHospital: 'Max Hospital',
        route: [
            { name: 'Bypass Road', status: 'cleared', time: '2 min' },
            { name: 'Industrial Area', status: 'priority', time: '4 min' },
            { name: 'Max Hospital Gate', status: 'pending', time: '6 min' }
        ]
    },
    {
        id: 'AMB-005',
        driver: 'Vijay Singh',
        phone: '+91 98765 43214',
        status: 'offline',
        location: { lat: 22.06, lng: 82.14, name: 'Depot Area' },
        destination: null,
        speed: 0,
        eta: null,
        patient: null,
        assignedHospital: null,
        route: []
    }
];

const stats = [
    { title: 'Active Ambulances', value: '3', change: '+2', icon: '🚑', gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)' },
    { title: 'Emergency Calls', value: '12', change: '+5', icon: '⚠️', gradient: 'linear-gradient(135deg, #ef4444, #ec4899)' },
    { title: 'Avg Response Time', value: '4.2m', change: '-0.8m', icon: '⏱️', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
    { title: 'Available Units', value: '2', change: '-1', icon: '✓', gradient: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }
];

const hospitals = [
    { name: 'Apollo Hospital', beds: 12, status: 'available', distance: '2.3 km' },
    { name: 'City Hospital', beds: 5, status: 'limited', distance: '3.1 km' },
    { name: 'Max Hospital', beds: 8, status: 'available', distance: '4.5 km' },
    { name: 'AIIMS Bilaspur', beds: 15, status: 'available', distance: '6.2 km' }
];

// STATE
let currentPage = 'dashboard';
let currentFilter = 'all';
let selectedAmbulance = null;

// INITIALIZE
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initClock();
    renderStats();
    renderDashboard();
    renderAmbulances();
    renderHospitals();
    initMap();
    initDetailPanel();
    initFilters();
});

// NAVIGATION
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const page = item.getAttribute('data-page');
            showPage(page);
        });
    });
}

function showPage(page) {
    currentPage = page;
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(page).classList.add('active');
}

// CLOCK
function initClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('currentTime').textContent = timeString;
}

// STATS
function renderStats() {
    const grid = document.getElementById('statsGrid');
    grid.innerHTML = stats.map(stat => `
        <div class="stat-card">
            <div class="stat-header">
                <div class="stat-title">${stat.title}</div>
                <div class="stat-icon" style="background: ${stat.gradient}">
                    ${stat.icon}
                </div>
            </div>
            <div class="stat-value">${stat.value}</div>
            <div class="stat-change ${stat.change.startsWith('+') ? 'positive' : 'negative'}">
                ${stat.change} from last hour
            </div>
        </div>
    `).join('');
}

// DASHBOARD
function renderDashboard() {
    const activeEmergencies = ambulances.filter(a => a.status === 'emergency' || a.status === 'active');
    const container = document.getElementById('activeEmergencies');

    container.innerHTML = activeEmergencies.map(amb => `
        <div class="emergency-item" onclick="openDetailPanel('${amb.id}')">
            <div class="emergency-left">
                <div class="emergency-icon ${amb.status}" style="background: ${getStatusColor(amb.status)}">
                    🚑
                </div>
                <div class="emergency-info">
                    <h3>${amb.id}</h3>
                    <p>${amb.driver} • ${amb.patient}</p>
                </div>
            </div>
            <div class="emergency-right">
                <div class="emergency-eta">
                    <div class="emergency-eta-label">ETA</div>
                    <div class="emergency-eta-value">${amb.eta}</div>
                </div>
                <span class="status-badge ${amb.status}">${amb.status.toUpperCase()}</span>
            </div>
        </div>
    `).join('');
}

// AMBULANCES
function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderAmbulances();
        });
    });
}

function renderAmbulances() {
    const filtered = currentFilter === 'all'
        ? ambulances
        : ambulances.filter(a => a.status === currentFilter);

    const container = document.getElementById('ambulanceList');
    container.innerHTML = filtered.map(amb => `
        <div class="ambulance-card" onclick="openDetailPanel('${amb.id}')">
            <div class="ambulance-avatar" style="background: ${getStatusColor(amb.status)}">
                🚑
            </div>
            <div class="ambulance-info">
                <div class="ambulance-id">${amb.id}</div>
                <div class="ambulance-driver">👤 ${amb.driver}</div>
                <div class="ambulance-location">
                    📍 ${amb.location.name}
                </div>
            </div>
            <div class="ambulance-meta">
                ${amb.eta ? `
                    <div class="ambulance-eta">
                        <div class="ambulance-eta-label">ETA</div>
                        <div class="ambulance-eta-value">${amb.eta}</div>
                    </div>
                ` : ''}
                <span class="status-badge ${amb.status}">${amb.status.toUpperCase()}</span>
            </div>
        </div>
    `).join('');
}

// HOSPITALS
function renderHospitals() {
    const grid = document.getElementById('hospitalGrid');
    grid.innerHTML = hospitals.map(hospital => `
        <div class="hospital-card">
            <div class="hospital-header">
                <div class="hospital-info">
                    <h3>${hospital.name}</h3>
                    <div class="hospital-distance">${hospital.distance} away</div>
                </div>
                <div class="hospital-icon">🏥</div>
            </div>
            <div class="hospital-footer">
                <div>
                    <div class="hospital-beds-label">Available Beds</div>
                    <div class="hospital-beds-value">${hospital.beds}</div>
                </div>
                <span class="status-badge ${hospital.status}">${hospital.status.toUpperCase()}</span>
            </div>
        </div>
    `).join('');
}

// MAP
function initMap() {
    const canvas = document.getElementById('mapCanvas');
    const ctx = canvas.getContext('2d');
    const markersContainer = document.getElementById('mapMarkers');

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Draw grid background
    drawMapGrid(ctx, canvas.width, canvas.height);

    // Draw roads
    drawRoads(ctx, canvas.width, canvas.height);

    // Place markers
    placeMarkers(markersContainer, canvas.width, canvas.height);
}

function drawMapGrid(ctx, width, height) {
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.3)';
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x < width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

function drawRoads(ctx, width, height) {
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
    ctx.lineWidth = 3;

    // Main roads
    const roads = [
        [[0, height * 0.3], [width, height * 0.3]],
        [[0, height * 0.6], [width, height * 0.6]],
        [[width * 0.3, 0], [width * 0.3, height]],
        [[width * 0.7, 0], [width * 0.7, height]]
    ];

    roads.forEach(road => {
        ctx.beginPath();
        ctx.moveTo(road[0][0], road[0][1]);
        ctx.lineTo(road[1][0], road[1][1]);
        ctx.stroke();
    });
}

function placeMarkers(container, width, height) {
    container.innerHTML = '';

    ambulances.forEach(amb => {
        // Convert lat/lng to pixel coordinates
        const x = ((amb.location.lng - 82.13) * 3000 + 50) * width / 100;
        const y = ((22.10 - amb.location.lat) * 3000 + 50) * height / 100;

        const marker = document.createElement('div');
        marker.className = `ambulance-marker ${amb.status}`;
        marker.style.left = `${x}px`;
        marker.style.top = `${y}px`;
        marker.innerHTML = `
            🚑
            <div class="marker-label">${amb.id}</div>
        `;
        marker.onclick = () => openDetailPanel(amb.id);

        container.appendChild(marker);
    });
}

// DETAIL PANEL
function initDetailPanel() {
    document.getElementById('closeDetail').addEventListener('click', closeDetailPanel);
}

function openDetailPanel(ambulanceId) {
    selectedAmbulance = ambulances.find(a => a.id === ambulanceId);
    if (!selectedAmbulance) return;

    const panel = document.getElementById('detailPanel');
    const content = document.getElementById('detailContent');

    content.innerHTML = `
        <div class="detail-avatar" style="background: ${getStatusColor(selectedAmbulance.status)}">
            🚑
        </div>
        <div class="detail-id">${selectedAmbulance.id}</div>
        <div class="detail-status">
            <span class="status-badge ${selectedAmbulance.status}">
                ${selectedAmbulance.status.toUpperCase()}
            </span>
        </div>
        
        <div class="detail-section">
            <div class="detail-section-title">Driver Information</div>
            <div class="detail-item">
                <span class="detail-item-icon">👤</span>
                <span class="detail-item-text">${selectedAmbulance.driver}</span>
            </div>
            <div class="detail-item">
                <span class="detail-item-icon">📞</span>
                <span class="detail-item-text">${selectedAmbulance.phone}</span>
            </div>
        </div>
        
        <div class="detail-section">
            <div class="detail-section-title">Current Location</div>
            <div class="detail-item">
                <span class="detail-item-icon">📍</span>
                <span class="detail-item-text">${selectedAmbulance.location.name}</span>
            </div>
        </div>
        
        ${selectedAmbulance.patient ? `
            <div class="detail-section">
                <div class="detail-section-title">Emergency Details</div>
                <div class="detail-item">
                    <span class="detail-item-icon">🚨</span>
                    <span class="detail-item-text">${selectedAmbulance.patient}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-item-icon">🏥</span>
                    <span class="detail-item-text">${selectedAmbulance.destination}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-item-icon">⏱️</span>
                    <span class="detail-item-text">ETA: ${selectedAmbulance.eta}</span>
                </div>
            </div>
            
            <div class="detail-section">
                <div class="detail-section-title">Route & Traffic Signals</div>
                ${selectedAmbulance.route.map(point => `
                    <div class="route-item">
                        <div class="route-icon">
                            ${point.status === 'cleared' ? '✅' :
        point.status === 'priority' ? '⚠️' : '⏳'}
                        </div>
                        <div class="route-info">
                            <div class="route-name">${point.name}</div>
                            <div class="route-details">
                                <span class="route-time">${point.time}</span>
                                <span class="route-status ${point.status}">
                                    ${point.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        <div class="detail-section">
            <div class="detail-section-title">Current Speed</div>
            <div class="speed-display">
                <div class="speed-value">${selectedAmbulance.speed}</div>
                <div class="speed-unit">km/h</div>
            </div>
        </div>
    `;

    panel.classList.add('open');
}

function closeDetailPanel() {
    document.getElementById('detailPanel').classList.remove('open');
    selectedAmbulance = null;
}

// UTILITY FUNCTIONS
function getStatusColor(status) {
    const colors = {
        available: '#10b981',
        active: '#06b6d4',
        emergency: '#ef4444',
        offline: '#64748b'
    };
    return colors[status] || colors.offline;
}

// Update map when window resizes
window.addEventListener('resize', () => {
    if (currentPage === 'live-map') {
        initMap();
    }
});