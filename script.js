/**
 * ═══════════════════════════════════════════════════════════
 *  TRAFFICORE – Emergency Medical Coordination System
 *  script.js  |  Ambulance-to-Hospital Data Transfer Logic
 * ═══════════════════════════════════════════════════════════
 */

'use strict';

// ── Transmission counter ─────────────────────────────────────
let transmissionCount = 0;

// ═══════════════════════════════════════════════════════════
// LIVE CLOCK
// Updates every second in the header
// ═══════════════════════════════════════════════════════════
function startClock() {
    const clockEl = document.getElementById('live-clock');
    const dateEl  = document.getElementById('live-date');

    function tick() {
        const now = new Date();

        // Format HH:MM:SS
        const h  = String(now.getHours()).padStart(2, '0');
        const m  = String(now.getMinutes()).padStart(2, '0');
        const s  = String(now.getSeconds()).padStart(2, '0');
        clockEl.textContent = `${h}:${m}:${s}`;

        // Format "Mon 17 Jun 2025"
        dateEl.textContent = now.toLocaleDateString('en-IN', {
            weekday: 'short', day: '2-digit',
            month: 'short', year: 'numeric'
        });
    }

    tick(); // immediate call
    setInterval(tick, 1000);
}

// ═══════════════════════════════════════════════════════════
// VALIDATION HELPERS
// ═══════════════════════════════════════════════════════════

/**
 * Show inline validation error
 * @param {string} id   - Error span ID
 * @param {string} msg  - Error message (empty = clear)
 */
function setError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
}

/** Clear all validation errors */
function clearErrors() {
    ['err-name', 'err-phone', 'err-age', 'err-desc'].forEach(id => setError(id, ''));
}

/**
 * Validate the ambulance form
 * @returns {boolean} - True if valid
 */
function validateForm() {
    let valid = true;
    clearErrors();

    const name = document.getElementById('p-name').value.trim();
    const phone = document.getElementById('p-phone').value.trim();
    const age   = document.getElementById('p-age').value.trim();
    const desc  = document.getElementById('i-desc').value.trim();

    if (!name) {
        setError('err-name', '⚠ Full name is required');
        valid = false;
    }

    if (!phone) {
        setError('err-phone', '⚠ Phone number is required');
        valid = false;
    }

    if (!age || isNaN(age) || age < 0 || age > 120) {
        setError('err-age', '⚠ Enter a valid age (0–120)');
        valid = false;
    }

    if (!desc) {
        setError('err-desc', '⚠ Incident description is required');
        valid = false;
    }

    return valid;
}

// ═══════════════════════════════════════════════════════════
// VITALS AUTO-DETECTION
// Classifies each vital and overall emergency level
// ═══════════════════════════════════════════════════════════

/**
 * Assess Heart Rate
 * Normal: 60–100 | Warning: 101–130 or 50–59 | Critical: <50 or >130
 */
function assessHeartRate(hr) {
    if (hr === null) return 'unknown';
    if (hr >= 60 && hr <= 100) return 'normal';
    if ((hr >= 101 && hr <= 130) || (hr >= 50 && hr < 60)) return 'warning';
    return 'critical';
}

/**
 * Assess SpO₂
 * Normal: ≥95 | Warning: 90–94 | Critical: <90
 */
function assessSpO2(spo2) {
    if (spo2 === null) return 'unknown';
    if (spo2 >= 95) return 'normal';
    if (spo2 >= 90) return 'warning';
    return 'critical';
}

/**
 * Assess Temperature (°C)
 * Normal: 36.1–37.2 | Warning: 37.3–38.9 or 35–36 | Critical: <35 or ≥39
 */
function assessTemp(temp) {
    if (temp === null) return 'unknown';
    if (temp >= 36.1 && temp <= 37.2) return 'normal';
    if ((temp >= 37.3 && temp <= 38.9) || (temp >= 35 && temp < 36.1)) return 'warning';
    return 'critical';
}

/**
 * Overall emergency level (worst of all vitals)
 * Returns: 'normal' | 'warning' | 'critical'
 */
function overallLevel(statuses) {
    if (statuses.includes('critical')) return 'critical';
    if (statuses.includes('warning'))  return 'warning';
    return 'normal';
}

// ═══════════════════════════════════════════════════════════
// APPLY VITAL STATUS TO DOM
// Sets classes and updates the status bar colour
// ═══════════════════════════════════════════════════════════
function applyVitalStatus(cardId, status) {
    const card = document.getElementById(cardId);
    if (!card) return;

    // Remove previous status classes
    card.classList.remove('status-normal', 'status-warning', 'status-critical');

    if (status === 'normal')   card.classList.add('status-normal');
    if (status === 'warning')  card.classList.add('status-warning');
    if (status === 'critical') card.classList.add('status-critical');
}

// ═══════════════════════════════════════════════════════════
// TOAST NOTIFICATION
// ═══════════════════════════════════════════════════════════
let toastTimer = null;

/**
 * Show a toast message
 * @param {string} msg   - Message text
 * @param {'success'|'error'} type
 */
function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    toast.className = `toast ${type}`;
    toast.innerHTML = (type === 'success' ? '✅ ' : '❌ ') + msg;

    // Force reflow so transition fires
    toast.offsetHeight;
    toast.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ═══════════════════════════════════════════════════════════
// TRANSMISSION FLASH EFFECT
// Brief red flash across the screen to simulate "sending"
// ═══════════════════════════════════════════════════════════
function triggerFlash() {
    const flash = document.getElementById('tx-flash');
    flash.classList.add('active');
    setTimeout(() => flash.classList.remove('active'), 200);
}

// ═══════════════════════════════════════════════════════════
// COLLECT FORM DATA
// Reads all inputs and returns a structured object
// ═══════════════════════════════════════════════════════════
function collectFormData() {
    return {
        patient: {
            name:   document.getElementById('p-name').value.trim(),
            phone:  document.getElementById('p-phone').value.trim(),
            age:    document.getElementById('p-age').value.trim(),
            gender: document.getElementById('p-gender').value || '—',
            blood:  document.getElementById('p-blood').value || '—',
        },
        incident: {
            desc:     document.getElementById('i-desc').value.trim(),
            location: document.getElementById('i-loc').value.trim() || '—',
            time:     document.getElementById('i-time').value || '—',
        },
        vitals: {
            bp:   document.getElementById('v-bp').value.trim() || '—',
            hr:   parseFloat(document.getElementById('v-hr').value) || null,
            spo2: parseFloat(document.getElementById('v-spo2').value) || null,
            temp: parseFloat(document.getElementById('v-temp').value) || null,
        },
        message: document.getElementById('msg-text').value.trim() || '(No message provided)',
    };
}

// ═══════════════════════════════════════════════════════════
// POPULATE HOSPITAL PANEL
// Injects collected data into the right-side display
// ═══════════════════════════════════════════════════════════
function populateHospitalPanel(data) {
    const { patient, incident, vitals, message } = data;

    // ── Patient ────────────────────────────────
    document.getElementById('h-name').textContent  = patient.name;
    document.getElementById('h-phone').textContent = patient.phone;
    document.getElementById('h-age').textContent   = patient.age + ' yrs';
    document.getElementById('h-gender').textContent = patient.gender;
    document.getElementById('h-blood').textContent  = patient.blood;

    // ── Incident ───────────────────────────────
    document.getElementById('h-desc').textContent = incident.desc;
    document.getElementById('h-loc').textContent  = incident.location;
    document.getElementById('h-time').textContent = incident.time;

    // ── Vitals with status assessment ──────────
    const hrStatus   = assessHeartRate(vitals.hr);
    const spo2Status = assessSpO2(vitals.spo2);
    const tempStatus = assessTemp(vitals.temp);

    // Display values
    document.getElementById('h-bp').textContent   = vitals.bp;
    document.getElementById('h-hr').textContent   = vitals.hr !== null ? `${vitals.hr} bpm` : '—';
    document.getElementById('h-spo2').textContent = vitals.spo2 !== null ? `${vitals.spo2}%` : '—';
    document.getElementById('h-temp').textContent = vitals.temp !== null ? `${vitals.temp}°C` : '—';

    // Apply colour classes
    applyVitalStatus('vd-hr',   hrStatus);
    applyVitalStatus('vd-spo2', spo2Status);
    applyVitalStatus('vd-temp', tempStatus);
    // BP doesn't auto-assess (text input), default to normal
    applyVitalStatus('vd-bp', 'normal');

    // Overall emergency level
    const level = overallLevel([hrStatus, spo2Status, tempStatus]);
    updateEmergencyBadge(level);

    // Vitals overall label
    const vLabel = document.getElementById('vitals-overall-label');
    vLabel.className = 'vitals-status-label level-' + level;
    const labels = { normal: '✓ Stable', warning: '⚠ Warning', critical: '🔴 Critical' };
    vLabel.textContent = labels[level] || '—';

    // ── Message ────────────────────────────────
    document.getElementById('h-msg').textContent = message;

    // ── Received timestamp ─────────────────────
    const now = new Date();
    const ts = String(now.getHours()).padStart(2,'0') + ':'
        + String(now.getMinutes()).padStart(2,'0') + ':'
        + String(now.getSeconds()).padStart(2,'0');
    document.getElementById('recv-time').textContent  = ts;
    document.getElementById('recv-count').textContent = transmissionCount;
}

// ═══════════════════════════════════════════════════════════
// UPDATE EMERGENCY BADGE
// ═══════════════════════════════════════════════════════════
function updateEmergencyBadge(level) {
    const badge = document.getElementById('emergency-level-badge');
    badge.className = 'unit-badge level-' + level;

    const icons = { normal: '🟢 STABLE', warning: '🟡 MODERATE', critical: '🔴 CRITICAL' };
    badge.innerHTML = `<span>${icons[level] || 'UNKNOWN'}</span>`;
}

// ═══════════════════════════════════════════════════════════
// SHOW HOSPITAL DATA (hides idle, shows data panel)
// ═══════════════════════════════════════════════════════════
function revealHospitalPanel() {
    document.getElementById('idle-state').style.display  = 'none';
    document.getElementById('hospital-data').style.display = 'flex';
}

// ═══════════════════════════════════════════════════════════
// MAIN FORM SUBMIT HANDLER
// ═══════════════════════════════════════════════════════════
function handleFormSubmit(e) {
    e.preventDefault(); // Prevent page reload

    // Validate first
    if (!validateForm()) {
        showToast('Please fill all required fields.', 'error');
        return;
    }

    // Collect data
    const data = collectFormData();

    // Increment transmission counter
    transmissionCount++;

    // Visual effects
    triggerFlash();

    // Brief simulated delay (100ms) for realism
    setTimeout(() => {
        populateHospitalPanel(data);
        revealHospitalPanel();
        showToast(`Transmission #${transmissionCount} sent to hospital successfully!`, 'success');

        // Scroll to hospital panel on mobile
        if (window.innerWidth < 960) {
            document.getElementById('hospital-panel').scrollIntoView({ behavior: 'smooth' });
        }
    }, 120);
}

// ═══════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {

    // Start the live clock
    startClock();

    // Set a random unit ID for flavour
    const units = ['AMB-DL-047', 'AMB-MH-012', 'AMB-KA-031', 'AMB-GJ-008'];
    document.getElementById('amb-unit-id').textContent =
        'Unit ID: ' + units[Math.floor(Math.random() * units.length)];

    // Attach form submit listener
    const form = document.getElementById('ambulance-form');
    form.addEventListener('submit', handleFormSubmit);

    // Set default incident time to now
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('i-time').value = `${hh}:${mm}`;

    // Live input feedback: clear error as user types
    ['p-name', 'p-phone', 'p-age', 'i-desc'].forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            const errId = 'err-' + id.replace('p-', '').replace('i-', '');
            setError(errId, '');
        });
    });

});
