# Visual Assets Creation Guide

This guide explains how to create professional visual assets for the Survival Decision Series, leveraging Dragonsuite AI tools where applicable.

## Table of Contents

- [Social Media Preview Image (og-preview.png)](#social-media-preview-image)
- [Screenshots for README](#screenshots-for-readme)
- [Animated GIF Demo](#animated-gif-demo)
- [Favicon Generation](#favicon-generation)
- [Optional Logo](#optional-logo)

## Social Media Preview Image

**File:** `og-preview.png`
**Dimensions:** 1200×630px (Facebook/Twitter recommended)
**Purpose:** Rich preview when game link is shared on social media

### Option 1: Generate with DragonFlux Klein (Dragonsuite)

**Launch DragonFlux Klein:**
```bash
cd /srv/containers/edq
bash scripts/start_flux2_klein.sh
# Access at: http://192.168.7.226:8001
```

**Prompt for og-preview.png:**
```
Professional web game promotional banner, 1200x630px layout. Dark navy blue gradient background (#1a2f5a to #0d1b3a). Center: Large glowing compass rose in cyan blue (#3a7ca5), surrounded by survival scenario icons (moon, waves, mountain, arctic symbols). Top text in bold modern font: "SURVIVAL DECISION SERIES" in white. Bottom text: "8 Expert-Validated Scenarios • NASA • Coast Guard • Forest Service" in smaller white text. Glassmorphism effect, clean modern design, gaming aesthetic, professional UI style, high contrast, readable text
```

**Settings:**
- Width: 1200px
- Height: 630px
- Guidance: 7-8
- Steps: 30+
- Save as: `og-preview.png`

### Option 2: Generate with Z-Image Base (Higher Quality)

**Launch Z-Image Base:**
```bash
cd /srv/containers/edq
bash scripts/start_zimage.sh
# Access at: http://192.168.7.226:8011
```

**Prompt for og-preview.png:**
```
Social media preview card for survival training game. Dark navy blue (#1a2f5a) to deep blue (#0d1b3a) gradient background. Central focus: Glowing cyan compass rose symbol (#3a7ca5) with north arrow pointing up in red. Surrounding the compass: 8 small white icons representing different environments (moon, ocean waves, snowy mountain, arctic ice, jungle leaves, mine tunnel, deep sea submarine, asteroid). Large bold white text at top: "SURVIVAL DECISION SERIES" in modern sans-serif font, very readable. Bottom text in smaller white: "Test Your Survival Skills Against NASA, Coast Guard & Military Experts". Clean, professional, game UI design, high contrast, perfect typography, glass morphism effects, 1200x630 pixel social media card format
```

**Settings:**
- Aspect Ratio: Custom (1200×630)
- CFG Scale: 7-9
- Steps: 30
- Negative Prompt: "blurry text, unreadable, low contrast, cluttered, messy, amateur, pixelated, distorted"
- Save as: `og-preview.png`

### Option 3: Manual Design (Figma/Canva)

**Figma/Canva Template:**
1. Create 1200×630px canvas
2. **Background**: Navy gradient (#1a2f5a → #0d1b3a)
3. **Center**: Large compass icon or survival symbol
4. **Top Text** (48px bold, white): "SURVIVAL DECISION SERIES"
5. **Bottom Text** (24px, white, 80% opacity): "8 Expert-Validated Scenarios"
6. **Icons Row**: Moon 🌙, Waves 🌊, Mountain 🏔️, Ice 🧊, Jungle 🌴, Mine ⛏️, Submarine 🌊, Asteroid 🚀
7. Export as PNG, 1200×630px

### Verification

After creating `og-preview.png`:
1. Place in `/srv/containers/edq/projects/interactive-games/`
2. Test with [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
3. Test with [Twitter Card Validator](https://cards-dev.twitter.com/validator)
4. Verify image displays clearly at different sizes (600px wide minimum)

---

## Screenshots for README

**Purpose:** Show gameplay in README.md and documentation

### Screenshots Needed

1. **Landing Page** (`screenshot-landing.png` - 1920×1080)
   - Show welcome screen with scenario selector
   - Dark mode active
   - All 8 scenarios visible in dropdown

2. **Lunar Scenario** (`screenshot-moon.png` - 1920×1080)
   - Load Moon scenario
   - Show emergency description and 10 items
   - Mid-drag state (item being reordered)
   - NASA theme visible (blue colors)

3. **Results Screen** (`screenshot-results.png` - 1920×1080)
   - Complete Moon scenario with excellent score (~15 difference)
   - Show comparison table with expert rankings
   - Achievement unlock toast visible (if possible)
   - Share button visible at bottom

4. **Mobile View** (`screenshot-mobile.png` - 375×667)
   - Load on phone or use browser DevTools mobile emulation
   - Show touch-friendly interface
   - Larger buttons and cards visible

### How to Capture Screenshots

**Method 1: Browser Built-in (Recommended)**

1. **Open game**: Navigate to `unified-survival-game.html`
2. **Set viewport**: Press F12 → Toggle device toolbar (Ctrl+Shift+M)
3. **Desktop** (1920×1080): Select "Responsive" mode, set 1920×1080
4. **Mobile** (375×667): Select "iPhone SE" or "iPhone 12 Pro"
5. **Capture**:
   - Chrome: Ctrl+Shift+P → "Capture screenshot"
   - Firefox: Right-click → "Take a Screenshot"
6. **Save** as `screenshot-*.png` in repository root

**Method 2: OS Screenshot Tool**

- **Windows**: Win+Shift+S (Snipping Tool)
- **macOS**: Cmd+Shift+4 (select area)
- **Linux**: Use `scrot` or `gnome-screenshot`

**Tips:**
- Clear browser zoom (100%)
- Hide dev tools before capturing
- Capture in dark mode (default theme)
- Show actual gameplay, not empty states

---

## Animated GIF Demo

**File:** `demo-gameplay.gif`
**Dimensions:** 800×600px or 1280×720px
**Duration:** 10-15 seconds
**Purpose:** README and landing page

### What to Record

**Sequence:**
1. Start at landing page (2 seconds)
2. Select "Lunar Survival" from dropdown (1 second)
3. Brief pause on emergency description (2 seconds)
4. Drag 2-3 items to reorder (4 seconds)
5. Click "Check Rankings" button (1 second)
6. Show score appear with count-up animation (2 seconds)
7. Scroll down to show comparison table (2 seconds)

**Total:** ~14 seconds

### How to Create GIF

**Method 1: ScreenToGif (Windows)**
1. Download [ScreenToGif](https://www.screentogif.com/) (free)
2. Launch → Recorder mode
3. Select game window area (800×600 or 1280×720)
4. Click Record (red button)
5. Perform sequence above
6. Click Stop → Edit
7. Reduce frame rate to 10-15 FPS (smaller file)
8. File → Save As → GIF
9. Optimize: Use "Gifski" encoder for quality
10. Save as `demo-gameplay.gif`

**Method 2: LICEcap (macOS/Windows)**
1. Download [LICEcap](https://www.cockos.com/licecap/) (free)
2. Adjust frame to game area
3. Click Record
4. Perform sequence
5. Click Stop
6. Save as `demo-gameplay.gif`

**Method 3: ffmpeg (Linux/CLI)**
```bash
# Record screen with ffmpeg
ffmpeg -video_size 1280x720 -framerate 25 -f x11grab -i :0.0+0,0 -t 15 recording.mp4

# Convert to GIF
ffmpeg -i recording.mp4 -vf "fps=10,scale=800:-1:flags=lanczos" demo-gameplay.gif

# Optimize GIF size
gifsicle -O3 --colors 256 demo-gameplay.gif -o demo-gameplay-optimized.gif
```

### Optimization

**Target Size:** <3MB (GitHub README limit: 10MB)

**Reduce file size:**
1. Lower resolution (800×600 instead of 1280×720)
2. Reduce frame rate (10-15 FPS instead of 30)
3. Limit colors (256 colors or fewer)
4. Shorten duration (10-12 seconds)
5. Use [Ezgif.com Optimizer](https://ezgif.com/optimize) (online tool)

---

## Favicon Generation

**Completed!** ✅

The repository now includes `favicon.svg` (512×512 vector format with compass rose design).

### Add to HTML

Update `<head>` in both HTML files:

```html
<!-- Favicon (all sizes) -->
<link rel="icon" type="image/svg+xml" href="favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="favicon-16.png">
<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
```

### Generate PNG Versions (Optional)

**Using ImageMagick:**
```bash
# Install ImageMagick (if not installed)
sudo apt install imagemagick  # Linux
brew install imagemagick       # macOS

# Generate PNG sizes from SVG
convert -background none favicon.svg -resize 16x16 favicon-16.png
convert -background none favicon.svg -resize 32x32 favicon-32.png
convert -background none favicon.svg -resize 180x180 apple-touch-icon.png
convert -background none favicon.svg -resize 192x192 android-chrome-192.png
convert -background none favicon.svg -resize 512x512 android-chrome-512.png
```

**Using Online Tool:**
1. Go to [RealFaviconGenerator.net](https://realfavicongenerator.net/)
2. Upload `favicon.svg`
3. Customize (optional)
4. Generate & download favicon package
5. Extract to repository root

---

## Optional Logo

**Purpose:** Branding for landing page, documentation headers

### Generate with Dragonsuite

**Prompt for Logo:**
```
Minimalist logo design for survival training game. Circular badge style. Navy blue circle background (#1a2f5a). Central white compass rose symbol with red north arrow. Text "SURVIVAL DECISION SERIES" curved around the top edge in white uppercase letters. Clean, professional, vector-style, modern gaming aesthetic, high contrast
```

**Settings:**
- Square output (1024×1024)
- High guidance (8-10)
- Save as: `logo.png`

### Manual Design

**Simple Text Logo:**
1. Font: Inter Bold (700 weight)
2. Text: "SURVIVAL DECISION SERIES"
3. Color: White on navy blue background
4. Add compass icon before text
5. Export as `logo-horizontal.png` (1200×300)

---

## Asset Checklist

### Critical Assets (Required for Launch)
- [x] `favicon.svg` - Browser tab icon (✅ **Created**)
- [ ] `og-preview.png` - Social media card (1200×630) ⚠️ **Generate with Dragonsuite**
- [ ] `screenshot-landing.png` - Landing page (1920×1080)
- [ ] `screenshot-moon.png` - Gameplay example (1920×1080)

### Nice-to-Have Assets
- [ ] `screenshot-results.png` - Results screen (1920×1080)
- [ ] `screenshot-mobile.png` - Mobile view (375×667)
- [ ] `demo-gameplay.gif` - Animated demo (800×600, <3MB)
- [ ] `favicon-16.png` / `favicon-32.png` - PNG fallbacks
- [ ] `apple-touch-icon.png` - iOS home screen (180×180)

### Optional Assets
- [ ] `logo.png` - Branding logo (1024×1024)
- [ ] `logo-horizontal.png` - Header logo (1200×300)
- [ ] Individual scenario screenshots (8 files)

---

## After Creating Assets

### 1. Update README.md

Add screenshots to README:

```markdown
# Survival Decision Series

![Gameplay Screenshot](screenshot-moon.png)

## Features

- 8 Expert-Validated Scenarios
- Interactive Drag & Drop
- Real-Time Scoring

![Landing Page](screenshot-landing.png)

## Demo

![Gameplay Demo](demo-gameplay.gif)
```

### 2. Verify Social Preview

**Test og-preview.png:**
1. Commit and push image to GitHub
2. Share link on Facebook/Twitter/Discord
3. Verify image displays correctly
4. If not showing: Clear cache, regenerate with [Sharing Debugger](https://developers.facebook.com/tools/debug/)

### 3. Add Favicon Links

Update `<head>` in HTML files (see Favicon section above).

---

## Quick Start: Minimal Asset Set

**If time is limited, create these 2 assets:**

1. **og-preview.png** (1200×630) - Use Z-Image Base
   - Ensures rich social media previews
   - Most impactful for sharing

2. **screenshot-moon.png** (1920×1080) - Manual screenshot
   - Shows gameplay in README
   - Demonstrates UI quality

**Total time:** ~30 minutes (10 min generation + 5 min screenshot + 15 min testing/upload)

---

## Resources

**AI Image Generation:**
- DragonFlux Klein: `http://192.168.7.226:8001`
- Z-Image Base: `http://192.168.7.226:8011`

**Online Tools:**
- [RealFaviconGenerator](https://realfavicongenerator.net/) - Favicon packages
- [Ezgif.com](https://ezgif.com/) - GIF optimizer
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)

**Screenshot Tools:**
- [ScreenToGif](https://www.screentogif.com/) - Windows GIF recorder
- [LICEcap](https://www.cockos.com/licecap/) - macOS/Windows GIF recorder
- Browser DevTools (F12) - Built-in screenshot

---

**Questions?** Open an issue on GitHub or reference this guide.

**Next Step:** Generate `og-preview.png` with Dragonsuite, then take gameplay screenshots! 🚀
