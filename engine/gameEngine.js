/**
 * GameEngine - Core game loop and orchestration
 * Manages game lifecycle and coordinates between systems
 */
const GameEngine = (() => {
  let isRunning = false;
  let isPaused = false;
  let gameLoopInterval = null;

  const initialize = async (ruleset, theme) => {
    if (!ruleset || !theme) {
      console.error("Ruleset and theme are required to initialize the game");
      return false;
    }

    // Load configuration
    const rulesetValid = ConfigLoader.validateRuleset(ruleset);
    const themeValid = ConfigLoader.validateTheme(theme);

    if (!rulesetValid || !themeValid) {
      console.error("Configuration validation failed");
      return false;
    }

    ConfigLoader.loadRuleset(ruleset);
    ConfigLoader.loadTheme(theme);

    // Initialize state
    StateManager.setState({
      gameId: `game_${Date.now()}`,
      theme: theme.name,
      ruleset: ruleset.version
    }, false);

    EventBus.emit(Events.GAME_START, { gameId: StateManager.getState().gameId });

    return true;
  };

  const start = () => {
    if (isRunning) return;

    isRunning = true;
    isPaused = false;

    // Set up game loop
    gameLoopInterval = setInterval(() => {
      update();
    }, 100); // 10 updates per second

    EventBus.emit(Events.GAME_START);
  };

  const pause = () => {
    if (!isRunning || isPaused) return;

    isPaused = true;
    if (gameLoopInterval) {
      clearInterval(gameLoopInterval);
      gameLoopInterval = null;
    }

    EventBus.emit(Events.GAME_PAUSE);
  };

  const resume = () => {
    if (!isRunning || !isPaused) return;

    isPaused = false;
    gameLoopInterval = setInterval(() => {
      update();
    }, 100);

    EventBus.emit(Events.GAME_RESUME);
  };

  const stop = () => {
    if (gameLoopInterval) {
      clearInterval(gameLoopInterval);
      gameLoopInterval = null;
    }

    isRunning = false;
    isPaused = false;
    EventBus.emit(Events.GAME_END);
  };

  const update = () => {
    // This is called every frame (100ms)
    // Update game systems here
    // For now, this is a placeholder
  };

  const getStatus = () => ({
    isRunning,
    isPaused,
    gameTime: StateManager.getState().currentSeason
  });

  const newGame = (teamName = "New Stable") => {
    StateManager.reset();
    StateManager.setState({
      teamName: teamName,
      funds: ConfigLoader.getConfig("economy.startingFunds")
    }, false);

    EventBus.emit(Events.GAME_START, { isNewGame: true });
  };

  const saveGame = (slotNumber) => {
    return Persistence.save(slotNumber, {
      theme: ConfigLoader.getTheme().name,
      ruleset: ConfigLoader.getRuleset().version
    });
  };

  const loadGame = (slotNumber) => {
    const result = Persistence.load(slotNumber);
    if (result) {
      EventBus.emit(Events.GAME_LOAD, { slot: slotNumber });
    }
    return result;
  };

  return {
    initialize,
    start,
    pause,
    resume,
    stop,
    update,
    getStatus,
    newGame,
    saveGame,
    loadGame
  };
})();
