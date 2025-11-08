/**
 * EventBus - Centralized event system for game systems
 * Allows decoupled communication between game systems
 */
const EventBus = (() => {
  const listeners = {};

  const on = (event, callback, priority = 0) => {
    if (!listeners[event]) {
      listeners[event] = [];
    }
    listeners[event].push({ callback, priority });
    // Sort by priority (higher priority first)
    listeners[event].sort((a, b) => b.priority - a.priority);
  };

  const off = (event, callback) => {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(item => item.callback !== callback);
  };

  const emit = (event, data = {}) => {
    if (!listeners[event]) return;
    listeners[event].forEach(item => {
      try {
        item.callback(data);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    });
  };

  const clear = () => {
    Object.keys(listeners).forEach(key => delete listeners[key]);
  };

  return {
    on,
    off,
    emit,
    clear
  };
})();

// Event type definitions (documentation)
const Events = {
  // Game lifecycle
  GAME_START: "game:start",
  GAME_LOAD: "game:load",
  GAME_PAUSE: "game:pause",
  GAME_RESUME: "game:resume",
  GAME_END: "game:end",

  // Season/Match
  SEASON_START: "season:start",
  SEASON_END: "season:end",
  MATCH_SCHEDULED: "match:scheduled",
  MATCH_START: "match:start",
  MATCH_END: "match:end",

  // Fighter
  FIGHTER_ADDED: "fighter:added",
  FIGHTER_REMOVED: "fighter:removed",
  FIGHTER_TRAINED: "fighter:trained",
  FIGHTER_INJURED: "fighter:injured",
  FIGHTER_HEALED: "fighter:healed",

  // Combat
  COMBAT_TURN: "combat:turn",
  COMBAT_CHOICE_MADE: "combat:choiceMade",
  COMBAT_RESOLVED: "combat:resolved",

  // Economy
  FUNDS_CHANGED: "funds:changed",
  REPUTATION_CHANGED: "reputation:changed",

  // UI
  SCREEN_CHANGED: "ui:screenChanged",
  SELECTION_CHANGED: "ui:selectionChanged"
};
