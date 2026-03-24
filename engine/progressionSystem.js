/**
 * ProgressionSystem - Manage level and tier advancement
 * Handles team progression through the three levels of the game
 */
const ProgressionSystem = (() => {
  /**
   * Check if team should advance to next tier
   */
  const canAdvanceTier = () => {
    return SchedulingSystem.checkSeasonAdvance();
  };

  /**
   * Advance team to next tier within current level
   */
  const advanceTier = () => {
    const state = StateManager.getState();
    const ruleset = ConfigLoader.getRuleset();
    const levelConfig = ruleset.levels[`level${state.currentLevel}`];

    if (state.currentTier >= levelConfig.tiers) {
      // Try to advance to next level instead
      return advanceLevel();
    }

    state.currentTier++;
    StateManager.setState({ currentTier: state.currentTier });

    EventBus.emit(Events.GAME_START, {
      action: "tier_advanced",
      level: state.currentLevel,
      tier: state.currentTier
    });

    return state;
  };

  /**
   * Advance team to next level
   * Must reduce roster to required number of fighters
   */
  const advanceLevel = () => {
    const state = StateManager.getState();
    const ruleset = ConfigLoader.getRuleset();

    if (state.currentLevel >= 3) {
      // Already at max level
      return null;
    }

    const currentLevelConfig = ruleset.levels[`level${state.currentLevel}`];
    const nextLevelConfig = ruleset.levels[`level${state.currentLevel + 1}`];

    // Check advancement conditions
    if (!canAdvanceTier()) {
      console.warn("Cannot advance level: season threshold not met");
      return null;
    }

    // Advance level
    state.currentLevel++;
    state.currentTier = 1;

    // Roster must be reduced based on level requirements
    const maxFighters = nextLevelConfig.maxFighters;
    if (state.roster.length > maxFighters) {
      // Player needs to select which fighters to keep
      return {
        requiresRosterSelection: true,
        currentRoster: state.roster.length,
        maxRoster: maxFighters,
        mustRetire: state.roster.length - maxFighters
      };
    }

    StateManager.setState({
      currentLevel: state.currentLevel,
      currentTier: state.currentTier
    });

    EventBus.emit(Events.GAME_START, {
      action: "level_advanced",
      level: state.currentLevel
    });

    return state;
  };

  /**
   * Complete roster selection when advancing levels
   * Retire excess fighters
   */
  const confirmRosterSelection = (fightIdsToKeep) => {
    const state = StateManager.getState();
    const ruleset = ConfigLoader.getRuleset();
    const levelConfig = ruleset.levels[`level${state.currentLevel}`];

    if (fightIdsToKeep.length > levelConfig.maxFighters) {
      console.warn("Too many fighters selected");
      return null;
    }

    // Retire fighters not in the keep list
    state.roster.forEach(fighter => {
      if (!fightIdsToKeep.includes(fighter.id)) {
        RosterSystem.retireFighter(fighter.id);
      }
    });

    // Update roster
    const newRoster = state.roster.filter(f => fightIdsToKeep.includes(f.id));
    StateManager.setState({ roster: newRoster });

    EventBus.emit(Events.GAME_START, {
      action: "roster_selected",
      level: state.currentLevel,
      roster: newRoster
    });

    return state;
  };

  /**
   * Get current level info
   */
  const getLevelInfo = () => {
    const state = StateManager.getState();
    const ruleset = ConfigLoader.getRuleset();
    const theme = ConfigLoader.getTheme();
    const levelConfig = ruleset.levels[`level${state.currentLevel}`];
    const levelThemeName = theme.narrative.levelNames[`level${state.currentLevel}`];

    return {
      level: state.currentLevel,
      tier: state.currentTier,
      maxTiers: levelConfig.tiers,
      name: levelThemeName,
      description: `Tier ${state.currentTier} of ${levelConfig.tiers}`,
      minFighters: levelConfig.minFighters,
      maxFighters: levelConfig.maxFighters,
      minArenaCapacity: levelConfig.minArenaSeatCapacity,
      maxArenaCapacity: levelConfig.maxArenaSeatCapacity,
      combatType: levelConfig.combatType,
      deathChance: levelConfig.deathChance,
      cripplingChance: levelConfig.cripplingWoundChance,
      canReplace: levelConfig.canReplaceInSeason
    };
  };

  /**
   * Get progression stats
   */
  const getProgressionStats = () => {
    const state = StateManager.getState();
    const fillPercentage = state.seasonStats.totalSeatsAvailable > 0
      ? state.seasonStats.seatsFilled / state.seasonStats.totalSeatsAvailable
      : 0;

    const ruleset = ConfigLoader.getRuleset();
    const levelConfig = ruleset.levels[`level${state.currentLevel}`];
    const threshold = levelConfig.advancementThreshold;

    return {
      currentLevel: state.currentLevel,
      currentTier: state.currentTier,
      currentSeason: state.currentSeason,
      fillPercentage: fillPercentage,
      advancementThreshold: threshold,
      canAdvance: fillPercentage >= threshold,
      progressToAdvance: {
        current: state.seasonStats.seatsFilled,
        required: Math.ceil(state.seasonStats.totalSeatsAvailable * threshold),
        total: state.seasonStats.totalSeatsAvailable
      }
    };
  };

  /**
   * Calculate difficulty rating based on level/tier
   */
  const getDifficultyRating = () => {
    const state = StateManager.getState();
    const baseRating = state.currentLevel;
    const tierModifier = (state.currentTier - 1) * 0.3;

    return Math.floor((baseRating + tierModifier) * 10);
  };

  /**
   * Complete current tier
   * Prepares for next tier or advancement
   */
  const completeTier = () => {
    const state = StateManager.getState();

    // Check if we can advance
    if (canAdvanceTier()) {
      const levelConfig = ConfigLoader.getConfig(`levels.level${state.currentLevel}`);

      if (state.currentTier >= levelConfig.tiers) {
        // Advance to next level
        return advanceLevel();
      } else {
        // Advance to next tier
        return advanceTier();
      }
    }

    EventBus.emit(Events.GAME_START, {
      action: "tier_complete",
      level: state.currentLevel,
      tier: state.currentTier,
      canAdvance: false
    });

    return state;
  };

  return {
    canAdvanceTier,
    advanceTier,
    advanceLevel,
    confirmRosterSelection,
    getLevelInfo,
    getProgressionStats,
    getDifficultyRating,
    completeTier
  };
})();
