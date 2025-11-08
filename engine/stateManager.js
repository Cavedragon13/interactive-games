/**
 * StateManager - Centralized state management for the gladiator game
 * Single source of truth for all game state
 */
const StateManager = (() => {
  let state = {
    // Game metadata
    gameId: null,
    theme: null,
    ruleset: null,

    // Current progress
    currentLevel: 1,
    currentTier: 1,
    currentSeason: 1,

    // Team/Roster
    teamName: "New Stable",
    roster: [], // Array of fighter objects
    retiredFighters: [],
    deadFighters: [],

    // Economy
    funds: 5000,

    // Progression tracking
    seasonStats: {
      matchesPlayed: 0,
      matchesWon: 0,
      seatsFilled: 0,
      totalSeatsAvailable: 0
    },

    // Hype/Marketing
    reputation: 0,
    winStreak: 0,

    // Scheduling
    schedule: [], // Array of upcoming matches

    // UI state
    currentScreen: "mainMenu",
    selectedFighter: null,
    selectedMatch: null
  };

  // Event listeners for state changes
  const listeners = {};

  const getState = () => ({ ...state });

  const getSlice = (key) => {
    if (key.includes(".")) {
      const [parent, child] = key.split(".");
      return state[parent]?.[child];
    }
    return state[key];
  };

  const setState = (updates, triggerEvent = true) => {
    const oldState = { ...state };

    // Support nested updates
    Object.keys(updates).forEach(key => {
      if (key.includes(".")) {
        const [parent, child] = key.split(".");
        if (!state[parent]) state[parent] = {};
        state[parent][child] = updates[key];
      } else {
        state[key] = updates[key];
      }
    });

    if (triggerEvent) {
      notifyListeners("stateChanged", { oldState, newState: { ...state } });
    }

    return state;
  };

  const addListener = (event, callback) => {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(callback);
  };

  const removeListener = (event, callback) => {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(cb => cb !== callback);
  };

  const notifyListeners = (event, data = {}) => {
    if (!listeners[event]) return;
    listeners[event].forEach(callback => callback(data));
  };

  const addFighter = (fighter) => {
    const newFighter = {
      id: `fighter_${Date.now()}_${Math.random()}`,
      name: fighter.name || "Unnamed Gladiator",
      level: 1,
      tier: 1,
      health: 5,
      maxHealth: 5,
      stats: {
        Strength: 1,
        Stamina: 1,
        Defense: 1,
        Sense: 1
      },
      record: { wins: 0, losses: 0, draws: 0 },
      status: "healthy", // healthy, injured, crippled, dead
      injuries: [],
      ...fighter
    };

    state.roster.push(newFighter);
    notifyListeners("fighterAdded", { fighter: newFighter });
    return newFighter;
  };

  const removeFighter = (fighterId, reason = "retired") => {
    const fighter = state.roster.find(f => f.id === fighterId);
    if (!fighter) return null;

    state.roster = state.roster.filter(f => f.id !== fighterId);

    if (reason === "dead") {
      state.deadFighters.push(fighter);
    } else if (reason === "retired") {
      state.retiredFighters.push(fighter);
    }

    notifyListeners("fighterRemoved", { fighter, reason });
    return fighter;
  };

  const updateFighter = (fighterId, updates) => {
    const fighter = state.roster.find(f => f.id === fighterId);
    if (!fighter) return null;

    Object.assign(fighter, updates);
    notifyListeners("fighterUpdated", { fighter });
    return fighter;
  };

  const getFighter = (fighterId) => {
    return state.roster.find(f => f.id === fighterId);
  };

  const addMatch = (match) => {
    state.schedule.push(match);
    notifyListeners("matchScheduled", { match });
    return match;
  };

  const reset = () => {
    state = {
      gameId: null,
      theme: null,
      ruleset: null,
      currentLevel: 1,
      currentTier: 1,
      currentSeason: 1,
      teamName: "New Stable",
      roster: [],
      retiredFighters: [],
      deadFighters: [],
      funds: 5000,
      seasonStats: {
        matchesPlayed: 0,
        matchesWon: 0,
        seatsFilled: 0,
        totalSeatsAvailable: 0
      },
      reputation: 0,
      winStreak: 0,
      schedule: [],
      currentScreen: "mainMenu",
      selectedFighter: null,
      selectedMatch: null
    };
    notifyListeners("gameReset", {});
  };

  return {
    getState,
    getSlice,
    setState,
    addListener,
    removeListener,
    notifyListeners,
    addFighter,
    removeFighter,
    updateFighter,
    getFighter,
    addMatch,
    reset
  };
})();
