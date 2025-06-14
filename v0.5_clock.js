// v0.5_clock.js

// Reutiliza as funções e variáveis de v0.3_clock.js (showDesktopNotification, etc.)
let alarmTimeoutId;
let pauseTimeoutId; // Novo: ID do timeout da pausa
let alarmSet = false;
let pauseAlarmSet = false; // Novo: Estado do alarme de pausa
let pauseEndTime; // Novo: Hora de término da pausa

const alarmButton = document.getElementById('setAlarmButton'); // Mantém o botão existente
const setPauseButton = document.getElementById('setPauseButton'); // Novo: Botão para definir a pausa
const alarmDisplay = document.getElementById('alarmDisplay');

function updateCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;

    // Verifica o alarme principal
    if (alarmSet && hours === String(window.getAlarmHour()).padStart(2, '0') && minutes === String(window.getAlarmMinute()).padStart(2, '0') && seconds === '00') {
        showDesktopNotification('Alarme!', 'Hora de acordar!');
        alarmSet = false;
        alarmDisplay.textContent = '';
        clearTimeout(alarmTimeoutId);
    }

    // Verifica o alarme de pausa (NOVO)
    if (pauseAlarmSet && hours === String(pauseEndTime.hours).padStart(2, '0') && minutes === String(pauseEndTime.minutes).padStart(2, '0') && seconds === '00') {
        showDesktopNotification('Pausa Terminada!', 'Sua pausa acabou.');
        pauseAlarmSet = false;
        pauseEndTime = null;
        clearTimeout(pauseTimeoutId);
    }
}

function setAlarm() {
    if (!alarmSet) {
        alarmSet = true;
        const alarmHour = window.getAlarmHour();
        const alarmMinute = window.getAlarmMinute();
        alarmDisplay.textContent = `Alarme definido para ${String(alarmHour).padStart(2, '0')}:${String(alarmMinute).padStart(2, '0')}`;
        // Não precisa de setTimeout aqui, a verificação é feita em updateCurrentTime
    } else {
         alarmSet = false;
        alarmDisplay.textContent = '';
        clearTimeout(alarmTimeoutId);
    }
}

// Nova função para definir a pausa
function setPause() {
    if (!pauseAlarmSet) {
        pauseAlarmSet = true;
        const pauseType = document.querySelector('input[name="pause-type"]:checked').value;

        let startHour;
        let startMinute;

         // Obtém a hora DO ALARME, não a hora atual
        startHour = window.getAlarmHour();
        startMinute = window.getAlarmMinute();

        if (pauseType === 'duration') {
            const durationHours = window.getPauseDurationHour();
            const durationMinutes = window.getPauseDurationMinute();

            // Calcula a hora de término da pausa
            let endMinutes = startMinute + durationMinutes;
            let endHours = startHour + durationHours + Math.floor(endMinutes / 60);
            endMinutes = endMinutes % 60;
            endHours = endHours % 24;

            pauseEndTime = { hours: endHours, minutes: endMinutes };

        } else if (pauseType === 'end-time') {
            // Usa a hora de término diretamente
            pauseEndTime = { hours: window.getPauseEndHour(), minutes: window.getPauseEndMinute() };
        }

        console.log('Pause End Time:', pauseEndTime);
        showDesktopNotification('Pausa Definida', `A pausa terminará às ${String(pauseEndTime.hours).padStart(2, '0')}:${String(pauseEndTime.minutes).padStart(2, '0')}`);

        // Não precisa de setTimeout aqui, a verificação é feita em updateCurrentTime

    } else {
        pauseAlarmSet = false;
        pauseEndTime = null;
        clearTimeout(pauseTimeoutId);
    }
}

// Adiciona event listeners
alarmButton.addEventListener('click', setAlarm);
setPauseButton.addEventListener('click', setPause); // Novo botão

// Atualiza o relógio a cada segundo
setInterval(updateCurrentTime, 1000);

// Solicitar permissão para notificações (como em v0.3_clock.js)
if (Notification.permission !== 'granted') {
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            console.log('Notificações permitidas.');
        }
    });
}
