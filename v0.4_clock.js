// v0.4_clock.js
// Este arquivo contém a lógica principal para o seu despertador.
// Ele depende de 'v0.3_time.js' para os carrosséis de seleção de tempo.

/**
 * Solicita permissão para exibir notificações da área de trabalho e as exibe.
 * @param {string} title - O título da notificação.
 * @param {string} body - O corpo (conteúdo) da notificação.
 */
function showDesktopNotification(title, body) {
    if (!("Notification" in window)) {
        console.warn("Este navegador não suporta notificações de desktop.");
        return;
    }

    if (Notification.permission === "granted") {
        console.log("Permissão de notificação já concedida. Exibindo notificação...");
        new Notification(title, { body: body });
    } else if (Notification.permission === "denied") {
        console.warn("Permissão de notificação negada. Não é possível exibir.");
    } else {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Permissão de notificação concedida! Exibindo notificação...");
                new Notification(title, { body: body });
            } else if (permission === "denied") {
                console.warn("Permissão de notificação negada. Não é possível exibir.");
            } else {
                console.log("Permissão de notificação não concedida.");
            }
        }).catch(error => {
            console.error("Erro ao solicitar permissão de notificação:", error);
        });
    }
}


// Lógica Principal do Despertador
document.addEventListener('DOMContentLoaded', () => {
    // --- Verificações de Dependência ---
    // Verificamos se as funções globais do v0.3_time.js estão disponíveis.
    if (typeof window.getSelectedHour !== 'function' || typeof window.getSelectedMinute !== 'function' || typeof window.setInitialTime !== 'function') {
        console.error("Erro: As funções do carrossel (getSelectedHour, getSelectedMinute, setInitialTime) não foram carregadas corretamente. Certifique-se de que 'v0.3_time.js' esteja vinculado ANTES deste script no HTML.");
        document.getElementById('status-message').textContent = 'Erro de Inicialização: Script do carrossel ausente.';
        return; // Interrompe a execução se as dependências não forem atendidas
    }

    // --- Referências aos Elementos da UI ---
    const setAlarmButton = document.getElementById('setAlarmButton');
    const statusMessage = document.getElementById('status-message');
    const currentTimeDisplay = document.getElementById('current-time');

    // Referências para as opções de pausa e seus campos
    const opcaoDuracaoRadio = document.getElementById('opcao-duracao');
    const opcaoFimRadio = document.getElementById('opcao-fim');
    const camposDuracao = document.getElementById('campos-duracao');
    const camposFim = document.getElementById('campos-fim');

    let alarmSet = false;      // Estado para rastrear se um alarme está ativo
    let alarmHour;             // Hora armazenada do alarme definido
    let alarmMinute;           // Minuto armazenado do alarme definido
    let mainClockIntervalId;   // ID para o setInterval que atualiza a hora atual

    // --- Funções da UI para a Lógica de Pausa ---

    /**
     * Alterna a visibilidade dos campos de duração da pausa ou de hora de término com base na seleção do botão de rádio.
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

    // Adiciona ouvintes para os botões de rádio para alternar a visibilidade do campo
    if (opcaoDuracaoRadio) {
        opcaoDuracaoRadio.addEventListener('change', togglePauseFields);
    }
    if (opcaoFimRadio) {
        opcaoFimRadio.addEventListener('change', togglePauseFields);
    }

    // Define o estado inicial dos campos de pausa quando a página é carregada
    togglePauseFields();

    // --- Funções Principais do Alarme ---

    /**
     * Atualiza a exibição da hora atual e verifica se o alarme deve ser acionado.
     */
    function updateCurrentTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        currentTimeDisplay.textContent = `Hora Atual: ${hours}:${minutes}:${seconds}`;

        // Verifica se o alarme está ativo e se a hora atual corresponde à hora do alarme
        if (alarmSet && now.getHours() === alarmHour && now.getMinutes() === alarmMinute && now.getSeconds() === 0) {
            triggerAlarm();
            alarmSet = false; // Desativa o alarme após o disparo
            statusMessage.textContent = 'Alarme disparado!';
            setAlarmButton.textContent = 'Definir Alarme';
        }
    }

    /**
     * Define o alarme usando os valores dos carrosséis principais de horas e minutos.
     */
    function setAlarm() {
        // Usa as funções globais fornecidas por v0.3_time.js
        const hour = window.getSelectedHour();
        const minute = window.getSelectedMinute();

        if (hour === null || minute === null) {
            statusMessage.textContent = 'Por favor, selecione uma hora de alarme válida.';
            return;
        }

        alarmHour = hour;
        alarmMinute = minute;
        alarmSet = true;

        const formattedAlarmTime = `${String(alarmHour).padStart(2, '0')}:${String(alarmMinute).padStart(2, '0')}`;
        statusMessage.textContent = `Alarme definido para ${formattedAlarmTime}`;
        setAlarmButton.textContent = 'Alarme Definido (Clique para Cancelar)';

        // Notificação de desktop para confirmação do alarme
        showDesktopNotification("⏰ Alarme Definido!", `Seu alarme está definido para: ${formattedAlarmTime}`);
    }

    /**
     * Dispara o alarme: toca um som e exibe uma notificação.
     */
    function triggerAlarm() {
        console.log('Alarme tocando!');
        showDesktopNotification(
            "🔔 Acorde!",
            "São " + String(alarmHour).padStart(2, '0') + ":" + String(alarmMinute).padStart(2, '0')
        );

        const audio = new Audio('https://www.soundjay.com/buttons/beep-07.mp3');
        audio.play().catch(e => console.error("Erro ao reproduzir áudio:", e));

        setTimeout(() => {
            audio.pause();
            audio.currentTime = 0; // Reinicia o áudio para a próxima reprodução
        }, 5000); // Para de tocar após 5 segundos
    }

    // --- Ouvintes de Eventos ---

    // Ouvinte para o botão "Definir Alarme" / "Cancelar Alarme"
    if (setAlarmButton) {
        setAlarmButton.addEventListener('click', () => {
            if (alarmSet) {
                // Se o alarme estiver definido, cancele-o.
                alarmSet = false;
                statusMessage.textContent = 'Alarme cancelado.';
                setAlarmButton.textContent = 'Definir Alarme';
            } else {
                setAlarm(); // Caso contrário, defina o alarme
            }
        });
    }

    // --- Inicialização ao Carregar a Página ---

    // Define a hora inicial dos carrosséis principais para a hora atual do sistema.
    // Esta função é fornecida por v0.3_time.js.
    const now = new Date();
    window.setInitialTime(now.getHours(), now.getMinutes());

    // Inicia o intervalo do relógio principal para atualizar a exibição da hora atual a cada segundo.
    // Isso é executado continuamente, independentemente do estado do alarme.
    mainClockIntervalId = setInterval(updateCurrentTime, 1000);

    // Chamada inicial para atualizar a exibição da hora imediatamente ao carregar
    updateCurrentTime();
});
