// v0.5_time.js

// Mantém a lógica dos carrosséis de hora e minuto, como em v0.3_time.js
class TimeCarousel {
    constructor(containerId, values, onChange) {
        this.container = document.getElementById(containerId);
        this.values = values;
        this.onChange = onChange;
        this.currentIndex = 0;
        this.render();
        this.updateSelection();
    }

    render() {
        // ... (Mesma lógica de renderização dos carrosséis de v0.3_time.js) ...
        this.container.innerHTML = '';
        const ul = document.createElement('ul');
        this.values.forEach((value, index) => {
            const li = document.createElement('li');
            li.textContent = String(value).padStart(2, '0');
            li.addEventListener('click', () => {
                this.currentIndex = index;
                this.updateSelection();
                this.onChange(this.selectedValue());
            });
            ul.appendChild(li);
        });
        this.container.appendChild(ul);

        this.upButton = document.createElement('button');
        this.upButton.textContent = '▲';
         this.upButton.classList.add('carousel-button'); // Adiciona a classe
        this.upButton.addEventListener('click', () => {
            this.currentIndex = (this.currentIndex - 1 + this.values.length) % this.values.length;
            this.updateSelection();
            this.onChange(this.selectedValue());
        });
        this.container.appendChild(this.upButton);

        this.downButton = document.createElement('button');
        this.downButton.textContent = '▼';
        this.downButton.classList.add('carousel-button'); // Adiciona a classe
        this.downButton.addEventListener('click', () => {
            this.currentIndex = (this.currentIndex + 1) % this.values.length;
            this.updateSelection();
            this.onChange(this.selectedValue());
        });
        this.container.appendChild(this.downButton);
    }

    updateSelection() {
         // ... (Mesma lógica de atualização da seleção de v0.3_time.js) ...
        const ul = this.container.querySelector('ul');
        if (ul) {
            Array.from(ul.children).forEach((li, index) => {
                li.classList.toggle('selected', index === this.currentIndex);
            });
        }
    }

    selectedValue() {
        return this.values[this.currentIndex];
    }
}

// Inicialização dos carrosséis (como em v0.3_time.js)
const alarmHourCarousel = new TimeCarousel('alarm-hour', Array.from({ length: 24 }, (_, i) => i), updateAlarmTime);
const alarmMinuteCarousel = new TimeCarousel('alarm-minute', Array.from({ length: 60 }, (_, i) => i), updateAlarmTime);
const pauseDurationHourCarousel = new TimeCarousel('pause-duration-hour', Array.from({ length: 24 }, (_, i) => i), updatePauseTime);
const pauseDurationMinuteCarousel = new TimeCarousel('pause-duration-minute', Array.from({ length: 60 }, (_, i) => i), updatePauseTime);
const pauseEndHourCarousel = new TimeCarousel('pause-end-hour', Array.from({ length: 24 }, (_, i) => i), updatePauseEndTime);
const pauseEndMinuteCarousel = new TimeCarousel('pause-end-minute', Array.from({ length: 60 }, (_, i) => i), updatePauseEndTime);

let alarmTime = { hour: 0, minute: 0 };
let pauseTime = { durationHour: 0, durationMinute: 0, endHour: 0, endMinute: 0 };

function updateAlarmTime(newTime) {
    if (this === alarmHourCarousel) {
        alarmTime.hour = newTime;
    } else if (this === alarmMinuteCarousel) {
        alarmTime.minute = newTime;
    }
    console.log('Alarm Time:', alarmTime);
}

function updatePauseTime(newTime) {
     if (this === pauseDurationHourCarousel) {
        pauseTime.durationHour = newTime;
    } else if (this === pauseDurationMinuteCarousel) {
        pauseTime.durationMinute = newTime;
    }
    console.log('Pause Duration:', pauseTime);
}

function updatePauseEndTime(newTime) {
    if (this === pauseEndHourCarousel) {
        pauseTime.endHour = newTime;
    } else if (this === pauseEndMinuteCarousel) {
        pauseTime.endMinute = newTime;
    }
     console.log('Pause End Time:', pauseTime);
}

// Funções auxiliares globalmente expostas (NOVAS e IMPORTANTES para v0.5)
window.getAlarmHour = function() {
    return alarmTime.hour;
};

window.getAlarmMinute = function() {
    return alarmTime.minute;
};

window.getPauseDurationHour = function() {
    return pauseTime.durationHour;
};

window.getPauseDurationMinute = function() {
    return pauseTime.durationMinute;
};

window.getPauseEndHour = function() {
    return pauseTime.endHour;
};

window.getPauseEndMinute = function() {
    return pauseTime.endMinute;
};
