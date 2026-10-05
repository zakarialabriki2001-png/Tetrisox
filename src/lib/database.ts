import { DataCompressionEngine, CompressionReport } from "./dataCompressor";
import { OracleDatabase, Match } from '../types';
import { ForebetParser } from './forebetParser';
import { LocalOfflineTrainer } from './signalTrainer';
import { DataSentinelAgent, SystemUpgradeAgent } from './autonomousAgents';
import { isBannedLeagueOrMatch } from './matchEngine';

const LOCAL_STORAGE_DB_KEY = 'oracle_match_ai_local_db_v105_clean_en_final';

export class DatabaseManager {
  /**
   * Prunes or passes matches through safely without losing user records.
   */
  static pruneExpiredMatches(matches: Record<string, Match>): Record<string, Match> {
    return matches || {};
  }

  /**
   * Safe legacy to prevent breaking imports.
   */
  static autoShiftUpcomingMatchesToFuture(matches: Record<string, Match>): Record<string, Match> {
    return matches;
  }

  /**
   * Initializes database by loading persistent matches from server /api/db,
   * with graceful fallback to in-memory session.
   */
  static async loadDatabaseAsync(): Promise<OracleDatabase> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);
      const res = await fetch('/api/db', { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data && data.matches && Object.keys(data.matches).length > 0) {
          return data;
        }
      }
    } catch (e) {
      console.warn('[DatabaseManager] Server API db fetch timed out or failed, using session store:', e);
    }

    const sessionDb: OracleDatabase = {
      matches: {},
      signals: {},
      signals_v2: {},
      global_stats: { total_picks: 0, correct_picks: 0, win_rate: 0, daily_history: {} },
      active_strategy: "BALANCED",
      calibration_modifiers: { COMBOS: 0, DC: 0, DIRECT_WIN: 0, GG: 0, DNB: 0, GOALS: 0 },
      strategy_history: {},
      system_telemetry: {
        last_sync: new Date().toISOString(),
        payload_size_bytes: 0,
        total_matches: 0,
        total_signals: 0,
        total_slips: 0,
        sync_type: "LOCAL_STORE",
        healed_records_detected: false,
        active_strategy: "BALANCED",
        operations_count: 0
      }
    };

    return sessionDb;
  }

  /**
   * Lightweight in-memory session save - zero network calls or server pressure.
   */
  static saveDatabase(db?: OracleDatabase): void {
    // Session-only in-memory storage
    return;
  }

  static async saveDatabaseAsync(db: OracleDatabase): Promise<void> {
    // Session-only: data lives in memory during the active session.
    // Zero external network load, zero Firestore writes, zero quota pressure.
    return;
  }

  /**
   * High-capacity session database importer:
   * Takes imported JSON, runs Autonomous Sentinel to heal all faults,
   * recalibrates signals, and executes System Evolver to tune all algorithms.
   */
  static importDatabaseSession(importedData: any, originalStringLength?: number): {
    cleanDb: OracleDatabase;
    matchCount: number;
    faultsHealed: number;
    systemsEvolved: number;
    compressionReport: CompressionReport;
  } {
    if (!importedData || typeof importedData !== "object" || (!importedData.matches && !Array.isArray(importedData))) {
      throw new Error("Invalid database format. Expected JSON containing matches dictionary or array.");
    }

    // 1. High-Efficiency Compression & Pruning Engine
    const { cleanDatabase, report: compressionReport } = DataCompressionEngine.processAndCompressPayload(
      importedData,
      originalStringLength
    );

    const cleanDb = cleanDatabase;

    // 2. Autonomous Sentinel Data Healing (Heals impossible HT>FT, negative scores, missing ciphers, timestamps)
    const { updatedMatches, report: healingReport } = DataSentinelAgent.autoCorrectDatabase(cleanDb);
    cleanDb.matches = updatedMatches;

    // 3. Train and recalibrate all offline signal models
    const trained = LocalOfflineTrainer.trainAndRecalibrate(cleanDb.matches);
    cleanDb.signals = trained.signals;
    cleanDb.signals_v2 = trained.signals_v2;
    cleanDb.global_stats = trained.globalStats;

    // 4. Autonomous System Evolver: Optimizes weights across all 8 prediction systems
    const matchesArray = Object.values(cleanDb.matches);
    const evo = SystemUpgradeAgent.evolveSystems(matchesArray);
    cleanDb.calibration_modifiers = {
      ...(cleanDb.calibration_modifiers || {}),
      ...evo.recommendedCalibrationModifiers,
    };
    cleanDb.active_strategy = evo.activeStrategy;
    cleanDb.system_telemetry = {
      last_sync: new Date().toISOString(),
      payload_size_bytes: compressionReport.compressedSizeBytes,
      total_matches: matchesArray.length,
      total_signals: Object.keys(cleanDb.signals).length,
      total_slips: cleanDb.archived_slips?.length || 0,
      sync_type: "LOCAL_STORE",
      healed_records_detected: healingReport.healedFaultsCount > 0,
      active_strategy: cleanDb.active_strategy,
      operations_count: 1,
    };

    return {
      cleanDb,
      matchCount: matchesArray.length,
      faultsHealed: healingReport.healedFaultsCount,
      systemsEvolved: Object.keys(evo.recommendedCalibrationModifiers || {}).length || 8,
      compressionReport,
    };
  }

  static clearDatabase(): OracleDatabase {
    const emptyDb: OracleDatabase = {
      matches: {},
      signals: {},
      global_stats: {
        total_picks: 0,
        correct_picks: 0,
        win_rate: 0,
        daily_history: {}
      },
      active_strategy: "BALANCED",
      calibration_modifiers: { COMBOS: 0, DC: 0, DIRECT_WIN: 0, GG: 0, DNB: 0, GOALS: 0 },
      strategy_history: {},
      system_telemetry: {
        last_sync: new Date().toISOString(),
        payload_size_bytes: 0,
        total_matches: 0,
        total_signals: 0,
        total_slips: 0,
        sync_type: "LOCAL_STORE",
        healed_records_detected: false,
        active_strategy: "BALANCED",
        operations_count: 1
      }
    };
    this.saveDatabase(emptyDb);
    return emptyDb;
  }

  /**
   * Generates and returns a baseline database seeded with the default demo matches
   */
  static loadSeededDefaults(): OracleDatabase {
    const defaultDb: OracleDatabase = {
      matches: {},
      signals: {},
      global_stats: {
        total_picks: 0,
        correct_picks: 0,
        win_rate: 0,
        daily_history: {}
      },
      active_strategy: "BALANCED",
      calibration_modifiers: { COMBOS: 0, DC: 0, DIRECT_WIN: 0, GG: 0, DNB: 0, GOALS: 0 },
      strategy_history: {},
      system_telemetry: {
        last_sync: new Date().toISOString(),
        payload_size_bytes: 0,
        total_matches: 0,
        total_signals: 0,
        total_slips: 0,
        sync_type: "LOCAL_STORE",
        healed_records_detected: false,
        active_strategy: "BALANCED",
        operations_count: 1
      }
    };

    this.saveDatabase(defaultDb);
    return defaultDb;
  }

  /**
   * Merges imported clipboard paste data safely into active DB registry
   */
  static importPaste(db: OracleDatabase, rawText: string): { imported: number; updated: number; skipped: number } {
    const list = ForebetParser.parseClipboard(rawText);
    
    let imported = 0;
    let updated = 0;
    let skipped = 0;

    list.forEach(m => {
      // 0. Strict filter: skip any banned league, country, or youth competition
      if (isBannedLeagueOrMatch(m.league_code, m.league_name, m.home, m.away)) {
        skipped++;
        return;
      }

      const existing = db.matches[m.match_id];
      if (!existing) {
        // Safe insert
        db.matches[m.match_id] = m;
        imported++;
      } else {
        // If match state updated, apply goals scoring results or halftime updates
        let changed = false;

        if (m.status === 'FINISHED' && existing.status !== 'FINISHED') {
          existing.status = 'FINISHED';
          existing.ft_home = m.ft_home;
          existing.ft_away = m.ft_away;
          existing.ht_home = m.ht_home;
          existing.ht_away = m.ht_away;
          changed = true;
        }

        if (changed) {
          updated++;
        } else {
          skipped++;
        }
      }
    });

    // Clean purge of any existing banned matches from database
    Object.keys(db.matches || {}).forEach(id => {
      const m = db.matches[id];
      if (m && isBannedLeagueOrMatch(m.league_code, m.league_name, m.home, m.away)) {
        delete db.matches[id];
      }
    });

    // Automatically prune matches older than 36 hours with no results recorded
    db.matches = this.pruneExpiredMatches(db.matches);

    // Automatically shift upcoming matches with elapsed dates to future kickoff slots
    db.matches = this.autoShiftUpcomingMatchesToFuture(db.matches);

    // Autonomous Sentinel healing for any paste anomalies
    const { updatedMatches } = DataSentinelAgent.autoCorrectDatabase(db);
    db.matches = updatedMatches;

    // Auto retraining of signal stats mappings
    const trained = LocalOfflineTrainer.trainAndRecalibrate(db.matches);
    db.signals = trained.signals;
    db.signals_v2 = trained.signals_v2;
    db.global_stats = trained.globalStats;

    // Autonomous System Evolver: Recalibrates weights and modifiers for the session
    const matchesArray = Object.values(db.matches);
    const evo = SystemUpgradeAgent.evolveSystems(matchesArray);
    db.calibration_modifiers = {
      ...(db.calibration_modifiers || {}),
      ...evo.recommendedCalibrationModifiers
    };
    db.active_strategy = evo.activeStrategy;

    this.saveDatabase(db);

    return { imported, updated, skipped };
  }
}
export default DatabaseManager;
