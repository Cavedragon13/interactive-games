/**
 * MarketingSystem - Manage team reputation and hype
 * Tracks reputation and marketing effectiveness
 */
const MarketingSystem = (() => {
  const MAX_REPUTATION = 100;
  const MIN_REPUTATION = 0;

  /**
   * Boost hype for upcoming match
   * Costs funds, increases attendance multiplier
   */
  const boostHype = (multiplier = 1) => {
    const state = StateManager.getState();
    const ruleset = ConfigLoader.getRuleset();

    const cost = ruleset.economy.hypeCost * multiplier;

    if (state.funds < cost) {
      console.warn("Insufficient funds for hype boost");
      return null;
    }

    // Remove funds
    state.funds -= cost;

    // Calculate hype effect
    const baseBenefit = ruleset.economy.hypeBenefits.attendanceMultiplier;
    const effect = 1 + (baseBenefit - 1) * multiplier;

    // Increase reputation slightly
    const reputationGain = Math.floor(multiplier * 3);
    state.reputation = Math.min(state.reputation + reputationGain, MAX_REPUTATION);

    StateManager.setState({
      funds: state.funds,
      reputation: state.reputation
    });

    EventBus.emit(Events.REPUTATION_CHANGED, {
      action: "hype_boost",
      cost,
      effect,
      newReputation: state.reputation
    });

    return { cost, effect, reputationGain };
  };

  /**
   * Update reputation based on match result
   */
  const updateReputation = (matchResult, matchAttendance = 0) => {
    const state = StateManager.getState();

    let reputationChange = 0;
    let streakBonus = 0;

    // Win bonus
    if (matchResult.winner) {
      reputationChange += 5;

      // Win streak bonus
      if (state.winStreak > 0) {
        streakBonus = Math.min(state.winStreak, 10) * 2;
        reputationChange += streakBonus;
      }
    } else if (!matchResult.isDraw) {
      // Loss penalty
      reputationChange -= 3;
    }

    // Attendance-based bonus
    if (matchAttendance > 0) {
      const attendanceBonus = Math.floor(matchAttendance / 100);
      reputationChange += attendanceBonus;
    }

    // Apply change
    state.reputation = Math.max(
      MIN_REPUTATION,
      Math.min(state.reputation + reputationChange, MAX_REPUTATION)
    );

    StateManager.setState({ reputation: state.reputation });

    EventBus.emit(Events.REPUTATION_CHANGED, {
      action: "match_result",
      change: reputationChange,
      streakBonus,
      newReputation: state.reputation
    });

    return reputationChange;
  };

  /**
   * Get reputation tier/description
   */
  const getReputationTier = () => {
    const state = StateManager.getState();
    const rep = state.reputation;

    if (rep >= 80) {
      return { tier: "Legendary", description: "Your name strikes fear and inspires awe", color: "gold" };
    } else if (rep >= 60) {
      return { tier: "Renowned", description: "Your stable is respected throughout the realm", color: "silver" };
    } else if (rep >= 40) {
      return { tier: "Notable", description: "People know of your team's exploits", color: "bronze" };
    } else if (rep >= 20) {
      return { tier: "Emerging", description: "Your stable is gaining attention", color: "blue" };
    } else {
      return { tier: "Unknown", description: "Few have heard of your fighters", color: "gray" };
    }
  };

  /**
   * Calculate attendance multiplier based on reputation and streak
   */
  const getAttendanceMultiplier = () => {
    const state = StateManager.getState();
    const ruleset = ConfigLoader.getRuleset();

    let multiplier = 1.0;

    // Reputation bonus: 20% reputation = +10% attendance
    const reputationBonus = (state.reputation / 100) * 0.2;
    multiplier += reputationBonus;

    // Win streak bonus: each win = +3% up to 15%
    const minStreakBonus = ruleset.economy.hypeBenefits.minStreakBonus || 3;
    if (state.winStreak > 0) {
      const streakBonus = Math.min(state.winStreak * 0.03, 0.15);
      multiplier += streakBonus;
    }

    return multiplier;
  };

  /**
   * Get marketing opportunities available
   */
  const getMarketingOpportunities = () => {
    const state = StateManager.getState();
    const ruleset = ConfigLoader.getRuleset();

    const opportunities = [];

    // Basic hype boost
    opportunities.push({
      id: "hype_basic",
      name: "Basic Promotion",
      cost: ruleset.economy.hypeCost,
      effect: "15% attendance boost for next match",
      multiplier: 1
    });

    if (state.funds >= ruleset.economy.hypeCost * 2) {
      opportunities.push({
        id: "hype_large",
        name: "Major Campaign",
        cost: ruleset.economy.hypeCost * 2,
        effect: "30% attendance boost for next match",
        multiplier: 2
      });
    }

    if (state.funds >= ruleset.economy.hypeCost * 5) {
      opportunities.push({
        id: "hype_legendary",
        name: "Legendary Event",
        cost: ruleset.economy.hypeCost * 5,
        effect: "45% attendance boost for next match",
        multiplier: 5
      });
    }

    return opportunities;
  };

  /**
   * Get reputation description text
   */
  const getReputationText = () => {
    const state = StateManager.getState();
    const tier = getReputationTier();

    const texts = {
      high: [
        "The crowds roar with anticipation!",
        "Spectators chant your fighters' names!",
        "Every match is packed to capacity!",
        "Your stable is the talk of the realm!"
      ],
      medium: [
        "Interest is growing in your team.",
        "Regular crowds attend your matches.",
        "Your fighters are becoming known.",
        "People speak favorably of your stable."
      ],
      low: [
        "Few spectators show up for your matches.",
        "Your team needs to build a reputation.",
        "Promote your fighters to gain attention.",
        "Success in the arena will build your name."
      ]
    };

    let category = "low";
    if (state.reputation >= 60) category = "high";
    else if (state.reputation >= 30) category = "medium";

    return texts[category][Math.floor(Math.random() * texts[category].length)];
  };

  /**
   * Get marketing stats summary
   */
  const getMarketingStats = () => {
    const state = StateManager.getState();
    const tier = getReputationTier();
    const multiplier = getAttendanceMultiplier();

    return {
      reputation: state.reputation,
      maxReputation: MAX_REPUTATION,
      tier: tier.tier,
      tierDescription: tier.description,
      winStreak: state.winStreak,
      attendanceMultiplier: multiplier.toFixed(2),
      marketingText: getReputationText(),
      nextOpportunities: getMarketingOpportunities().length
    };
  };

  return {
    MAX_REPUTATION,
    MIN_REPUTATION,
    boostHype,
    updateReputation,
    getReputationTier,
    getAttendanceMultiplier,
    getMarketingOpportunities,
    getReputationText,
    getMarketingStats
  };
})();
