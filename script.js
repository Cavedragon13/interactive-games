let SCENARIOS = {}; // Will be loaded from JSON

// Function to load scenarios from JSON
async function loadScenarios() {
    try {
        const response = await fetch('scenarios.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        SCENARIOS = await response.json();
        console.log('Scenarios loaded successfully:', SCENARIOS);
    } catch (error) {
        console.error('Could not load scenarios.json:', error);
        // Fallback or error handling for the user
        alert('Error loading game scenarios. Please try again later.');
    }
}

// ================================================================
// AUDIO MANAGER
// ================================================================
const audioManager = {
    sounds: {
        pickup: new Audio('audio/ui/pickup.mp3'),
        drop: new Audio('audio/ui/drop.mp3'),
        click: new Audio('audio/ui/click.mp3'),
        tick: new Audio('audio/ui/tick.mp3'),
        success: new Audio('audio/ui/success.mp3'),
        failure: new Audio('audio/ui/failure.mp3')
    },
    bgMusic: new Audio(),
    volume: 0.3,
    bgVolume: 0.15,
    muted: false,
    bgMusicPlaying: false,

    init() {
        // Load mute preference from localStorage
        const savedMute = localStorage.getItem('audio-muted');
        this.muted = savedMute === 'true';

        const savedVolume = localStorage.getItem('audio-volume');
        if (savedVolume) {
            this.volume = parseFloat(savedVolume);
        }

        // Set initial volumes
        Object.values(this.sounds).forEach(sound => {
            sound.volume = this.volume;
        });

        // Update UI
        this.updateUI();
    },

    play(soundName) {
        if (!this.muted && this.sounds[soundName]) {
            try {
                this.sounds[soundName].currentTime = 0;
                this.sounds[soundName].volume = this.volume;
                this.sounds[soundName].play().catch(err => {
                    // Silently handle autoplay restrictions
                    console.log('Audio play prevented:', err);
                });
            } catch (err) {
                console.log('Audio error:', err);
            }
        }
    },

    playBgMusic(scenarioId) {
        if (this.muted) return;

        try {
            // Stop current music
            this.stopBgMusic();

            // Load new music
            this.bgMusic.src = `audio/bg/${scenarioId}.mp3`;
            this.bgMusic.loop = true;
            this.bgMusic.volume = this.bgVolume;

            this.bgMusic.play().catch(err => {
                console.log('Background music play prevented:', err);
            });

            this.bgMusicPlaying = true;
        } catch (err) {
            console.log('Background music error:', err);
        }
    },

    stopBgMusic() {
        if (this.bgMusic) {
            this.bgMusic.pause();
            this.bgMusic.currentTime = 0;
            this.bgMusicPlaying = false;
        }
    },

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('audio-muted', this.muted.toString());

        if (this.muted) {
            this.stopBgMusic();
        } else {
            // Resume bg music if a scenario is loaded
            if (currentScenario) {
                this.playBgMusic(currentScenario.id || 'default');
            }
        }

        this.updateUI();
    },

    setVolume(value) {
        this.volume = parseFloat(value);
        localStorage.setItem('audio-volume', this.volume.toString());

        Object.values(this.sounds).forEach(sound => {
            sound.volume = this.volume;
        });

        this.bgMusic.volume = this.volume * 0.5;
    },

    updateUI() {
        const muteBtn = document.getElementById('audioToggle');
        if (muteBtn) {
            muteBtn.textContent = this.muted ? '🔇' : '🔊';
            muteBtn.setAttribute('aria-label', this.muted ? 'Unmute audio' : 'Mute audio');
        }
    }
};

// Handle page visibility changes (pause audio when tab hidden)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        audioManager.stopBgMusic();
    } else if (!audioManager.muted && currentScenario) {
        audioManager.playBgMusic(currentScenario.id || 'default');
    }
});

// ================================================================
// THEME MANAGEMENT
// ================================================================
function initTheme() {
    const savedTheme = localStorage.getItem('app-theme');
    const themeToggle = document.getElementById('themeToggle');

    // Default to dark mode unless light mode is explicitly saved
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeToggle.textContent = '🌙';
    } else {
        // Dark mode (default)
        themeToggle.textContent = '☀️';
        if (!savedTheme) {
            localStorage.setItem('app-theme', 'dark');
        }
    }

    // Add click handler for theme toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        themeToggle.textContent = isLight ? '🌙' : '☀️';
        localStorage.setItem('app-theme', isLight ? 'light' : 'dark');
    });
}

// ================================================================
// SCREEN READER ANNOUNCEMENTS
// ================================================================
function announce(message) {
    const srAnnouncements = document.getElementById('srAnnouncements');
    if (srAnnouncements) {
        srAnnouncements.textContent = message;
        // Clear after 1 second to allow multiple announcements
        setTimeout(() => {
            srAnnouncements.textContent = '';
        }, 1000);
    }
}

// ================================================================
// KEYBOARD NAVIGATION
// ================================================================
let keyboardSelectedCard = null;

function initKeyboardNavigation() {
    document.addEventListener('keydown', handleKeyboardNavigation);
}

function handleKeyboardNavigation(e) {
    const focusedCard = document.activeElement;

    // Only handle keyboard navigation if we're focused on a card or have a selected card
    if (!focusedCard.classList.contains('item-card') && !keyboardSelectedCard) {
        return;
    }

    const currentCard = keyboardSelectedCard || focusedCard;
    const allCards = Array.from(document.querySelectorAll('.item-card'));
    const currentIndex = allCards.indexOf(currentCard);

    switch(e.key) {
        case 'ArrowUp':
            e.preventDefault();
            if (keyboardSelectedCard) {
                // Move selected card up
                moveCardUp(keyboardSelectedCard);
            } else if (currentIndex > 0) {
                // Navigate to previous card
                allCards[currentIndex - 1].focus();
            }
            break;

        case 'ArrowDown':
            e.preventDefault();
            if (keyboardSelectedCard) {
                // Move selected card down
                moveCardDown(keyboardSelectedCard);
            } else if (currentIndex < allCards.length - 1) {
                // Navigate to next card
                allCards[currentIndex + 1].focus();
            }
            break;

        case 'Enter':
        case ' ':
            e.preventDefault();
            if (focusedCard.classList.contains('item-card')) {
                toggleCardSelection(focusedCard);
            }
            break;

        case 'Escape':
            e.preventDefault();
            if (keyboardSelectedCard) {
                // Deselect card
                keyboardSelectedCard.classList.remove('keyboard-selected');
                keyboardSelectedCard = null;
            }
            break;

        // Number keys 1-9, 0 for quick rank assignment
        case '1': case '2': case '3': case '4': case '5':
        case '6': case '7': case '8': case '9': case '0':
            e.preventDefault();
            if (focusedCard.classList.contains('item-card')) {
                const rank = e.key === '0' ? 10 : parseInt(e.key);
                assignCardToRank(focusedCard, rank);
            }
            break;
    }
}

function moveCardUp(card) {
    const allCards = Array.from(document.querySelectorAll('.item-card'));
    const currentIndex = allCards.indexOf(card);

    if (currentIndex > 0) {
        const cardId = card.dataset.itemId;
        const currentOrderIndex = currentOrder.findIndex(item => item.id === cardId);

        if (currentOrderIndex > 0) {
            // Swap in array
            [currentOrder[currentOrderIndex], currentOrder[currentOrderIndex - 1]] =
            [currentOrder[currentOrderIndex - 1], currentOrder[currentOrderIndex]];

            renderItems();

            // Keep focus on the moved card
            setTimeout(() => {
                const newCards = document.querySelectorAll('.item-card');
                newCards[currentOrderIndex - 1].classList.add('keyboard-selected');
                newCards[currentOrderIndex - 1].focus();
                keyboardSelectedCard = newCards[currentOrderIndex - 1];
                announce(`Item moved to rank ${currentOrderIndex}. ${card.getAttribute('aria-label')}`);
            }, 50);
        }
    }
}

function moveCardDown(card) {
    const allCards = Array.from(document.querySelectorAll('.item-card'));
    const currentIndex = allCards.indexOf(card);

    if (currentIndex < allCards.length - 1) {
        const cardId = card.dataset.itemId;
        const currentOrderIndex = currentOrder.findIndex(item => item.id === cardId);

        if (currentOrderIndex < currentOrder.length - 1) {
            // Swap in array
            [currentOrder[currentOrderIndex], currentOrder[currentOrderIndex + 1]] =
            [currentOrder[currentOrderIndex + 1], currentOrder[currentOrderIndex]];

            renderItems();

            // Keep focus on the moved card
            setTimeout(() => {
                const newCards = document.querySelectorAll('.item-card');
                newCards[currentOrderIndex + 1].classList.add('keyboard-selected');
                newCards[currentOrderIndex + 1].focus();
                keyboardSelectedCard = newCards[currentOrderIndex + 1];
                announce(`Item moved to rank ${currentOrderIndex + 2}. ${card.getAttribute('aria-label')}`);
            }, 50);
        }
    }
}

function toggleCardSelection(card) {
    if (keyboardSelectedCard === card) {
        // Deselect
        card.classList.remove('keyboard-selected');
        keyboardSelectedCard = null;
    } else {
        // Clear previous selection
        if (keyboardSelectedCard) {
            keyboardSelectedCard.classList.remove('keyboard-selected');
        }
        // Select new card
        card.classList.add('keyboard-selected');
        keyboardSelectedCard = card;
    }
}

function assignCardToRank(card, rank) {
    const cardId = card.dataset.itemId;
    const currentOrderIndex = currentOrder.findIndex(item => item.id === cardId);

    if (currentOrderIndex !== -1 && rank >= 1 && rank <= currentOrder.length) {
        // Remove from current position
        const movedItem = currentOrder.splice(currentOrderIndex, 1)[0];
        // Insert at new position (rank is 1-indexed, array is 0-indexed)
        currentOrder.splice(rank - 1, 0, movedItem);

        renderItems();

        // Keep focus on the moved card
        setTimeout(() => {
            const newCards = document.querySelectorAll('.item-card');
            newCards[rank - 1].focus();
        }, 50);
    }
}

// ================================================================
// GAME STATE MANAGEMENT
// ================================================================
let currentScenario = null;
let currentOrder = [];
let draggedElement = null;

// Timer and High Score Variables
let gameMode = 'untimed'; // 'untimed', '1min', '3min', '5min'
let timeRemaining = 0; // in milliseconds
let timerInterval = null;
let gameActive = false;
let startTime = 0;

// High Score System
const HIGH_SCORES_KEY = 'survivalGameHighScores';
let highScores = {
    '1min': [],
    '3min': [],
    '5min': []
};

// DOM Elements for Timer
let timerDisplay, initialsModal, initialsInput, highScoresContainer, highScoreList, highScoreTitle;

// ================================================================
// SCENARIO LOADING FUNCTIONS
// ================================================================
async function loadScenario(scenarioKey) {
            try {
                // Ensure scenarios are loaded
                if (Object.keys(SCENARIOS).length === 0) {
                    await loadScenarios();
                }

                // Validate input parameters
                if (!scenarioKey || typeof scenarioKey !== 'string') {
                    console.error('Invalid scenario key provided:', scenarioKey);
                    return false;
                }
                
                if (!SCENARIOS[scenarioKey]) {
                    console.error('Scenario not found:', scenarioKey);
                    return false;
                }
                
                // Validate scenario data structure
                const scenario = SCENARIOS[scenarioKey];
                if (!scenario.theme || !scenario.content || !scenario.items) {
                    console.error('Incomplete scenario data for:', scenarioKey);
                    return false;
                }
                
                // Hide welcome screen safely
                const welcomeScreen = document.getElementById('welcomeScreen');
                if (welcomeScreen) {
                    welcomeScreen.style.display = 'none';
                }
                
                // Load scenario data
                currentScenario = scenario;
                
                // Apply theme colors with error handling
                if (!applyTheme(currentScenario.theme)) {
                    console.warn('Theme application failed for scenario:', scenarioKey);
                }
                
                // Update UI content with error handling
                if (!updateUIContent(currentScenario.content)) {
                    console.warn('UI content update failed for scenario:', scenarioKey);
                }
                
                // Show game interface with animation
                setTimeout(() => {
                    const gameHeader = document.getElementById('gameHeader');
                    const gameContent = document.getElementById('gameContent');
                    
                    if (gameHeader) gameHeader.classList.add('show');
                    if (gameContent) gameContent.classList.add('show');
                }, 100);
                
                // Initialize game
                initGame();

                // Announce scenario loaded to screen readers
                announce(`Scenario loaded: ${currentScenario.content.gameTitle}. ${currentScenario.items.length} survival items to rank.`);

                return true;
                
            } catch (error) {
                console.error('Error loading scenario:', error);
                // Graceful degradation - show error message to user
                const welcomeScreen = document.getElementById('welcomeScreen');
                if (welcomeScreen) {
                    welcomeScreen.innerHTML = '<h2>Error loading scenario. Please refresh the page.</h2>';
                }
                return false;
            }
        }

function applyTheme(theme) {
    try {
        if (!theme) {
            console.error('No theme data provided');
            return false;
        }
        
        const root = document.documentElement;
        if (!root) {
            console.error('Cannot access document root element');
            return false;
        }
        
        // Apply theme colors safely
        const themeProperties = {
            '--primary-dark': theme.primaryDark,
            '--primary-medium': theme.primaryMedium,
            '--primary-light': theme.primaryLight,
            '--accent-primary': theme.accentPrimary,
            '--accent-secondary': theme.accentSecondary,
            '--accent-tertiary': theme.accentTertiary
        };
        
        for (const [property, value] of Object.entries(themeProperties)) {
            if (value) {
                root.style.setProperty(property, value);
            }
        }
        
        return true;
    } catch (error) {
        console.error('Error applying theme:', error);
        return false;
    }
}

function updateUIContent(content) {
    try {
        if (!content) {
            console.error('No content data provided');
            return false;
        }
        
        // Define elements to update with their content properties
        const updates = [
            { id: 'authorityLogo', content: content.authorityName, method: 'textContent' },
            { id: 'gameTitle', content: content.gameTitle, method: 'textContent' },
            { id: 'gameSubtitle', content: content.gameSubtitle, method: 'textContent' },
            { id: 'scenarioTitle', content: content.emergencyTitle, method: 'textContent' },
            { id: 'scenarioText', content: content.emergencyScenario, method: 'textContent' },
            { id: 'instructionsTitle', content: content.instructionsTitle, method: 'textContent' },
            { id: 'instructionsText', content: content.instructionsText, method: 'textContent' },
            { id: 'dragIcon', content: content.dragIcon, method: 'textContent' },
            { id: 'dragInstructionsText', content: content.dragInstructionsText, method: 'textContent' },
            { id: 'progressText', content: content.progressText, method: 'textContent' },
            { id: 'checkBtn', content: content.assessmentButton, method: 'textContent' },
            { id: 'resetBtn', content: content.resetButton, method: 'textContent' }
        ];
        
        // Apply updates safely
        for (const update of updates) {
            const element = document.getElementById(update.id);
            if (element && update.content) {
                element[update.method] = update.content;
            } else if (!element) {
                console.warn(`Element not found: ${update.id}`);
            }
        }
        
        // Handle attribute updates separately
        const scenarioBox = document.getElementById('scenarioBox');
        if (scenarioBox && content.scenarioLabel) {
            scenarioBox.setAttribute('data-label', content.scenarioLabel);
        }
        
        const instructions = document.getElementById('instructions');
        if (instructions && content.instructionsLabel) {
            instructions.setAttribute('data-label', content.instructionsLabel);
        }
        
        return true;
        
    } catch (error) {
        console.error('Error updating UI content:', error);
        return false;
    }
}

// ================================================================
// CORE GAME FUNCTIONS
// ================================================================
function initGame() {
    if (!currentScenario) return;
    
    // Hide results
    document.getElementById('results').classList.remove('show');
    
    // Shuffle items
    currentOrder = [...currentScenario.items].sort(() => Math.random() - 0.5);
    renderItems();
    
    // Ensure game is active
    gameActive = true;
}

function renderItems() {
    const rankingArea = document.getElementById('rankingArea');
    rankingArea.innerHTML = '';
    
    currentOrder.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.draggable = true;
        card.dataset.itemId = item.id;
        card.tabIndex = 0; // Make focusable for keyboard navigation
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Rank ${index + 1}: ${item.name}`);
        
        // Create elements safely without innerHTML
        const rankNumber = document.createElement('div');
        rankNumber.className = 'rank-number';
        rankNumber.textContent = index + 1;
        
        const itemContent = document.createElement('div');
        itemContent.className = 'item-content';
        
        const itemName = document.createElement('div');
        itemName.className = 'item-name';
        itemName.textContent = item.name;
        
        const itemDescription = document.createElement('div');
        itemDescription.className = 'item-description';
        itemDescription.textContent = item.description;
        
        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';
        dragHandle.textContent = '⋮⋮';
        
        // Assemble the card
        itemContent.appendChild(itemName);
        itemContent.appendChild(itemDescription);
        card.appendChild(rankNumber);
        card.appendChild(itemContent);
        card.appendChild(dragHandle);
        
        // Add drag event listeners
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
        card.addEventListener('dragover', handleDragOver);
        card.addEventListener('drop', handleDrop);
        card.addEventListener('dragenter', handleDragEnter);
        card.addEventListener('dragleave', handleDragLeave);
        
        rankingArea.appendChild(card);
    });
}

// ================================================================
// DRAG AND DROP HANDLERS
// ================================================================
function handleDragStart(e) {
    if (!gameActive && gameMode !== 'untimed') {
        e.preventDefault();
        return false;
    }
    draggedElement = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);

    // Haptic feedback on mobile (vibrate for 50ms)
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }

    // Play pickup sound
    audioManager.play('pickup');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedElement = null;
    
    document.querySelectorAll('.item-card').forEach(card => {
        card.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    if (e.target.closest('.item-card') && e.target.closest('.item-card') !== draggedElement) {
        e.target.closest('.item-card').classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    if (e.target.closest('.item-card')) {
        e.target.closest('.item-card').classList.remove('drag-over');
    }
}

function handleDrop(e) {
    if (e.stopPropagation) e.stopPropagation();

    const dropTarget = e.target.closest('.item-card');
    if (dropTarget && draggedElement && dropTarget !== draggedElement) {
        const draggedId = draggedElement.dataset.itemId;
        const dropTargetId = dropTarget.dataset.itemId;

        const draggedIndex = currentOrder.findIndex(item => item.id === draggedId);
        const dropTargetIndex = currentOrder.findIndex(item => item.id === dropTargetId);

        const draggedItem = currentOrder.splice(draggedIndex, 1)[0];
        currentOrder.splice(dropTargetIndex, 0, draggedItem);

        renderItems();

        // Haptic feedback on successful drop (short vibration)
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }

        // Play drop sound
        audioManager.play('drop');
    }
    return false;
}

// ================================================================
// SCORING AND RESULTS
// ================================================================
function checkRankings() {
    if (!currentScenario) return;
    
    // Stop timer and record time for timed modes
    if (gameMode !== 'untimed' && !gameActive) {
        return; // Game already ended
    }
    
    gameActive = false;
    stopTimer();
    
    let finalTimeMs = 0;
    if (gameMode !== 'untimed') {
        const initialTimeMs = getInitialTime(gameMode) * 1000;
        finalTimeMs = initialTimeMs - timeRemaining;
    }
    
    let totalScore = 0;
    const config = currentScenario.config;
    
    // Calculate score
    currentOrder.forEach((item, index) => {
        const userRank = index + 1;
        const expertRank = item.expertRank;
        const difference = Math.abs(userRank - expertRank);
        totalScore += difference;
    });

    // Determine assessment
    let assessment = '';
    let assessmentColor = '';
    
    if (totalScore <= config.scoringThresholds.excellent) {
        assessment = `EXCELLENT - ${config.expertReadyMessage}`;
        assessmentColor = '#10B981';
    } else if (totalScore <= config.scoringThresholds.good) {
        assessment = 'GOOD - You\'d likely survive!';
        assessmentColor = '#84CC16';
    } else if (totalScore <= config.scoringThresholds.fair) {
        assessment = 'FAIR - Risky but possible';
        assessmentColor = '#F59E0B';
    } else {
        assessment = 'POOR - Survival unlikely';
        assessmentColor = '#EF4444';
    }

    // Display results
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ''; // Clear previous results

    // Score section
    const scoreDiv = document.createElement('div');
    scoreDiv.className = 'score';

    const totalScoreDiv = document.createElement('div');
    totalScoreDiv.textContent = `SURVIVAL ASSESSMENT SCORE: ${totalScore}`;
    scoreDiv.appendChild(totalScoreDiv);

    const assessmentDiv = document.createElement('div');
    assessmentDiv.style.color = assessmentColor;
    assessmentDiv.style.marginTop = '10px';
    assessmentDiv.textContent = assessment;
    scoreDiv.appendChild(assessmentDiv);

    const scoreHintDiv = document.createElement('div');
    scoreHintDiv.style.fontSize = '14px';
    scoreHintDiv.style.color = 'var(--text-secondary)';
    scoreHintDiv.style.marginTop = '10px';
    scoreHintDiv.textContent = '(Lower scores indicate better survival chances)';
    scoreDiv.appendChild(scoreHintDiv);
    resultsContainer.appendChild(scoreDiv);

    // Expert explanation section 1
    const expertExplanation1 = document.createElement('div');
    expertExplanation1.className = 'expert-explanation';
    const expertTitleStrong = document.createElement('strong');
    expertTitleStrong.textContent = `${config.expertTitle}:`;
    expertExplanation1.appendChild(expertTitleStrong);
    expertExplanation1.appendChild(document.createTextNode(` Your score reflects how well your priorities match ${config.expertSource} survival experts. `));
    expertExplanation1.appendChild(document.createTextNode(`Lower scores indicate better alignment with proven survival strategies.`));
    resultsContainer.appendChild(expertExplanation1);

    // Comparison table
    const table = document.createElement('table');
    table.className = 'comparison-table';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Item', 'Your Rank', 'Expert Rank', 'Difference', `${config.expertSource} Reasoning`].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const sortedItems = [...currentScenario.items].sort((a, b) => a.expertRank - b.expertRank);

    sortedItems.forEach(item => {
        const userRank = currentOrder.findIndex(i => i.id === item.id) + 1;
        const expertRank = item.expertRank;
        const difference = Math.abs(userRank - expertRank);
        
        let diffColor = '#10B981';
        if (difference > 0 && difference <= 2) {
            diffColor = '#F59E0B';
        } else if (difference > 2) {
            diffColor = '#EF4444';
        }

        const row = document.createElement('tr');

        const itemTd = document.createElement('td');
        const itemNameStrong = document.createElement('strong');
        itemNameStrong.textContent = item.name;
        itemTd.appendChild(itemNameStrong);
        row.appendChild(itemTd);

        const userRankTd = document.createElement('td');
        userRankTd.style.textAlign = 'center';
        userRankTd.textContent = userRank;
        row.appendChild(userRankTd);

        const expertRankTd = document.createElement('td');
        expertRankTd.style.textAlign = 'center';
        expertRankTd.style.color = 'var(--text-secondary)';
        expertRankTd.textContent = expertRank;
        row.appendChild(expertRankTd);

        const differenceTd = document.createElement('td');
        differenceTd.style.textAlign = 'center';
        differenceTd.style.color = diffColor;
        differenceTd.textContent = `+${difference}`;
        row.appendChild(differenceTd);

        const explanationTd = document.createElement('td');
        explanationTd.style.fontSize = '11px';
        explanationTd.textContent = item.explanation;
        row.appendChild(explanationTd);

        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    resultsContainer.appendChild(table);

    // Expert explanation section 2
    const expertExplanation2 = document.createElement('div');
    expertExplanation2.className = 'expert-explanation';
    const keyPrioritiesStrong = document.createElement('strong');
    keyPrioritiesStrong.textContent = 'Key Survival Priorities:';
    expertExplanation2.appendChild(keyPrioritiesStrong);
    expertExplanation2.appendChild(document.createElement('br'));
    config.expertPriorities.forEach(priority => {
        const p = document.createElement('p');
        const bulletStrong = document.createElement('strong');
        bulletStrong.textContent = `• ${priority}`;
        p.appendChild(bulletStrong);
        expertExplanation2.appendChild(p);
    });
    resultsContainer.appendChild(expertExplanation2);

    // Time information for timed modes
    if (gameMode !== 'untimed') {
        const timeCompletedDiv = document.createElement('div');
        timeCompletedDiv.style.textAlign = 'center';
        timeCompletedDiv.style.margin = '25px 0';
        timeCompletedDiv.style.padding = '20px';
        timeCompletedDiv.style.background = 'rgba(0, 0, 0, 0.3)';
        timeCompletedDiv.style.borderRadius = '10px';
        timeCompletedDiv.style.border = '2px solid var(--accent-primary)';

        const timeTitle = document.createElement('h3');
        timeTitle.style.color = 'var(--accent-primary)';
        timeTitle.style.marginBottom = '10px';
        timeTitle.textContent = '⏱️ Time Completed';
        timeCompletedDiv.appendChild(timeTitle);

        const timeValue = document.createElement('div');
        timeValue.style.fontSize = '24px';
        timeValue.style.fontWeight = '700';
        timeValue.style.color = 'var(--text-primary)';
        timeValue.style.fontFamily = 'monospace';
        timeValue.textContent = formatTime(finalTimeMs, true);
        timeCompletedDiv.appendChild(timeValue);

        const challengeMode = document.createElement('div');
        challengeMode.style.fontSize = '14px';
        challengeMode.style.color = 'var(--text-secondary)';
        challengeMode.style.marginTop = '5px';
        challengeMode.textContent = `Challenge Mode: ${gameMode.toUpperCase()}`;
        timeCompletedDiv.appendChild(challengeMode);

        resultsContainer.appendChild(timeCompletedDiv);
    }

    // Announce score to screen readers
    announce(`Score calculated: ${totalScore} points. ${assessment}`);

    // Play success or failure sound based on score
    if (totalScore <= config.scoringThresholds.good) {
        audioManager.play('success');
    } else {
        audioManager.play('failure');
    }

    document.getElementById('results').classList.add('show');
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
    
    // Prompt for high score entry if timed mode
    if (gameMode !== 'untimed') {
        setTimeout(() => {
            promptForInitials(gameMode, finalTimeMs);
        }, 1000);
    }
}

// ================================================================
// TIMER SYSTEM FUNCTIONS
// ================================================================
function setDifficulty(mode) {
    gameMode = mode;

    // Update button states
    document.querySelectorAll('.difficulty-selection button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`difficulty${mode.charAt(0).toUpperCase() + mode.slice(1)}`).classList.add('active');

    stopTimer();
    if (gameMode === 'untimed') {
        timerDisplay.textContent = '00:00';
        timerDisplay.style.color = 'var(--text-primary)';
        gameActive = true;
        document.getElementById('checkBtn').disabled = false;
        announce('Untimed mode selected. No time limit.');
    } else {
        timeRemaining = getInitialTime(gameMode) * 1000;
        updateTimerDisplay();
        gameActive = true;
        document.getElementById('checkBtn').disabled = false;
        startTimer();
        const minutes = Math.floor(getInitialTime(gameMode) / 60);
        announce(`${minutes} minute timed challenge started. Timer is running.`);
    }
    displayHighScores(gameMode);
}

function getInitialTime(mode) {
    switch (mode) {
        case '1min': return 60;
        case '3min': return 180;
        case '5min': return 300;
        default: return 0;
    }
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    startTime = Date.now();
    timerInterval = setInterval(() => {
        if (!gameActive) {
            stopTimer();
            return;
        }
        const elapsed = Date.now() - startTime;
        const initialTimeMs = getInitialTime(gameMode) * 1000;
        timeRemaining = initialTimeMs - elapsed;

        if (timeRemaining <= 0) {
            timeRemaining = 0;
            updateTimerDisplay();
            stopTimer();
            gameActive = false;
            alert("Time's up! Your survival strategy will now be analyzed.");
            checkRankings();
            document.getElementById('checkBtn').disabled = true;
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
    timerDisplay.textContent = formatTime(timeRemaining, false);
    if (timeRemaining <= 10000 && gameMode !== 'untimed') {
        timerDisplay.style.color = 'var(--danger-color)';
    } else {
        timerDisplay.style.color = 'var(--accent-primary)';
    }
}

function formatTime(ms, isTimeTaken = false) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 100);

    if (isTimeTaken) {
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${milliseconds}`;
    } else {
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${milliseconds}`;
    }
}

// ================================================================
// HIGH SCORE SYSTEM FUNCTIONS
// ================================================================
function loadHighScores() {
    try {
        const storedScores = localStorage.getItem(HIGH_SCORES_KEY);
        if (storedScores) {
            highScores = JSON.parse(storedScores);
        }
    } catch (e) {
        console.error("Error loading high scores from localStorage:", e);
        highScores = { '1min': [], '3min': [], '5min': [] };
    }
}

function saveHighScores() {
    try {
        localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(highScores));
    } catch (e) {
        console.error("Error saving high scores to localStorage:", e);
    }
}

function displayHighScores(mode) {
    if (!highScoresContainer || !highScoreList || !highScoreTitle) return;

    highScoreTitle.textContent = `Best Times (${mode === 'untimed' ? 'Untimed' : mode.toUpperCase()})`;
    highScoreList.innerHTML = '';

    if (mode === 'untimed') {
        highScoresContainer.classList.remove('show');
        return;
    }

    const scoresForMode = highScores[mode] || [];
    scoresForMode.sort((a, b) => a.timeMs - b.timeMs);

    if (scoresForMode.length === 0) {
        highScoreList.innerHTML = '<li>No scores yet. Be the first!</li>';
    } else {
        scoresForMode.slice(0, 10).forEach(score => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${score.initials}</span> <span>${formatTime(score.timeMs, true)}</span>`;
            highScoreList.appendChild(li);
        });
    }
    highScoresContainer.classList.add('show');
}

function promptForInitials(mode, timeMs) {
    if (initialsModal && initialsInput) {
        initialsModal.style.display = 'flex';
        initialsInput.value = '';
        initialsInput.focus();

        initialsInput.onkeydown = (e) => {
            if (e.key === 'Enter') {
                submitInitials();
            }
        };
        initialsModal.dataset.mode = mode;
        initialsModal.dataset.timeMs = timeMs;
    }
}

function submitInitials() {
    const mode = initialsModal.dataset.mode;
    const timeMs = parseInt(initialsModal.dataset.timeMs, 10);
    const initials = initialsInput.value.trim().toUpperCase();

    if (initials.length === 3 && /^[A-Z]{3}$/.test(initials)) {
        if (!highScores[mode]) {
            highScores[mode] = [];
        }
        highScores[mode].push({ initials, timeMs });
        saveHighScores();
        displayHighScores(mode);
        initialsModal.style.display = 'none';
    } else {
        alert("Please enter exactly three uppercase letters for your initials.");
    }
}

// ================================================================
// ENHANCED GAME FUNCTIONS
// ================================================================
function resetGame() {
    document.getElementById('results').classList.remove('show');
    document.getElementById('results').innerHTML = '';
    stopTimer();
    setDifficulty('untimed'); // Reset to untimed mode
    initGame();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ================================================================
// INITIALIZATION
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme (dark/light mode)
    initTheme();

    // Initialize audio manager
    audioManager.init();

    // Initialize keyboard navigation
    initKeyboardNavigation();

    // Initialize DOM elements
    timerDisplay = document.getElementById('timerDisplay');
    initialsModal = document.getElementById('initialsModal');
    initialsInput = document.getElementById('initialsInput');
    highScoresContainer = document.getElementById('highScoresContainer');
    highScoreList = document.getElementById('highScoreList');
    highScoreTitle = document.getElementById('highScoreTitle');

    // Load high scores
    loadHighScores();

    // Add event listeners for difficulty buttons
    document.querySelectorAll('.difficulty-selection button').forEach(button => {
        button.addEventListener('click', () => {
            const mode = button.id.replace('difficulty', '').toLowerCase();
            setDifficulty(mode);
        });
    });

    // Add event listeners for main game buttons and select
    document.getElementById('scenarioSelect').addEventListener('change', (e) => {
        loadScenario(e.target.value);
    });
    document.getElementById('checkBtn').addEventListener('click', () => {
        audioManager.play('click');
        checkRankings();
    });
    document.getElementById('resetBtn').addEventListener('click', () => {
        audioManager.play('click');
        resetGame();
    });

    // Audio toggle button
    document.getElementById('audioToggle').addEventListener('click', () => {
        audioManager.toggleMute();
        audioManager.play('click'); // Play click sound when unmuting
    });

    // Add event listeners for initials modal
    document.getElementById('initialsInput').addEventListener('input', function() {
        this.value = this.value.toUpperCase();
    });
    document.getElementById('submitInitialsBtn').addEventListener('click', submitInitials);

    // Load scenarios and then set default mode
    loadScenarios().then(() => {
        setDifficulty('untimed');
    });
});