# Pomodorus: A Modern Alarm & Pause System

Pomodorus is a sleek, web-based alarm clock that goes beyond simple wake-up calls. It allows you to define specific "pause" periods throughout your day, either by duration or end time, making it ideal for managing work/break intervals, mindful interruptions, or even just scheduling your daily routines.

## 🚀 Welcome to: My Pomodorus Features

This system is designed to help you effectively manage your breaks during your focus sessions.

Here are the main features you can use:

* **⏰ Current Clock Display:** Keep track of the exact time in real-time on the main display.
* **➕ Configure New Break:**
    * Set the **start time** for your break using interactive hour and minute carousels.
    * Choose how to define the end of your break:
        * **By Duration:** Specify the length of the break in hours and minutes.
        * **By End Time:** Set a specific time for the break to conclude.
    * **Daily Repetition:** Check this option for the break to repeat every day (requires Gist configuration).
* **📋 Active Breaks Management:**
    * View a clear list of all your scheduled breaks.
    * Each break displays its start time, calculated duration, and end time, along with an indicator if it's a daily break.
    * **Remove Breaks:** Delete individual breaks from your list at any time.
* **🔔 Break Notifications:** Receive convenient desktop notifications when your breaks start and end.
* **💾 Load/Save Breaks (GitHub Gist):**
    * **Integrated Configuration:** Store and load your **Personal Access Token (PAT)** and **Gist ID** directly within the application.
    * **Synchronization:** Save your daily breaks to a private GitHub Gist to access them across different sessions or devices.
    * **Retrieval:** Load previously saved breaks from your Gist to restore your schedule.

## Features Resume

* **Real-time Clock Display:** Always see the current time at a glance.
* **Intuitive Pause Configuration:** Set new pauses through a user-friendly, multi-step modal interface.
* **Flexible Pause Definition:** Define pauses by their **duration** (e.g., "1 hour 30 minutes") or by a specific **end time** (e.g., "end at 17:00").
* **Interactive Time Carousels:** Modern, scrollable carousels for easy hour and minute selection, offering a more engaging experience than standard dropdowns.
* **Daily Repetition:** Mark any pause to repeat daily.
* **Persistent Storage with GitHub Gist:** For daily repeating pauses, your configurations are securely saved and loaded from a private GitHub Gist, ensuring your schedule is maintained across sessions and devices.
* **Desktop Notifications:** Receive timely notifications when a pause starts and ends, even if the browser window isn't in focus.
* **Active Pauses List:** A clear overview of all your configured pauses, with the ability to remove them individually.
* **Clean & Modern UI:** A responsive and aesthetically pleasing design built with plain HTML and CSS, ensuring a smooth user experience.

---

## How to Use

1.  **Open Pomodorus:** Simply open the `index.html` file in your web browser.
2.  **Set a New Pause:**
    * Click the "**Configurar Nova Pausa**" (Configure New Pause) button.
    * In the first modal, use the carousels to select the **start time** for your pause, then click "Avançar" (Next).
    * In the second modal, choose whether to define the pause by "**Duração da pausa**" (Pause duration) or "**Hora de término**" (End time). Adjust the hours and minutes accordingly using the carousels.
    * If you want this pause to repeat every day, check the "**Repetição Diária (requer Gist)**" (Daily Repetition (requires Gist)) checkbox.
    * Click "**Definir Pausa**" (Define Pause) to save your configuration.
3.  **Manage Gist (for Daily Pauses):**
    * Click the "**Carregar/Salvar Pausas (Gist)**" (Load/Save Pauses (Gist)) button.
    * Enter your **GitHub Personal Access Token (PAT)** and the **ID of your Gist**.
        * **Creating a PAT:** Go to your GitHub settings > Developer settings > Personal access tokens > Tokens (classic) > Generate new token. Give it a descriptive name (e.g., "Pomodorus Gist Access") and grant it **`gist` scope (read and write access to gists)**.
        * **Creating a Gist:** Go to [gist.github.com](https://gist.github.com/), create a new secret gist (or public, if you prefer, but secret is recommended), and copy its ID from the URL (e.g., `https://gist.github.com/yourusername/**gistid**`). The file name inside the gist doesn't matter, but it should be named something like `pausas.json` for clarity.
    * Click "**Salvar e Carregar**" (Save and Load) to store your credentials locally and attempt to load any existing daily pauses from your Gist.
4.  **Remove a Pause:** Click the "**Remover**" (Remove) button next to any active pause in the list.

---

## Technologies Used

* **HTML5:** For the page structure.
* **CSS3:** For styling and visual presentation.
* **JavaScript (ES6+):** For all interactive functionalities, including carousel logic, modal management, alarm scheduling, and GitHub Gist integration.

---

## Development & Contribution

Pomodorus is designed to be a simple, single-page application. Feel free to fork this repository, suggest improvements, or contribute to its development.

---

## License

[Choose a license, e.g., MIT License. If you don't add one, GitHub will usually default to none, but it's good practice to specify.]
