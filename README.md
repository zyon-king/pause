# Pomodorus: Clock-Driven Pause Management

The most effective way to manage your Pomodoro pauses and notifications is through a **centralized clock monitoring system**. This system will constantly check the current time against a single, unified list of all your active pauses. When the current time matches a pause's start or end time, it'll trigger the appropriate notification. This approach is more robust and easier to scale.

---

## 1. The Unified Pause List

You'll keep all your configured pauses in one place: a **single `List of Pause Objects`**. This simplifies everything, as your clock monitor only needs to iterate through this one list to find all relevant pauses.

Each **Pause Object** in this list should have these key properties:

* **`id`**: A **unique identifier** for each pause. This is essential for managing individual pauses, like removing them or updating their status.
* **`startHour`**: The hour when the pause should begin (e.g., `9` for 9 AM).
* **`startMinute`**: The minute when the pause should begin (e.g., `30` for 30 minutes past the hour).
* **`endHour`**: The hour when the pause should end.
* **`endMinute`**: The minute when the pause should end.
* **`isDailyRepeat`**: A **boolean flag** (`true` or `false`).
    * Set to `true` if the pause should repeat every day at the specified time (typically for Gist-loaded pauses).
    * Set to `false` if it's a one-time pause, valid only for the day it's created.
* **`triggeredStartForToday`**: A **boolean flag** (`true` or `false`). This prevents the "pause start" notification from firing more than once *per day* for daily repeating pauses when their time arrives.
* **`triggeredEndForToday`**: A **boolean flag** (`true` or `false`). Similar to `triggeredStartForToday`, this ensures the "pause end" notification fires only once *per day*.
* **`isActive`**: A **boolean flag** (`true` or `false`). For one-time pauses, you might set this to `false` (or remove the pause) once it has completed its cycle. For daily repeats, it generally remains `true` unless the user explicitly disables the pause.

---

## 2. Centralized Clock Monitoring Logic

This is the core of how your Pomodorus will work. A single function will run very frequently (e.g., every second) using `setInterval`. This function's job is to check the time and trigger notifications.

Here's the refined **conceptual flow** for this monitoring function:

1.  **Get Current Time**:
    * At the start of each `setInterval` cycle, get the **`currentHour`** and **`currentMinute`** from the user's system clock. This ensures you're always checking against the live time.

2.  **Handle Daily Reset (for `isDailyRepeat` pauses)**:
    * **Logic**: At the very beginning of a new day (e.g., when `currentHour` is `00` and `currentMinute` is `00`, or during the first `setInterval` check that detects a new day), iterate through *all* `pauseObject`s where `isDailyRepeat` is `true`.
    * **Action**: For these daily repeating pauses, **reset both `triggeredStartForToday` and `triggeredEndForToday` to `false`**. This makes them ready to trigger again for the new day.

3.  **Iterate Through All Pauses**:
    * Now, loop through **every single `pauseObject`** in your `List of Pause Objects`.

4.  **Check for "Pause Start" Notification**:
    * **Condition**: If `currentHour` **equals** `pauseObject.startHour` **AND** `currentMinute` **equals** `pauseObject.startMinute`:
        * **For Daily Repeating Pauses (`isDailyRepeat: true`)**:
            * **Additional Check**: If `pauseObject.triggeredStartForToday` is currently `false`:
                * **Action**: **Trigger the "Pause Start" notification** (e.g., play a sound, show a visual alert).
                * **Update Flag**: Set `pauseObject.triggeredStartForToday` to `true`.
        * **For One-Time Pauses (`isDailyRepeat: false`)**:
            * **Additional Check**: If `pauseObject.isActive` is `true` (meaning it hasn't completed its one-time cycle yet):
                * **Action**: **Trigger the "Pause Start" notification**.
                * **Internal Status**: You might want to set an internal flag like `pauseObject.hasActuallyStarted = true;` to indicate it has begun.

5.  **Check for "Pause End" Notification**:
    * **Condition**: If `currentHour` **equals** `pauseObject.endHour` **AND** `currentMinute` **equals** `pauseObject.endMinute`:
        * **For Daily Repeating Pauses (`isDailyRepeat: true`)**:
            * **Additional Check**: If `pauseObject.triggeredEndForToday` is currently `false`:
                * **Action**: **Trigger the "Pause End" notification**.
                * **Update Flag**: Set `pauseObject.triggeredEndForToday` to `true`.
        * **For One-Time Pauses (`isDailyRepeat: false`)**:
            * **Additional Check**: If `pauseObject.isActive` is `true` (and optionally, if `pauseObject.hasActuallyStarted` is `true`):
                * **Action**: **Trigger the "Pause End" notification**.
                * **Update Status**: Set `pauseObject.isActive` to `false`. At this point, it's a good idea to **remove this `pauseObject` from the `List of Pause Objects`** entirely, as its one-time purpose is fulfilled.

---

## 3. User Interface (UI) and Data Persistence

These components will interact with your `List of Pause Objects`:

* **"Configurar Nova Pausa" Modal**:
    * When the user defines a new pause, it will **create a new `pauseObject`** and **add it to your `List of Pause Objects`**. The `isDailyRepeat` property will be set based on the user's choice in the modal.
* **"Pausas Ativas" Display (`#pauses-list`)**:
    * This section should be **dynamically rendered** based on the current contents of your `List of Pause Objects`. Any addition or removal of a pause object should immediately update this display.
* **Removing Pauses**:
    * The "Remover" button next to each active pause will simply **delete the corresponding `pauseObject` from your `List of Pause Objects`**.
* **Gist Integration ("Carregar/Salvar Pausas")**:
    * **Loading**: When you load from a Gist, you'll fetch the JSON data, parse it into an array of `pauseObject`s (these will likely all have `isDailyRepeat: true`), and **add them to your `List of Pause Objects`**. Implement logic to avoid adding duplicates if the same Gist is loaded multiple times.
    * **Saving**: When saving to a Gist, you'll **serialize only the `pauseObject`s where `isDailyRepeat` is `true`** (since one-time pauses generally shouldn't be permanently saved) into a JSON string and update your Gist.



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

https://github.com/w3teal/awesome-ringtone/tree/main

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tocador de Ringtone</title>
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background-color: #f0f0f0;
            font-family: sans-serif;
            color: #333;
        }
        .container {
            text-align: center;
            background-color: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #555;
            margin-bottom: 20px;
        }
        audio {
            width: 100%;
            max-width: 400px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Tocando: Titanium Ringtone</h1>
        <audio controls autoplay>
            <source src="https://raw.githubusercontent.com/w3teal/awesome-ringtone/main/Google%20Pixel/2016%20-%20Titanium%20-%20Android%20Material%20Ringtone.mp3" type="audio/mpeg">
            Seu navegador não suporta o elemento de áudio.
        </audio>
        <p>Aproveite o som do ringtone "Titanium"!</p>
    </div>
</body>
</html>
