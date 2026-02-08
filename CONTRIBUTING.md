# Contributing to Survival Decision Series

Thank you for your interest in contributing to the Survival Decision Series! This document provides guidelines for contributing new scenarios, features, and improvements.

## Table of Contents

- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Adding a New Scenario](#adding-a-new-scenario)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Your Changes](#testing-your-changes)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Expert Source Validation](#expert-source-validation)

## Getting Started

### Prerequisites

- Basic knowledge of HTML, CSS, and JavaScript (ES6+)
- A text editor (VS Code, Sublime, Atom, etc.)
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Git for version control

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Cavedragon13/interactive-games.git
   cd interactive-games
   ```

2. **Open the game:**
   - Open `unified-survival-game.html` directly in your browser, or
   - Use a local server (recommended for testing):
     ```bash
     python3 -m http.server 8000
     # Then open http://localhost:8000/unified-survival-game.html
     ```

3. **Make your changes** and test locally before submitting.

## How to Contribute

We welcome contributions in several areas:

### 🎮 New Scenarios
Add survival scenarios from real emergency protocols (NASA, Coast Guard, military field manuals, wilderness organizations).

### 🎨 Visual Improvements
Enhance UI/UX, animations, accessibility, or mobile responsiveness.

### 🐛 Bug Fixes
Fix issues with drag-and-drop, timer, scoring, or cross-browser compatibility.

### 📚 Documentation
Improve README, add tutorials, or translate scenarios to other languages.

### 🔊 Audio Assets
Source Creative Commons audio files for UI sounds and background music (see `audio/README.md`).

## Adding a New Scenario

### Step 1: Research and Validate

**Find an expert source** for your survival scenario:
- Government agencies (NASA, NOAA, USCG, FEMA)
- Military survival manuals (FM 21-76, SERE training)
- Professional wilderness organizations (NOLS, Outward Bound)
- University emergency preparedness programs

**Example sources:**
- NASA: Moon and space survival rankings
- U.S. Coast Guard: Maritime/ocean survival protocols
- Forest Service: Wilderness and mountain survival
- SERE training: Desert, arctic, jungle survival

### Step 2: Define Your Scenario Data

Create your scenario in `scenarios.json`. Here's the template:

```json
{
  "your-scenario-id": {
    "config": {
      "authorityName": "Your Authority Name",
      "expertTitle": "Expert Assessment",
      "expertSource": "Organization Name",
      "expertReadyMessage": "You're ready for [scenario]!",
      "themePrimary": "#1a2f5a",
      "themeSecondary": "#0d1b3a",
      "themeAccent": "#3a7ca5",
      "themeText": "#ffffff",
      "themeBg": "#000814",
      "themeBorder": "#1e3a5f",
      "scoringThresholds": {
        "excellent": 15,
        "good": 30,
        "fair": 50
      }
    },
    "content": {
      "title": "Scenario Title",
      "emergencyScenario": "Detailed 3-4 paragraph description of the emergency situation...",
      "instructions": "Rank the following 10 items...",
      "dragInstruction": "Drag items to reorder them"
    },
    "items": [
      {
        "id": "item1",
        "name": "Item Name",
        "description": "Brief item description",
        "expertRank": 1,
        "reasoning": "Expert explanation of why this item is ranked here..."
      }
      // ... 9 more items (total 10)
    ]
  }
}
```

### Step 3: Scenario Guidelines

**Items (10 required):**
- Mix of obviously important and subtly critical items
- Include some "trap" items that seem useful but aren't priorities
- Each item needs clear expert reasoning based on your source

**Expert Rankings:**
- Use rankings 1-10 (1 = most critical, 10 = least critical)
- Base rankings on survival science (e.g., "Rule of 3s": 3 minutes without air, 3 hours without shelter in harsh conditions, 3 days without water, 3 weeks without food)

**Scoring Thresholds:**
- **Excellent (≤15)**: Player deeply understands survival priorities
- **Good (≤30)**: Solid understanding with minor mistakes
- **Fair (≤50)**: Basic grasp but significant misunderstandings

**Theme Colors:**
Use colors that match your scenario's environment:
- Desert: Oranges, browns, yellows
- Ocean: Blues, teals, navy
- Arctic: Whites, light blues, icy grays
- Jungle: Greens, browns, vibrant accents
- Space: Dark blues, blacks, silver

### Step 4: Add Scenario to Selector

Update `unified-survival-game.html` to include your scenario in the dropdown:

```html
<select class="scenario-select" id="scenarioSelect">
    <!-- Existing options -->
    <option value="your-scenario-id">🌟 Your Scenario Name (Authority)</option>
</select>
```

Choose an appropriate emoji that represents your scenario.

### Step 5: Test Your Scenario

1. **Load the game** and select your new scenario
2. **Check the theme colors** - ensure text is readable on all backgrounds
3. **Test drag-and-drop** - verify all items can be reordered
4. **Review expert explanations** - ensure reasoning is clear and educational
5. **Test scoring thresholds** - try intentionally wrong rankings to verify assessment messages
6. **Mobile test** - verify touch interactions work on phones/tablets
7. **Accessibility test** - use keyboard navigation and screen reader

### Example: Desert Survival Scenario

Here's a complete example of adding a desert survival scenario:

```json
{
  "desert": {
    "config": {
      "authorityName": "U.S. Army Survival Manual",
      "expertTitle": "Military Survival Expert Assessment",
      "expertSource": "U.S. Army FM 21-76",
      "expertReadyMessage": "You're ready for desert survival!",
      "themePrimary": "#d4a574",
      "themeSecondary": "#8b6914",
      "themeAccent": "#ff8c42",
      "themeText": "#ffffff",
      "themeBg": "#2a1810",
      "themeBorder": "#a67c52",
      "scoringThresholds": {
        "excellent": 15,
        "good": 30,
        "fair": 50
      }
    },
    "content": {
      "title": "Desert Survival Emergency",
      "emergencyScenario": "Your vehicle has broken down in the Mojave Desert during summer. It's 110°F (43°C) in the shade, and you're 50 miles from the nearest town. Cell service is nonexistent. You have 10 items available. The key to desert survival is preventing heat exhaustion, dehydration, and sun exposure while signaling for rescue.\n\nDesert environments are unforgiving. Water is the absolute priority—humans can survive only 1-2 days without water in extreme heat. Shade and protection from the sun are critical to prevent fatal heat stroke. Rescue teams will search by air, so visibility is your second priority.\n\nYour task: Rank these 10 items in order of importance for survival (1 = most critical, 10 = least critical). Your ranking will be compared against U.S. Army desert survival protocols.",
      "instructions": "Rank the following 10 items in order of survival importance:",
      "dragInstruction": "Drag items to reorder them from most to least important"
    },
    "items": [
      {
        "id": "desert1",
        "name": "Water (1 gallon)",
        "description": "One gallon of drinking water",
        "expertRank": 1,
        "reasoning": "Water is the absolute top priority. In 110°F heat, you lose 1-2 gallons of water per day through sweat. Without water, death from dehydration occurs in 24-48 hours. This gallon buys you critical time."
      },
      {
        "id": "desert2",
        "name": "Signal Mirror",
        "description": "Metal mirror for signaling",
        "expertRank": 2,
        "reasoning": "Signal mirrors can be seen up to 10 miles away by aircraft. Desert rescue relies heavily on air search. This is your best chance of being spotted quickly, potentially saving you before water runs out."
      },
      {
        "id": "desert3",
        "name": "Tarp or Emergency Blanket",
        "description": "Large reflective tarp",
        "expertRank": 3,
        "reasoning": "Shade reduces your water needs by up to 75%. A tarp creates essential shelter from the sun, preventing heat stroke and dramatically extending survival time. Stay with your vehicle and use it to create shade."
      },
      {
        "id": "desert4",
        "name": "Wide-Brimmed Hat",
        "description": "Hat with full sun protection",
        "expertRank": 4,
        "reasoning": "Protects your head and neck from direct sun, reducing heat absorption and dehydration rate. Heat stroke often starts with unprotected head exposure."
      },
      {
        "id": "desert5",
        "name": "Sunglasses",
        "description": "UV-protective sunglasses",
        "expertRank": 5,
        "reasoning": "Prevents snow blindness-like conditions from bright desert glare. Eye damage can occur in hours, impairing your ability to signal and navigate."
      },
      {
        "id": "desert6",
        "name": "First Aid Kit",
        "description": "Basic medical supplies",
        "expertRank": 6,
        "reasoning": "Treats minor injuries, sunburn, and heat exhaustion symptoms. Contains gauze for bandaging and potentially filtering water sediment."
      },
      {
        "id": "desert7",
        "name": "Knife",
        "description": "Multi-purpose survival knife",
        "expertRank": 7,
        "reasoning": "Useful for cutting fabric for sun protection, opening containers, and self-defense against wildlife. Less critical than hydration and signaling tools."
      },
      {
        "id": "desert8",
        "name": "Rope (50 feet)",
        "description": "Nylon rope",
        "expertRank": 8,
        "reasoning": "Can secure your tarp shelter and be used for signaling (layout in large 'X' pattern). Lower priority than immediate survival needs."
      },
      {
        "id": "desert9",
        "name": "Canned Food",
        "description": "Non-perishable food",
        "expertRank": 9,
        "reasoning": "Humans can survive 3 weeks without food, but only 1-2 days without water in extreme heat. Food digestion actually requires water, making it counterproductive if water is scarce."
      },
      {
        "id": "desert10",
        "name": "Book",
        "description": "Reading material",
        "expertRank": 10,
        "reasoning": "Provides mental distraction and can be burned for smoke signal as last resort. Paper reflects some sun. Least critical for immediate survival."
      }
    ]
  }
}
```

## Code Style Guidelines

### JavaScript
- **ES6+ syntax** - Use modern JavaScript (const/let, arrow functions, async/await)
- **No frameworks** - Keep the project vanilla JavaScript for educational purposes
- **Clear naming** - Use descriptive variable/function names (`calculateScore` not `calcScr`)
- **Comments** - Add comments for complex logic, but let code be self-documenting when possible
- **Error handling** - Use try/catch for async operations and provide user-friendly error messages

```javascript
// Good: Clear, modern, error-handled
async function loadScenarios() {
    try {
        const response = await fetch('scenarios.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Failed to load scenarios:', error);
        alert('Error loading game content. Please refresh the page.');
        return null;
    }
}

// Bad: Unclear, old syntax, no error handling
function loadScenarios() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'scenarios.json');
    xhr.send();
}
```

### CSS
- **CSS Custom Properties** - Use CSS variables for theme colors (already defined in `:root`)
- **Mobile-first** - Design for mobile, then enhance for desktop
- **Accessibility** - Maintain WCAG AA contrast ratios (4.5:1 for text)
- **Transitions** - Use `transition: all 0.3s ease` for smooth interactions
- **Naming** - Use semantic class names (`.scenario-box` not `.blue-container`)

### HTML
- **Semantic markup** - Use `<section>`, `<article>`, `<nav>`, `<button>` appropriately
- **ARIA labels** - Add `aria-label`, `role`, and `aria-live` for screen readers
- **Accessibility** - Ensure keyboard navigation works (tabindex, focus states)

## Testing Your Changes

### Browser Testing
Test on at least 2 modern browsers:
- ✅ Chrome/Edge (Chromium-based)
- ✅ Firefox
- ✅ Safari (if on macOS)

### Device Testing
- 📱 Mobile (iOS Safari or Chrome Android)
- 💻 Desktop (1920×1080 or higher)
- 📲 Tablet (optional but recommended)

### Accessibility Testing
1. **Keyboard navigation**:
   - Tab through all interactive elements
   - Use Arrow keys to reorder items
   - Press Enter/Space to select
   - Press Escape to cancel

2. **Screen reader** (optional but valuable):
   - Windows: [NVDA](https://www.nvaccess.org/) (free)
   - macOS: VoiceOver (built-in, Cmd+F5)
   - Verify all game actions are announced

3. **Color contrast**:
   - Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
   - Ensure all text meets WCAG AA (4.5:1 ratio)

### Performance Testing
- Open browser DevTools → Lighthouse
- Run audit on Performance, Accessibility, Best Practices
- Target scores: 90+ Performance, 95+ Accessibility

## Submitting a Pull Request

### 1. Create a Branch
```bash
git checkout -b add-desert-scenario
```

### 2. Make Your Changes
- Edit `scenarios.json` to add your scenario
- Update `unified-survival-game.html` if needed (dropdown option)
- Test thoroughly in multiple browsers

### 3. Commit with Clear Message
```bash
git add scenarios.json unified-survival-game.html
git commit -m "Add desert survival scenario based on U.S. Army FM 21-76

- 10 items ranked by desert survival priorities
- Expert reasoning from military survival manual
- Desert-appropriate theme colors (oranges/browns)
- Tested on Chrome, Firefox, mobile Safari"
```

### 4. Push and Create Pull Request
```bash
git push origin add-desert-scenario
```

Then go to GitHub and create a Pull Request with:
- **Title**: Clear description (e.g., "Add Desert Survival Scenario")
- **Description**: Include:
  - Expert source citation
  - Screenshot of your scenario
  - Browser/device testing notes
  - Any design decisions you made

### 5. Respond to Review Feedback
Maintainers may suggest changes. Address feedback by:
- Pushing additional commits to the same branch
- Explaining your reasoning if you disagree
- Being open to improvements

## Expert Source Validation

### Acceptable Sources
✅ **Government agencies**: NASA, NOAA, USCG, FEMA, CDC
✅ **Military manuals**: U.S. Army FM 21-76, SERE training docs
✅ **Professional organizations**: NOLS, Outward Bound, Red Cross
✅ **Academic institutions**: University emergency preparedness programs
✅ **Industry standards**: OSHA, mining safety boards, aviation authorities

### Unacceptable Sources
❌ Personal blogs or opinion pieces
❌ Fictional media (movies, TV shows, novels)
❌ Social media posts or forums
❌ Commercial survival gear marketing
❌ Unverified "survival tips" websites

### Citation Format
In your PR description, cite your source like this:

```
Source: U.S. Army Field Manual 21-76 "Survival"
URL: https://www.survivalebooks.com/free-manuals/army-field-manuals/FM21-76.pdf
Relevant sections: Chapter 13 (Desert Survival), pages 189-203
```

If your source isn't publicly available, explain how you accessed it (library, military training, etc.).

## Questions?

- **Bug reports**: [Open an issue](https://github.com/Cavedragon13/interactive-games/issues)
- **Feature requests**: [Start a discussion](https://github.com/Cavedragon13/interactive-games/discussions)
- **General questions**: Open an issue with the "question" label

Thank you for contributing to survival education! 🚀
