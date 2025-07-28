# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

A collection of HTML5 survival and space-themed games featuring educational content, resource management, and strategic decision-making. Built with vanilla JavaScript and modern CSS for cross-platform browser compatibility.

## Commands

### Local Development

All games are self-contained HTML files requiring no build process:

```bash
# Primary game (unified multi-scenario)
open survival-decision-series.html

# Individual games
open selene-lunar-reckoning.html

# Local server (recommended for full functionality)
python3 -m http.server 8000
# or
npx http-server -p 8080
# Then navigate to http://localhost:8000
```

### Template Development

```bash
# Create new game from template
cp survival-game-template.html new-scenario.html

# Use placeholders reference for customization
# Reference: survival-game-placeholders.json contains 200+ placeholders

# Validate scenario data structure
# Reference: scenarios.json for complete scenario examples
```

### Testing and Validation

```bash
# Test games locally
open http://localhost:8000/survival-decision-series.html

# Check browser console for JavaScript errors
# Test drag-and-drop functionality across different browsers
# Verify localStorage persistence for high scores and settings
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

The primary game `survival-decision-series.html` supports 8 complete scenarios loaded from `scenarios.json`:

```javascript
const SCENARIOS = {
  moon: { theme: {}, content: {}, items: [] },
  shipwreck: { theme: {}, content: {}, items: [] },
  mountain: { theme: {}, content: {}, items: [] },
  arctic: { theme: {}, content: {}, items: [] },
  jungle: { theme: {}, content: {}, items: [] },
  mine: { theme: {}, content: {}, items: [] },
  deepsea: { theme: {}, content: {}, items: [] },
  asteroid: { theme: {}, content: {}, items: [] }
};
```

Each scenario includes:
- **Theme**: Complete CSS color palette with professional styling
- **Content**: Authority branding, scenario text, instructions
- **Items**: 10 survival items with expert rankings (1-10)
- **Config**: Scoring thresholds and expert explanations

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

## File Structure

```
interactive-games/
├── survival-decision-series.html     # PRIMARY: Multi-scenario survival training
├── selene-lunar-reckoning.html      # Individual lunar scenario (legacy)
├── survival-game-template.html      # Template for new scenarios
├── survival-game-placeholders.json  # Template customization guide (200+ placeholders)
├── scenarios.json                   # Complete scenario data for multi-game
├── deprecated/                      # Legacy game files
│   ├── unified-survival-game.html   # Original unified game
│   ├── survival_game_fixed.html     # Development versions
│   └── [other deprecated files]
└── README.md                        # Project documentation
```

## Data Architecture

### Scenario Data Structure

All scenarios follow this JSON structure in `scenarios.json`:

```json
{
  "scenarioId": {
    "theme": {
      "primaryDark": "#color",
      "accentPrimary": "#color"
    },
    "content": {
      "gameTitle": "Title",
      "authorityName": "Organization",
      "emergencyScenario": "Detailed scenario text"
    },
    "config": {
      "expertSource": "Authority",
      "scoringThresholds": { "excellent": 15, "good": 25, "fair": 35 }
    },
    "items": [
      {
        "id": "unique_id",
        "name": "Item name",
        "description": "Brief description",
        "expertRank": 1,
        "explanation": "Expert reasoning"
      }
    ]
  }
}
```

## Creating New Games

### Using the Template System

1. **Start with template**: Copy `survival-game-template.html`
2. **Reference placeholders**: Use `survival-game-placeholders.json` for all 200+ available placeholders
3. **Replace placeholders**: Use find-and-replace for `{{PLACEHOLDER}}` values
4. **Customize theme**: Update CSS color variables for visual identity
5. **Define survival items**: Create exactly 10 items with expert rankings (1-10)
6. **Set scoring**: Configure thresholds based on expert data complexity

### Adding to Multi-Scenario Game

1. **Edit scenarios.json**: Add new scenario following existing structure
2. **Test locally**: Verify game loads and functions correctly
3. **Validate data**: Ensure all required fields are present

### Required Elements for New Scenarios

- **Authority theme**: Professional organization (NASA, Coast Guard, Forest Service, etc.)
- **Emergency description**: 3-4 paragraph detailed scenario
- **Expert validation**: 10 items ranked by real experts in field
- **Scoring thresholds**: Difficulty-appropriate score ranges
- **Visual theming**: Color palette matching authority branding