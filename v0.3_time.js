// v0.3_time.js
// Este script gerencia os carrosséis de seleção de tempo, incluindo scroll da roda do mouse e overlays.

// --- Variáveis Globais Expostas para outros scripts (ex: v0.2_clock.js) ---
// Usamos 'window.' para garantir que estas variáveis sejam acessíveis globalmente.
// Elas armazenam o valor atualmente selecionado em cada carrossel.
window.currentHour = 0;
window.currentMinute = 0;
window.currentPauseDurationHour = 0; // Para o carrossel de duração da pausa
window.currentPauseDurationMinute = 0; // Para o carrossel de duração da pausa
window.currentPauseEndHour = 0;       // Para o carrossel de fim da pausa
window.currentPauseEndMinute = 0;     // Para o carrossel de fim da pausa


// --- Constantes do Carrossel ---
const itemHeight = 50; // Altura de cada item em pixels
const itemsInView = 5; // Número de itens visíveis no carrossel de seleção (250px / 50px)
const bufferItems = Math.floor(itemsInView / 2); // Itens acima/abaixo do centro para manter completo (2 itens)
const NUM_REPEATS = 3; // Número de vezes para repetir a sequência completa no overlay de seleção


// --- Variáveis de Estado para o Carrossel de Seleção (Overlay) ---
let isTransitioning = false; // Flag para evitar saltos rápidos durante a transição


// --- Referências aos Elementos HTML (Serão inicializadas após DOMContentLoaded) ---
// Carrosséis Principais de Alarme
let hoursCarousel, hoursItems, hoursUpButton, hoursDownButton;
let minutesCarousel, minutesItems, minutesUpButton, minutesDownButton;

// Overlays e Carrosséis de Seleção (pop-up)
let hoursSelectionOverlay, hoursSelectionCarousel, hoursSelectionItems;
let minutesSelectionOverlay, minutesSelectionCarousel, minutesSelectionItems;

// Carrosséis de Duração da Pausa
let pauseDurationHoursCarousel, pauseDurationHoursItems, pauseDurationHoursUpButton, pauseDurationHoursDownButton;
let pauseDurationMinutesCarousel, pauseDurationMinutesItems, pauseDurationMinutesUpButton, pauseDurationMinutesDownButton;

// Carrosséis de Fim da Pausa
let pauseEndHoursCarousel, pauseEndHoursItems, pauseEndHoursUpButton, pauseEndHoursDownButton;
let pauseEndMinutesCarousel, pauseEndMinutesItems, pauseEndMinutesUpButton, pauseEndMinutesDownButton;


// --- Funções Auxiliares Globalmente Expostas (para v0.2_clock.js) ---

/**
 * Retorna a hora atualmente selecionada no carrossel principal de horas.
 * @returns {number} A hora selecionada (0-23).
 */
window.getSelectedHour = function() {
    return window.currentHour;
};

/**
 * Retorna o minuto atualmente selecionado no carrossel principal de minutos.
 * @returns {number} O minuto selecionado (0-59).
 */
window.getSelectedMinute = function() {
    return window.currentMinute;
};

/**
 * Define a hora e o minuto iniciais para os carrosséis principais de horas e minutos.
 * @param {number} hour - A hora a ser definida.
 * @param {number} minute - O minuto a ser definido.
 */
window.setInitialTime = function(hour, minute) {
    if (hoursItems && minutesItems) { // Garante que os elementos existam
        window.currentHour = hour;
        window.currentMinute = minute;
        updateMainCarouselPosition(hoursItems, window.currentHour);
        updateMainCarouselPosition(minutesItems, window.currentMinute);
    }
};

/**
 * Retorna a hora de duração da pausa selecionada.
 * @returns {number} A hora de duração da pausa.
 */
window.getPauseDurationHour = function() {
    return window.currentPauseDurationHour;
};

/**
 * Retorna o minuto de duração da pausa selecionado.
 * @returns {number} O minuto de duração da pausa.
 */
window.getPauseDurationMinute = function() {
    return window.currentPauseDurationMinute;
};

/**
 * Retorna a hora de fim da pausa selecionada.
 * @returns {number} A hora de fim da pausa.
 */
window.getPauseEndHour = function() {
    return window.currentPauseEndHour;
};

/**
 * Retorna o minuto de fim da pausa selecionado.
 * @returns {number} O minuto de fim da pausa.
 */
window.getPauseEndMinute = function() {
    return window.currentPauseEndMinute;
};


// --- Funções de Lógica do Carrossel (Seu Código Original) ---

/**
 * Preenche um carrossel principal com números formatados.
 * @param {HTMLElement} itemsContainer - O contêiner dos itens do carrossel.
 * @param {number} totalItems - O número total de itens (ex: 24 para horas, 60 para minutos).
 */
function populateMainCarousel(itemsContainer, totalItems) {
    itemsContainer.innerHTML = ''; // Limpa itens existentes
    for (let i = 0; i < totalItems; i++) {
        const value = i.toString().padStart(2, '0');
        const item = document.createElement('div');
        item.classList.add('item');
        item.textContent = value;
        itemsContainer.appendChild(item);
    }
}

/**
 * Atualiza a posição visual de um carrossel principal via transformação CSS.
 * @param {HTMLElement} carouselItems - O contêiner dos itens.
 * @param {number} currentIndex - O índice do item que deve ser centralizado.
 */
function updateMainCarouselPosition(carouselItems, currentIndex) {
    carouselItems.style.transform = `translateY(-${currentIndex * itemHeight}px)`;
}

/**
 * Configura a funcionalidade de rolagem da roda do mouse para um carrossel principal.
 * @param {HTMLElement} carouselElement - O elemento pai do carrossel.
 * @param {HTMLElement} itemsElement - O contêiner dos itens do carrossel.
 * @param {{value: number}} currentValRef - Uma referência mutável para a variável global do valor atual.
 * @param {number} totalItems - O número total de itens no carrossel.
 */
function setupMainCarouselScroll(carouselElement, itemsElement, currentValRef, totalItems) {
    itemsElement.addEventListener('wheel', (event) => {
        event.preventDefault(); // Evita a rolagem da página
        if (event.deltaY > 0) { // Rolagem para baixo
            currentValRef.value = (currentValRef.value + 1) % totalItems;
        } else { // Rolagem para cima
            currentValRef.value = (currentValRef.value - 1 + totalItems) % totalItems;
        }
        updateMainCarouselPosition(itemsElement, currentValRef.value);

        // Atualiza a variável global correspondente
        if (carouselElement.id === 'hours-carousel') {
            window.currentHour = currentValRef.value;
        } else if (carouselElement.id === 'minutes-carousel') {
            window.currentMinute = currentValRef.value;
        } else if (carouselElement.id === 'pause-duration-hours-carousel') {
            window.currentPauseDurationHour = currentValRef.value;
        } else if (carouselElement.id === 'pause-duration-minutes-carousel') {
            window.currentPauseDurationMinute = currentValRef.value;
        } else if (carouselElement.id === 'pause-end-hours-carousel') {
            window.currentPauseEndHour = currentValRef.value;
        } else if (carouselElement.id === 'pause-end-minutes-carousel') {
            window.currentPauseEndMinute = currentValRef.value;
        }
    });
}

/**
 * Configura os botões de subir/descer para um carrossel principal.
 * @param {HTMLElement} upButton - O botão de subir.
 * @param {HTMLElement} downButton - O botão de descer.
 * @param {HTMLElement} itemsElement - O contêiner dos itens do carrossel.
 * @param {{value: number}} currentValRef - Uma referência mutável para a variável global do valor atual.
 * @param {number} totalItems - O número total de itens no carrossel.
 * @param {string} carouselId - O ID do carrossel (para identificar qual variável global atualizar).
 */
function setupCarouselButtons(upButton, downButton, itemsElement, currentValRef, totalItems, carouselId) {
    upButton.addEventListener('click', () => {
        currentValRef.value = (currentValRef.value - 1 + totalItems) % totalItems;
        updateMainCarouselPosition(itemsElement, currentValRef.value);
        // Atualiza a variável global correspondente
        if (carouselId === 'hours-carousel') {
            window.currentHour = currentValRef.value;
        } else if (carouselId === 'minutes-carousel') {
            window.currentMinute = currentValRef.value;
        } else if (carouselId === 'pause-duration-hours-carousel') {
            window.currentPauseDurationHour = currentValRef.value;
        } else if (carouselId === 'pause-duration-minutes-carousel') {
            window.currentPauseDurationMinute = currentValRef.value;
        } else if (carouselId === 'pause-end-hours-carousel') {
            window.currentPauseEndHour = currentValRef.value;
        } else if (carouselId === 'pause-end-minutes-carousel') {
            window.currentPauseEndMinute = currentValRef.value;
        }
    });

    downButton.addEventListener('click', () => {
        currentValRef.value = (currentValRef.value + 1) % totalItems;
        updateMainCarouselPosition(itemsElement, currentValRef.value);
        // Atualiza a variável global correspondente
        if (carouselId === 'hours-carousel') {
            window.currentHour = currentValRef.value;
        } else if (carouselId === 'minutes-carousel') {
            window.currentMinute = currentValRef.value;
        } else if (carouselId === 'pause-duration-hours-carousel') {
            window.currentPauseDurationHour = currentValRef.value;
        } else if (carouselId === 'pause-duration-minutes-carousel') {
            window.currentPauseDurationMinute = currentValRef.value;
        } else if (carouselId === 'pause-end-hours-carousel') {
            window.currentPauseEndHour = currentValRef.value;
        } else if (carouselId === 'pause-end-minutes-carousel') {
            window.currentPauseEndMinute = currentValRef.value;
        }
    });
}

/**
 * Preenche o carrossel de seleção (overlay) com itens repetidos para rolagem "infinita".
 * @param {HTMLElement} itemsContainer - O contêiner dos itens no overlay.
 * @param {number} totalItems - O número total de itens (ex: 24 para horas, 60 para minutos).
 * @param {HTMLElement} parentOverlay - O elemento overlay pai.
 * @param {{value: number}} currentValRef - Uma referência mutável para a variável global do valor atual.
 */
function populateSelectionCarousel(itemsContainer, totalItems, parentOverlay, currentValRef) {
    itemsContainer.innerHTML = '';
    for (let r = 0; r < NUM_REPEATS; r++) { // Repete a sequência NUM_REPEATS vezes
        for (let i = 0; i < totalItems; i++) {
            const value = i.toString().padStart(2, '0');
            const item = document.createElement('div');
            item.classList.add('item');
            item.textContent = value;
            item.dataset.value = i; // Armazena o valor real (0-23 ou 0-59)
            item.dataset.fullIndex = (r * totalItems) + i; // Armazena o índice completo na lista repetida
            itemsContainer.appendChild(item);

            item.addEventListener('click', (event) => {
                const selectedValue = parseInt(event.target.dataset.value);
                currentValRef.value = selectedValue; // Atualiza a referência

                // Atualiza a variável global correspondente e a posição do carrossel principal
                if (parentOverlay.id === 'hours-selection-overlay') {
                    window.currentHour = selectedValue;
                    updateMainCarouselPosition(hoursItems, window.currentHour);
                } else if (parentOverlay.id === 'minutes-selection-overlay') {
                    window.currentMinute = selectedValue;
                    updateMainCarouselPosition(minutesItems, window.currentMinute);
                }
                // Adicione a lógica para os carrosséis de pausa se eles tiverem overlays de seleção dedicados
                // Ou, se usarem os mesmos overlays de horas/minutos, certifique-se de que o currentValRef correto seja passado.
                parentOverlay.classList.remove('active'); // Fecha o overlay
            });
        }
    }
}

/**
 * Atualiza a posição visual do carrossel de seleção (overlay) e lida com a rolagem "infinita".
 * @param {HTMLElement} itemsContainer - O contêiner dos itens do carrossel de seleção.
 * @param {number} currentLogicalIndex - O índice lógico (0-23 ou 0-59) do item a ser centralizado.
 * @param {number} totalItems - O número total de itens no carrossel.
 * @param {boolean} isScrolling - Verdadeiro se a atualização for devido a um evento de rolagem, falso caso contrário.
 */
function updateSelectionCarouselPosition(itemsContainer, currentLogicalIndex, totalItems, isScrolling = false) {
    // Calcula a posição de início do bloco de repetição do meio
    const midBlockStartOffset = Math.floor(NUM_REPEATS / 2) * totalItems;
    // Calcula o índice completo do item alvo dentro da lista repetida
    let targetFullIndex = midBlockStartOffset + currentLogicalIndex;

    // Calcula a posição Y de transformação para centralizar o item alvo
    // Subtrai itemHeight * bufferItems para que o item selecionado esteja visivelmente no centro do overlay
    let targetTransformY = -(targetFullIndex * itemHeight) + (bufferItems * itemHeight);

    // Gerencia as transições CSS para evitar saltos visíveis
    if (!isScrolling && isTransitioning) {
        itemsContainer.style.transition = `transform 0.2s ease-out`;
    } else if (isScrolling && !isTransitioning) {
        // Se estamos rolando e não há transição, desabilite temporariamente para um "snap" suave
        itemsContainer.style.transition = 'none';
    } else if (!isScrolling && !isTransitioning) {
        // Primeira renderização ou clique: habilita a transição
        itemsContainer.style.transition = `transform 0.2s ease-out`;
    }

    itemsContainer.style.transform = `translateY(${targetTransformY}px)`;

    // Lógica para rolagem "infinita": teletransporta a posição quando atinge as bordas
    const currentTransformY = parseFloat(itemsContainer.style.transform.replace('translateY(', '').replace('px)', ''));
    // Calcula a posição "normalizada" dentro de um único bloco de repetição
    const scrolledOffset = Math.abs(currentTransformY) - (midBlockStartOffset * itemHeight) + (bufferItems * itemHeight);


    // Se rolou perto do topo do bloco do meio, teletransporta para o bloco inferior (virtualmente igual)
    if (scrolledOffset < (bufferItems * itemHeight) && currentLogicalIndex >= 0) {
        const newLogicalIndex = currentLogicalIndex;
        const newTargetFullIndex = (NUM_REPEATS - 1) * totalItems + newLogicalIndex; // Último bloco
        const newTransformY = -(newTargetFullIndex * itemHeight) + (bufferItems * itemHeight);

        itemsContainer.style.transition = 'none'; // Desabilita transição para o teletransporte
        requestAnimationFrame(() => { // Garante que a atualização seja renderizada antes de reabilitar a transição
            itemsContainer.style.transform = `translateY(${newTransformY}px)`;
        });
    }
    // Se rolou perto do fundo do bloco do meio, teletransporta para o bloco superior (virtualmente igual)
    else if (scrolledOffset > ((totalItems - bufferItems) * itemHeight)) {
        const newLogicalIndex = currentLogicalIndex;
        const newTargetFullIndex = (0 * totalItems) + newLogicalIndex; // Primeiro bloco
        const newTransformY = -(newTargetFullIndex * itemHeight) + (bufferItems * itemHeight);

        itemsContainer.style.transition = 'none'; // Desabilita transição para o teletransporte
        requestAnimationFrame(() => {
            itemsContainer.style.transform = `translateY(${newTransformY}px)`;
        });
    }

    // Reabilita a transição se ela foi desativada para um snap ou se não estava ativa
    if (!isTransitioning) { // Apenas se não estivermos já numa transição de clique
        itemsContainer.style.transition = `transform 0.2s ease-out`;
    }
}

/**
 * Configura as interações para abrir o overlay de seleção, fechar e rolar com a roda do mouse.
 * @param {HTMLElement} mainItemsElement - O elemento .items do carrossel principal que abre o overlay.
 * @param {HTMLElement} selectionOverlay - O elemento overlay.
 * @param {HTMLElement} selectionItemsContainer - O contêiner dos itens no overlay.
 * @param {{value: number}} currentValRef - Uma referência mutável para a variável global do valor atual.
 * @param {number} totalItems - O número total de itens.
 */
function setupSelectionCarouselInteraction(mainItemsElement, selectionOverlay, selectionItemsContainer, currentValRef, totalItems) {
    mainItemsElement.addEventListener('click', (event) => {
        populateSelectionCarousel(selectionItemsContainer, totalItems, selectionOverlay, currentValRef);
        isTransitioning = true; // Indica que uma transição suave é desejada
        selectionItemsContainer.style.transition = `transform 0.2s ease-out`;
        updateSelectionCarouselPosition(selectionItemsContainer, currentValRef.value, totalItems, false);
        selectionOverlay.classList.add('active');
        event.stopPropagation(); // Evita que o clique se propague para fechar o overlay imediatamente
        setTimeout(() => { // Reseta a flag após a transição inicial
            isTransitioning = false;
        }, 200); // Deve corresponder à duração da transição CSS
    });

    selectionOverlay.addEventListener('click', (event) => {
        if (event.target === selectionOverlay) { // Só fecha se clicar fora da lista de seleção
            selectionOverlay.classList.remove('active');
        }
    });

    // Lógica de scroll da roda do mouse para o carrossel DENTRO do overlay
    selectionOverlay.querySelector('.selection-carousel').addEventListener('wheel', (event) => {
        event.preventDefault();
        let newLogicalIndex = currentValRef.value;

        if (event.deltaY > 0) { // Rolagem para baixo
            newLogicalIndex = (newLogicalIndex + 1) % totalItems;
        } else { // Rolagem para cima
            newLogicalIndex = (newLogicalIndex - 1 + totalItems) % totalItems;
        }
        currentValRef.value = newLogicalIndex;

        // Atualiza a variável global correspondente e a posição do carrossel principal
        if (selectionOverlay.id === 'hours-selection-overlay') {
            window.currentHour = newLogicalIndex;
            updateMainCarouselPosition(hoursItems, window.currentHour);
        } else if (selectionOverlay.id === 'minutes-selection-overlay') {
            window.currentMinute = newLogicalIndex;
            updateMainCarouselPosition(minutesItems, window.currentMinute);
        }
        // Adicione a lógica para os carrosséis de pausa se eles tiverem overlays de seleção dedicados
        // Ou, se usarem os mesmos overlays de horas/minutos, certifique-se de que o currentValRef correto seja passado.

        selectionItemsContainer.style.transition = `transform 0.2s ease-out`; // Garante transição para rolagem
        updateSelectionCarouselPosition(selectionItemsContainer, newLogicalIndex, totalItems, true);
    });
}


// --- Inicialização do DOM (Chamada Principal ao Carregar a Página) ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Referências aos carrosséis principais de Alarme ---
    hoursCarousel = document.getElementById('hours-carousel');
    hoursItems = document.getElementById('hours-items');
    hoursUpButton = hoursCarousel.querySelector('.carousel-button.up');
    hoursDownButton = hoursCarousel.querySelector('.carousel-button.down');

    minutesCarousel = document.getElementById('minutes-carousel');
    minutesItems = document.getElementById('minutes-items');
    minutesUpButton = minutesCarousel.querySelector('.carousel-button.up');
    minutesDownButton = minutesCarousel.querySelector('.carousel-button.down');

    // --- Referências aos Overlays e Carrosséis de Seleção (pop-up) ---
    hoursSelectionOverlay = document.getElementById('hours-selection-overlay');
    hoursSelectionCarousel = document.getElementById('hours-selection-carousel');
    hoursSelectionItems = document.getElementById('hours-selection-items');

    minutesSelectionOverlay = document.getElementById('minutes-selection-overlay');
    minutesSelectionCarousel = document.getElementById('minutes-selection-carousel');
    minutesSelectionItems = document.getElementById('minutes-selection-items');

    // --- Referências e Inicialização dos carrosséis de Duração da Pausa ---
    // Repetição do padrão para os carrosséis de duração de pausa
    pauseDurationHoursCarousel = document.getElementById('pause-duration-hours-carousel');
    pauseDurationHoursItems = document.getElementById('pause-duration-hours-items');
    pauseDurationHoursUpButton = pauseDurationHoursCarousel.querySelector('.carousel-button.up');
    pauseDurationHoursDownButton = pauseDurationHoursCarousel.querySelector('.carousel-button.down');

    pauseDurationMinutesCarousel = document.getElementById('pause-duration-minutes-carousel');
    pauseDurationMinutesItems = document.getElementById('pause-duration-minutes-items');
    pauseDurationMinutesUpButton = pauseDurationMinutesCarousel.querySelector('.carousel-button.up');
    pauseDurationMinutesDownButton = pauseDurationMinutesCarousel.querySelector('.carousel-button.down');

    // --- Referências e Inicialização dos carrosséis de Fim da Pausa ---
    // Repetição do padrão para os carrosséis de fim de pausa
    pauseEndHoursCarousel = document.getElementById('pause-end-hours-carousel');
    pauseEndHoursItems = document.getElementById('pause-end-hours-items');
    pauseEndHoursUpButton = pauseEndHoursCarousel.querySelector('.carousel-button.up');
    pauseEndHoursDownButton = pauseEndHoursCarousel.querySelector('.carousel-button.down');

    pauseEndMinutesCarousel = document.getElementById('pause-end-minutes-carousel');
    pauseEndMinutesItems = document.getElementById('pause-end-minutes-items');
    pauseEndMinutesUpButton = pauseEndMinutesCarousel.querySelector('.carousel-button.up');
    pauseEndMinutesDownButton = pauseEndMinutesCarousel.querySelector('.carousel-button.down');


    // --- Preenchimento e Configuração dos Carrosséis ---

    // Carrosséis de Alarme Principal
    populateMainCarousel(hoursItems, 24);
    populateMainCarousel(minutesItems, 60);

    // Criando referências mutáveis para as funções de setup
    const hourRef = { value: window.currentHour };
    const minuteRef = { value: window.currentMinute };

    setupMainCarouselScroll(hoursCarousel, hoursItems, hourRef, 24);
    setupMainCarouselScroll(minutesCarousel, minutesItems, minuteRef, 60);

    setupCarouselButtons(hoursUpButton, hoursDownButton, hoursItems, hourRef, 24, 'hours-carousel');
    setupCarouselButtons(minutesUpButton, minutesDownButton, minutesItems, minuteRef, 60, 'minutes-carousel');

    setupSelectionCarouselInteraction(hoursItems, hoursSelectionOverlay, hoursSelectionItems, hourRef, 24);
    setupSelectionCarouselInteraction(minutesItems, minutesSelectionOverlay, minutesSelectionItems, minuteRef, 60);

    // Popula inicialmente os carrosséis de seleção (para quando eles abrirem pela primeira vez)
    populateSelectionCarousel(hoursSelectionItems, 24, hoursSelectionOverlay, hourRef);
    populateSelectionCarousel(minutesSelectionItems, 60, minutesSelectionOverlay, minuteRef);


    // --- Configuração dos Carrosséis de Duração da Pausa ---
    populateMainCarousel(pauseDurationHoursItems, 24);
    populateMainCarousel(pauseDurationMinutesItems, 60);

    const pauseDurHourRef = { value: window.currentPauseDurationHour };
    const pauseDurMinuteRef = { value: window.currentPauseDurationMinute };

    setupMainCarouselScroll(pauseDurationHoursCarousel, pauseDurationHoursItems, pauseDurHourRef, 24);
    setupMainCarouselScroll(pauseDurationMinutesCarousel, pauseDurationMinutesItems, pauseDurMinuteRef, 60);

    setupCarouselButtons(pauseDurationHoursUpButton, pauseDurationHoursDownButton, pauseDurationHoursItems, pauseDurHourRef, 24, 'pause-duration-hours-carousel');
    setupCarouselButtons(pauseDurationMinutesUpButton, pauseDurationMinutesDownButton, pauseDurationMinutesItems, pauseDurMinuteRef, 60, 'pause-duration-minutes-carousel');

    // Você pode reutilizar os mesmos overlays de seleção de horas/minutos
    // Se quiser overlays separados, precisará de mais divs no HTML e mais instâncias aqui.
    // Usando os mesmos overlays, o click em um carrossel de pausa abrirá o overlay principal de horas/minutos.
    setupSelectionCarouselInteraction(pauseDurationHoursItems, hoursSelectionOverlay, hoursSelectionItems, pauseDurHourRef, 24);
    setupSelectionCarouselInteraction(pauseDurationMinutesItems, minutesSelectionOverlay, minutesSelectionItems, pauseDurMinuteRef, 60);


    // --- Configuração dos Carrosséis de Fim da Pausa ---
    populateMainCarousel(pauseEndHoursItems, 24);
    populateMainCarousel(pauseEndMinutesItems, 60);

    const pauseEndHourRef = { value: window.currentPauseEndHour };
    const pauseEndMinuteRef = { value: window.currentPauseEndMinute };

    setupMainCarouselScroll(pauseEndHoursCarousel, pauseEndHoursItems, pauseEndHourRef, 24);
    setupMainCarouselScroll(pauseEndMinutesCarousel, pauseEndMinutesItems, pauseEndMinuteRef, 60);

    setupCarouselButtons(pauseEndHoursUpButton, pauseEndHoursDownButton, pauseEndHoursItems, pauseEndHourRef, 24, 'pause-end-hours-carousel');
    setupCarouselButtons(pauseEndMinutesUpButton, pauseEndMinutesDownButton, pauseEndMinutesItems, pauseEndMinuteRef, 60, 'pause-end-minutes-carousel');

    // Reutilizando overlays de seleção de horas/minutos
    setupSelectionCarouselInteraction(pauseEndHoursItems, hoursSelectionOverlay, hoursSelectionItems, pauseEndHourRef, 24);
    setupSelectionCarouselInteraction(pauseEndMinutesItems, minutesSelectionOverlay, minutesSelectionItems, pauseEndMinuteRef, 60);


    // --- Definir Hora Inicial ao Carregar a Página ---
    const now = new Date();
    // Usa a função global exposta para definir a hora inicial dos carrosséis principais
    window.setInitialTime(now.getHours(), now.getMinutes());
});
