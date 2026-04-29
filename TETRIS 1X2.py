# ============================================================
# OMEGA CHAOS LOGIC v4.0 - Streamlit Web App
# Engine: TETRIS GB v18.3 (Titan AI) - Poisson · Self-Learning
# Database: SQLite (Free & Local)
# ============================================================

import streamlit as st
import sqlite3
import json, os, re, math, random, hashlib
from collections import defaultdict
from datetime import datetime, date
from typing import Dict, List, Optional, Tuple
import pandas as pd

# ─── PAGE CONFIG ────────────────────────────────────────────
st.set_page_config(
    page_title="CHAOS LOGIC v4.0",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# ─── CUSTOM CSS ─────────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Rajdhani:wght@400;600;700&display=swap');

* { box-sizing: border-box; }

.stApp, body {
    background-color: #080d1a !important;
    color: #e0e8ff !important;
    font-family: 'Rajdhani', sans-serif;
}
#MainMenu, footer, header { visibility: hidden; }
.block-container { padding: 1rem 2rem 2rem 2rem; max-width: 1200px; margin: auto; }

/* ── HEADER ── */
.chaos-header {
    background: linear-gradient(135deg, #0f1b35 0%, #0a1020 100%);
    border: 1px solid #1e3060;
    border-radius: 18px;
    padding: 22px 28px;
    margin-bottom: 18px;
    display: flex; align-items: center; justify-content: space-between;
    box-shadow: 0 0 40px rgba(77,166,255,0.08);
}
.chaos-logo { font-size: 2rem; font-weight: 700; font-family: 'Rajdhani', sans-serif;
    color: #fff; letter-spacing: 2px; display: flex; align-items: center; gap: 14px; }
.chaos-logo .icon { background: linear-gradient(135deg, #6a4fff, #4da6ff);
    border-radius: 14px; width: 52px; height: 52px; display: flex;
    align-items: center; justify-content: center; font-size: 1.6rem; }
.chaos-meta { color: #5a7aaa; font-size: 0.82rem; margin-top: 4px; }
.live-badge { background: rgba(0,255,136,0.12); border: 1px solid #00cc66;
    color: #00ff88; border-radius: 20px; padding: 4px 12px; font-size: 0.82rem;
    font-weight: 700; display: inline-flex; align-items: center; gap: 6px; }
.live-dot { width: 7px; height: 7px; background: #00ff88;
    border-radius: 50%; animation: pulse 1.5s infinite; display: inline-block; }
@keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }

/* ── STAT CARDS ── */
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 18px; }
.stat-card {
    background: #0f1b35;
    border: 1px solid #1e3060;
    border-radius: 14px; padding: 18px 12px 14px; text-align: center;
    position: relative; overflow: hidden;
    transition: border-color 0.2s;
}
.stat-card:hover { border-color: #4da6ff; }
.stat-card::before { content:''; position:absolute; top:0; left:0; right:0;
    height:3px; border-radius:14px 14px 0 0; }
.stat-card.blue::before { background: linear-gradient(90deg,#4da6ff,#6ac4ff); }
.stat-card.yellow::before { background: linear-gradient(90deg,#ffd700,#ffaa00); }
.stat-card.green::before { background: linear-gradient(90deg,#00ff88,#00cc66); }
.stat-card.grey::before { background: linear-gradient(90deg,#444,#666); }
.stat-num { font-size: 2.2rem; font-weight: 700; line-height: 1; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
.stat-num.blue { color: #4da6ff; }
.stat-num.yellow { color: #ffd700; }
.stat-num.green { color: #00ff88; }
.stat-num.grey { color: #555; }
.stat-label { font-size: 0.78rem; color: #5a7aaa; letter-spacing: 1px; text-transform: uppercase; }
.stat-sub { font-size: 0.7rem; color: #3a5a80; margin-top: 2px; }

/* ── INPUT CARD ── */
.input-card {
    background: #0f1b35; border: 1px solid #1e3060;
    border-radius: 16px; padding: 22px; margin-bottom: 18px;
}
.input-title { font-size: 1.1rem; font-weight: 700; color: #fff;
    display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.input-hint { font-size: 0.8rem; color: #5a7aaa; margin-bottom: 14px; }
.stTextArea textarea {
    background: #060c1a !important; color: #7090bb !important;
    border: 1px solid #1e3060 !important; border-radius: 10px !important;
    font-family: 'JetBrains Mono', monospace !important; font-size: 0.82rem !important;
}
.stTextArea textarea::placeholder { color: #2a4060 !important; }

/* ── PROCESS BUTTON ── */
.stButton > button {
    background: linear-gradient(135deg, #6a4fff 0%, #4da6ff 100%) !important;
    color: white !important; border: none !important; border-radius: 12px !important;
    padding: 14px 30px !important; font-weight: 700 !important; font-size: 1rem !important;
    width: 100% !important; letter-spacing: 1px !important;
    transition: all 0.2s !important; box-shadow: 0 4px 20px rgba(106,79,255,0.3) !important;
}
.stButton > button:hover {
    transform: translateY(-1px) !important;
    box-shadow: 0 6px 24px rgba(106,79,255,0.5) !important;
}

/* ── TABS ── */
.stTabs [data-baseweb="tab-list"] {
    background: #0f1b35 !important; border-radius: 14px !important;
    padding: 6px !important; gap: 4px !important;
    border: 1px solid #1e3060 !important;
}
.stTabs [data-baseweb="tab"] {
    background: transparent !important; color: #5a7aaa !important;
    border-radius: 10px !important; padding: 9px 20px !important;
    font-family: 'Rajdhani', sans-serif !important;
    font-weight: 600 !important; font-size: 0.9rem !important; letter-spacing: 0.5px !important;
}
.stTabs [aria-selected="true"] {
    background: linear-gradient(135deg, #1a2a5e, #1e3565) !important;
    color: #4da6ff !important;
}
.stTabs [data-baseweb="tab-panel"] {
    background: transparent !important; padding-top: 14px !important;
}

/* ── TOGGLE BUTTONS ── */
.toggle-row { display: flex; gap: 8px; margin-bottom: 14px; }
.toggle-active {
    background: #4da6ff; color: #fff; border: none;
    border-radius: 20px; padding: 7px 18px; font-size: 0.85rem; font-weight: 700;
    cursor: pointer; font-family: 'Rajdhani', sans-serif;
}
.toggle-inactive {
    background: #0f1b35; color: #5a7aaa; border: 1px solid #1e3060;
    border-radius: 20px; padding: 7px 18px; font-size: 0.85rem;
    cursor: pointer; font-family: 'Rajdhani', sans-serif;
}

/* ── MATCH CARDS ── */
.match-card {
    background: #0f1b35; border: 1px solid #1e3060;
    border-radius: 14px; padding: 14px 18px; margin-bottom: 10px;
    transition: all 0.2s; cursor: pointer;
    display: flex; align-items: center; justify-content: space-between;
}
.match-card:hover { border-color: #4da6ff; background: #111f40; }
.match-teams { font-size: 1rem; font-weight: 700; color: #dde8ff; }
.match-meta { font-size: 0.78rem; color: #5a7aaa; margin-top: 3px; }
.match-score {
    background: #0a1525; border: 1px solid #1e3060;
    border-radius: 10px; padding: 8px 14px; text-align: center;
    min-width: 70px;
}
.match-score-num { font-size: 1.2rem; font-weight: 700; color: #4da6ff;
    font-family: 'JetBrains Mono', monospace; }
.match-score-label { font-size: 0.65rem; color: #3a5a80; letter-spacing: 1px; }
.badge { display: inline-block; background: #6a4fff; color: #fff;
    border-radius: 8px; padding: 2px 8px; font-size: 0.7rem; font-weight: 700; margin-right: 4px; }
.badge-gold { background: linear-gradient(90deg, #b8860b, #ffd700); color: #000; }
.badge-green { background: #006633; color: #00ff88; }
.badge-red { background: #660000; color: #ff4444; }
.badge-grey { background: #1a2a40; color: #5a7aaa; }
.market-pill {
    background: rgba(77,166,255,0.1); border: 1px solid rgba(77,166,255,0.3);
    color: #4da6ff; border-radius: 8px; padding: 3px 10px;
    font-size: 0.78rem; font-weight: 600; display: inline-block; margin: 2px;
}
.joker-pill {
    background: rgba(255,215,0,0.1); border: 1px solid rgba(255,215,0,0.3);
    color: #ffd700; border-radius: 8px; padding: 3px 10px;
    font-size: 0.78rem; font-weight: 600; display: inline-block; margin: 2px;
}

/* ── TICKET BOX ── */
.ticket-box {
    background: linear-gradient(135deg, #0f1b35 0%, #080d1a 100%);
    border: 1px solid #ffd700; border-radius: 16px; padding: 24px;
    margin: 16px 0; box-shadow: 0 0 30px rgba(255,215,0,0.08);
}
.ticket-title {
    text-align: center; font-size: 0.8rem; letter-spacing: 3px;
    color: #ffd700; font-weight: 700; margin-bottom: 16px;
    text-transform: uppercase;
}
.ticket-match { font-size: 1.2rem; font-weight: 700; text-align: center;
    color: #fff; margin-bottom: 6px; }
.ticket-market { font-size: 1.5rem; font-weight: 700; text-align: center;
    color: #4da6ff; margin: 12px 0; font-family: 'JetBrains Mono', monospace; }
.ticket-stats { display: flex; justify-content: center; gap: 30px; margin-top: 14px; }
.ticket-stat { text-align: center; }
.ticket-stat-num { font-size: 1.1rem; font-weight: 700; color: #fff; }
.ticket-stat-label { font-size: 0.72rem; color: #5a7aaa; letter-spacing: 1px; }

/* ── RESULT BOXES ── */
.result-win { background: rgba(0,255,136,0.07); border: 1px solid #00cc66;
    border-radius: 12px; padding: 14px; margin: 8px 0; }
.result-loss { background: rgba(255,60,60,0.07); border: 1px solid #cc3333;
    border-radius: 12px; padding: 14px; margin: 8px 0; }
.result-pending { background: rgba(255,215,0,0.07); border: 1px solid #aa8800;
    border-radius: 12px; padding: 14px; margin: 8px 0; }

/* ── SECTION CARD ── */
.section-card {
    background: #0f1b35; border: 1px solid #1e3060;
    border-radius: 14px; padding: 18px; margin-bottom: 14px;
}
.section-header { font-size: 0.75rem; letter-spacing: 2px; color: #3a5a80;
    text-transform: uppercase; margin-bottom: 10px; }

/* ── PARLAY TABLE ── */
.parlay-row { display:flex; align-items:center; justify-content:space-between;
    padding: 10px 0; border-bottom: 1px solid #1a2a40; }
.parlay-row:last-child { border-bottom: none; }
.parlay-odds-total { font-size: 1.6rem; font-weight: 700; color: #00ff88;
    font-family: 'JetBrains Mono', monospace; text-align: center; }
.parlay-odds-label { font-size: 0.75rem; color: #5a7aaa; text-align: center;
    letter-spacing: 1px; text-transform: uppercase; }

/* ── SIGNAL CARD ── */
.signal-card { background: #0f1b35; border-left: 3px solid #4da6ff;
    border-radius: 0 12px 12px 0; padding: 12px 16px; margin-bottom: 8px; }
.signal-hot { border-left-color: #ff4444; }
.signal-warm { border-left-color: #ffd700; }
.signal-cold { border-left-color: #00ff88; }

/* ── DB TABLE ── */
.stDataFrame { background: #0f1b35 !important; }
[data-testid="stDataFrameResizable"] { border-radius: 12px; overflow: hidden;
    border: 1px solid #1e3060 !important; }

/* ── SELECTBOX / INPUT ── */
.stSelectbox > div > div { background: #0f1b35 !important; border-color: #1e3060 !important; color: #dde8ff !important; }
.stTextInput > div > input { background: #0f1b35 !important; border-color: #1e3060 !important; color: #dde8ff !important; }
.stNumberInput > div > input { background: #0f1b35 !important; border-color: #1e3060 !important; color: #dde8ff !important; }

/* ── METRICS ── */
[data-testid="stMetric"] { background: #0f1b35; border: 1px solid #1e3060;
    border-radius: 12px; padding: 14px; }
[data-testid="stMetricLabel"] { color: #5a7aaa !important; font-size: 0.78rem !important; letter-spacing: 1px; }
[data-testid="stMetricValue"] { color: #4da6ff !important; font-family: 'JetBrains Mono', monospace !important; }

/* ── SIDEBAR ── */
[data-testid="stSidebar"] { background: #060c1a !important; border-right: 1px solid #1e3060; }

/* ── SUCCESS / ERROR ── */
.stSuccess { background: rgba(0,255,136,0.1) !important; border-color: #00ff88 !important; color: #00ff88 !important; }
.stError { background: rgba(255,60,60,0.1) !important; border-color: #ff4444 !important; color: #ff4444 !important; }
.stWarning { background: rgba(255,215,0,0.1) !important; border-color: #ffd700 !important; color: #ffd700 !important; }
.stInfo { background: rgba(77,166,255,0.1) !important; border-color: #4da6ff !important; color: #4da6ff !important; }

div.stAlert { border-radius: 10px !important; }

hr { border-color: #1e3060 !important; }
</style>
""", unsafe_allow_html=True)

# ============================================================
# ─── ENGINE CONFIGURATION ────────────────────────────────────
# ============================================================
NUM_SIMULATIONS = 20000
MIN_IMPLIED_ODDS = 1.618
MAX_IMPLIED_ODDS = 16.18
ELITE_MIN_CONFIDENCE = 0.575
ELITE_MAX_SURPRISE = 6.5
DB_FILE = "omega_chaos.db"

MARKETS_LIST = [
    "W1","X","W2","1X","X2","12",
    "AH Home -0.25","AH Away -0.25","AH Home -0.5","AH Away -0.5",
    "AH Home -0.75","AH Away -0.75","AH Home -1.0","AH Away -1.0",
    "AH Home -1.25","AH Away -1.25","AH Home -1.5","AH Away -1.5",
    "AH Home -1.75","AH Away -1.75","AH Home -2.0","AH Away -2.0",
    "AH Home -2.5","AH Away -2.5","AH Home -3.0","AH Away -3.0",
    "AH Home +0.25","AH Away +0.25","AH Home +0.5","AH Away +0.5",
    "AH Home +0.75","AH Away +0.75","AH Home +1.0","AH Away +1.0",
    "AH Home -0.0","AH Away -0.0",
    "Over 0.5","Under 0.5","Over 1.5","Under 1.5","Over 2.5","Under 2.5",
    "Over 3.5","Under 3.5","Over 4.5","Under 4.5","Over 5.5","Under 5.5",
    "Over 6.5","Under 6.5","Over 7.5","Under 7.5",
    "Over 1.75","Under 1.75","Over 2.25","Under 2.25",
    "Over 2.75","Under 2.75","Over 3.25","Under 3.25","Over 3.75","Under 3.75",
    "Over 4.25","Under 4.25","Over 4.75","Under 4.75",
    "BTTS Yes","BTTS No",
    "HT W1","HT X","HT W2",
    "HT Over 0.5","HT Under 0.5","HT Over 1.5","HT Under 1.5","HT Over 2.5","HT Under 2.5",
    "HT Over 3.5","HT Under 3.5",
    "2H Over 0.5","2H Under 0.5","2H Over 1.5","2H Under 1.5","2H Over 2.5","2H Under 2.5",
    "1/1","1/X","1/2","X/1","X/X","X/2","2/1","2/X","2/2",
    "Exact 0-0","Exact 0-1","Exact 0-2","Exact 0-3","Exact 1-0","Exact 1-1",
    "Exact 1-2","Exact 1-3","Exact 2-0","Exact 2-1","Exact 2-2","Exact 2-3",
    "Exact 3-0","Exact 3-1","Exact 3-2","Exact 3-3",
    "Home Clean Sheet","Away Clean Sheet","Either Clean Sheet",
    "Home Win to Nil","Away Win to Nil",
    "Home Over 0.5","Home Over 1.5","Home Over 2.5","Home Over 3.5",
    "Away Over 0.5","Away Over 1.5","Away Over 2.5","Away Over 3.5",
    "Home Under 0.5","Home Under 1.5","Home Under 2.5",
    "Away Under 0.5","Away Under 1.5","Away Under 2.5",
    "First goal: Home","First goal: Away","First goal: No goal",
    "Last goal: Home","Last goal: Away",
    "Goal in Both Halves","No Goal in Both Halves",
    "Exact Goals Total 0","Exact Goals Total 1","Exact Goals Total 2","Exact Goals Total 3",
    "Exact Goals Total 4","Exact Goals Total 5",
    "Total Goals Even","Total Goals Odd",
    "HT Exact 0-0","HT Exact 0-1","HT Exact 1-0","HT Exact 1-1",
    "Over 8.5 Corners","Under 8.5 Corners","Over 9.5 Corners","Under 9.5 Corners",
    "Over 10.5 Corners","Under 10.5 Corners","Over 11.5 Corners","Under 11.5 Corners",
    "Corners Odd","Corners Even",
    "Total Cards Over 3.5","Total Cards Under 3.5","Total Cards Over 4.5","Total Cards Under 4.5",
    "Total Cards Over 5.5","Total Cards Under 5.5",
    "Goal Before 15'","No Goal Before 15'","Goal Before 30'","No Goal Before 30'",
    "Goal After 75'","No Goal After 75'",
    "Penalty Awarded Yes","Penalty Awarded No",
    "Red Card Yes","Red Card No",
    "2-3 Goals","4-5 Goals","6-7 Goals",
    "Goal in 1st Half Yes","Goal in 2nd Half Yes",
]

VERIFIABLE_WITH_SCORE = {
    "W1","X","W2","1X","X2","12",
    "Over 0.5","Under 0.5","Over 1.5","Under 1.5","Over 2.5","Under 2.5",
    "Over 3.5","Under 3.5","Over 4.5","Under 4.5","Over 5.5","Under 5.5",
    "BTTS Yes","BTTS No","Home Clean Sheet","Away Clean Sheet",
    "Home Win to Nil","Away Win to Nil",
    "Home Over 0.5","Home Over 1.5","Home Over 2.5","Home Over 3.5",
    "Away Over 0.5","Away Over 1.5","Away Over 2.5","Away Over 3.5",
    "Exact Goals Total 0","Exact Goals Total 1","Exact Goals Total 2","Exact Goals Total 3",
    "Total Goals Even","Total Goals Odd",
    "AH Home -0.5","AH Away -0.5","AH Home -1.5","AH Away -1.5",
    "AH Home +0.5","AH Away +0.5","AH Home -1.0","AH Away -1.0",
    "2-3 Goals","4-5 Goals","6-7 Goals",
    "Goal in 1st Half Yes","Goal in 2nd Half Yes",
}

def get_market_grade(mkt):
    if "Over 0.5" in mkt or "1X" in mkt or "X2" in mkt or "12" in mkt: return "S"
    if "AH Home +0.5" in mkt or "AH Away +0.5" in mkt: return "S"
    if "Over 1.5" in mkt or "BTTS" in mkt: return "A"
    if "Home Over 0.5" in mkt or "Away Over 0.5" in mkt: return "A"
    if "W1" in mkt or "W2" in mkt or "Over 2.5" in mkt: return "B"
    if "AH" in mkt: return "B"
    if "HT" in mkt or "Exact" in mkt or "Cards" in mkt or "Clean Sheet" in mkt: return "C"
    return "B"

def grade_color(grade):
    return {"S": "#00ff88", "A": "#4da6ff", "B": "#ffd700", "C": "#ff8844"}.get(grade, "#888")

# ============================================================
# ─── DATABASE LAYER (SQLite) ─────────────────────────────────
# ============================================================
@st.cache_resource
def get_db():
    return Database()

class Database:
    def __init__(self):
        self.path = DB_FILE
        self._init()

    def conn(self):
        return sqlite3.connect(self.path)

    def _init(self):
        with self.conn() as c:
            c.executescript("""
            CREATE TABLE IF NOT EXISTS picks (
                match_id TEXT PRIMARY KEY, home TEXT, away TEXT, match_date TEXT,
                market TEXT, probability REAL, fair_odds REAL,
                confidence_score REAL, surprise_index REAL, xg_h REAL, xg_a REAL,
                status TEXT DEFAULT 'pending', actual_result TEXT,
                did_win INTEGER, added_ts TEXT, finished_ts TEXT,
                grade TEXT, joker_market TEXT
            );
            CREATE TABLE IF NOT EXISTS brain (
                market TEXT PRIMARY KEY, wins INTEGER DEFAULT 0, losses INTEGER DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS brain_meta (key TEXT PRIMARY KEY, value TEXT);
            CREATE TABLE IF NOT EXISTS parlay (
                match_id TEXT PRIMARY KEY, home TEXT, away TEXT, match_date TEXT,
                primary_market TEXT, secondary_market TEXT, confidence REAL,
                fair_odds REAL, surprise_index REAL, added_time TEXT
            );
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT, match_id TEXT, home TEXT,
                away TEXT, match_date TEXT, market TEXT, predicted_prob REAL,
                actual_result TEXT, did_win INTEGER, timestamp TEXT
            );
            INSERT OR IGNORE INTO brain_meta VALUES ('matches_learned','0');
            """)

    # ── Brain ──
    def brain_bias(self, market):
        with self.conn() as c:
            row = c.execute("SELECT wins,losses FROM brain WHERE market=?", (market,)).fetchone()
        if not row: return 1.0
        w,l = row; total = w+l
        if total < 5: return 1.0
        r = w/total
        if r > 0.65: return 1.10
        if r < 0.45: return 0.90
        return 1.0

    def brain_learn(self, market, won):
        with self.conn() as c:
            c.execute("INSERT OR IGNORE INTO brain(market,wins,losses) VALUES(?,0,0)", (market,))
            if won: c.execute("UPDATE brain SET wins=wins+1 WHERE market=?", (market,))
            else:   c.execute("UPDATE brain SET losses=losses+1 WHERE market=?", (market,))
            c.execute("UPDATE brain_meta SET value=CAST(CAST(value AS INT)+1 AS TEXT) WHERE key='matches_learned'")

    def brain_stats(self):
        with self.conn() as c:
            rows = c.execute("SELECT market,wins,losses FROM brain ORDER BY wins DESC").fetchall()
            learned = c.execute("SELECT value FROM brain_meta WHERE key='matches_learned'").fetchone()
        return rows, int(learned[0]) if learned else 0

    # ── Picks ──
    def add_pick(self, pick_data: dict) -> bool:
        try:
            with self.conn() as c:
                c.execute("""INSERT OR IGNORE INTO picks
                    (match_id,home,away,match_date,market,probability,fair_odds,
                     confidence_score,surprise_index,xg_h,xg_a,status,added_ts,grade,joker_market)
                    VALUES(:match_id,:home,:away,:match_date,:market,:probability,:fair_odds,
                     :confidence_score,:surprise_index,:xg_h,:xg_a,'pending',:added_ts,:grade,:joker_market)
                """, pick_data)
                return c.rowcount > 0
        except: return False

    def mark_finished(self, match_id, result_str, did_win):
        with self.conn() as c:
            c.execute("""UPDATE picks SET status='finished', actual_result=?, did_win=?, finished_ts=?
                WHERE match_id=?""", (result_str, 1 if did_win else 0,
                datetime.now().isoformat(), match_id))

    def get_picks(self, status=None, limit=100):
        with self.conn() as c:
            if status:
                rows = c.execute("SELECT * FROM picks WHERE status=? ORDER BY added_ts DESC LIMIT ?",
                    (status, limit)).fetchall()
            else:
                rows = c.execute("SELECT * FROM picks ORDER BY added_ts DESC LIMIT ?", (limit,)).fetchall()
        cols = ["match_id","home","away","match_date","market","probability","fair_odds",
                "confidence_score","surprise_index","xg_h","xg_a","status","actual_result",
                "did_win","added_ts","finished_ts","grade","joker_market"]
        return [dict(zip(cols, r)) for r in rows]

    def get_pick(self, match_id):
        rows = self.get_picks()
        for r in rows:
            if r["match_id"] == match_id: return r
        return None

    def exists_pick(self, match_id):
        with self.conn() as c:
            return c.execute("SELECT 1 FROM picks WHERE match_id=?", (match_id,)).fetchone() is not None

    def stats(self):
        with self.conn() as c:
            total   = c.execute("SELECT COUNT(*) FROM picks").fetchone()[0]
            pending = c.execute("SELECT COUNT(*) FROM picks WHERE status='pending'").fetchone()[0]
            finished= c.execute("SELECT COUNT(*) FROM picks WHERE status='finished'").fetchone()[0]
            won     = c.execute("SELECT COUNT(*) FROM picks WHERE did_win=1").fetchone()[0]
            lost    = c.execute("SELECT COUNT(*) FROM picks WHERE did_win=0").fetchone()[0]
            today   = c.execute("SELECT COUNT(*) FROM picks WHERE match_date=? AND status='pending'",
                (date.today().isoformat(),)).fetchone()[0]
        return {"total": total, "pending": pending, "finished": finished,
                "won": won, "lost": lost, "today": today}

    # ── Parlay ──
    def add_parlay(self, data: dict) -> bool:
        try:
            with self.conn() as c:
                c.execute("""INSERT OR IGNORE INTO parlay
                    (match_id,home,away,match_date,primary_market,secondary_market,
                     confidence,fair_odds,surprise_index,added_time)
                    VALUES(:match_id,:home,:away,:match_date,:primary_market,:secondary_market,
                     :confidence,:fair_odds,:surprise_index,:added_time)""", data)
                return c.rowcount > 0
        except: return False

    def get_today_parlay(self):
        today = date.today().isoformat()
        with self.conn() as c:
            rows = c.execute("SELECT * FROM parlay WHERE match_date=? ORDER BY confidence DESC",
                (today,)).fetchall()
        cols = ["match_id","home","away","match_date","primary_market","secondary_market",
                "confidence","fair_odds","surprise_index","added_time"]
        return [dict(zip(cols, r)) for r in rows]

    def get_all_parlay(self):
        with self.conn() as c:
            rows = c.execute("SELECT * FROM parlay ORDER BY match_date DESC, confidence DESC").fetchall()
        cols = ["match_id","home","away","match_date","primary_market","secondary_market",
                "confidence","fair_odds","surprise_index","added_time"]
        return [dict(zip(cols, r)) for r in rows]

    def clear_old_parlay(self):
        today = date.today().isoformat()
        with self.conn() as c:
            c.execute("DELETE FROM parlay WHERE match_date<?", (today,))

    # ── History ──
    def save_history(self, record: dict):
        with self.conn() as c:
            c.execute("""INSERT INTO history(match_id,home,away,match_date,market,
                predicted_prob,actual_result,did_win,timestamp)
                VALUES(:match_id,:home,:away,:match_date,:market,:predicted_prob,
                :actual_result,:did_win,:timestamp)""", record)

    def get_history(self, limit=200):
        with self.conn() as c:
            rows = c.execute("SELECT * FROM history ORDER BY timestamp DESC LIMIT ?", (limit,)).fetchall()
        cols = ["id","match_id","home","away","match_date","market","predicted_prob",
                "actual_result","did_win","timestamp"]
        return [dict(zip(cols, r)) for r in rows]

    def safe_picks(self, min_conf=0.70):
        picks = self.get_picks(status='pending')
        return [p for p in picks if p['confidence_score'] >= min_conf]

# ============================================================
# ─── TITAN ENGINE ────────────────────────────────────────────
# ============================================================
class DataHarvester:
    @staticmethod
    def parse(content):
        stats = {
            'home': 'Home', 'away': 'Away',
            'h_gs_avg': 1.25, 'h_gc_avg': 1.25,
            'a_gs_avg': 1.25, 'a_gc_avg': 1.25,
            'seed': 12345, 'actual_result': None, 'match_date': None,
        }
        try:
            lines = content.split('\n')
            team_line = None
            for line in lines:
                if re.search(r'\bVS\b', line, re.IGNORECASE) and len(line) > 15:
                    team_line = line.strip(); break
            if not team_line:
                for line in lines:
                    if re.search(r'\bvs\.?\b|\bv\b', line, re.IGNORECASE) and len(line) > 10:
                        team_line = line.strip(); break
            if team_line:
                parts = re.split(r'\s+VS\s+|\s+vs\.?\s+|\s+v\s+', team_line, flags=re.IGNORECASE)
                if len(parts) >= 2:
                    def clean(name):
                        name = re.sub(r'\s*[-–]\s*Logo.*$', '', name, flags=re.IGNORECASE)
                        name = re.sub(r'\s+Logo.*$', '', name, flags=re.IGNORECASE)
                        name = re.sub(r'^.*Prediction\s*', '', name, flags=re.IGNORECASE)
                        name = re.sub(r'[^a-zA-Z\s\u0600-\u06FF]+$', '', name)
                        return name.strip()
                    h = clean(parts[0]); a = clean(parts[1])
                    if len(h) > 2 and len(a) > 2:
                        stats['home'] = h; stats['away'] = a

            for pat in [r'(\d{1,2}/\d{1,2}/\d{4})', r'(\d{4}-\d{2}-\d{2})',
                        r'([A-Z][a-z]{2,8}\s+\d{1,2},\s+\d{4})']:
                m = re.search(pat, content, re.IGNORECASE)
                if m:
                    ds = m.group(1)
                    for fmt in ("%d/%m/%Y","%Y-%m-%d","%B %d, %Y","%b %d, %Y"):
                        try:
                            stats['match_date'] = datetime.strptime(ds, fmt).date().isoformat()
                            break
                        except: pass
                    if not stats['match_date']: stats['match_date'] = ds
                    break
            if not stats['match_date']:
                stats['match_date'] = date.today().isoformat()

            avgs = re.findall(r"Avg\.\s*(?:\[.*?\])?\s*per game\s*(\d+\.\d+|\d+)", content)
            clean_avgs = [float(a) for a in avgs if 0 <= float(a) <= 6.0]
            if len(clean_avgs) >= 4:
                stats['h_gs_avg'],stats['h_gc_avg'] = clean_avgs[0],clean_avgs[1]
                stats['a_gs_avg'],stats['a_gc_avg'] = clean_avgs[2],clean_avgs[3]

            rm = re.search(r"(?:FT|Result|Final|Score)[:\s]+(\d+)\s*-\s*(\d+)", content, re.IGNORECASE)
            if rm: stats['actual_result'] = (int(rm.group(1)), int(rm.group(2)))

            unique = f"{stats['home']}{stats['away']}{stats['match_date']}v18".encode()
            stats['seed'] = int(hashlib.md5(unique).hexdigest(), 16) % (2**32)
        except Exception as e:
            st.warning(f"Parse warning: {e}")
        return stats


class TitanEngine:
    def __init__(self, stats):
        self.stats = stats
        self.xg_h = self.xg_a = self.surprise_index = 0

    def calculate(self):
        L = 2.70
        h_att = self.stats['h_gs_avg'] / (L/2)
        h_def = self.stats['h_gc_avg'] / (L/2)
        a_att = self.stats['a_gs_avg'] / (L/2)
        a_def = self.stats['a_gc_avg'] / (L/2)
        self.xg_h = h_att * a_def * 1.35
        self.xg_a = a_att * h_def * 1.20
        diff = abs(self.xg_h - self.xg_a)
        total = self.xg_h + self.xg_a
        self.surprise_index = 0
        if diff < 0.25: self.surprise_index += 4
        if total < 1.9: self.surprise_index += 3
        if self.stats['h_gc_avg'] > 1.7 or self.stats['a_gc_avg'] > 1.7:
            self.surprise_index += 2


class Simulator:
    def __init__(self, engine):
        self.e = engine
        random.seed(engine.stats['seed'])

    def _poisson(self, lam):
        L = math.exp(-lam); k = 0; p = 1.0
        while p > L: k += 1; p *= random.random()
        return k - 1

    def run(self):
        hits = defaultdict(int)
        hr = self.e.xg_h; ar = self.e.xg_a
        if self.e.surprise_index > 6:
            avg = (hr+ar)/2
            hr = hr*0.7 + avg*0.3; ar = ar*0.7 + avg*0.3
        tot = hr+ar
        corn_rate = 9.0 + tot*0.5
        card_rate = 4.0 - tot*0.2

        for _ in range(NUM_SIMULATIONS):
            ft_h = self._poisson(hr); ft_a = self._poisson(ar)
            ht_h = sum(1 for _ in range(ft_h) if random.random()<0.45)
            ht_a = sum(1 for _ in range(ft_a) if random.random()<0.45)
            sh_h = ft_h-ht_h; sh_a = ft_a-ht_a
            total_goals = ft_h+ft_a
            fg_h = fg_a = False
            early = late = False
            if total_goals > 0:
                if ft_h>0 and ft_a==0: fg_h=True
                elif ft_a>0 and ft_h==0: fg_a=True
                elif ft_h>0 and ft_a>0:
                    if random.random() < (hr/(hr+ar+1e-9)): fg_h=True
                    else: fg_a=True
                if random.random() < 0.16*total_goals: early=True
                if random.random() < 0.20*total_goals: late=True
            tc = self._poisson(corn_rate)
            h_corn_r = hr/(hr+ar+0.1)
            hc = sum(1 for _ in range(tc) if random.random()<h_corn_r)
            ac = tc-hc
            tcards = self._poisson(card_rate)
            hcards = sum(1 for _ in range(tcards) if random.random()<0.5)
            acards = tcards-hcards
            pen = random.random()<0.25; red = random.random()<0.15
            self._check(hits, ft_h, ft_a, ht_h, ht_a, sh_h, sh_a,
                        tc, hc, ac, tcards, hcards, acards,
                        fg_h, fg_a, early, late, pen, red)
        return hits

    def _check(self, hits, h, a, ht_h, ht_a, sh_h, sh_a,
               tc, hc, ac, tcards, hcards, acards, fg_h, fg_a, early, late, pen, red):
        total=h+a; btts=(h>0 and a>0)
        if h>a: hits["W1"]+=1
        elif a>h: hits["W2"]+=1
        else: hits["X"]+=1
        if h>=a: hits["1X"]+=1
        if a>=h: hits["X2"]+=1
        if h!=a: hits["12"]+=1
        if ht_h>ht_a: hits["HT W1"]+=1
        elif ht_a>ht_h: hits["HT W2"]+=1
        else: hits["HT X"]+=1
        rht="1" if ht_h>ht_a else("2" if ht_a>ht_h else "X")
        rft="1" if h>a else("2" if a>h else "X")
        hits[f"{rht}/{rft}"]+=1
        for thresh,lbl in [(0.25,"0.25"),(0.5,"0.5"),(0.75,"0.75"),(1.0,"1.0"),
                            (1.5,"1.5"),(2.0,"2.0"),(2.5,"2.5"),(3.0,"3.0")]:
            if (h-a)>thresh: hits[f"AH Home -{lbl}"]+=1
            if (a-h)>thresh: hits[f"AH Away -{lbl}"]+=1
        for thresh,lbl in [(0.25,"0.25"),(0.5,"0.5"),(0.75,"0.75"),(1.0,"1.0")]:
            if (h-a)>-thresh: hits[f"AH Home +{lbl}"]+=1
            if (a-h)>-thresh: hits[f"AH Away +{lbl}"]+=1
        for line in [0.5,1.5,1.75,2.25,2.5,2.75,3.25,3.5,3.75,4.25,4.5,4.75,5.5,6.5,7.5]:
            if total>line: hits[f"Over {line}"]+=1
            else: hits[f"Under {line}"]+=1
        if btts: hits["BTTS Yes"]+=1
        else: hits["BTTS No"]+=1
        for line in [0.5,1.5,2.5,3.5]:
            ht_total=ht_h+ht_a
            if ht_total>line: hits[f"HT Over {line}"]+=1
            else: hits[f"HT Under {line}"]+=1
            sh_total=sh_h+sh_a
            if sh_total>line: hits[f"2H Over {line}"]+=1
            else: hits[f"2H Under {line}"]+=1
        for thsh in [0.5,1.5,2.5,3.5,4.5]:
            if h>thsh: hits[f"Home Over {thsh}"]+=1
            else: hits[f"Home Under {thsh}"]+=1
            if a>thsh: hits[f"Away Over {thsh}"]+=1
            else: hits[f"Away Under {thsh}"]+=1
        for ct in range(min(h+1,5)):
            for ca in range(min(a+1,5)):
                hits[f"Exact {ct}-{ca}"]+=1
        hits["Home Clean Sheet"]+=(a==0)
        hits["Away Clean Sheet"]+=(h==0)
        hits["Either Clean Sheet"]+=(h==0 or a==0)
        hits["Home Win to Nil"]+=(h>a and a==0)
        hits["Away Win to Nil"]+=(a>h and h==0)
        if fg_h: hits["First goal: Home"]+=1
        elif fg_a: hits["First goal: Away"]+=1
        else: hits["First goal: No goal"]+=1
        hits["Goal in Both Halves"]+=(ht_h+ht_a>0 and sh_h+sh_a>0)
        hits["No Goal in Both Halves"]+=(ht_h+ht_a==0 or sh_h+sh_a==0)
        for n in range(7):
            if total==n: hits[f"Exact Goals Total {n}"]+=1
        if total>=7: hits["Exact Goals Total 7+"]+=1
        hits["Total Goals Even"]+=(total%2==0)
        hits["Total Goals Odd"]+=(total%2==1)
        for line in [8.5,9.5,10.5,11.5,12.5]:
            if tc>line: hits[f"Over {line} Corners"]+=1
            else: hits[f"Under {line} Corners"]+=1
        hits["Corners Odd"]+=(tc%2==1); hits["Corners Even"]+=(tc%2==0)
        for line in [3.5,4.5,5.5,6.5]:
            if tcards>line: hits[f"Total Cards Over {line}"]+=1
            else: hits[f"Total Cards Under {line}"]+=1
        hits["Penalty Awarded Yes"]+=pen; hits["Penalty Awarded No"]+=(not pen)
        hits["Red Card Yes"]+=red; hits["Red Card No"]+=(not red)
        hits["Goal Before 15'"]+=(early)
        hits["Goal After 75'"]+=(late)
        if 2<=total<=3: hits["2-3 Goals"]+=1
        elif 4<=total<=5: hits["4-5 Goals"]+=1
        elif 6<=total<=7: hits["6-7 Goals"]+=1
        if ht_h+ht_a>0: hits["Goal in 1st Half Yes"]+=1
        if sh_h+sh_a>0: hits["Goal in 2nd Half Yes"]+=1


class Judge:
    @staticmethod
    def select(hits, sims, engine, db: Database):
        candidates = []
        for mkt, count in hits.items():
            if mkt not in MARKETS_LIST: continue
            prob = count/sims
            if prob <= 0: continue
            impl = 1/prob
            if impl < MIN_IMPLIED_ODDS or impl > MAX_IMPLIED_ODDS: continue
            grade = get_market_grade(mkt)
            ev = 1.0
            if engine.surprise_index > 6:
                if grade=="B": ev=0.6
                elif grade=="S": ev=1.2
                elif grade=="C": ev=1.1
            elif engine.surprise_index < 2:
                if grade=="B": ev=1.2
                elif grade=="C": ev=0.7
            score = (prob*100) * ev * db.brain_bias(mkt)
            candidates.append((mkt, prob, score, grade))
        candidates.sort(key=lambda x: x[2], reverse=True)
        if not candidates: return None, 0.0, "B"
        return candidates[0][0], candidates[0][1], candidates[0][3]

    @staticmethod
    def top_candidates(hits, sims, engine, db: Database, n=5):
        candidates = []
        for mkt, count in hits.items():
            if mkt not in MARKETS_LIST: continue
            prob = count/sims
            if prob <= 0: continue
            impl = 1/prob
            if impl < MIN_IMPLIED_ODDS or impl > MAX_IMPLIED_ODDS: continue
            grade = get_market_grade(mkt)
            ev = 1.0
            if engine.surprise_index > 6:
                if grade=="B": ev=0.6
                elif grade=="S": ev=1.2
            elif engine.surprise_index < 2:
                if grade=="B": ev=1.2
            score = (prob*100) * ev * db.brain_bias(mkt)
            candidates.append({"market": mkt, "prob": prob,
                "score": score, "grade": grade, "odds": round(1/prob,2)})
        candidates.sort(key=lambda x: x['score'], reverse=True)
        return candidates[:n]

    @staticmethod
    def verify_win(market, h, a):
        total = h+a
        if market=="W1": return h>a
        if market=="W2": return a>h
        if market=="X": return h==a
        if market=="1X": return h>=a
        if market=="X2": return a>=h
        if market=="12": return h!=a
        if "Over" in market and "Corners" not in market and "Cards" not in market \
           and "Home" not in market and "Away" not in market:
            try:
                line = float(re.search(r"(\d+\.?\d*)", market).group(1))
                return total > line
            except: pass
        if "Under" in market and "Corners" not in market and "Cards" not in market:
            try:
                line = float(re.search(r"(\d+\.?\d*)", market).group(1))
                return total < line
            except: pass
        if market=="BTTS Yes": return h>0 and a>0
        if market=="BTTS No": return h==0 or a==0
        if market=="Home Win to Nil": return h>a and a==0
        if market=="Away Win to Nil": return a>h and h==0
        if market=="AH Home -0.5": return (h-a)>0.5
        if market=="AH Away -0.5": return (a-h)>0.5
        if market=="AH Home +0.5": return (h-a)>-0.5
        if market=="AH Away +0.5": return (a-h)>-0.5
        if market=="AH Home -1.0": return (h-a)>1.0
        if market=="AH Away -1.0": return (a-h)>1.0
        if "Exact Goals Total" in market:
            try:
                n = int(market.split()[-1])
                return total==n
            except: pass
        if "Home Over" in market:
            try: return h > float(re.search(r"(\d+\.?\d*)", market.split("Over")[1]).group(1))
            except: pass
        if "Away Over" in market:
            try: return a > float(re.search(r"(\d+\.?\d*)", market.split("Over")[1]).group(1))
            except: pass
        if "Goal in 1st Half Yes" == market: return (h+a) > 0
        if "Goal in 2nd Half Yes" == market: return (h+a) > 0
        if "2-3 Goals" == market: return 2<=total<=3
        if "4-5 Goals" == market: return 4<=total<=5
        if "6-7 Goals" == market: return 6<=total<=7
        if "Total Goals Even" == market: return total%2==0
        if "Total Goals Odd" == market: return total%2==1
        return False


def select_joker(primary_mkt, xg_h, xg_a, surprise_index):
    total = xg_h + xg_a
    if total <= 2.4: return "Under 2.5"
    if min(xg_h,xg_a) > 0.75: return "BTTS Yes"
    if xg_h > 1.6: return "Home Over 1.5"
    if xg_a > 1.55: return "Away Over 1.5"
    return "Under 3.5"


def generate_id(home, away, match_date):
    return f"{home}_{away}_{match_date}".replace(" ","_")


# ============================================================
# ─── PROCESSING LOGIC ────────────────────────────────────────
# ============================================================
def process_match(content: str, db: Database):
    stats = DataHarvester.parse(content)
    engine = TitanEngine(stats)
    engine.calculate()
    sim = Simulator(engine)
    hits = sim.run()
    best_mkt, best_prob, grade = Judge.select(hits, NUM_SIMULATIONS, engine, db)
    top5 = Judge.top_candidates(hits, NUM_SIMULATIONS, engine, db, n=8)

    if not best_mkt:
        return None, stats, engine, []

    fair_odds = round(1/best_prob, 2) if best_prob > 0 else 0
    ev = 1.0
    si = engine.surprise_index
    if si > 6:
        ev = 1.2 if grade=="S" else (0.6 if grade=="B" else 1.1)
    elif si < 2:
        ev = 1.2 if grade=="B" else (0.7 if grade=="C" else 1.0)
    confidence = (best_prob*100) * ev * db.brain_bias(best_mkt) / 100
    joker = select_joker(best_mkt, engine.xg_h, engine.xg_a, si)
    match_id = generate_id(stats['home'], stats['away'], stats['match_date'])

    pick = {
        "match_id": match_id, "home": stats['home'], "away": stats['away'],
        "match_date": stats['match_date'], "market": best_mkt,
        "probability": best_prob, "fair_odds": fair_odds,
        "confidence_score": confidence, "surprise_index": si,
        "xg_h": engine.xg_h, "xg_a": engine.xg_a,
        "added_ts": datetime.now().isoformat(), "grade": grade,
        "joker_market": joker,
    }

    added = db.add_pick(pick)

    # Elite parlay
    if confidence >= ELITE_MIN_CONFIDENCE and si <= ELITE_MAX_SURPRISE:
        db.clear_old_parlay()
        db.add_parlay({
            "match_id": match_id, "home": stats['home'], "away": stats['away'],
            "match_date": stats['match_date'], "primary_market": best_mkt,
            "secondary_market": joker, "confidence": confidence,
            "fair_odds": fair_odds, "surprise_index": si,
            "added_time": datetime.now().isoformat()
        })

    # Auto-learn if result embedded
    if stats['actual_result'] and best_mkt in VERIFIABLE_WITH_SCORE:
        h_r, a_r = stats['actual_result']
        did_win = Judge.verify_win(best_mkt, h_r, a_r)
        db.brain_learn(best_mkt, did_win)
        db.mark_finished(match_id, f"{h_r}-{a_r}", did_win)
        db.save_history({
            "match_id": match_id, "home": stats['home'], "away": stats['away'],
            "match_date": stats['match_date'], "market": best_mkt,
            "predicted_prob": best_prob,
            "actual_result": f"{h_r}-{a_r}", "did_win": 1 if did_win else 0,
            "timestamp": datetime.now().isoformat()
        })

    return pick, stats, engine, top5


# ============================================================
# ─── UI HELPERS ──────────────────────────────────────────────
# ============================================================
def render_header(db: Database):
    st_data = db.stats()
    _, brain_learned = db.brain_stats()
    win_rate = ""
    if st_data['finished'] > 0:
        wr = st_data['won'] / st_data['finished'] * 100
        win_rate = f"  ·  Win Rate: {wr:.0f}%"

    today_p = st_data['today']
    pending = st_data['pending']
    today_str = f"{today_p}/{pending}" if pending > 0 else str(today_p)

    parlay_picks = db.get_today_parlay()
    if parlay_picks:
        total_odds = 1.0
        for p in parlay_picks: total_odds *= p['fair_odds']
        omega_odds = f"{total_odds:.2f}"
    else:
        omega_odds = "--"

    st.markdown(f"""
    <div class="chaos-header">
      <div>
        <div class="chaos-logo">
          <div class="icon">🧠</div>
          <div>
            CHAOS LOGIC <span style="color:#4da6ff">v4.0</span>
          </div>
        </div>
        <div class="chaos-meta">
          Poisson &nbsp;·&nbsp; Self-Learning &nbsp;·&nbsp; SQLite DB &nbsp;·&nbsp;
          Brain: {brain_learned} matches{win_rate}
        </div>
      </div>
      <div style="text-align:right">
        <div class="live-badge"><span class="live-dot"></span> Live &nbsp;·&nbsp; Local Mode</div>
        <div style="color:#3a5a80;font-size:0.75rem;margin-top:6px">TETRIS Engine v18.3 (Titan AI)</div>
      </div>
    </div>

    <div class="stat-grid">
      <div class="stat-card blue">
        <div class="stat-num blue">{st_data['total']}</div>
        <div class="stat-label">Processed</div>
      </div>
      <div class="stat-card yellow">
        <div class="stat-num yellow">{today_str}</div>
        <div class="stat-label">Upcoming</div>
        <div class="stat-sub">Today / Total pending</div>
      </div>
      <div class="stat-card green">
        <div class="stat-num green">{st_data['finished']}</div>
        <div class="stat-label">Finished</div>
      </div>
      <div class="stat-card {'green' if omega_odds != '--' else 'grey'}">
        <div class="stat-num {'green' if omega_odds != '--' else 'grey'}">{omega_odds}</div>
        <div class="stat-label">Omega Odds</div>
        <div class="stat-sub">Today's parlay</div>
      </div>
    </div>
    """, unsafe_allow_html=True)


def render_match_card(pick, show_result_input=False, db=None):
    grade = pick.get('grade', 'B')
    gc = grade_color(grade)
    status = pick.get('status', 'pending')

    if status == 'finished':
        dw = pick.get('did_win')
        if dw == 1:
            badge_cls = "badge-green"; badge_txt = "✓ WON"
            score_color = "#00ff88"
        else:
            badge_cls = "badge-red"; badge_txt = "✗ LOST"
            score_color = "#ff4444"
        result_display = pick.get('actual_result', '?-?')
        score_label = "RESULT"
    else:
        badge_cls = "badge"; badge_txt = f"Grade {grade}"
        score_color = "#4da6ff"
        result_display = f"{pick['fair_odds']:.2f}"
        score_label = "ODDS"

    conf_pct = round(pick['confidence_score'] * 100, 1)
    conf_color = "#00ff88" if conf_pct >= 70 else ("#ffd700" if conf_pct >= 57 else "#ff8844")

    si = pick.get('surprise_index', 0)
    protocol = "🎯 Sniper" if si < 2 else ("🛡️ Chaos" if si > 6 else "⚖️ Normal")

    st.markdown(f"""
    <div class="match-card">
      <div style="flex:1; min-width:0">
        <div class="match-teams">
          🕐 &nbsp; {pick['home']} &nbsp;<span style="color:#3a5a80">vs</span>&nbsp; {pick['away']}
        </div>
        <div class="match-meta">
          {pick.get('match_date','')} &nbsp;·&nbsp;
          <span class="badge {badge_cls}">{badge_txt}</span>
          <span class="badge badge-grey">{protocol}</span>
        </div>
        <div style="margin-top:8px">
          <span class="market-pill">⚡ {pick['market']}</span>
          <span class="joker-pill">🃏 {pick.get('joker_market','--')}</span>
        </div>
        <div style="margin-top:6px;font-size:0.78rem;color:{conf_color}">
          Confidence: <b>{conf_pct}%</b> &nbsp;·&nbsp;
          <span style="color:#3a5a80">xG: {pick.get('xg_h',0):.2f} – {pick.get('xg_a',0):.2f}</span>
        </div>
      </div>
      <div class="match-score">
        <div class="match-score-num" style="color:{score_color}">{result_display}</div>
        <div class="match-score-label">{score_label}</div>
      </div>
    </div>
    """, unsafe_allow_html=True)

    if show_result_input and status == 'pending' and db is not None:
        mid = pick['match_id']
        with st.expander(f"📥 Enter result for {pick['home']} vs {pick['away']}"):
            col1, col2 = st.columns([3, 1])
            with col1:
                res_input = st.text_input(
                    "Final Score (e.g. 2-1)", key=f"res_{mid}", placeholder="2-1")
            with col2:
                st.write("")
                st.write("")
                if st.button("✅ Submit", key=f"btn_{mid}"):
                    parts = res_input.strip().split('-')
                    if len(parts) == 2:
                        try:
                            rh, ra = int(parts[0]), int(parts[1])
                            mkt = pick['market']
                            did_win = Judge.verify_win(mkt, rh, ra)
                            db.brain_learn(mkt, did_win)
                            db.mark_finished(mid, f"{rh}-{ra}", did_win)
                            db.save_history({
                                "match_id": mid, "home": pick['home'],
                                "away": pick['away'], "match_date": pick['match_date'],
                                "market": mkt, "predicted_prob": pick['probability'],
                                "actual_result": f"{rh}-{ra}",
                                "did_win": 1 if did_win else 0,
                                "timestamp": datetime.now().isoformat()
                            })
                            st.success("✓ WON! Brain updated." if did_win else "✗ LOST. Brain updated.")
                            st.rerun()
                        except: st.error("Invalid score format")
                    else: st.error("Use format: 2-1")


def render_ticket(pick, stats, engine, top5):
    si = engine.surprise_index
    protocol = "🎯 Sniper Mode" if si < 2 else ("🛡️ Chaos / Evasion Mode" if si > 6 else "⚖️ Balanced Mode")

    st.markdown(f"""
    <div class="ticket-box">
      <div class="ticket-title">⚡ TITAN PRECISION TICKET ⚡</div>
      <div class="ticket-match">{pick['home']} &nbsp;vs&nbsp; {pick['away']}</div>
      <div style="text-align:center;color:#5a7aaa;font-size:0.82rem;margin-bottom:4px">
        {pick['match_date']} &nbsp;·&nbsp; {protocol}
      </div>
      <div class="ticket-market">{pick['market']}</div>
      <div style="text-align:center;margin-bottom:12px">
        <span class="joker-pill" style="font-size:0.85rem;">🃏 Joker: {pick['joker_market']}</span>
      </div>
      <div class="ticket-stats">
        <div class="ticket-stat">
          <div class="ticket-stat-num" style="color:#4da6ff">{pick['probability']*100:.1f}%</div>
          <div class="ticket-stat-label">Probability</div>
        </div>
        <div class="ticket-stat">
          <div class="ticket-stat-num" style="color:#ffd700">{pick['fair_odds']:.2f}</div>
          <div class="ticket-stat-label">Fair Odds</div>
        </div>
        <div class="ticket-stat">
          <div class="ticket-stat-num" style="color:#00ff88">{pick['confidence_score']*100:.1f}%</div>
          <div class="ticket-stat-label">Confidence</div>
        </div>
        <div class="ticket-stat">
          <div class="ticket-stat-num" style="color:#ff8844">{engine.surprise_index:.1f}</div>
          <div class="ticket-stat-label">Surprise Idx</div>
        </div>
      </div>
    </div>
    """, unsafe_allow_html=True)

    if top5:
        st.markdown('<div class="section-card"><div class="section-header">📊 Top Market Candidates</div>', unsafe_allow_html=True)
        for i, c in enumerate(top5, 1):
            gc = grade_color(c['grade'])
            bar_w = min(100, int(c['prob']*100))
            st.markdown(f"""
            <div style="display:flex;align-items:center;gap:10px;padding:6px 0;
                border-bottom:1px solid #1e3060;">
              <div style="width:24px;color:#5a7aaa;font-size:0.8rem;text-align:center">{i}</div>
              <div style="flex:1;min-width:0">
                <div style="font-size:0.9rem;font-weight:600;color:#dde8ff">{c['market']}</div>
                <div style="background:#1a2a40;border-radius:4px;height:4px;margin-top:4px">
                  <div style="width:{bar_w}%;height:4px;background:linear-gradient(90deg,#6a4fff,#4da6ff);border-radius:4px"></div>
                </div>
              </div>
              <div style="text-align:right;min-width:80px">
                <div style="color:{gc};font-weight:700;font-size:0.85rem">{c['grade']}</div>
                <div style="color:#5a7aaa;font-size:0.78rem">{c['prob']*100:.1f}% · {c['odds']:.2f}</div>
              </div>
            </div>
            """, unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)


# ============================================================
# ─── TABS ────────────────────────────────────────────────────
# ============================================================
def tab_matches(db: Database):
    st.markdown('<div class="section-header">⚽ ALL MATCHES</div>', unsafe_allow_html=True)

    col1, col2 = st.columns([1, 1])
    with col1:
        view = st.radio("View", ["Upcoming", "Finished", "All"],
            horizontal=True, label_visibility="collapsed")
    with col2:
        search = st.text_input("🔍 Search", placeholder="team name...", label_visibility="collapsed")

    status_map = {"Upcoming": "pending", "Finished": "finished", "All": None}
    picks = db.get_picks(status=status_map[view], limit=200)

    if search:
        s = search.lower()
        picks = [p for p in picks if s in p['home'].lower() or s in p['away'].lower()]

    if not picks:
        st.info("No matches found. Process a match to get started.")
        return

    for p in picks:
        render_match_card(p, show_result_input=(view in ["Upcoming","All"]), db=db)


def tab_safe(db: Database):
    st.markdown('<div class="section-header">🛡️ SAFE PICKS — High Confidence (≥70%)</div>', unsafe_allow_html=True)
    safe = db.safe_picks(min_conf=0.70)

    if not safe:
        st.info("No high-confidence picks at the moment. Keep processing matches.")
        return

    for p in safe:
        render_match_card(p, show_result_input=True, db=db)


def tab_omega(db: Database):
    st.markdown('<div class="section-header">⚡ OMEGA ANALYSIS — Today\'s Elite Parlay</div>', unsafe_allow_html=True)

    parlay = db.get_today_parlay()

    if not parlay:
        st.info("Elite Parlay is building... Process matches with confidence ≥57.5%.")
    else:
        total_odds = 1.0
        for p in parlay: total_odds *= p['fair_odds']

        st.markdown(f"""
        <div style="text-align:center;margin-bottom:20px">
          <div class="parlay-odds-total">{total_odds:.2f}x</div>
          <div class="parlay-odds-label">Total Parlay Odds · {len(parlay)} matches</div>
        </div>
        """, unsafe_allow_html=True)

        for i, p in enumerate(parlay, 1):
            conf = p['confidence']*100
            cc = "#00ff88" if conf>=70 else ("#ffd700" if conf>=58 else "#ff8844")
            st.markdown(f"""
            <div class="section-card" style="margin-bottom:10px">
              <div style="display:flex;align-items:center;justify-content:space-between">
                <div>
                  <span style="color:#5a7aaa;font-size:0.75rem;margin-right:8px">#{i}</span>
                  <b style="color:#dde8ff">{p['home']} vs {p['away']}</b>
                  <span style="color:#3a5a80;font-size:0.78rem;margin-left:8px">{p['match_date']}</span>
                </div>
                <div style="text-align:right">
                  <div style="color:#ffd700;font-weight:700;font-family:'JetBrains Mono',monospace">{p['fair_odds']:.2f}</div>
                  <div style="color:{cc};font-size:0.75rem">{conf:.1f}%</div>
                </div>
              </div>
              <div style="margin-top:8px">
                <span class="market-pill">⚡ MAIN: {p['primary_market']}</span>
                <span class="joker-pill">🃏 JOKER: {p['secondary_market']}</span>
              </div>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("---")
    st.markdown('<div class="section-header">📜 ALL PARLAY HISTORY</div>', unsafe_allow_html=True)
    all_p = db.get_all_parlay()
    if all_p:
        df = pd.DataFrame(all_p)[['home','away','match_date','primary_market',
            'secondary_market','confidence','fair_odds']]
        df.columns = ['Home','Away','Date','Main Market','Joker','Confidence','Odds']
        df['Confidence'] = df['Confidence'].apply(lambda x: f"{x*100:.1f}%")
        st.dataframe(df, use_container_width=True, hide_index=True)


def tab_coupon(db: Database):
    st.markdown('<div class="section-header">🎫 COUPON BUILDER</div>', unsafe_allow_html=True)

    pending = db.get_picks(status='pending')
    if not pending:
        st.info("No pending picks to build a coupon from.")
        return

    today = date.today().isoformat()
    today_picks = [p for p in pending if p.get('match_date') == today]
    all_picks = pending

    st.markdown("**Auto-select today's best picks for coupon:**")
    col1, col2 = st.columns(2)
    with col1:
        mode = st.selectbox("Picks pool", ["Today's picks", "All pending"])
    with col2:
        max_picks = st.number_input("Max picks", min_value=2, max_value=12, value=5)

    pool = today_picks if mode == "Today's picks" else all_picks
    pool.sort(key=lambda x: x['confidence_score'], reverse=True)
    selected = pool[:max_picks]

    if not selected:
        st.info("No picks available in selected pool.")
        return

    total_odds = 1.0
    for p in selected: total_odds *= p['fair_odds']

    st.markdown(f"""
    <div style="text-align:center;padding:18px;background:#0f1b35;border:1px solid #ffd700;
        border-radius:14px;margin-bottom:16px">
      <div style="font-size:2rem;font-weight:700;color:#ffd700;
          font-family:'JetBrains Mono',monospace">{total_odds:.2f}x</div>
      <div style="color:#5a7aaa;font-size:0.8rem;letter-spacing:1px">COUPON TOTAL ODDS ({len(selected)} PICKS)</div>
    </div>
    """, unsafe_allow_html=True)

    for i, p in enumerate(selected, 1):
        conf = p['confidence_score']*100
        cc = "#00ff88" if conf>=70 else ("#ffd700" if conf>=57 else "#ff8844")
        st.markdown(f"""
        <div class="section-card" style="margin-bottom:8px">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div>
              <span style="color:#5a7aaa;margin-right:6px">#{i}</span>
              <b>{p['home']} vs {p['away']}</b>
              <span style="color:#3a5a80;font-size:0.78rem;margin-left:6px">{p['match_date']}</span>
            </div>
            <div style="color:#ffd700;font-weight:700;font-family:'JetBrains Mono',monospace">{p['fair_odds']:.2f}</div>
          </div>
          <div style="margin-top:6px">
            <span class="market-pill">{p['market']}</span>
            <span style="color:{cc};font-size:0.78rem;margin-left:8px">{conf:.1f}%</span>
          </div>
        </div>
        """, unsafe_allow_html=True)


def tab_signals(db: Database):
    st.markdown('<div class="section-header">📡 SIGNALS — Smart Alerts</div>', unsafe_allow_html=True)

    picks = db.get_picks(status='pending')
    history = db.get_history(limit=100)
    brain_rows, learned = db.brain_stats()

    # Signal: high confidence
    high_conf = [p for p in picks if p['confidence_score'] >= 0.72]
    if high_conf:
        st.markdown("""<div class="signal-card signal-hot">
            <b style="color:#ff4444">🔥 HOT SIGNALS</b> — Very high confidence picks (≥72%)
        </div>""", unsafe_allow_html=True)
        for p in high_conf[:5]:
            st.markdown(f"""
            <div style="padding:8px 14px;border-bottom:1px solid #1e3060">
              <b>{p['home']} vs {p['away']}</b> &nbsp;—&nbsp;
              <span class="market-pill">{p['market']}</span> &nbsp;
              <span style="color:#00ff88">{p['confidence_score']*100:.1f}%</span>
            </div>""", unsafe_allow_html=True)

    # Signal: brain top markets
    if brain_rows:
        st.markdown("""<div class="signal-card signal-cold" style="margin-top:12px">
            <b style="color:#00ff88">🧠 BRAIN TOP MARKETS</b> — Best historical win rate
        </div>""", unsafe_allow_html=True)
        for mkt, w, l in brain_rows[:8]:
            total = w+l
            if total < 2: continue
            wr = w/total*100
            bar_w = int(wr)
            wc = "#00ff88" if wr>=60 else ("#ffd700" if wr>=50 else "#ff4444")
            st.markdown(f"""
            <div style="display:flex;align-items:center;gap:10px;padding:6px 0;
                border-bottom:1px solid #1e3060">
              <div style="flex:1;font-size:0.85rem;color:#dde8ff">{mkt}</div>
              <div style="width:80px;background:#1a2a40;border-radius:4px;height:6px">
                <div style="width:{min(bar_w,100)}%;height:6px;background:{wc};border-radius:4px"></div>
              </div>
              <div style="color:{wc};font-weight:700;font-size:0.85rem;min-width:46px;text-align:right">
                {wr:.0f}%</div>
              <div style="color:#3a5a80;font-size:0.75rem;min-width:50px">{w}W / {l}L</div>
            </div>
            """, unsafe_allow_html=True)

    # Summary metrics
    st.markdown("---")
    st.markdown('<div class="section-header">📈 PERFORMANCE SUMMARY</div>', unsafe_allow_html=True)
    s = db.stats()
    c1, c2, c3, c4 = st.columns(4)
    with c1: st.metric("Total Processed", s['total'])
    with c2: st.metric("Finished", s['finished'])
    with c3:
        wr = f"{s['won']/s['finished']*100:.1f}%" if s['finished'] > 0 else "N/A"
        st.metric("Win Rate", wr, delta=f"+{s['won']}W / {s['lost']}L")
    with c4: st.metric("Brain Learned", learned)


def tab_db(db: Database):
    st.markdown('<div class="section-header">🗄️ DATABASE MANAGEMENT</div>', unsafe_allow_html=True)

    subtab = st.radio("Section", ["📋 Picks", "🧠 Brain Memory", "📜 History", "⚙️ Tools"],
        horizontal=True, label_visibility="collapsed")

    if subtab == "📋 Picks":
        picks = db.get_picks(limit=500)
        if picks:
            df = pd.DataFrame(picks)
            cols = ['match_id','home','away','match_date','market','probability',
                    'fair_odds','confidence_score','grade','status','actual_result','did_win']
            df = df[[c for c in cols if c in df.columns]]
            df['probability'] = df['probability'].apply(lambda x: f"{x*100:.1f}%")
            df['confidence_score'] = df['confidence_score'].apply(lambda x: f"{x*100:.1f}%")
            st.dataframe(df, use_container_width=True, hide_index=True, height=400)
        else:
            st.info("No picks in database yet.")

    elif subtab == "🧠 Brain Memory":
        rows, learned = db.brain_stats()
        st.markdown(f"**Brain has learned from {learned} matches.**")
        if rows:
            data = []
            for mkt, w, l in rows:
                total = w+l
                wr = f"{w/total*100:.0f}%" if total > 0 else "N/A"
                data.append({"Market": mkt, "Wins": w, "Losses": l, "Total": total, "Win Rate": wr})
            st.dataframe(pd.DataFrame(data), use_container_width=True, hide_index=True, height=400)
        else:
            st.info("Brain has no data yet. Process matches and enter results.")

    elif subtab == "📜 History":
        hist = db.get_history(limit=300)
        if hist:
            df = pd.DataFrame(hist)
            df['did_win'] = df['did_win'].apply(lambda x: "✓ WIN" if x==1 else "✗ LOSS")
            df['predicted_prob'] = df['predicted_prob'].apply(lambda x: f"{x*100:.1f}%")
            st.dataframe(df[['home','away','match_date','market','predicted_prob',
                'actual_result','did_win','timestamp']],
                use_container_width=True, hide_index=True, height=400)
        else:
            st.info("No history yet. Enter match results to build history.")

    elif subtab == "⚙️ Tools":
        st.markdown("**Database Tools**")
        st.warning("⚠️ These actions are irreversible.")
        col1, col2 = st.columns(2)
        with col1:
            if st.button("🗑️ Clear Old Parlay Entries"):
                db.clear_old_parlay()
                st.success("Old parlay entries cleared.")
        with col2:
            if st.button("📊 Export Picks as CSV"):
                picks = db.get_picks(limit=1000)
                if picks:
                    df = pd.DataFrame(picks)
                    csv = df.to_csv(index=False)
                    st.download_button("⬇️ Download CSV", csv, "omega_picks.csv", "text/csv")
                else: st.info("No picks to export.")

        st.markdown("---")
        with st.expander("🔴 Danger Zone"):
            st.error("This will permanently delete data.")
            confirm = st.text_input("Type DELETE to confirm")
            if confirm == "DELETE":
                if st.button("🗑️ Delete ALL Picks"):
                    with db.conn() as c:
                        c.execute("DELETE FROM picks")
                        c.execute("DELETE FROM parlay")
                    st.success("All picks deleted.")
                    st.rerun()


# ============================================================
# ─── MAIN APP ────────────────────────────────────────────────
# ============================================================
def main():
    db = get_db()

    render_header(db)

    # ── Input Card ──
    st.markdown("""
    <div class="input-card">
      <div class="input-title">📋 Paste Forebet Match Page</div>
      <div class="input-hint">(copy entire page text from Forebet and paste below)</div>
    </div>
    """, unsafe_allow_html=True)

    match_text = st.text_area(
        "match_input",
        height=180,
        placeholder=(
            "Paste the full Forebet match page text here...\n\n"
            "Example:\n"
            "Real Madrid VS Barcelona\n"
            "21/04/2026 20:30\n"
            "Avg. per game 2.1  Avg. per game 1.4 ...\n"
            "67 22 11 → 3-0 ..."
        ),
        label_visibility="collapsed",
        key="match_input"
    )

    process_clicked = st.button("⚡  Process Match", key="process_btn")

    # ── Process ──
    if process_clicked:
        if not match_text.strip():
            st.error("Please paste match data first.")
        else:
            with st.spinner("🧠 Running Titan AI simulation (20,000 iterations)..."):
                pick, stats, engine, top5 = process_match(match_text, db)

            if pick is None:
                st.warning("No suitable market found. Check the pasted data format.")
            else:
                st.success(f"✅ Match processed! ID: `{pick['match_id']}`")
                render_ticket(pick, stats, engine, top5)

    # ── Tabs ──
    tab_names = ["🏠 Matches", "🛡️ Safe", "⚡ Omega", "🎫 Coupon", "📡 Signals", "🗄️ DB"]
    tabs = st.tabs(tab_names)

    with tabs[0]: tab_matches(db)
    with tabs[1]: tab_safe(db)
    with tabs[2]: tab_omega(db)
    with tabs[3]: tab_coupon(db)
    with tabs[4]: tab_signals(db)
    with tabs[5]: tab_db(db)


if __name__ == "__main__":
    main()
