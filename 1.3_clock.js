// This file contains the main logic for your alarm clock.
// It relies on 'v0.1_time-multi-carousel-input.js' for the time selection carousels.

/**
 * Requests permission to display desktop notifications and shows them.
 * @param {string} title - The title of the notification.
 * @param {string} body - The body (content) of the notification.
 */
function showDesktopNotification(title, body) {
    if (!("Notification" in window)) {
        console.warn("This browser does not support desktop notifications.");
        return;
    }

    if (Notification.permission === "granted") {
        console.log("Notification permission already granted. Displaying notification...");
        new Notification(title, { body: body });
    } else if (Notification.permission === "denied") {
        console.warn("Notification permission denied. Cannot display.");
    } else {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Notification permission granted! Displaying notification...");
                new Notification(title, { body: body });
            } else if (permission === "denied") {
                console.warn("Notification permission denied. Cannot display.");
            } else {
                console.log("Notification permission not granted.");
            }
        }).catch(error => {
            console.error("Error requesting notification permission:", error);
        });
    }
}


// Main Alarm Clock Logic
document.addEventListener('DOMContentLoaded', () => {
    // Check if the carousel functions are available.
    // This is a safety check to ensure v0.1_time-multi-carousel-input.js loaded first.
    if (typeof getSelectedHour !== 'function' || typeof getSelectedMinute !== 'function' || typeof setInitialTime !== 'function') {
        console.error("Error: Carousel functions (getSelectedHour, getSelectedMinute, setInitialTime) were not loaded correctly. Ensure 'v0.1_time-multi-carousel-input.js' is linked BEFORE this script.");
        document.getElementById('status-message').textContent = 'Initialization Error: Carousel script missing.';
        return; // Stop execution if dependencies aren't met
    }

    // --- References to UI elements ---
    const setAlarmButton = document.getElementById('setAlarmButton');
    const statusMessage = document.getElementById('status-message');
    const currentTimeDisplay = document.getElementById('current-time');

    // References for pause options and their fields
    const opcaoDuracaoRadio = document.getElementById('opcao-duracao');
    const opcaoFimRadio = document.getElementById('opcao-fim');
    const camposDuracao = document.getElementById('campos-duracao');
    const camposFim = document.getElementById('campos-fim');

    let alarmSet = false;      // State to track if an alarm is active
    let alarmHour;             // Stored hour of the set alarm
    let alarmMinute;           // Stored minute of the set alarm
    let mainClockIntervalId;   // ID for the setInterval that updates current time

    // --- UI Functions for Pause Logic ---

    /**
     * Toggles the visibility of pause duration or end time fields based on radio button selection.
     */
    function togglePauseFields() {
        if (opcaoDuracaoRadio && opcaoDuracaoRadio.checked) {
            if (camposDuracao) camposDuracao.style.display = 'flex';
            if (camposFim) camposFim.style.display = 'none';
        } else if (opcaoFimRadio && opcaoFimRadio.checked) {
            if (camposDuracao) camposDuracao.style.display = 'none';
            if (camposFim) camposFim.style.display = 'flex';
        }
    }

    // Add listeners for the radio buttons to switch field visibility
    if (opcaoDuracaoRadio) {
        opcaoDuracaoRadio.addEventListener('change', togglePauseFields);
    }
    if (opcaoFimRadio) {
        opcaoFimRadio.addEventListener('change', togglePauseFields);
    }

    // Set initial state of pause fields when page loads
    togglePauseFields();

    // --- Main Alarm Functions ---

    /**
     * Updates the current time display and checks if the alarm should trigger.
     */
    function updateCurrentTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        currentTimeDisplay.textContent = `Current Time: ${hours}:${minutes}:${seconds}`;

        // Check if alarm is active and if current time matches alarm time
        if (alarmSet && now.getHours() === alarmHour && now.getMinutes() === alarmMinute && now.getSeconds() === 0) {
            triggerAlarm();
            // Important: Do NOT clearInterval(mainClockIntervalId) here.
            // The main clock should keep running. Only the alarm state resets.
            alarmSet = false;
            statusMessage.textContent = 'Alarm triggered!';
            setAlarmButton.textContent = 'Set Alarm';
        }
    }

    /**
     * Sets the alarm using the values from the main hour and minute carousels.
     */
    function setAlarm() {
        const hour = getSelectedHour();   // Get hour from the global carousel function
        const minute = getSelectedMinute(); // Get minute from the global carousel function

        if (hour === null || minute === null) {
            statusMessage.textContent = 'Please select a valid alarm time.';
            return;
        }

        alarmHour = hour;
        alarmMinute = minute;
        alarmSet = true;

        const formattedAlarmTime = `${String(alarmHour).padStart(2, '0')}:${String(alarmMinute).padStart(2, '0')}`;
        statusMessage.textContent = `Alarm set for ${formattedAlarmTime}`;
        setAlarmButton.textContent = 'Alarm Set (Click to Cancel)';

        // Desktop notification for alarm confirmation
        showDesktopNotification("⏰ Alarm Set!", `Your alarm is set for: ${formattedAlarmTime}`);
    }

    /**
     * Triggers the alarm: plays a sound and displays a notification.
     */
    function triggerAlarm() {
        console.log('Alarm ringing!');
        showDesktopNotification(
            "🔔 Wake Up!",
            "It's " + String(alarmHour).padStart(2, '0') + ":" + String(alarmMinute).padStart(2, '0')
        );

        const audio = new Audio('https://www.soundjay.com/buttons/beep-07.mp3');
        audio.play().catch(e => console.error("Error playing audio:", e));

        setTimeout(() => {
            audio.pause();
            audio.currentTime = 0; // Rewind audio for next play
        }, 5000); // Stop playing after 5 seconds
    }

    // --- Event Listeners ---

    // Listener for the "Set Alarm" / "Cancel Alarm" button
    if (setAlarmButton) {
        setAlarmButton.addEventListener('click', () => {
            if (alarmSet) {
                // If alarm is set, cancel it.
                alarmSet = false;
                statusMessage.textContent = 'Alarm canceled.';
                setAlarmButton.textContent = 'Set Alarm';
            } else {
                setAlarm(); // Otherwise, set the alarm
            }
        });
    }


    // --- Initialization on Page Load ---

    // Set the initial time of the main alarm carousels to the current system time.
    const now = new Date();
    setInitialTime(now.getHours(), now.getMinutes());

    // Start the main clock interval to update the current time display every second.
    // This runs continuously, regardless of alarm state.
    mainClockIntervalId = setInterval(updateCurrentTime, 1000);

    // Initial call to update time display immediately on load
    updateCurrentTime();
});
