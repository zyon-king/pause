// 0.1_time.js
// Este script gerencia os carrosséis de seleção de tempo e suas sobreposições.

// --- Variáveis Globais (Expostas para 0.1_clock.js) ---
// Usamos `window.` para garantir que sejam acessíveis globalmente
window.currentHour = 0;
window.currentMinute = 0;

// Constantes
const itemHeight = 50; // Height of each item in pixels
const itemsInView = 5; // Number of items visible in the selection carousel (250px / 50px)
const bufferItems = Math.floor(itemsInView / 2); // Items above/below center to keep full (2 items)
const NUM_REPEATS = 3; // Number of times to repeat the full sequence in selection overlay

let isTransitioning = false; // Flag to prevent rapid jumps

// --- Referências aos Elementos HTML (Inicializadas após DOMContentLoaded) ---
let hoursCarousel, hoursItems, hoursUpButton, hoursDownButton;
let minutesCarousel, minutesItems, minutesUpButton, minutesDownButton;
let hoursSelectionOverlay, hoursSelectionCarousel, hoursSelectionItems;
let minutesSelectionOverlay, minutesSelectionCarousel, minutesSelectionItems;

// Referências para os carrosséis de pausa (assumindo que o HTML terá IDs semelhantes)
let pauseDurationHoursCarousel, pauseDurationHoursItems, pauseDurationHoursUpButton, pauseDurationHoursDownButton;
let pauseDurationMinutesCarousel, pauseDurationMinutesItems, pauseDurationMinutesUpButton, pauseDurationMinutesDownButton;
let pauseEndHoursCarousel, pauseEndHoursItems, pauseEndHoursUpButton, pauseEndHoursDownButton;
let pauseEndMinutesCarousel, pauseEndMinutesItems, pauseEndMinutesUpButton, pauseEndMinutesDownButton;

// --- Funções Auxiliares para o 0.1_clock.js acessar ---

/**
 * Obtém a hora selecionada no carrossel principal de horas.
 * @returns {number} A hora selecionada.
 */
window.getSelectedHour = function() {
    return window.currentHour;
};

/**
 * Obtém o minuto selecionado no carrossel principal de minutos.
 * @returns {number} O minuto selecionado.
 */
window.getSelectedMinute = function() {
    return window.currentMinute;
};

/**
 * Define a hora inicial dos carrosséis principais de horas e minutos.
 * @param {number} hour - A hora a ser definida.
 * @param {number} minute - O minuto a ser definido.
 */
window.setInitialTime = function(hour, minute) {
    if (hoursItems) {
        window.currentHour = hour;
        updateMainCarouselPosition(hoursItems, window.currentHour);
    }
    if (minutesItems) {
        window.currentMinute = minute;
        updateMainCarouselPosition(minutesItems, window.currentMinute);
    }
};

// Funções para obter valores dos carrosséis de pausa
window.getPauseDurationHour = function() {
    // Para simplificar, vou assumir que você terá variáveis globais para estes também
    // Ou uma maneira de acessar o `currentValRef.value` deles.
    // Se você quiser que esses carrosséis de pausa sejam independentes de `currentHour`/`currentMinute`,
    // precisaremos de variáveis `currentPauseDurationHour`, etc., ou usar a classe TimeCarousel que eu havia sugerido.
    // Por enquanto, vou apenas retornar 0 para evitar erros.
    // Para funcionar corretamente, você precisa replicar a lógica de `currentHour`/`currentMinute` para eles.
    return 0; // Placeholder
};

window.getPauseDurationMinute = function() {
    return 0; // Placeholder
};

window.getPauseEndHour = function() {
    return 0; // Placeholder
};

window.getPauseEndMinute = function() {
    return 0; // Placeholder
};


// --- Funções de Carrossel Principais (Do seu script original) ---

function populateMainCarousel(itemsContainer, totalItems) {
    itemsContainer.innerHTML = '';
    for (let i = 0; i < totalItems; i++) {
        const value = i.toString().padStart(2, '0');
        const item = document.createElement('div');
        item.classList.add('item');
        item.textContent = value;
        itemsContainer.appendChild(item);
    }
}

function updateMainCarouselPosition(carouselItems, currentIndex) {
    carouselItems.style.transform = `translateY(-${currentIndex * itemHeight}px)`;
}

function setupMainCarouselScroll(carouselElement, itemsElement, currentValRef, totalItems) {
    itemsElement.addEventListener('wheel', (event) => {
        event.preventDefault();
        if (event.deltaY > 0) { // Scroll down
            currentValRef.value = (currentValRef.value + 1) % totalItems;
        } else { // Scroll up
            currentValRef.value = (currentValRef.value - 1 + totalItems) % totalItems;
        }
        updateMainCarouselPosition(itemsElement, currentValRef.value);
        if (carouselElement.id === 'hours-carousel') {
            window.currentHour = currentValRef.value;
        } else {
            window.currentMinute = currentValRef.value;
        }
    });
}

function setupCarouselButtons(upButton, downButton, itemsElement, currentValRef, totalItems, carouselId) {
    upButton.addEventListener('click', () => {
        currentValRef.value = (currentValRef.value - 1 + totalItems) % totalItems;
        updateMainCarouselPosition(itemsElement, currentValRef.value);
        if (carouselId === 'hours-carousel') {
            window.currentHour = currentValRef.value;
        } else {
            window.currentMinute = currentValRef.value;
        }
    });

    downButton.addEventListener('click', () => {
        currentValRef.value = (currentValRef.value + 1) % totalItems;
        updateMainCarouselPosition(itemsElement, currentValRef.value);
        if (carouselId === 'hours-carousel') {
            window.currentHour = currentValRef.value;
        } else {
            window.currentMinute = currentValRef.value;
        }
    });
}

// --- Lógica do Carrossel de Seleção (Overlay) ---

function populateSelectionCarousel(itemsContainer, totalItems, parentOverlay, currentValRef) {
    itemsContainer.innerHTML = '';
    for (let r = 0; r < NUM_REPEATS; r++) {
        for (let i = 0; i < totalItems; i++) {
            const value = i.toString().padStart(2, '0');
            const item = document.createElement('div');
            item.classList.add('item');
            item.textContent = value;
            item.dataset.value = i;
            item.dataset.fullIndex = (r * totalItems) + i;
            itemsContainer.appendChild(item);

            item.addEventListener('click', (event) => {
                const selectedValue = parseInt(event.target.dataset.value);
                currentValRef.value = selectedValue;

                if (parentOverlay.id === 'hours-selection-overlay') {
                    window.currentHour = selectedValue;
                    updateMainCarouselPosition(hoursItems, window.currentHour);
                } else {
                    window.currentMinute = selectedValue;
                    updateMainCarouselPosition(minutesItems, window.currentMinute);
                }
                parentOverlay.classList.remove('active');
            });
        }
    }
}

function updateSelectionCarouselPosition(itemsContainer, currentLogicalIndex, totalItems, isScrolling = false) {
    const midBlockStartOffset = Math.floor(NUM_REPEATS / 2) * totalItems;
    let targetFullIndex = midBlockStartOffset + currentLogicalIndex;
    let targetTransformY = -(targetFullIndex * itemHeight) + (bufferItems * itemHeight);

    if (!isScrolling && isTransitioning) {
        itemsContainer.style.transition = `transform 0.2s ease-out`;
    } else if (isScrolling && !isTransitioning) {
        itemsContainer.style.transition = 'none';
    } else if (!isScrolling && !isTransitioning) {
        itemsContainer.style.transition = `transform 0.2s ease-out`;
    }

    itemsContainer.style.transform = `translateY(${targetTransformY}px)`;

    const currentTransformY = parseFloat(itemsContainer.style.transform.replace('translateY(', '').replace('px)', ''));
    const scrolledOffset = Math.abs(currentTransformY) - (midBlockStartOffset * itemHeight) + (bufferItems * itemHeight);

    if (scrolledOffset < (bufferItems * itemHeight) && currentLogicalIndex >= 0) {
        const newLogicalIndex = currentLogicalIndex;
        const newTargetFullIndex = (NUM_REPEATS - 1) * totalItems + newLogicalIndex;
        const newTransformY = -(newTargetFullIndex * itemHeight) + (bufferItems * itemHeight);

        itemsContainer.style.transition = 'none';
        requestAnimationFrame(() => {
            itemsContainer.style.transform = `translateY(${newTransformY}px)`;
        });
    } else if (scrolledOffset > ((totalItems - bufferItems) * itemHeight)) {
        const newLogicalIndex = currentLogicalIndex;
        const newTargetFullIndex = (0 * totalItems) + newLogicalIndex;
        const newTransformY = -(newTargetFullIndex * itemHeight) + (bufferItems * itemHeight);

        itemsContainer.style.transition = 'none';
        requestAnimationFrame(() => {
            itemsContainer.style.transform = `translateY(${newTransformY}px)`;
        });
    }
    if (!isTransitioning) {
        itemsContainer.style.transition = `transform 0.2s ease-out`;
    }
}

function setupSelectionCarouselInteraction(mainItemsElement, selectionOverlay, selectionItemsContainer, currentValRef, totalItems) {
    mainItemsElement.addEventListener('click', (event) => {
        populateSelectionCarousel(selectionItemsContainer, totalItems, selectionOverlay, currentValRef);
        isTransitioning = true;
        selectionItemsContainer.style.transition = `transform 0.2s ease-out`;
        updateSelectionCarouselPosition(selectionItemsContainer, currentValRef.value, totalItems, false);
        selectionOverlay.classList.add('active');
        event.stopPropagation();
        setTimeout(() => {
            isTransitioning = false;
        }, 200);
    });

    selectionOverlay.addEventListener('click', (event) => {
        if (event.target === selectionOverlay) {
            selectionOverlay.classList.remove('active');
        }
    });

    selectionOverlay.querySelector('.selection-carousel').addEventListener('wheel', (event) => {
        event.preventDefault();
        let newLogicalIndex = currentValRef.value;

        if (event.deltaY > 0) { // Scroll down
            newLogicalIndex = (newLogicalIndex + 1) % totalItems;
        } else { // Scroll up
            newLogicalIndex = (newLogicalIndex - 1 + totalItems) % totalItems;
        }
        currentValRef.value = newLogicalIndex;

        // Update main carousel
        if (selectionOverlay.id === 'hours-selection-overlay') {
            window.currentHour = newLogicalIndex;
            updateMainCarouselPosition(hoursItems, window.currentHour);
        } else {
            window.currentMinute = newLogicalIndex;
            updateMainCarouselPosition(minutesItems, window.currentMinute);
        }

        selectionItemsContainer.style.transition = `transform 0.2s ease-out`;
        updateSelectionCarouselPosition(selectionItemsContainer, newLogicalIndex, totalItems, true);
    });
}

// --- Inicialização do DOM ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Referências aos carrosséis principais ---
    hoursCarousel = document.getElementById('hours-carousel');
    hoursItems = document.getElementById('hours-items');
    hoursUpButton = hoursCarousel.querySelector('.carousel-button.up');
    hoursDownButton = hoursCarousel.querySelector('.carousel-button.down');

    minutesCarousel = document.getElementById('minutes-carousel');
    minutesItems = document.getElementById('minutes-items');
    minutesUpButton = minutesCarousel.querySelector('.carousel-button.up');
    minutesDownButton = minutesCarousel.querySelector('.carousel-button.down');

    // --- Referências para os novos carrosséis de seleção ---
    hoursSelectionOverlay = document.getElementById('hours-selection-overlay');
    hoursSelectionCarousel = document.getElementById('hours-selection-carousel');
    hoursSelectionItems = document.getElementById('hours-selection-items');

    minutesSelectionOverlay = document.getElementById('minutes-selection-overlay');
    minutesSelectionCarousel = document.getElementById('minutes-selection-carousel');
    minutesSelectionItems = document.getElementById('minutes-selection-items');

    // --- Inicialização dos carrosséis de pausa (você precisará adicionar os IDs no HTML) ---
    // Atualmente, as funções getPauseDurationHour etc. retornam placeholders.
    // Para que estes funcionem, você precisará replicar a estrutura do carrossel principal
    // para eles, incluindo as variáveis globais (`window.currentPauseDurationHour` etc.)
    // e suas próprias instâncias de setup. Por simplicidade, vou manter a inicialização
    // comentada ou mínima aqui para o 0.1_time.js.

    // Exemplo de como você inicializaria se tivesse IDs dedicados no HTML
    /*
    pauseDurationHoursCarousel = document.getElementById('pause-duration-hours-carousel');
    pauseDurationHoursItems = document.getElementById('pause-duration-hours-items');
    pauseDurationHoursUpButton = pauseDurationHoursCarousel.querySelector('.carousel-button.up');
    pauseDurationHoursDownButton = pauseDurationHoursCarousel.querySelector('.carousel-button.down');
    window.currentPauseDurationHour = 0; // Nova variável global
    const pauseDurHourRef = { value: window.currentPauseDurationHour };
    populateMainCarousel(pauseDurationHoursItems, 24);
    updateMainCarouselPosition(pauseDurationHoursItems, window.currentPauseDurationHour);
    setupMainCarouselScroll(pauseDurationHoursCarousel, pauseDurationHoursItems, pauseDurHourRef, 24);
    setupCarouselButtons(pauseDurationHoursUpButton, pauseDurationHoursDownButton, pauseDurationHoursItems, pauseDurHourRef, 24, 'pause-duration-hours-carousel');

    // ... e o mesmo para pauseDurationMinutes, pauseEndHours, pauseEndMinutes
    */

    // --- Preenchimento e Configuração Inicial ---
    populateMainCarousel(hoursItems, 24);
    populateMainCarousel(minutesItems, 60);

    const hourRef = { value: window.currentHour };
    const minuteRef = { value: window.currentMinute };

    setupMainCarouselScroll(hoursCarousel, hoursItems, hourRef, 24);
    setupMainCarouselScroll(minutesCarousel, minutesItems, minuteRef, 60);

    setupCarouselButtons(hoursUpButton, hoursDownButton, hoursItems, hourRef, 24, 'hours-carousel');
    setupCarouselButtons(minutesUpButton, minutesDownButton, minutesItems, minuteRef, 60, 'minutes-carousel');

    setupSelectionCarouselInteraction(hoursItems, hoursSelectionOverlay, hoursSelectionItems, hourRef, 24);
    setupSelectionCarouselInteraction(minutesItems, minutesSelectionOverlay, minutesSelectionItems, minuteRef, 60);

    // Initial population for the selection carousels (needed when they first open)
    populateSelectionCarousel(hoursSelectionItems, 24, hoursSelectionOverlay, hourRef);
    populateSelectionCarousel(minutesSelectionItems, 60, minutesSelectionOverlay, minuteRef);

    // Definir a hora inicial dos carrosséis principais para a hora atual do sistema.
    const now = new Date();
    window.setInitialTime(now.getHours(), now.getMinutes());
});
