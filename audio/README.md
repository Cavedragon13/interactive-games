# Audio Assets for Survival Decision Series

This directory contains audio files for the game. All audio is sourced from **Creative Commons** licensed libraries.

## Directory Structure

```
audio/
├── ui/           # UI sound effects
└── bg/           # Background music per scenario
```

## Required Audio Files

### UI Sounds (audio/ui/)

| File | Description | Suggested Source | Duration |
|------|-------------|------------------|----------|
| `pickup.mp3` | Card pickup sound (short whoosh) | freesound.org search: "whoosh short" | 0.3-0.5s |
| `drop.mp3` | Card drop sound (soft thud) | freesound.org search: "drop soft" | 0.2-0.4s |
| `click.mp3` | Button click sound (subtle beep) | freesound.org search: "button click" | 0.1-0.2s |
| `tick.mp3` | Timer tick (clock sound at 10s warning) | freesound.org search: "clock tick" | 0.1-0.2s |
| `success.mp3` | Achievement/good score sound (ding) | freesound.org search: "success chime" | 0.5-1.0s |
| `failure.mp3` | Poor score sound (gentle buzz) | freesound.org search: "failure buzz" | 0.5-1.0s |

### Background Music (audio/bg/)

Optional ambient background music for each scenario (looping):

| File | Scenario | Description | Suggested Keywords |
|------|----------|-------------|-------------------|
| `moon.mp3` | Lunar Survival | Space ambience, static, cosmic sounds | "space ambient loop" |
| `shipwreck.mp3` | Shipwreck | Ocean waves, creaking wood | "ocean waves loop" |
| `mountain.mp3` | Mountain Crash | Wind howling, mountain ambience | "wind mountain loop" |
| `arctic.mp3` | Arctic Emergency | Blizzard, icy wind | "blizzard loop" |
| `jungle.mp3` | Jungle Crash | Tropical birds, insects, jungle sounds | "jungle ambient loop" |
| `mine.mp3` | Mine Collapse | Dripping water, distant rumbling | "cave dripping loop" |
| `deepsea.mp3` | Deep Sea Emergency | Underwater bubbles, sonar pings | "underwater ambient loop" |
| `asteroid.mp3` | Asteroid Mining | Mechanical hums, space station ambience | "space station loop" |

## Free Audio Sources

### Recommended Sites (Creative Commons / Public Domain)
1. **Freesound.org** - https://freesound.org/
   - Filter by Creative Commons 0 (CC0) for no attribution required
   - Filter by CC-BY for attribution required

2. **Zapsplat** - https://www.zapsplat.com/
   - Free for games with attribution
   - High quality sound effects

3. **OpenGameArt.org** - https://opengameart.org/
   - Game-focused audio assets
   - Various CC licenses

4. **Incompetech** - https://incompetech.com/music/
   - Royalty-free background music
   - Requires attribution

5. **BBC Sound Effects** - https://sound-effects.bbcrewind.co.uk/
   - Free for personal/educational use
   - 16,000+ effects

## File Format Requirements

- **Format**: MP3 (for best browser compatibility)
- **Bitrate**: 128-192 kbps (good quality, reasonable size)
- **Sample Rate**: 44.1 kHz
- **Channels**: Stereo (or mono for UI sounds)

## File Size Guidelines

- UI sounds: < 50 KB each
- Background music: < 1 MB each (aim for 2-3 minute loops)
- Total audio directory: < 10 MB (for fast loading)

## Attribution

If using CC-BY licensed audio, add attribution to `AUDIO_CREDITS.md` in this directory.

Example format:
```
"Whoosh Sound" by Author Name
Source: freesound.org/s/12345
License: CC-BY 3.0
```

## Audio Settings

The audio manager defaults:
- UI volume: 30% (configurable)
- Background music: 15% (50% of UI volume)
- Muted by default: No (user can mute via 🔊 button)
- Persist mute preference: Yes (localStorage)

## Testing

After adding audio files, test:
1. All UI sounds play correctly
2. Background music loops smoothly
3. No clipping or distortion
4. Mute toggle works
5. Audio doesn't autoplay on mobile (respects browser policies)

## Notes

- Audio files are optional - the game will function without them
- The audio manager handles missing files gracefully (logs warnings but doesn't crash)
- Background music is lower volume (15%) to not distract from gameplay
- Audio auto-pauses when browser tab is hidden
