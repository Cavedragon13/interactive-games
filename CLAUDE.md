# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

A collection of HTML5 survival and space-themed games featuring educational content, resource management, and strategic decision-making. Built with vanilla JavaScript and modern CSS for cross-platform browser compatibility.

## Commands

### Local Development

All games are self-contained HTML files requiring no build process:

```bash
# Direct browser access
open nasa-survivor.html
open selene-lunar-reckoning.html
open unified-survival-game.html

# Local server (recommended)
python3 -m http.server 8000
# or
npx http-server -p 8080
```

### Template Development

```bash
# Create new game from template
cp survival-game-template.html new-scenario.html
# Use survival-game-placeholders.json as reference for customization
```

## Architecture

### Self-Contained HTML Pattern

Each game is a complete application in a single HTML file containing:
- Inline CSS with custom properties for theming
- Embedded JavaScript using IIFE modules
- JSON data objects for all game content
- Zero external dependencies

### Game Engine Structure

All games follow this consistent pattern:

```javascript
(() => {
  // Data layer
  const items = [/* survival items with expert rankings */];
  
  // State management
  let currentOrder = [];
  let gameActive = false;
  
  // Core systems
  function initializeGame() { /* setup */ }
  function renderItems() { /* DOM updates */ }
  function handleDragDrop() { /* reordering logic */ }
  function calculateScore() { /* expert comparison */ }
})();
```

### Template System

`survival-game-template.html` uses 200+ placeholders for customization:
- `{{GAME_TITLE}}`, `{{AUTHORITY_NAME}}` for branding
- `{{EMERGENCY_SCENARIO_TEXT}}` for scenario content
- CSS color variables for theming
- Complete item data with expert rankings

Reference `survival-game-placeholders.json` for all available placeholders.

### Multi-Scenario Architecture

Advanced games like `unified-survival-game.html` support multiple complete scenarios:

```javascript
const SCENARIOS = {
  moon: { theme: {}, content: {}, items: [] },
  shipwreck: { theme: {}, content: {}, items: [] },
  // 8 scenarios total
};
```

### Drag and Drop System

Consistent implementation across all games for item reordering:
- HTML5 drag/drop API
- Visual feedback during dragging
- Automatic list reordering
- Touch device compatibility

### Expert Scoring Algorithm

All games use the same scoring approach:

```javascript
function calculateScore() {
  let totalScore = 0;
  currentOrder.forEach((item, index) => {
    const userRank = index + 1;
    const expertRank = item.expertRank;
    totalScore += Math.abs(userRank - expertRank);
  });
}
```

### Theme Management

Dynamic theming using CSS custom properties:

```css
:root {
  --primary-dark: #041E42;
  --accent-primary: #FC3D21;
  /* More theme variables */
}
```

Theme switching via JavaScript updates to CSS variables.

## Game Data Structure

Each survival scenario contains exactly 10 items with this structure:

```javascript
{
  id: 'oxygen',
  name: "Two 45.5kg (100-pound) tanks of oxygen",
  description: "Pressurized tanks for breathing",
  expertRank: 1,        // Expert ranking 1-10
  explanation: "...",   // Expert reasoning
  icon: "🫁"           // Visual identifier
}
```

## Advanced Features

### Timer System (Selene game)
- Multiple game modes: untimed, 1min, 3min, 5min
- High score tracking per difficulty
- Real-time countdown display

### Local Storage
- High score persistence
- Game preferences
- Progress tracking

### Accessibility
- Full keyboard navigation
- ARIA labels and roles
- Screen reader compatibility
- Focus management during interactions

## Creating New Games

1. Start with `survival-game-template.html`
2. Replace all `{{PLACEHOLDER}}` values using find-and-replace
3. Customize CSS color variables for theme
4. Define 10 survival items with expert rankings (1-10)
5. Set scoring thresholds based on expert data difficulty

Required elements:
- Authority/organization theme (NASA, Coast Guard, etc.)
- Emergency scenario description
- 10 survival items with expert validation
- Appropriate visual theming