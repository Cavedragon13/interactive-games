/**
 * CombatSystem - Rock-Paper-Scissors combat with Shield/Parry/Attack
 * Pluggable combat resolver for different game modes
 */
const CombatSystem = (() => {
  const CHOICES = {
    ATTACK: "attack",
    SHIELD: "shield",
    PARRY: "parry"
  };

  const RESULTS = {
    ATTACKER_WIN: "attacker_win",
    DEFENDER_WIN: "defender_win",
    MUTUAL_BLOCK: "mutual_block"
  };

  // Combat effectiveness matrix
  const effectiveness = {
    [CHOICES.ATTACK]: {
      beats: CHOICES.PARRY,
      damageMult: 1.0,
      notes: "Full damage against unprepared opponent"
    },
    [CHOICES.SHIELD]: {
      beats: CHOICES.ATTACK,
      damageMult: 0.5,
      notes: "Blocks attacks, takes reduced damage from parry"
    },
    [CHOICES.PARRY]: {
      beats: CHOICES.SHIELD,
      damageMult: 0.5,
      notes: "Counters shield, takes full damage from attack"
    }
  };

  /**
   * Resolve a single combat round
   * @param {Object} attacker - Fighter doing the attacking
   * @param {Object} defender - Fighter being attacked
   * @param {string} attackerChoice - "attack", "shield", or "parry"
   * @param {string} defenderChoice - "attack", "shield", or "parry"
   * @returns {Object} Round result with damage dealt
   */
  const resolveRound = (attacker, defender, attackerChoice, defenderChoice) => {
    const baseDamage = calculateDamage(attacker, defender);

    // Determine outcome based on choices
    let damageDealt = 0;
    let outcome = RESULTS.MUTUAL_BLOCK;

    if (attackerChoice === CHOICES.ATTACK) {
      if (defenderChoice === CHOICES.PARRY) {
        // Attack beats parry
        damageDealt = baseDamage;
        outcome = RESULTS.ATTACKER_WIN;
      } else if (defenderChoice === CHOICES.SHIELD) {
        // Shield takes reduced damage from attack
        damageDealt = Math.ceil(baseDamage * 0.5);
        outcome = RESULTS.MUTUAL_BLOCK;
      } else {
        // Both attack - mutual strike
        damageDealt = baseDamage;
        outcome = RESULTS.ATTACKER_WIN;
      }
    } else if (attackerChoice === CHOICES.SHIELD) {
      if (defenderChoice === CHOICES.ATTACK) {
        // Shield blocks attack
        damageDealt = 0;
        outcome = RESULTS.DEFENDER_WIN;
      } else if (defenderChoice === CHOICES.PARRY) {
        // Parry beats shield
        damageDealt = Math.ceil(baseDamage * 0.5);
        outcome = RESULTS.DEFENDER_WIN;
      } else {
        // Both shield - no damage
        damageDealt = 0;
        outcome = RESULTS.MUTUAL_BLOCK;
      }
    } else if (attackerChoice === CHOICES.PARRY) {
      if (defenderChoice === CHOICES.SHIELD) {
        // Parry beats shield
        damageDealt = Math.ceil(baseDamage * 0.5);
        outcome = RESULTS.ATTACKER_WIN;
      } else if (defenderChoice === CHOICES.ATTACK) {
        // Attack beats parry
        damageDealt = baseDamage;
        outcome = RESULTS.DEFENDER_WIN;
      } else {
        // Both parry - mutual block
        damageDealt = 0;
        outcome = RESULTS.MUTUAL_BLOCK;
      }
    }

    return {
      outcome,
      damageDealt,
      attackerChoice,
      defenderChoice,
      timestamp: Date.now()
    };
  };

  /**
   * Calculate base damage based on stats
   * Strength and Stamina increase damage
   */
  const calculateDamage = (attacker, defender) => {
    const strength = attacker.stats.Strength || 1;
    const stamina = attacker.stats.Stamina || 1;
    const defenseReduction = Math.max(0.3, 1 - (defender.stats.Defense || 1) * 0.1);

    const baseDamage = 5 + (strength * 0.5) + (stamina * 0.2);
    return Math.max(1, Math.floor(baseDamage * defenseReduction));
  };

  /**
   * Simulate AI opponent choice based on simple heuristics
   */
  const getAIChoice = (fighter, opponentLastChoice = null) => {
    const sense = fighter.stats.Sense || 1;
    const randomness = 0.3 - (sense * 0.02);

    if (Math.random() < randomness) {
      // Random choice
      const choices = [CHOICES.ATTACK, CHOICES.SHIELD, CHOICES.PARRY];
      return choices[Math.floor(Math.random() * choices.length)];
    }

    // Predictive choice based on opponent's last move
    if (opponentLastChoice === CHOICES.ATTACK) {
      return CHOICES.SHIELD;
    } else if (opponentLastChoice === CHOICES.SHIELD) {
      return CHOICES.PARRY;
    } else if (opponentLastChoice === CHOICES.PARRY) {
      return CHOICES.ATTACK;
    }

    return CHOICES.ATTACK;
  };

  /**
   * Check if fighter should be injured/killed
   * Returns injury status or null
   */
  const checkInjury = (fighter, damageDealt, level = 1) => {
    if (damageDealt === 0) return null;

    const ruleset = ConfigLoader.getRuleset();
    const levelConfig = ruleset.levels[`level${level}`];

    if (!levelConfig) return null;

    // Check for death (only above level 1, and based on damage severity)
    if (level > 1 && damageDealt >= fighter.maxHealth) {
      const deathChance = levelConfig.deathChance || 0.05;
      if (Math.random() < deathChance) {
        return { type: "death", severity: "fatal" };
      }
    }

    // Check for crippling wound
    if (damageDealt >= fighter.maxHealth * 0.8) {
      const cripplingChance = levelConfig.cripplingWoundChance || 0.05;
      if (Math.random() < cripplingChance) {
        return { type: "crippling", severity: "severe", turns: 1 };
      }
    }

    // Regular damage
    return null;
  };

  /**
   * Full match simulation
   * Returns complete match result
   */
  const simulateMatch = (fighter1, fighter2, options = {}) => {
    const rounds = [];
    const f1 = { ...fighter1, currentHealth: fighter1.health };
    const f2 = { ...fighter2, currentHealth: fighter2.health };

    let maxRounds = options.maxRounds || 10;
    let interactive = options.interactive || false;

    while (maxRounds > 0 && f1.currentHealth > 0 && f2.currentHealth > 0) {
      const f1Choice = interactive ? null : getAIChoice(f1, rounds[rounds.length - 1]?.f2Choice);
      const f2Choice = getAIChoice(f2, rounds[rounds.length - 1]?.f1Choice);

      const round = {
        f1Choice,
        f2Choice,
        ...resolveRound(f1, f2, f1Choice || CHOICES.ATTACK, f2Choice)
      };

      // Apply damage to f2
      f2.currentHealth -= round.damageDealt;

      // Check for injuries to f2
      const f2Injury = checkInjury(f2, round.damageDealt, StateManager.getState().currentLevel);
      if (f2Injury?.type === "death") {
        f2.currentHealth = 0;
        round.f2Injury = f2Injury;
        break;
      }
      if (f2Injury) {
        round.f2Injury = f2Injury;
      }

      // Reverse: f2 attacks f1 (in simultaneous combat)
      const reverseRound = resolveRound(f2, f1, f2Choice, f1Choice || CHOICES.ATTACK);
      f1.currentHealth -= reverseRound.damageDealt;

      const f1Injury = checkInjury(f1, reverseRound.damageDealt, StateManager.getState().currentLevel);
      if (f1Injury?.type === "death") {
        f1.currentHealth = 0;
        reverseRound.f1Injury = f1Injury;
        break;
      }
      if (f1Injury) {
        reverseRound.f1Injury = f1Injury;
      }

      rounds.push(round);
      maxRounds--;
    }

    const winner = f1.currentHealth > 0 ? f1 : f2.currentHealth > 0 ? f2 : null;
    const loser = winner === f1 ? f2 : f1;

    return {
      winner: winner ? winner.id : null,
      loser: loser ? loser.id : null,
      rounds,
      f1Final: { id: f1.id, health: f1.currentHealth },
      f2Final: { id: f2.id, health: f2.currentHealth },
      isDraw: f1.currentHealth <= 0 && f2.currentHealth <= 0
    };
  };

  return {
    CHOICES,
    RESULTS,
    resolveRound,
    calculateDamage,
    getAIChoice,
    checkInjury,
    simulateMatch,
    effectiveness
  };
})();
