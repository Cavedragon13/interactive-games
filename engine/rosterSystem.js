/**
 * RosterSystem - Manage team of fighters
 * Handles recruiting, training, retiring, and tracking fighters
 */
const RosterSystem = (() => {
  const FIGHTER_STATUS = {
    HEALTHY: "healthy",
    INJURED: "injured",
    CRIPPLED: "crippled",
    DEAD: "dead",
    RETIRED: "retired"
  };

  const FIGHTER_NAMES = [
    "Brutus", "Maximus", "Aurelius", "Castor", "Theron", "Lucius", "Quintus", "Spartacus",
    "Varro", "Marius", "Cato", "Seneca", "Agrippa", "Hadrian", "Titus", "Sulla",
    "Fabius", "Gaius", "Decimus", "Domitian", "Commodus", "Caracalla", "Severus", "Gordian"
  ];

  /**
   * Create a new fighter with random stats
   */
  const createFighter = (name = null) => {
    const finalName = name || FIGHTER_NAMES[Math.floor(Math.random() * FIGHTER_NAMES.length)];

    // Distribute 4 stat points randomly
    const baseStats = {
      Strength: 1,
      Stamina: 1,
      Defense: 1,
      Sense: 1
    };

    return {
      id: `fighter_${Date.now()}_${Math.random()}`,
      name: finalName,
      status: FIGHTER_STATUS.HEALTHY,
      health: 5,
      maxHealth: 5,
      stats: baseStats,
      trainingPoints: 0,
      record: {
        wins: 0,
        losses: 0,
        draws: 0
      },
      injuries: [],
      joinedSeason: StateManager.getState().currentSeason,
      lastFought: null,
      experience: 0
    };
  };

  /**
   * Hire a fighter for the roster
   */
  const hireFighter = (name = null) => {
    const state = StateManager.getState();
    const ruleset = ConfigLoader.getRuleset();
    const levelConfig = ruleset.levels[`level${state.currentLevel}`];

    // Check roster limit
    if (state.roster.length >= levelConfig.maxFighters) {
      console.warn("Roster is full!");
      return null;
    }

    const fighter = createFighter(name);
    return StateManager.addFighter(fighter);
  };

  /**
   * Update fighter status after combat
   */
  const updateFighterStatus = (fighterId, result) => {
    const fighter = StateManager.getFighter(fighterId);
    if (!fighter) return null;

    // Update record
    if (result.winner === fighterId) {
      fighter.record.wins++;
      fighter.experience += 100;
    } else if (result.loser === fighterId) {
      fighter.record.losses++;
      fighter.experience += 50;
    } else {
      fighter.record.draws++;
      fighter.experience += 75;
    }

    fighter.lastFought = new Date().toISOString();
    fighter.health = result[`f${fighterId === result.f1Final?.id ? 1 : 2}Final`]?.health || 0;

    // Check for injuries from result
    const round = result.rounds[result.rounds.length - 1];
    if (round.f1Injury && fighterId === result.f1Final?.id) {
      applyInjury(fighterId, round.f1Injury);
    } else if (round.f2Injury && fighterId === result.f2Final?.id) {
      applyInjury(fighterId, round.f2Injury);
    }

    StateManager.updateFighter(fighterId, fighter);
    EventBus.emit(Events.FIGHTER_INJURED, { fighter });
    return fighter;
  };

  /**
   * Apply injury/death to fighter
   */
  const applyInjury = (fighterId, injury) => {
    const fighter = StateManager.getFighter(fighterId);
    if (!fighter) return null;

    if (injury.type === "death") {
      fighter.status = FIGHTER_STATUS.DEAD;
      StateManager.removeFighter(fighterId, "dead");
      EventBus.emit(Events.FIGHTER_REMOVED, { fighter, reason: "death" });

      // Hire replacement if in season and level 1
      const state = StateManager.getState();
      if (state.currentLevel === 1) {
        hireFighter();
      }
    } else if (injury.type === "crippling") {
      fighter.status = FIGHTER_STATUS.CRIPPLED;
      fighter.injuries.push({
        type: injury.type,
        severity: injury.severity,
        appliedSeason: StateManager.getState().currentSeason
      });
    }

    StateManager.updateFighter(fighterId, fighter);
    return fighter;
  };

  /**
   * Heal a fighter
   */
  const healFighter = (fighterId) => {
    const fighter = StateManager.getFighter(fighterId);
    if (!fighter) return null;

    const ruleset = ConfigLoader.getRuleset();
    const state = StateManager.getState();
    let cost = 0;

    if (fighter.status === FIGHTER_STATUS.CRIPPLED) {
      cost = ruleset.economy.healingCost.crippledFighter;
      fighter.status = FIGHTER_STATUS.HEALTHY;
      fighter.injuries = [];
    } else if (fighter.status === FIGHTER_STATUS.INJURED) {
      cost = ruleset.economy.healingCost.majorInjury;
      fighter.status = FIGHTER_STATUS.HEALTHY;
    } else if (fighter.health < fighter.maxHealth) {
      cost = ruleset.economy.healingCost.minorInjury;
      fighter.health = fighter.maxHealth;
    } else {
      return fighter; // Already healthy
    }

    // Check funds
    if (state.funds < cost) {
      console.warn("Insufficient funds to heal fighter");
      return null;
    }

    StateManager.setState({ funds: state.funds - cost });
    StateManager.updateFighter(fighterId, fighter);
    EventBus.emit(Events.FIGHTER_HEALED, { fighter, cost });

    return fighter;
  };

  /**
   * Retire a fighter
   */
  const retireFighter = (fighterId) => {
    const fighter = StateManager.getFighter(fighterId);
    if (!fighter) return null;

    fighter.status = FIGHTER_STATUS.RETIRED;
    StateManager.removeFighter(fighterId, "retired");
    EventBus.emit(Events.FIGHTER_REMOVED, { fighter, reason: "retired" });

    return fighter;
  };

  /**
   * Get fighter stats including modifiers
   */
  const getFighterStats = (fighterId) => {
    const fighter = StateManager.getFighter(fighterId);
    if (!fighter) return null;

    const ruleset = ConfigLoader.getRuleset();
    const stats = { ...fighter.stats };

    // Apply modifiers based on training
    const trainingStat = ruleset.training.statBonusPerPoint;
    Object.keys(stats).forEach(stat => {
      stats[stat] += (fighter[`trained${stat}`] || 0) * (trainingStat[stat] || 0.1);
    });

    return stats;
  };

  /**
   * Prepare roster for new season
   * Heal all injuries, reset training points
   */
  const startNewSeason = () => {
    const state = StateManager.getState();
    const roster = [...state.roster];

    roster.forEach(fighter => {
      // Heal all injuries
      if (fighter.status === FIGHTER_STATUS.INJURED || fighter.status === FIGHTER_STATUS.CRIPPLED) {
        fighter.status = FIGHTER_STATUS.HEALTHY;
        fighter.injuries = [];
      }

      // Restore health
      fighter.health = fighter.maxHealth;

      // Reset training points for next season
      fighter.trainingPoints = ConfigLoader.getConfig("training.pointsPerSeason");
    });

    StateManager.setState({ roster }, false);
    return roster;
  };

  /**
   * Get roster summary stats
   */
  const getRosterStats = () => {
    const state = StateManager.getState();
    const roster = state.roster;

    return {
      totalFighters: roster.length,
      healthyFighters: roster.filter(f => f.status === FIGHTER_STATUS.HEALTHY).length,
      injuredFighters: roster.filter(f => f.status === FIGHTER_STATUS.INJURED).length,
      crippledFighters: roster.filter(f => f.status === FIGHTER_STATUS.CRIPPLED).length,
      totalWins: roster.reduce((sum, f) => sum + f.record.wins, 0),
      totalLosses: roster.reduce((sum, f) => sum + f.record.losses, 0),
      avgExperience: Math.floor(roster.reduce((sum, f) => sum + f.experience, 0) / roster.length) || 0
    };
  };

  return {
    FIGHTER_STATUS,
    createFighter,
    hireFighter,
    updateFighterStatus,
    applyInjury,
    healFighter,
    retireFighter,
    getFighterStats,
    startNewSeason,
    getRosterStats
  };
})();
