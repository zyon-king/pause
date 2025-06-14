// This script defines the TimeCarousel class and its associated global functions.

// Define constants for item height and number of repeats for the carousel items.
const itemHeight = 50; // Height of each individual number item in pixels.
const NUM_REPEATS = 50; // Number of times to repeat the number sequence to ensure infinite scroll.

/**
 * TimeCarousel Class: Manages a single carousel for hours or minutes.
 */
class TimeCarousel {
    constructor(
        containerId,
        itemsContainerId,
        upButtonSelector,
        downButtonSelector,
        minValue,
        maxValue,
        selectionOverlayId,
        selectionItemsId,
        selectCallback
    ) {
        this.container = document.getElementById(containerId);
        this.itemsContainer = document.getElementById(itemsContainerId);
        this.upButton = this.container.querySelector(upButtonSelector);
        this.downButton = this.container.querySelector(downButtonSelector);
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.range = maxValue - minValue + 1;
        this.selectionOverlay = document.getElementById(selectionOverlayId);
        this.selectionItemsContainer = document.getElementById(selectionItemsId);
        this.selectCallback = selectCallback;

        this.currentIndex = 0; // Current selected value index relative to minValue
        this.isDragging = false;
        this.startY = 0;
        this.currentY = 0;
        this.dragOffset = 0;
        this.animationFrameId = null;

        this.setupItems();
        this.setupSelectionOverlay();
        this.addEventListeners();
        this.snapToNearestItem(); // Initial snap to align correctly
    }

    /**
     * Populates the carousel with repeated number sequences for infinite scroll.
     */
    setupItems() {
        this.itemsContainer.innerHTML = ''; // Clear existing items
        const fragment = document.createDocumentFragment();

        for (let r = 0; r < NUM_REPEATS; r++) {
            for (let i = this.minValue; i <= this.maxValue; i++) {
                const item = document.createElement('div');
                item.classList.add('item');
                item.textContent = String(i).padStart(2, '0');
                item.dataset.value = i; // Store the actual value
                fragment.appendChild(item);
            }
        }
        this.itemsContainer.appendChild(fragment);

        // Set initial scroll position to the middle section of repeats
        this.itemsContainer.style.transform = `translateY(-${(NUM_REPEATS / 2) * this.range * itemHeight}px)`;
        this.currentY = (NUM_REPEATS / 2) * this.range * itemHeight; // Initialize currentY
    }

    /**
     * Populates the selection overlay with all possible values.
     */
    setupSelectionOverlay() {
        this.selectionItemsContainer.innerHTML = '';
        const fragment = document.createDocumentFragment();
        for (let i = this.minValue; i <= this.maxValue; i++) {
            const item = document.createElement('div');
            item.classList.add('item');
            item.textContent = String(i).padStart(2, '0');
            item.dataset.value = i;
            item.addEventListener('click', () => {
                this.selectCallback(i); // Use the callback to set the main carousel
                this.toggleSelectionOverlay(false);
            });
            fragment.appendChild(item);
        }
        this.selectionItemsContainer.appendChild(fragment);
    }

    /**
     * Adds event listeners for buttons, touch/mouse dragging, and click to open overlay.
     */
    addEventListeners() {
        this.upButton.addEventListener('click', () => this.scrollBy(-itemHeight));
        this.downButton.addEventListener('click', () => this.scrollBy(itemHeight));

        this.itemsContainer.addEventListener('mousedown', this.handleStart.bind(this));
        this.itemsContainer.addEventListener('mousemove', this.handleMove.bind(this));
        this.itemsContainer.addEventListener('mouseup', this.handleEnd.bind(this));
        this.itemsContainer.addEventListener('mouseleave', this.handleEnd.bind(this)); // End drag if mouse leaves

        this.itemsContainer.addEventListener('touchstart', this.handleStart.bind(this), { passive: true });
        this.itemsContainer.addEventListener('touchmove', this.handleMove.bind(this), { passive: true });
        this.itemsContainer.addEventListener('touchend', this.handleEnd.bind(this));

        // Event listener to open selection overlay on carousel click
        this.itemsContainer.addEventListener('click', (e) => {
            if (!this.isDragging && Math.abs(this.dragOffset) < 5) { // Only open if not dragging significantly
                this.toggleSelectionOverlay(true);
                this.scrollToSelectedInOverlay(this.getSelectedValue());
            }
        });

        // Close overlay when clicking outside
        this.selectionOverlay.addEventListener('click', (e) => {
            if (e.target === this.selectionOverlay) {
                this.toggleSelectionOverlay(false);
            }
        });

        // Add scroll event listener for the selection overlay
        this.selectionItemsContainer.addEventListener('scroll', () => {
            // No snapping on scroll, but you could add a subtle active state here
        });
    }

    /**
     * Handles the start of a drag/touch gesture.
     * @param {Event} e - The event object.
     */
    handleStart(e) {
        this.isDragging = true;
        this.startY = e.clientY || e.touches[0].clientY;
        this.itemsContainer.style.transition = 'none'; // Disable transition during drag
        this.dragOffset = 0;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    /**
     * Handles the continuation of a drag/touch gesture.
     * @param {Event} e - The event object.
     */
    handleMove(e) {
        if (!this.isDragging) return;

        const clientY = e.clientY || e.touches[0].clientY;
        this.dragOffset = clientY - this.startY;

        this.currentY -= this.dragOffset; // Apply drag offset to currentY
        this.startY = clientY; // Update startY for next frame

        this.updateCarouselPosition();
    }

    /**
     * Handles the end of a drag/touch gesture.
     */
    handleEnd() {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.itemsContainer.style.transition = 'transform 0.2s ease-out'; // Re-enable transition
        this.snapToNearestItem(); // Snap to the closest item after drag ends
    }

    /**
     * Updates the CSS transform for the carousel items.
     */
    updateCarouselPosition() {
        this.itemsContainer.style.transform = `translateY(-${this.currentY}px)`;
    }

    /**
     * Scrolls the carousel by a specified amount (e.g., itemHeight).
     * @param {number} scrollAmount - The amount to scroll (positive for down, negative for up).
     */
    scrollBy(scrollAmount) {
        this.currentY += scrollAmount;
        this.snapToNearestItem(); // Snap after button click
    }

    /**
     * Snaps the carousel to the nearest valid item position, handles wrapping.
     */
    snapToNearestItem() {
        const targetScrollY = Math.round(this.currentY / itemHeight) * itemHeight;
        this.currentY = targetScrollY;

        // Calculate the actual value at the visual center
        let visualIndex = Math.round((this.currentY / itemHeight) % this.range);
        if (visualIndex < 0) {
            visualIndex += this.range; // Handle negative modulo results
        }
        let selectedValue = this.minValue + visualIndex;

        // Adjust for "infinite" scrolling: recenter if too far from the middle block
        const middleBlockStart = (NUM_REPEATS / 2) * this.range * itemHeight;
        const offsetFromMiddle = this.currentY - middleBlockStart;

        if (Math.abs(offsetFromMiddle) > (this.range / 2) * itemHeight * NUM_REPEATS / 4) { // Threshold for recentering
            const newMiddleY = middleBlockStart + (visualIndex * itemHeight);
            this.currentY = newMiddleY;
        }

        this.itemsContainer.style.transform = `translateY(-${this.currentY}px)`;
        // Update current index based on the snapped position
        this.currentIndex = selectedValue - this.minValue;
        this.updateActiveItem();
    }

    /**
     * Sets the carousel to a specific value.
     * @param {number} value - The value to set (e.g., 10 for hours, 30 for minutes).
     */
    setValue(value) {
        if (value < this.minValue || value > this.maxValue) {
            console.warn(`Value ${value} is out of range [${this.minValue}-${this.maxValue}] for this carousel.`);
            return;
        }

        const targetIndex = value - this.minValue;
        // Calculate Y position to center the targetIndex in the middle repeat block
        const middleBlockIndex = Math.floor(NUM_REPEATS / 2);
        const targetY = (middleBlockIndex * this.range * itemHeight) + (targetIndex * itemHeight);

        this.currentY = targetY;
        this.itemsContainer.style.transition = 'none'; // Disable transition for direct set
        this.itemsContainer.style.transform = `translateY(-${this.currentY}px)`;
        this.currentIndex = targetIndex;
        this.updateActiveItem();
        // Force a reflow to ensure the 'none' transition is applied before re-enabling
        void this.itemsContainer.offsetWidth;
        this.itemsContainer.style.transition = 'transform 0.2s ease-out';
    }

    /**
     * Gets the currently selected value from the carousel.
     * @returns {number} The selected value.
     */
    getSelectedValue() {
        // Calculate the value based on the current Y position and snap rules.
        const effectiveY = this.currentY;
        let selectedIndex = Math.round(effectiveY / itemHeight);
        selectedIndex = selectedIndex % this.range;
        if (selectedIndex < 0) {
            selectedIndex += this.range;
        }
        return this.minValue + selectedIndex;
    }

    /**
     * Updates the visual active state of the carousel item.
     */
    updateActiveItem() {
        this.itemsContainer.querySelectorAll('.item').forEach(item => {
            item.style.color = '#555'; // Default color
            item.style.fontWeight = 'normal';
            item.style.fontSize = '24px';
        });

        const activeItemIndex = this.getSelectedValue();
        const items = Array.from(this.itemsContainer.children);

        // Find all items that represent the active value
        items.forEach(item => {
            if (parseInt(item.dataset.value) === activeItemIndex) {
                item.style.color = '#00796b'; // Highlight color
                item.style.fontWeight = 'bold';
                item.style.fontSize = '28px';
            }
        });
    }

    /**
     * Toggles the visibility of the full selection overlay.
     * @param {boolean} show - True to show, false to hide.
     */
    toggleSelectionOverlay(show) {
        if (show) {
            this.selectionOverlay.classList.add('active');
        } else {
            this.selectionOverlay.classList.remove('active');
        }
    }

    /**
     * Scrolls the selection overlay to center the currently selected value.
     * @param {number} selectedValue - The value that is currently selected in the main carousel.
     */
    scrollToSelectedInOverlay(selectedValue) {
        const itemElements = Array.from(this.selectionItemsContainer.children);
        const targetItem = itemElements.find(item => parseInt(item.dataset.value) === selectedValue);

        if (targetItem) {
            // Calculate scroll position to center the target item
            const containerHeight = this.selectionItemsContainer.clientHeight;
            const itemOffsetTop = targetItem.offsetTop;
            const itemHeight = targetItem.offsetHeight;

            // Scroll to center: itemOffsetTop - (containerHeight / 2) + (itemHeight / 2)
            this.selectionItemsContainer.scrollTop = itemOffsetTop - (containerHeight / 2) + (itemHeight / 2);
        }
    }
}

// Global instances of carousels
let hoursCarousel;
let minutesCarousel;
let pauseDurationHoursCarousel;
let pauseDurationMinutesCarousel;
let pauseEndHoursCarousel;
let pauseEndMinutesCarousel;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize main alarm carousels
    hoursCarousel = new TimeCarousel(
        'hours-carousel', 'hours-items', '.up', '.down', 0, 23,
        'hours-selection-overlay', 'hours-selection-items',
        (value) => hoursCarousel.setValue(value) // Callback to update the main carousel
    );
    minutesCarousel = new TimeCarousel(
        'minutes-carousel', 'minutes-items', '.up', '.down', 0, 59,
        'minutes-selection-overlay', 'minutes-selection-items',
        (value) => minutesCarousel.setValue(value)
    );

    // Initialize pause duration carousels
    pauseDurationHoursCarousel = new TimeCarousel(
        'pause-duration-hours-carousel', 'pause-duration-hours-items', '.up', '.down', 0, 23,
        'hours-selection-overlay', 'hours-selection-items', // Using same selection overlay for hours
        (value) => pauseDurationHoursCarousel.setValue(value)
    );
    pauseDurationMinutesCarousel = new TimeCarousel(
        'pause-duration-minutes-carousel', 'pause-duration-minutes-items', '.up', '.down', 0, 59,
        'minutes-selection-overlay', 'minutes-selection-items', // Using same selection overlay for minutes
        (value) => pauseDurationMinutesCarousel.setValue(value)
    );

    // Initialize pause end time carousels
    pauseEndHoursCarousel = new TimeCarousel(
        'pause-end-hours-carousel', 'pause-end-hours-items', '.up', '.down', 0, 23,
        'hours-selection-overlay', 'hours-selection-items',
        (value) => pauseEndHoursCarousel.setValue(value)
    );
    pauseEndMinutesCarousel = new TimeCarousel(
        'pause-end-minutes-carousel', 'pause-end-minutes-items', '.up', '.down', 0, 59,
        'minutes-selection-overlay', 'minutes-selection-items',
        (value) => pauseEndMinutesCarousel.setValue(value)
    );
});

// --- Global helper functions for alarm-clock.js to use ---
function getSelectedHour() {
    return hoursCarousel ? hoursCarousel.getSelectedValue() : null;
}

function getSelectedMinute() {
    return minutesCarousel ? minutesCarousel.getSelectedValue() : null;
}

function setInitialTime(hour, minute) {
    if (hoursCarousel) hoursCarousel.setValue(hour);
    if (minutesCarousel) minutesCarousel.setValue(minute);
}

// Add more getters for pause duration and end time if needed by alarm-clock.js
function getPauseDurationHour() {
    return pauseDurationHoursCarousel ? pauseDurationHoursCarousel.getSelectedValue() : null;
}

function getPauseDurationMinute() {
    return pauseDurationMinutesCarousel ? pauseDurationMinutesCarousel.getSelectedValue() : null;
}

function getPauseEndHour() {
    return pauseEndHoursCarousel ? pauseEndHoursCarousel.getSelectedValue() : null;
}

function getPauseEndMinute() {
    return pauseEndMinutesCarousel ? pauseEndMinutesCarousel.getSelectedValue() : null;
}
