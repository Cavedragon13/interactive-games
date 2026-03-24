/**
 * TrainingSystem - Allocate training points to fighters
 * Manages skill progression during seasons
 */
const TrainingSystem = (() => {
  const MAX_STAT_LEVEL = 10;

  /**
   * Get available training points for a fighter
   */
  const getTrainingPoints = (fighterId) => {
    const fighter = StateManager.getFighter(fighterId);
    return fighter?.trainingPoints || 0;
  };

  /**
   * Allocate training points to a specific stat
   */
  const trainStat = (fighterId, stat, points = 1) => {
    const fighter = StateManager.getFighter(fighterId);
    if (!fighter) return null;

    const ruleset = ConfigLoader.getRuleset();
    const validStats = ruleset.training.stats;

    if (!validStats.includes(stat)) {
      console.warn(`Invalid stat: ${stat}`);
      return null;
    }

    if (fighter.trainingPoints < points) {
      console.warn("Insufficient training points");
      return null;
    }

    if (!fighter.stats[stat]) {
      fighter.stats[stat] = 1;
    }

    // Cap stat at MAX_STAT_LEVEL
    if (fighter.stats[stat] + points > MAX_STAT_LEVEL) {
      points = MAX_STAT_LEVEL - fighter.stats[stat];
    }

    if (points <= 0) {
      console.warn(`Stat ${stat} is already at maximum`);
      return null;
    }

    fighter.stats[stat] += points;
    fighter.trainingPoints -= points;

    StateManager.updateFighter(fighterId, fighter);
    EventBus.emit(Events.FIGHTER_TRAINED, {
      fighter,
      stat,
      pointsAllocated: points,
      newLevel: fighter.stats[stat]
    });

    return fighter;
  };

  /**
   * Get all training recommendations based on fighter's record
   */
  const getTrainingRecommendations = (fighterId) => {
    const fighter = StateManager.getFighter(fighterId);
    if (!fighter) return null;

    const recommendations = [];
    const { wins, losses } = fighter.record;

    // Win ratio analysis
    const totalFights = wins + losses;
    if (totalFights === 0) {
      recommendations.push({
        stat: "Strength",
        reason: "New fighter - build foundation in offense",
        priority: "high"
      });
      return recommendations;
    }

    const winRatio = wins / totalFights;

    if (winRatio < 0.4) {
      // Losing fighter
      recommendations.push({
        stat: "Defense",
        reason: "High loss rate - improve defense",
        priority: "high"
      });
      recommendations.push({
        stat: "Stamina",
        reason: "Build endurance for longer fights",
        priority: "medium"
      });
    } else if (winRatio > 0.6) {
      // Winning fighter
      recommendations.push({
        stat: "Strength",
        reason: "Leverage winning record - increase damage",
        priority: "high"
      });
      recommendations.push({
        stat: "Sense",
        reason: "Improve decision-making for more wins",
        priority: "medium"
      });
    } else {
      // Average fighter
      recommendations.push({
        stat: "Sense",
        reason: "Balanced record - improve fight awareness",
        priority: "high"
      });
    }

    return recommendations;
  };

  /**
   * Complete training for a season
   * Award bonus points based on performance
   */
  const completeSeasionTraining = () => {
    const state = StateManager.getState();
    const roster = [...state.roster];

    roster.forEach(fighter => {
      const ruleset = ConfigLoader.getRuleset();
      let bonusPoints = 0;

      // Award bonus points based on wins
      if (fighter.record.wins > 0) {
        bonusPoints = Math.floor(fighter.record.wins * 0.5);
      }

      fighter.trainingPoints += bonusPoints;

      // Cap training points at reasonable level
      fighter.trainingPoints = Math.min(fighter.trainingPoints, 20);
    });

    StateManager.setState({ roster }, false);
    EventBus.emit(Events.SEASON_END, { action: "training_completed" });
    return roster;
  };

  /**
   * Auto-train a fighter based on recommendations
   */
  const autoTrain = (fighterId) => {
    const fighter = StateManager.getFighter(fighterId);
    if (!fighter || fighter.trainingPoints === 0) return null;

    const recommendations = getTrainingRecommendations(fighterId);
    if (!recommendations || recommendations.length === 0) return null;

    const topRecommendation = recommendations[0];
    return trainStat(fighterId, topRecommendation.stat, 1);
  };

  /**
   * Manual training session - player allocates all points
   */
  const startTrainingSession = (fighterId) => {
    const fighter = StateManager.getFighter(fighterId);
    if (!fighter) return null;

    const ruleset = ConfigLoader.getRuleset();

    return {
      fighterId,
      fighterName: fighter.name,
      availablePoints: fighter.trainingPoints,
      currentStats: { ...fighter.stats },
      stats: ruleset.training.stats,
      maxStatLevel: MAX_STAT_LEVEL,
      recommendations: getTrainingRecommendations(fighterId)
    };
  };

  /**
   * Commit training changes from session
   */
  const commitTrainingSession = (fighterId, allocations) => {
    const fighter = StateManager.getFighter(fighterId);
    if (!fighter) return null;

    let pointsUsed = 0;

    // Apply allocations
    Object.keys(allocations).forEach(stat => {
      const points = allocations[stat];
      if (points > 0) {
        trainStat(fighterId, stat, points);
        pointsUsed += points;
      }
    });

    EventBus.emit(Events.FIGHTER_TRAINED, {
      fighter: StateManager.getFighter(fighterId),
      totalPointsUsed: pointsUsed,
      sessionComplete: true
    });

    return StateManager.getFighter(fighterId);
  };

  return {
    MAX_STAT_LEVEL,
    getTrainingPoints,
    trainStat,
    getTrainingRecommendations,
    completeSeasionTraining,
    autoTrain,
    startTrainingSession,
    commitTrainingSession
  };
})();
