/**
 * Persistence - Save and load game state to localStorage
 * Supports 5 save slots
 */
const Persistence = (() => {
  const STORAGE_KEY = "gladiator-manager-saves";
  const MAX_SLOTS = 5;

  const getSaveSlots = () => {
    const saves = localStorage.getItem(STORAGE_KEY);
    return saves ? JSON.parse(saves) : {};
  };

  const setSaveSlots = (slots) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
  };

  const save = (slotNumber, metadata = {}) => {
    if (slotNumber < 1 || slotNumber > MAX_SLOTS) {
      console.error(`Invalid save slot: ${slotNumber}. Must be 1-${MAX_SLOTS}`);
      return null;
    }

    const slots = getSaveSlots();
    const state = StateManager.getState();

    const saveData = {
      slot: slotNumber,
      timestamp: new Date().toISOString(),
      gameId: state.gameId,
      teamName: state.teamName,
      currentLevel: state.currentLevel,
      currentTier: state.currentTier,
      currentSeason: state.currentSeason,
      funds: state.funds,
      reputation: state.reputation,
      winStreak: state.winStreak,
      roster: state.roster,
      seasonStats: state.seasonStats,
      ...metadata
    };

    slots[slotNumber] = saveData;
    setSaveSlots(slots);

    EventBus.emit(Events.GAME_LOAD, { action: "saved", slot: slotNumber });
    return saveData;
  };

  const load = (slotNumber) => {
    if (slotNumber < 1 || slotNumber > MAX_SLOTS) {
      console.error(`Invalid save slot: ${slotNumber}. Must be 1-${MAX_SLOTS}`);
      return null;
    }

    const slots = getSaveSlots();
    const saveData = slots[slotNumber];

    if (!saveData) {
      console.warn(`No save data in slot ${slotNumber}`);
      return null;
    }

    StateManager.setState({
      gameId: saveData.gameId,
      teamName: saveData.teamName,
      currentLevel: saveData.currentLevel,
      currentTier: saveData.currentTier,
      currentSeason: saveData.currentSeason,
      funds: saveData.funds,
      reputation: saveData.reputation,
      winStreak: saveData.winStreak,
      roster: saveData.roster || [],
      seasonStats: saveData.seasonStats || {}
    }, false);

    EventBus.emit(Events.GAME_LOAD, { action: "loaded", slot: slotNumber });
    return saveData;
  };

  const getSlotInfo = (slotNumber) => {
    if (slotNumber < 1 || slotNumber > MAX_SLOTS) {
      return null;
    }

    const slots = getSaveSlots();
    return slots[slotNumber] || null;
  };

  const getAllSlots = () => {
    const slots = getSaveSlots();
    const allSlots = [];

    for (let i = 1; i <= MAX_SLOTS; i++) {
      allSlots.push(slots[i] || null);
    }

    return allSlots;
  };

  const deleteSlot = (slotNumber) => {
    if (slotNumber < 1 || slotNumber > MAX_SLOTS) {
      console.error(`Invalid save slot: ${slotNumber}. Must be 1-${MAX_SLOTS}`);
      return false;
    }

    const slots = getSaveSlots();
    delete slots[slotNumber];
    setSaveSlots(slots);

    EventBus.emit(Events.GAME_LOAD, { action: "deleted", slot: slotNumber });
    return true;
  };

  const clearAllSlots = () => {
    localStorage.removeItem(STORAGE_KEY);
    EventBus.emit(Events.GAME_LOAD, { action: "cleared" });
  };

  return {
    save,
    load,
    getSlotInfo,
    getAllSlots,
    deleteSlot,
    clearAllSlots,
    MAX_SLOTS
  };
})();
