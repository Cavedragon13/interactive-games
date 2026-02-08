# Changelog

All notable changes to the Survival Decision Series game will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-02-08

### Major Release: Production-Ready Enhancement

This release transforms the Survival Decision Series from a functional educational game into a polished, accessible, engaging web application ready for public sharing.

### Added

#### Foundation & User Experience
- **Dark/Light Mode Toggle** - Circular toggle button with moon/sun icons
  - Defaults to dark mode on first load
  - Persistent preference via localStorage
  - Smooth 0.3s transitions on all theme-affected elements
  - Complete coverage across all UI elements

- **Mobile Optimization**
  - Touch-friendly drag-and-drop with haptic feedback
  - Larger touch targets (min 44×44px)
  - Visible drag handles on mobile devices
  - Prevention of scroll conflicts during drag operations
  - Responsive design enhancements for phone/tablet

#### Accessibility (WCAG AA Compliance)
- **Keyboard Navigation Support**
  - Tab/Shift+Tab navigation between all interactive elements
  - Arrow Up/Down keys to reorder items
  - Enter/Space to select cards
  - Escape to cancel operations
  - Custom focus indicators (3px outline)
  - Visual hints for keyboard shortcuts

- **Screen Reader Support**
  - 15+ ARIA labels across interactive elements
  - 2 aria-live regions for dynamic updates
  - 7 ARIA roles for semantic structure
  - Complete game state announcements
  - Hidden helper text for context

- **Visual Accessibility**
  - High contrast color schemes (WCAG AA 4.5:1 ratio)
  - Minimum 16px font size
  - 1.6 line-height for readability
  - Color-blind friendly indicators (icons + color)
  - Reduced motion support (@media prefers-reduced-motion)

#### Engagement Features
- **Audio System** (8 total sound effects)
  - UI sounds: pickup, drop, click, success, failure, tick
  - Background ambient music per scenario (8 tracks)
  - Volume control slider
  - Mute toggle with persistence
  - Auto-pause on tab visibility change

- **Achievement System**
  - 16 unlockable achievements across 3 categories
  - Completion achievements (Scenario Master, Speed Demon, Perfect Score)
  - Skill achievements (90+ score per scenario, 8 total)
  - Challenge achievements (Speedrunner, Expert Analyst)
  - Toast notifications on unlock
  - localStorage persistence
  - Progress tracking

- **Social Sharing**
  - Native Web Share API (mobile)
  - Clipboard fallback (desktop)
  - Challenge URL generation with score targets
  - Pre-filled scenario and difficulty
  - Open Graph meta tags for rich previews
  - Twitter Card support
  - Toast feedback on share actions

#### Visual Polish
- **Modern UI Design**
  - Glassmorphism effects (backdrop-filter: blur(10px))
  - Animated gradient backgrounds (@keyframes gradientShift)
  - Button ripple effects on click
  - Card hover elevation (translateY + shadow)
  - Score count-up animation (requestAnimationFrame)
  - Timer pulse animation at 10 seconds
  - Smooth transitions (cubic-bezier easing)

- **Enhanced Typography**
  - Inter variable font
  - Clear heading hierarchy (2.5rem → 1.5rem)
  - Bold weights (700) for emphasis
  - Subtle text shadows on gradients

#### Documentation
- **CONTRIBUTING.md** (570 lines)
  - Complete scenario creation workflow
  - Desert survival example with 10 items
  - Code style guidelines
  - Testing checklist
  - Expert source validation rules

- **API.md** (790 lines)
  - Architecture overview with ASCII diagram
  - Complete function signatures
  - Data structure documentation
  - Audio Manager API
  - Achievement Manager API
  - localStorage schema

- **SCENARIOS.md** (760 lines)
  - Scenario design principles
  - 7-phase creation process
  - Item selection strategies
  - Expert ranking logic
  - Bloom's Taxonomy alignment
  - Classroom implementation guide
  - Assessment rubric

- **VISUAL_ASSETS.md** (470 lines)
  - Complete asset creation guide
  - Dragonsuite AI tool integration
  - Screenshot capture instructions
  - Animated GIF workflow
  - Asset checklist with priorities

#### SEO & Discoverability
- **Meta Tags**
  - Open Graph protocol (og:title, og:description, og:image)
  - Twitter Card (summary_large_image)
  - Descriptive meta description
  - Relevant keywords

- **Search Engine Optimization**
  - sitemap.xml (3 URLs prioritized)
  - robots.txt (crawler configuration)
  - Semantic HTML structure
  - Descriptive alt text

- **Visual Assets**
  - favicon.svg (512×512 compass rose design)
  - og-preview.png (1200×640 social media card)
  - Professional branding with scenario icons

### Changed

- **Code Quality Improvements**
  - Organized CSS custom properties by theme
  - Consistent naming conventions
  - Improved error handling
  - Better function documentation
  - Memory optimization patterns

- **Performance Enhancements**
  - Lightweight: 181.7 KB total application size
  - Minimal external dependencies
  - Efficient localStorage usage
  - Optimized animations (GPU-accelerated)

### Removed

- Deprecated test files (484 KB):
  - survival_game_fixed.html (236 KB)
  - survival_game_fixedx.html (88 KB)
  - survival_game_fixed copy.html (92 KB)
  - unified-survival-gamex.html (88 KB)

### Fixed

- Touch scroll conflicts on mobile during drag operations
- Focus outline visibility on keyboard navigation
- Timer warning state at 10 seconds
- Challenge URL parameter parsing on page load
- Theme persistence across browser sessions

### Technical Details

**Browser Compatibility:**
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- iOS Safari (iOS 14+)
- Chrome Android

**Technologies:**
- Vanilla JavaScript ES6+
- CSS Custom Properties
- HTML5 Drag and Drop API
- Web Share API
- Clipboard API
- localStorage API
- Media Queries (responsive + reduced motion)

**File Sizes:**
- HTML: 17.7 KB
- JavaScript: 53.0 KB
- CSS: 27.4 KB
- Data (scenarios.json): 46.3 KB
- Assets: 37.3 KB
- **Total: 181.7 KB** ⚡

### Contributors

- [@Cavedragon13](https://github.com/Cavedragon13) - Project owner
- Claude Sonnet 4.5 (Anthropic) - Development assistance

---

## [1.0.0] - 2025-XX-XX

### Initial Release

- 8 complete survival scenarios based on expert protocols
- Drag-and-drop ranking interface
- Expert comparison and scoring system
- 4 difficulty modes (untimed, 1/3/5 minute timed)
- High score tracking with initials
- Professional scenario theming (NASA, Coast Guard, etc.)
- Dynamic theme system via CSS custom properties
- Comprehensive scenario data with reasoning
- GitHub Pages deployment pipeline

### Scenarios

1. **Lunar Survival** - NASA emergency protocol
2. **Shipwreck Survival** - Coast Guard maritime protocol
3. **Mountain Plane Crash** - Forest Service protocol
4. **Arctic Survival** - Canadian Forces survival guide
5. **Jungle Expedition** - Tropical survival protocol
6. **Mine Collapse** - Mine safety emergency procedures
7. **Deep Sea Emergency** - Navy submarine protocol
8. **Asteroid Mining** - Space exploration emergency

---

## Future Roadmap

### Planned Features (Post-Launch)
- [ ] Code refactoring into modular JavaScript files
- [ ] Multiplayer mode (real-time competitive ranking)
- [ ] Scenario editor (visual UI for creating custom scenarios)
- [ ] Progressive Web App (offline support, installable)
- [ ] Global leaderboards (requires backend)
- [ ] AI opponent mode
- [ ] Localization (Spanish, French, Mandarin)
- [ ] Video integration (instructional videos per scenario)
- [ ] Adaptive difficulty (AI adjusts based on player skill)
- [ ] Team mode (collaborative ranking)

### Community Contributions Welcome!

We welcome contributions in the following areas:
- New survival scenarios (see CONTRIBUTING.md)
- Bug fixes and accessibility improvements
- Translations and localization
- Documentation improvements
- Audio assets (Creative Commons licensed)
- Visual enhancements

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

**Links:**
- [Repository](https://github.com/Cavedragon13/interactive-games)
- [Live Demo](https://seed13productions.com/games/survival/)
- [Report Issues](https://github.com/Cavedragon13/interactive-games/issues)
