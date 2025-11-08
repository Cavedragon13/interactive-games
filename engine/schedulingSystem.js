/**
 * SchedulingSystem - Manage matches and seasons
 * Handles opponent selection, matchmaking, and season progression
 */
const SchedulingSystem = (() => {
  const MATCH_TYPE = {
    HOME: "home",
    AWAY: "away"
  };

  /**
   * Get available towns for current level
   */
  const getAvailableTowns = () => {
    const state = StateManager.getState();
    const level = state.currentLevel;

    // Generate towns based on level
    const towns = [];
    const townCount = 3 + level * 2; // More towns at higher levels

    for (let i = 0; i < townCount; i++) {
      towns.push({
        id: `town_${level}_${i}`,
        name: generateTownName(),
        level: level,
        arenaCapacity: generateArenaCapacity(level),
        homeTeam: generateHomeTeam(),
        populationTier: Math.floor(Math.random() * 3) + 1
      });
    }

    return towns;
  };

  /**
   * Generate random town name
   */
  const generateTownName = () => {
    const prefixes = ["New", "Old", "Great", "Lesser", "Upper", "Lower", "West", "East", "North", "South"];
    const suffixes = [
      "Haven", "Port", "Field", "Shire", "Valley", "Peak", "Ford", "Borough",
      "Wood", "Stone", "Gate", "Hill", "Bay", "Springs", "Mills"
    ];

    return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${
      suffixes[Math.floor(Math.random() * suffixes.length)]
    }`;
  };

  /**
   * Generate arena capacity based on level
   */
  const generateArenaCapacity = (level) => {
    const ruleset = ConfigLoader.getRuleset();
    const levelConfig = ruleset.levels[`level${level}`];

    const min = levelConfig.minArenaSeatCapacity;
    const max = levelConfig.maxArenaSeatCapacity;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  /**
   * Generate home team for a town
   */
  const generateHomeTeam = () => {
    const teamNames = [
      "The Gladiators", "The Titans", "The Warriors", "The Sentries",
      "The Dominators", "The Victors", "The Invincibles", "The Guardians",
      "The Eagles", "The Lions", "The Wolves", "The Dragons",
      "The Reapers", "The Destroyers", "The Unstoppables"
    ];

    return {
      name: teamNames[Math.floor(Math.random() * teamNames.length)],
      fighters: generateTeamFighters(),
      winRate: Math.random() * 0.6 + 0.2 // 20-80% win rate
    };
  };

  /**
   * Generate fighters for home team
   */
  const generateTeamFighters = () => {
    const count = Math.floor(Math.random() * 5) + 3; // 3-8 fighters
    const fighters = [];

    for (let i = 0; i < count; i++) {
      fighters.push({
        name: RosterSystem.FIGHTER_NAMES[Math.floor(Math.random() * RosterSystem.FIGHTER_NAMES.length)],
        difficulty: Math.floor(Math.random() * 10) + 1 // 1-10 difficulty rating
      });
    }

    return fighters;
  };

  /**
   * Create season schedule
   */
  const generateSeason = () => {
    const state = StateManager.getState();
    const ruleset = ConfigLoader.getRuleset();
    const levelConfig = ruleset.levels[`level${state.currentLevel}`];

    const matchesPerSeason = ruleset.seasons.matchesPerSeason;
    const homeAwayRatio = ruleset.seasons.homeAwayRatio;

    const schedule = [];
    const towns = getAvailableTowns();

    for (let i = 0; i < matchesPerSeason; i++) {
      const isHome = i < matchesPerSeason * homeAwayRatio;
      const town = towns[i % towns.length];

      const match = {
        id: `match_${state.currentSeason}_${i}`,
        season: state.currentSeason,
        round: i + 1,
        type: isHome ? MATCH_TYPE.HOME : MATCH_TYPE.AWAY,
        town: town.name,
        townId: town.id,
        arenaCapacity: town.arenaCapacity,
        opponent: town.homeTeam,
        status: "scheduled", // scheduled, in_progress, completed
        playerFighter: null,
        opponentFighter: null,
        result: null,
        attendance: 0
      };

      schedule.push(match);
    }

    StateManager.setState({ schedule });
    EventBus.emit(Events.SEASON_START, { season: state.currentSeason, matchCount: schedule.length });

    return schedule;
  };

  /**
   * Get opponent for next match
   * Uses player-selected fighter from roster
   */
  const selectOpponent = (matchId, playerFighterId) => {
    const state = StateManager.getState();
    const match = state.schedule.find(m => m.id === matchId);
    const playerFighter = StateManager.getFighter(playerFighterId);

    if (!match || !playerFighter) return null;

    // For now, pick random opponent from home team
    const opponent = match.opponent.fighters[
      Math.floor(Math.random() * match.opponent.fighters.length)
    ];

    match.playerFighter = playerFighterId;
    match.opponentFighter = opponent.name;

    StateManager.setState({ schedule: state.schedule });
    return { match, playerFighter, opponent };
  };

  /**
   * Complete a match and record result
   */
  const completeMatch = (matchId, matchResult) => {
    const state = StateManager.getState();
    const match = state.schedule.find(m => m.id === matchId);

    if (!match) return null;

    const player = StateManager.getFighter(match.playerFighter);
    if (!player) return null;

    match.status = "completed";
    match.result = matchResult;
    match.attendance = Math.floor(
      match.arenaCapacity * (0.2 + state.reputation * 0.05) * (matchResult.winner === match.playerFighter ? 1.2 : 0.8)
    );

    // Update season stats
    state.seasonStats.matchesPlayed++;
    state.seasonStats.totalSeatsAvailable += match.arenaCapacity;
    state.seasonStats.seatsFilled += match.attendance;

    if (matchResult.winner === match.playerFighter) {
      state.seasonStats.matchesWon++;
      state.funds += Math.floor(match.attendance * 10); // Revenue from attendance
      state.winStreak++;
    } else {
      state.winStreak = 0;
      state.funds += Math.floor(match.attendance * 5); // Reduced revenue
    }

    // Update fighter record
    RosterSystem.updateFighterStatus(match.playerFighter, matchResult);

    StateManager.setState({
      schedule: state.schedule,
      seasonStats: state.seasonStats,
      funds: state.funds,
      winStreak: state.winStreak
    });

    EventBus.emit(Events.MATCH_END, { match, result: matchResult });

    return match;
  };

  /**
   * Check if season should advance
   * Based on 90% capacity filled threshold
   */
  const checkSeasonAdvance = () => {
    const state = StateManager.getState();
    const fillPercentage = state.seasonStats.totalSeatsAvailable > 0
      ? state.seasonStats.seatsFilled / state.seasonStats.totalSeatsAvailable
      : 0;

    const ruleset = ConfigLoader.getRuleset();
    const levelConfig = ruleset.levels[`level${state.currentLevel}`];
    const threshold = levelConfig.advancementThreshold;

    return fillPercentage >= threshold;
  };

  /**
   * Complete current season
   */
  const completeSeason = () => {
    const state = StateManager.getState();

    // Complete training for all fighters
    TrainingSystem.completeSeasionTraining();

    // Prepare for next season
    RosterSystem.startNewSeason();

    // Reset season stats
    state.currentSeason++;
    state.seasonStats = {
      matchesPlayed: 0,
      matchesWon: 0,
      seatsFilled: 0,
      totalSeatsAvailable: 0
    };

    StateManager.setState({
      currentSeason: state.currentSeason,
      seasonStats: state.seasonStats
    });

    EventBus.emit(Events.SEASON_END, { season: state.currentSeason - 1 });

    return state;
  };

  /**
   * Get next scheduled match
   */
  const getNextMatch = () => {
    const state = StateManager.getState();
    return state.schedule.find(m => m.status === "scheduled") || null;
  };

  /**
   * Get match details
   */
  const getMatch = (matchId) => {
    const state = StateManager.getState();
    return state.schedule.find(m => m.id === matchId);
  };

  return {
    MATCH_TYPE,
    getAvailableTowns,
    generateSeason,
    selectOpponent,
    completeMatch,
    checkSeasonAdvance,
    completeSeason,
    getNextMatch,
    getMatch
  };
})();
