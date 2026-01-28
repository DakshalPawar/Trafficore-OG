/* ========================================
   AUTHENTICATION SYSTEM (In-Memory Storage)
   ======================================== */

// Demo user database
const users = {
    admin: { password: 'admin123', role: 'Administrator', name: 'Admin User' },
    driver: { password: 'driver123', role: 'Ambulance Driver', name: 'Driver User' }
};

// In-memory storage for current user
let currentUser = null;

/* ========================================
   HLS STREAM CONFIGURATION
   ======================================== */

// Your HLS stream URL (from hospital dashboard)
const HLS_STREAM_URL = "http://192.168.0.175:8000/stream.m3u8";

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
        eta: '4 min',
        lastService: '2024-01-15',
        fuelLevel: '75%',
        authenticated: false
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
        eta: null,
        lastService: '2024-01-20',
        fuelLevel: '90%',
        authenticated: true
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
        eta: '6 min',
        lastService: '2024-01-18',
        fuelLevel: '60%',
        authenticated: true
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

    // Setup detail panel close button
    document.getElementById('closeDetail').addEventListener('click', closeDetailPanel);

    // Setup video modal close button
    document.getElementById('closeVideoModal').addEventListener('click', closeVideoModal);
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
   SIDE DETAIL PANEL
   ======================================== */

function showAmbulanceDetails(ambulance) {
    const detailPanel = document.getElementById('detailPanel');
    const detailContent = document.getElementById('detailContent');

    // Build the detail content HTML
    detailContent.innerHTML = `
        <div class="detail-section">
            <div class="detail-section-title">Vehicle Information</div>
            <div class="detail-info-grid">
                <div class="detail-info-item">
                    <div class="detail-info-label">Ambulance ID</div>
                    <div class="detail-info-value">${ambulance.id}</div>
                </div>
                <div class="detail-info-item">
                    <div class="detail-info-label">Current Status</div>
                    <div class="detail-info-value">
                        <span class="detail-status-indicator ${ambulance.status}">
                            ${ambulance.status.toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">Driver Information</div>
            <div class="detail-info-grid">
                <div class="detail-info-item">
                    <div class="detail-info-label">Driver Name</div>
                    <div class="detail-info-value">${ambulance.driver}</div>
                </div>
                <div class="detail-info-item">
                    <div class="detail-info-label">Contact Number</div>
                    <div class="detail-info-value">${ambulance.phone}</div>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">Location & Route</div>
            <div class="detail-info-grid">
                <div class="detail-info-item">
                    <div class="detail-info-label">Current Location</div>
                    <div class="detail-info-value">${ambulance.location}</div>
                </div>
                ${ambulance.destination ? `
                    <div class="detail-info-item">
                        <div class="detail-info-label">Destination</div>
                        <div class="detail-info-value">${ambulance.destination}</div>
                    </div>
                ` : ''}
                <div class="detail-info-item">
                    <div class="detail-info-label">Current Speed</div>
                    <div class="detail-info-value">${ambulance.speed} km/h</div>
                </div>
                ${ambulance.eta ? `
                    <div class="detail-info-item">
                        <div class="detail-info-label">Estimated Arrival</div>
                        <div class="detail-info-value">${ambulance.eta}</div>
                    </div>
                ` : ''}
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">Vehicle Diagnostics</div>
            <div class="detail-info-grid">
                <div class="detail-info-item">
                    <div class="detail-info-label">Fuel Level</div>
                    <div class="detail-info-value">${ambulance.fuelLevel}</div>
                </div>
                <div class="detail-info-item">
                    <div class="detail-info-label">Last Service</div>
                    <div class="detail-info-value">${ambulance.lastService}</div>
                </div>
                <div class="detail-info-item">
                    <div class="detail-info-label">Authentication Status</div>
                    <div class="detail-info-value">
                        ${ambulance.authenticated ?
        '<span style="color: #00e096;">✓ Verified</span>' :
        '<span style="color: #ffaa00;">⚠ Pending</span>'}
                    </div>
                </div>
            </div>
        </div>

        <div class="detail-section">
            ${!ambulance.authenticated ? `
                <button class="detail-action-btn" onclick="openVideoAuthentication('${ambulance.id}')">
                    🎥 Authenticate Ambulance
                </button>
            ` : `
                <button class="detail-action-btn" style="background: linear-gradient(135deg, #00e096, #00b377);">
                    ✓ Authentication Complete
                </button>
            `}
        </div>
    `;

    // Add the appropriate status class to the indicator
    const statusIndicator = detailContent.querySelector('.detail-status-indicator');
    if (statusIndicator) {
        statusIndicator.classList.add(ambulance.status);
    }

    // Show the panel with slide-in animation
    detailPanel.classList.add('active');
}

function closeDetailPanel() {
    const detailPanel = document.getElementById('detailPanel');
    detailPanel.classList.remove('active');
}

/* ========================================
   RENDER AMBULANCES
   ======================================== */

function renderAmbulances() {
    const grid = document.getElementById('ambulanceGrid');

    grid.innerHTML = ambulances.map((amb, index) => `
        <div class="ambulance-card" onclick="showAmbulanceDetails(ambulances[${index}])">
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
                <div class="info-row">
                    <span class="info-icon">${amb.authenticated ? '✓' : '⚠️'}</span>
                    <span>${amb.authenticated ? 'Authenticated' : 'Authentication Pending'}</span>
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

/* ========================================
   VIDEO AUTHENTICATION WITH REAL HLS STREAM
   Using your working HLS implementation
   ======================================== */

let authTimer;
let authCountdown = 120; // 120 seconds = 2 minutes
let hls = null; // HLS instance

function openVideoAuthentication(ambulanceId) {
    // Find the ambulance
    const ambulance = ambulances.find(amb => amb.id === ambulanceId);
    if (!ambulance) return;

    // Set ambulance details in modal
    document.getElementById('verifyingAmbId').textContent = ambulanceId;
    document.getElementById('feedDriverName').textContent = ambulance.driver;
    document.getElementById('feedVehicleId').textContent = ambulanceId;
    document.getElementById('feedLocation').textContent = ambulance.location;

    // Show the modal
    const videoModal = document.getElementById('videoModal');
    videoModal.classList.add('active');

    // Get video element and loading element
    const video = document.getElementById('authVideoPlayer');
    const videoLoading = document.getElementById('videoLoading');

    // Show loading spinner initially
    videoLoading.classList.remove('hidden');
    video.style.display = 'none';

    // Initialize HLS stream using your working code
    initializeHLSStream(video, videoLoading);

    // Reset countdown to 2 minutes
    authCountdown = 120;
    updateAuthTimer();

    // Start the countdown timer
    authTimer = setInterval(() => {
        authCountdown--;
        updateAuthTimer();

        if (authCountdown <= 0) {
            clearInterval(authTimer);
            alert('⏰ Authentication timeout! The 2-minute window has expired.');
            closeVideoModal();
        }
    }, 1000);

    // Setup approve/deny buttons with proper event listeners
    setupVideoButtons(ambulanceId);
}

/* ========================================
   HLS STREAM INITIALIZATION
   Your working code - DO NOT MODIFY
   ======================================== */

function initializeHLSStream(video, loadingElement) {
    if (video) {
        if (Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(HLS_STREAM_URL);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                // Hide loading spinner
                loadingElement.classList.add('hidden');
                // Show video
                video.style.display = 'block';
                // Play video
                video.play().catch(err => console.error("Autoplay failed:", err));
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            // Safari/iOS native HLS
            video.src = HLS_STREAM_URL;
            video.addEventListener("loadedmetadata", () => {
                // Hide loading spinner
                loadingElement.classList.add('hidden');
                // Show video
                video.style.display = 'block';
                // Play video
                video.play().catch(err => console.error("Play failed:", err));
            });
        } else {
            console.error("❌ Browser does not support HLS streaming.");
            alert("Your browser does not support HLS streaming. Try Chrome/Edge/Firefox with hls.js.");
        }
    }
}

/* ========================================
   SETUP VIDEO BUTTONS - FIXED VERSION
   ======================================== */
function setupVideoButtons(ambulanceId) {
    console.log('Setting up buttons for:', ambulanceId);

    // Get button elements
    const approveBtn = document.getElementById('approveBtn');
    const denyBtn = document.getElementById('denyBtn');

    if (!approveBtn || !denyBtn) {
        console.error('Buttons not found!');
        return;
    }

    // Remove any existing event listeners by cloning and replacing
    const newApproveBtn = approveBtn.cloneNode(true);
    const newDenyBtn = denyBtn.cloneNode(true);
    approveBtn.parentNode.replaceChild(newApproveBtn, approveBtn);
    denyBtn.parentNode.replaceChild(newDenyBtn, denyBtn);

    // Add fresh event listeners with proper logging
    newApproveBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('✅ Approve button clicked!');
        approveAuthentication(ambulanceId);
    });

    newDenyBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('❌ Deny button clicked!');
        denyAuthentication(ambulanceId);
    });

    console.log('✓ Buttons set up successfully');
}

/* ========================================
   TIMER UPDATE
   ======================================== */

function updateAuthTimer() {
    // Calculate minutes and seconds
    const minutes = Math.floor(authCountdown / 60);
    const seconds = authCountdown % 60;

    // Update timer display
    document.getElementById('videoTimer').textContent =
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('authTimeRemaining').textContent = `${authCountdown}s`;

    // Update progress bar (2 minutes = 120 seconds)
    const progressPercent = (authCountdown / 120) * 100;
    document.getElementById('progressFill').style.width = `${progressPercent}%`;
}

/* ========================================
   APPROVAL - WITH POPUP
   ======================================== */
function approveAuthentication(ambulanceId) {
    console.log('Approving:', ambulanceId);

    // Find and update ambulance
    const ambulance = ambulances.find(amb => amb.id === ambulanceId);
    if (ambulance) {
        ambulance.authenticated = true;

        // Close modal first
        closeVideoModal();

        // Show success popup with custom styling
        showAuthPopup('success', `
            <div style="text-align: center;">
                <div style="font-size: 60px; margin-bottom: 20px;">✅</div>
                <h2 style="color: #00e096; margin-bottom: 10px;">Access Granted!</h2>
                <p style="font-size: 18px; margin-bottom: 10px;">
                    Ambulance <strong>${ambulanceId}</strong> has been authenticated successfully!
                </p>
                <p style="color: #8f9bb3; font-size: 14px;">
                    Driver: ${ambulance.driver}
                </p>
            </div>
        `);

        // Update UI
        setTimeout(() => {
            renderAmbulances();

            // If detail panel is open, refresh it
            const detailPanel = document.getElementById('detailPanel');
            if (detailPanel.classList.contains('active')) {
                showAmbulanceDetails(ambulance);
            }
        }, 500);
    }
}

/* ========================================
   DENIAL - WITH POPUP
   ======================================== */
function denyAuthentication(ambulanceId) {
    console.log('Denying:', ambulanceId);

    // Show confirmation first
    if (confirm(`Are you sure you want to DENY access to ${ambulanceId}?`)) {

        // Close modal first
        closeVideoModal();

        // Show denial popup with custom styling
        showAuthPopup('error', `
            <div style="text-align: center;">
                <div style="font-size: 60px; margin-bottom: 20px;">❌</div>
                <h2 style="color: #ff3d71; margin-bottom: 10px;">Access Denied!</h2>
                <p style="font-size: 18px; margin-bottom: 10px;">
                    Authentication denied for <strong>${ambulanceId}</strong>
                </p>
                <p style="color: #8f9bb3; font-size: 14px;">
                    System access has been restricted
                </p>
            </div>
        `);
    }
}

/* ========================================
   CUSTOM POPUP FUNCTION - NEW!
   ======================================== */
function showAuthPopup(type, content) {
    // Create popup overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        animation: fadeIn 0.3s ease;
    `;

    // Create popup box
    const popup = document.createElement('div');
    const bgColor = type === 'success' ? '#1e2139' : '#1e2139';
    const borderColor = type === 'success' ? '#00e096' : '#ff3d71';

    popup.style.cssText = `
        background: ${bgColor};
        border: 3px solid ${borderColor};
        border-radius: 20px;
        padding: 40px;
        max-width: 500px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        animation: slideUp 0.4s ease;
    `;
    popup.innerHTML = content;

    // Add button
    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.style.cssText = `
        margin-top: 30px;
        padding: 14px 40px;
        background: linear-gradient(135deg, ${type === 'success' ? '#00e096, #00b377' : '#ff3d71, #cc0040'});
        border: none;
        border-radius: 10px;
        color: white;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        width: 100%;
        transition: transform 0.2s;
    `;

    okButton.onmouseover = () => okButton.style.transform = 'translateY(-2px)';
    okButton.onmouseout = () => okButton.style.transform = 'translateY(0)';

    okButton.onclick = () => {
        overlay.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => overlay.remove(), 300);
    };

    popup.appendChild(okButton);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Auto close after 4 seconds
    setTimeout(() => {
        if (overlay.parentNode) {
            overlay.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => overlay.remove(), 300);
        }
    }, 4000);
}

/* ========================================
   CLOSE VIDEO MODAL - ENHANCED
   ======================================== */
function closeVideoModal() {
    console.log('Closing video modal...');

    // Stop timer
    if (authTimer) {
        clearInterval(authTimer);
        authTimer = null;
    }

    // Stop and cleanup HLS stream
    const video = document.getElementById('authVideoPlayer');
    if (video) {
        video.pause();
        video.src = '';
        video.style.display = 'none';
        video.load();
    }

    if (hls) {
        hls.destroy();
        hls = null;
    }

    // Show loading spinner again for next time
    const videoLoading = document.getElementById('videoLoading');
    if (videoLoading) {
        videoLoading.classList.remove('hidden');
    }

    // Hide modal
    const videoModal = document.getElementById('videoModal');
    if (videoModal) {
        videoModal.classList.remove('active');
    }

    console.log('✓ Video modal closed successfully');
}

/* ========================================
   ADD CSS ANIMATIONS
   Add this to your <head> or styles
   ======================================== */
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(animationStyles);
