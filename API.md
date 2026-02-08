# Game Engine API Documentation

This document provides technical documentation for developers working with the Survival Decision Series game engine.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Core Data Structures](#core-data-structures)
- [Game Engine Functions](#game-engine-functions)
- [Audio Manager API](#audio-manager-api)
- [Achievement Manager API](#achievement-manager-api)
- [Theme System](#theme-system)
- [Keyboard Navigation](#keyboard-navigation)
- [Local Storage Schema](#local-storage-schema)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                 unified-survival-game.html              │
│  ┌───────────────┐  ┌────────────────┐  ┌───────────┐  │
│  │ Scenario      │  │ Game Content   │  │ Results   │  │
│  │ Selector      │  │ (Hidden)       │  │ Display   │  │
│  └───────────────┘  └────────────────┘  └───────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                      script.js                          │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Game Loop   │  │ Audio Manager│  │ Achievement   │  │
│  │ & Scoring   │  │ (6 sounds)   │  │ Manager (11)  │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Drag & Drop │  │ Keyboard Nav │  │ Timer System  │  │
│  │ System      │  │ (Arrows,Tab) │  │ (4 modes)     │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    scenarios.json                       │
│  8 scenarios × (10 items + config + content)           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    localStorage                         │
│  High Scores | Achievements | Audio Prefs | Theme      │
└─────────────────────────────────────────────────────────┘
```

**Technology Stack:**
- Vanilla JavaScript (ES6+)
- CSS3 (Custom Properties, Grid, Flexbox)
- HTML5 (Drag & Drop API, localStorage API, Audio API)
- No external dependencies or frameworks

## Core Data Structures

### Scenario Object

Loaded from `scenarios.json`:

```javascript
{
  "moon": {
    "config": {
      "authorityName": string,        // e.g., "NASA"
      "expertTitle": string,          // e.g., "NASA Expert Assessment"
      "expertSource": string,         // e.g., "NASA"
      "expertReadyMessage": string,   // e.g., "You're ready for lunar missions!"
      "themePrimary": string,         // CSS color (dark)
      "themeSecondary": string,       // CSS color (darker)
      "themeAccent": string,          // CSS color (highlight)
      "themeText": string,            // CSS color (text)
      "themeBg": string,              // CSS color (background)
      "themeBorder": string,          // CSS color (borders)
      "scoringThresholds": {
        "excellent": number,          // e.g., 15
        "good": number,               // e.g., 30
        "fair": number                // e.g., 50
      }
    },
    "content": {
      "title": string,                // Scenario title
      "emergencyScenario": string,    // 3-4 paragraph description
      "instructions": string,         // Ranking instructions
      "dragInstruction": string       // Drag-and-drop hint
    },
    "items": [                        // Array of 10 items
      {
        "id": string,                 // Unique ID (e.g., "moon1")
        "name": string,               // Item name
        "description": string,        // Brief description
        "expertRank": number,         // 1-10 (1 = most critical)
        "reasoning": string           // Expert explanation
      }
    ]
  }
}
```

### Current Order Array

Tracks the player's current item ranking:

```javascript
let currentOrder = [
  {
    id: "moon1",
    name: "Oxygen Tanks",
    description: "50 kg oxygen supply",
    expertRank: 1,
    reasoning: "Life support priority..."
  },
  // ... 9 more items in player's order
];
```

### High Score Entry

```javascript
{
  initials: "ABC",      // 3 uppercase letters
  time: 63450,          // Time in milliseconds
  date: 1738800000000   // Unix timestamp
}
```

## Game Engine Functions

### Core Functions

#### `loadScenarios()`
Fetches and parses `scenarios.json`.

**Returns:** `Promise<Object>` - Scenarios object or null on error

**Usage:**
```javascript
const SCENARIOS = await loadScenarios();
if (!SCENARIOS) {
  // Handle error (already shown to user)
}
```

#### `loadScenario(scenarioKey)`
Loads a specific scenario and applies its theme.

**Parameters:**
- `scenarioKey` (string) - Scenario ID from scenarios.json

**Side effects:**
- Updates `currentScenario` global
- Applies theme colors via `applyTheme()`
- Renders items via `renderItems()`
- Updates UI text content
- Starts background music (if enabled)
- Announces scenario to screen readers

**Usage:**
```javascript
loadScenario('moon'); // Loads lunar survival scenario
```

#### `applyTheme(config)`
Applies scenario theme colors to CSS custom properties.

**Parameters:**
- `config` (object) - Scenario config object with theme colors

**Side effects:**
- Sets CSS variables on document root
- Updates all themed elements instantly

**CSS Variables Updated:**
```css
--primary-dark
--primary-medium
--primary-light
--accent-primary
--accent-secondary
--accent-tertiary
```

#### `calculateScore()`
Calculates difference-based scoring by comparing player ranking to expert ranking.

**Returns:** `number` - Total difference score (0 = perfect, higher = worse)

**Algorithm:**
```javascript
totalScore = Σ |playerRank[i] - expertRank[i]| for i = 0 to 9
```

**Example:**
```
Item: Oxygen Tank
Player Rank: 3
Expert Rank: 1
Difference: |3 - 1| = 2

Total for all 10 items = Σ differences
```

#### `checkRankings()`
Main scoring function triggered when player submits rankings.

**Side effects:**
- Stops timer and calculates elapsed time
- Calculates total difference score
- Determines assessment (Excellent/Good/Fair/Poor)
- Displays results with comparison table
- Checks achievements
- Plays success/failure sound
- Shows high score modal if applicable
- Announces results to screen reader

**Assessment Thresholds:**
```javascript
if (totalScore <= config.scoringThresholds.excellent) {
    assessment = "EXCELLENT"; // Typically ≤15
} else if (totalScore <= config.scoringThresholds.good) {
    assessment = "GOOD";      // Typically ≤30
} else if (totalScore <= config.scoringThresholds.fair) {
    assessment = "FAIR";      // Typically ≤50
} else {
    assessment = "POOR";      // >50
}
```

### Drag and Drop Functions

#### `handleDragStart(e)`
Initiates drag operation.

**Parameters:**
- `e` (DragEvent) - Drag event object

**Side effects:**
- Sets `draggedElement` global
- Adds `.dragging` class to card
- Plays pickup sound
- Triggers haptic feedback (if supported)

#### `handleDragOver(e)`
Prevents default to allow drop.

**Parameters:**
- `e` (DragEvent) - Drag event object

**Required:** Must call `e.preventDefault()` to enable drop

#### `handleDrop(e)`
Handles item reordering on drop.

**Parameters:**
- `e` (DragEvent) - Drag event object

**Side effects:**
- Swaps items in `currentOrder` array
- Calls `renderItems()` to update display
- Removes `.dragging` class
- Plays drop sound
- Announces change to screen reader

### Keyboard Navigation Functions

#### `handleKeyboardNavigation(e)`
Main keyboard event handler for accessibility.

**Supported Keys:**
- `Tab` / `Shift+Tab` - Navigate between cards
- `Arrow Up` - Move focused card up one position
- `Arrow Down` - Move focused card down one position
- `Enter` / `Space` - Select/deselect card for reordering
- `Escape` - Cancel selection
- `1-9`, `0` - Quick assign card to rank (1-9, 0=10)

**Parameters:**
- `e` (KeyboardEvent) - Keyboard event object

**Side effects:**
- Updates `currentOrder` array
- Re-renders items
- Maintains focus on moved card
- Announces changes to screen reader
- Plays appropriate sounds

#### `moveCardUp(card)`
Moves card up one position in ranking.

**Parameters:**
- `card` (HTMLElement) - Item card element

**Side effects:**
- Swaps items in `currentOrder`
- Calls `renderItems()`
- Maintains keyboard focus
- Announces new position

#### `moveCardDown(card)`
Moves card down one position in ranking.

**Parameters:**
- `card` (HTMLElement) - Item card element

**Side effects:**
- Swaps items in `currentOrder`
- Calls `renderItems()`
- Maintains keyboard focus
- Announces new position

## Audio Manager API

Global object: `audioManager`

### Properties

```javascript
audioManager = {
    sounds: {
        pickup: Audio,   // Card grab sound
        drop: Audio,     // Card drop sound
        click: Audio,    // Button click sound
        tick: Audio,     // Timer warning sound
        success: Audio,  // High score achieved
        failure: Audio   // Poor score sound
    },
    bgMusic: Audio,      // Background music player
    volume: 0.3,         // UI sound volume (0-1)
    bgVolume: 0.15,      // Background music volume (0-1)
    muted: false,        // Global mute state
    bgMusicPlaying: false
}
```

### Methods

#### `audioManager.init()`
Initializes audio system, loads preferences from localStorage.

**Side effects:**
- Loads saved mute state
- Loads saved volume level
- Sets volumes on all sound objects
- Updates mute button UI

**Call once on page load:**
```javascript
document.addEventListener('DOMContentLoaded', () => {
    audioManager.init();
});
```

#### `audioManager.play(soundName)`
Plays a UI sound effect.

**Parameters:**
- `soundName` (string) - One of: 'pickup', 'drop', 'click', 'tick', 'success', 'failure'

**Returns:** `void`

**Error handling:**
- Silently catches autoplay restrictions
- Logs errors to console
- Does nothing if muted

**Usage:**
```javascript
audioManager.play('pickup');  // When card is grabbed
audioManager.play('success'); // When achievement unlocked
```

#### `audioManager.playBgMusic(scenarioId)`
Plays looping background music for a scenario.

**Parameters:**
- `scenarioId` (string) - Scenario key (e.g., 'moon', 'shipwreck')

**Side effects:**
- Stops current music
- Loads new music file from `audio/bg/${scenarioId}.mp3`
- Sets loop mode
- Starts playback (if not muted)

**Usage:**
```javascript
audioManager.playBgMusic('moon');
```

#### `audioManager.stopBgMusic()`
Stops and resets background music.

**Side effects:**
- Pauses audio
- Resets playback position to 0
- Sets `bgMusicPlaying` to false

#### `audioManager.toggleMute()`
Toggles global mute state.

**Side effects:**
- Flips `muted` boolean
- Saves to localStorage
- Updates mute button icon (🔊/🔇)
- Pauses/resumes background music
- Updates button aria-label

**Usage:**
```javascript
document.getElementById('audioToggle').addEventListener('click', () => {
    audioManager.toggleMute();
});
```

## Achievement Manager API

Global object: `achievementManager`

### Structure

```javascript
achievementManager = {
    achievements: {
        // Completion achievements
        scenarioMaster: {
            id: 'scenarioMaster',
            name: 'Scenario Master',
            description: 'Complete all 8 survival scenarios',
            icon: '🏆',
            unlocked: false,
            unlockedDate: null,
            progress: 0,
            maxProgress: 8
        },
        speedDemon: { /* ... */ },
        perfectScore: { /* ... */ },

        // Skill achievements (one per scenario)
        lunarLegend: { /* ... */ },
        seaSurvivor: { /* ... */ },
        // ... etc for all 8 scenarios
    },

    init() { /* Load from localStorage */ },
    checkAchievements(scenarioId, differenceScore, timeMs, difficulty) { /* ... */ },
    unlock(achievementId) { /* ... */ },
    showToast(achievement) { /* ... */ },
    save() { /* ... */ }
}
```

### Methods

#### `achievementManager.init()`
Loads achievements from localStorage.

**Side effects:**
- Parses JSON from localStorage
- Merges with default achievement structure
- Updates `achievements` object

#### `achievementManager.checkAchievements(scenarioId, differenceScore, timeMs, difficulty)`
Checks if any achievements were unlocked based on game results.

**Parameters:**
- `scenarioId` (string) - Scenario key
- `differenceScore` (number) - Total score (lower is better)
- `timeMs` (number) - Time taken in milliseconds (0 for untimed)
- `difficulty` (string) - 'untimed', '1min', '3min', '5min'

**Achievement Conditions:**
```javascript
// Perfect Score: difference score is exactly 0
if (differenceScore === 0) unlock('perfectScore');

// Speed Demon: complete in under 1 minute (any timed mode)
if (timeMs < 60000 && difficulty !== 'untimed') unlock('speedDemon');

// Skill achievements: difference score ≤15 (excellent threshold)
if (differenceScore <= 15) unlock(`${scenarioId}Legend`);

// Scenario Master: check if all 8 scenarios completed
if (all 8 skill achievements unlocked) unlock('scenarioMaster');
```

**Side effects:**
- Unlocks achievements
- Shows toast notifications
- Plays success sound
- Announces to screen reader
- Saves to localStorage

#### `achievementManager.showToast(achievement)`
Displays achievement unlock notification.

**Parameters:**
- `achievement` (object) - Achievement object

**Side effects:**
- Creates toast DOM element
- Animates slide-in from right
- Auto-removes after 4 seconds
- Accessible to screen readers

**Toast HTML:**
```html
<div class="achievement-toast show">
    <div class="achievement-icon">🏆</div>
    <div class="achievement-content">
        <div class="achievement-title">Achievement Unlocked</div>
        <div class="achievement-name">Scenario Master</div>
        <div class="achievement-desc">Complete all 8 scenarios</div>
    </div>
</div>
```

## Theme System

### Dynamic Theme Application

The game uses CSS custom properties for dynamic theming:

```javascript
function applyTheme(config) {
    const root = document.documentElement;
    root.style.setProperty('--primary-dark', config.themePrimary);
    root.style.setProperty('--primary-medium', config.themeSecondary);
    root.style.setProperty('--accent-primary', config.themeAccent);
    root.style.setProperty('--text-primary', config.themeText);
    // ... etc
}
```

### Theme Persistence

Dark/light mode preference stored in localStorage:

```javascript
// Save
localStorage.setItem('app-theme', 'dark'); // or 'light'

// Load
const savedTheme = localStorage.getItem('app-theme');
if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
}
```

### Light Mode CSS

Light mode triggered by `.light-mode` class on `<body>`:

```css
body.light-mode {
    --base-bg-dark: #f5f5f5;
    --base-text-primary: #1a1a1a;
    /* ... */
}
```

## Keyboard Navigation

### Focus Management

```javascript
// Set focus on card
card.focus();

// Add visual focus indicator
card.classList.add('keyboard-selected');

// Remove focus
card.classList.remove('keyboard-selected');
```

### Keyboard Event Handling

```javascript
document.addEventListener('keydown', handleKeyboardNavigation);

function handleKeyboardNavigation(e) {
    const focusedCard = document.activeElement;

    if (!focusedCard.classList.contains('item-card')) return;

    switch(e.key) {
        case 'ArrowUp':
            e.preventDefault();
            moveCardUp(focusedCard);
            break;
        // ... etc
    }
}
```

## Local Storage Schema

### Keys and Values

```javascript
// High Scores (per scenario)
localStorage.setItem('survival-highscores', JSON.stringify({
    moon: [
        { initials: "ABC", time: 63450, date: 1738800000000 },
        // ... up to 10 entries
    ],
    shipwreck: [ /* ... */ ],
    // ... all scenarios
}));

// Achievements
localStorage.setItem('survival-achievements', JSON.stringify({
    scenarioMaster: {
        id: 'scenarioMaster',
        unlocked: true,
        unlockedDate: 1738800000000,
        progress: 8
    },
    // ... all achievements
}));

// Audio Preferences
localStorage.setItem('audio-muted', 'false');     // or 'true'
localStorage.setItem('audio-volume', '0.3');      // 0-1

// Theme Preference
localStorage.setItem('app-theme', 'dark');        // or 'light'
```

### Data Persistence

All localStorage writes happen immediately:
- High scores: When player submits initials after timed mode
- Achievements: When achievement unlocked
- Audio: When mute toggled or volume changed
- Theme: When dark/light mode toggled

## Timer System

### Timer Modes

```javascript
const TIMER_MODES = {
    'untimed': null,        // No time limit
    '1min': 60 * 1000,      // 60 seconds
    '3min': 180 * 1000,     // 180 seconds
    '5min': 300 * 1000      // 300 seconds
};
```

### Timer Functions

```javascript
let timerInterval = null;
let timeRemaining = 0;

function startTimer(initialTimeMs) {
    timeRemaining = initialTimeMs;
    gameActive = true;

    timerInterval = setInterval(() => {
        timeRemaining -= 100;  // Update every 100ms

        if (timeRemaining <= 0) {
            timeRemaining = 0;
            stopTimer();
            autoSubmitResults();
        }

        updateTimerDisplay();
    }, 100);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(timeRemaining);

    // Warning state at 10 seconds
    if (timeRemaining <= 10000) {
        timerDisplay.classList.add('warning');
        // Play tick sound once
        if (!timerDisplay.dataset.tickPlayed) {
            audioManager.play('tick');
            timerDisplay.dataset.tickPlayed = 'true';
        }
    }
}
```

## Visual Polish

### Score Count-Up Animation

```javascript
function animateScoreCountUp(element, targetScore) {
    const duration = 800;
    const frameRate = 60;
    const totalFrames = (duration / 1000) * frameRate;
    const increment = targetScore / totalFrames;
    let currentScore = 0;
    let frame = 0;

    const animate = () => {
        frame++;
        currentScore += increment;

        if (frame >= totalFrames) {
            currentScore = targetScore;
            element.textContent = `SURVIVAL ASSESSMENT SCORE: ${Math.round(currentScore)}`;
            return;
        }

        element.textContent = `SURVIVAL ASSESSMENT SCORE: ${Math.round(currentScore)}`;
        requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
}
```

### Button Ripple Effect

CSS pseudo-element animation:

```css
.btn::before {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transition: width 0.6s, height 0.6s;
}

.btn:active::before {
    width: 300px;
    height: 300px;
}
```

## Screen Reader Support

### Announcement Function

```javascript
function announce(message) {
    const srAnnouncements = document.getElementById('srAnnouncements');
    if (srAnnouncements) {
        srAnnouncements.textContent = message;
        setTimeout(() => srAnnouncements.textContent = '', 1000);
    }
}
```

**Usage:**
```javascript
announce('Scenario loaded: Lunar Survival');
announce('Item moved to rank 3');
announce('Achievement unlocked: Scenario Master');
announce('Score: 12. Excellent work!');
```

### ARIA Live Regions

```html
<div id="srAnnouncements" class="sr-only"
     aria-live="polite" aria-atomic="true"></div>
```

## Extension Points

### Adding New Features

**1. New Achievement Type:**
```javascript
// Add to achievementManager.achievements
streakMaster: {
    id: 'streakMaster',
    name: 'Streak Master',
    description: 'Complete 5 scenarios in a row',
    icon: '🔥',
    unlocked: false,
    progress: 0,
    maxProgress: 5
}

// Check in checkAchievements()
if (consecutiveCompletions >= 5) unlock('streakMaster');
```

**2. New Timer Mode:**
```javascript
// Add button in HTML
<button id="difficulty10min">10 Minutes</button>

// Add mode in script.js
case '10min':
    startTimer(600 * 1000);
    break;
```

**3. New Sound Effect:**
```javascript
// Add to audioManager.sounds
audioManager.sounds.explosion = new Audio('audio/ui/explosion.mp3');

// Play when needed
audioManager.play('explosion');
```

## Performance Considerations

- **Drag operations**: Throttled to animation frame rate
- **Timer updates**: 100ms intervals (10 Hz)
- **localStorage**: Synchronous writes (keep data small)
- **Audio loading**: Lazy-loaded on first play
- **CSS animations**: Hardware-accelerated transforms

## Browser Compatibility

**Supported:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Key APIs used:**
- Drag and Drop API (all modern browsers)
- localStorage API (all modern browsers)
- Audio API (all modern browsers)
- CSS Custom Properties (all modern browsers)
- requestAnimationFrame (all modern browsers)

**Progressive enhancement:**
- Haptic feedback: Optional (mobile only)
- Backdrop filter: Graceful degradation to solid backgrounds
- CSS Grid: Flexbox fallback not needed (universal support)

---

**Last updated:** 2026-02-08
**Game version:** 2.0
**License:** MIT
