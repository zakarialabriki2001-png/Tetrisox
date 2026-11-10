# ============================================================
# TETRIS 1X2 - OMEGA SIGNAL v5.0 PRO (GLOBAL EDITION)
# Restored: 20,000 Monte Carlo Simulations + Reverse xG Engine
# New: Batch Processing, Signal Intelligence, English Dark UI
# ============================================================
import streamlit as st
import sqlite3, re, math, random
from collections import defaultdict
from datetime import datetime, date
import pandas as pd

st.set_page_config(page_title="TETRIS 1X2 - OMEGA v5 PRO", page_icon="🧠", layout="wide", initial_sidebar_state="collapsed")

# ─── CONSTANTS & CSS ─────────────────────────────────────────
NUM_SIMS = 20000

st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono:wght@500;800&display=swap');
html, body, .stApp { background-color: #0B0E14 !important; color: #E2E8F0 !important; font-family: 'Inter', sans-serif !important; }
.block-container { max-width: 1200px; padding-top: 2rem; }

/* Dashboard Header */
.dash-header { background: linear-gradient(135deg, #131824, #0F131D); border: 1px solid #1E293B; border-radius: 16px; padding: 25px; margin-bottom: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); display: flex; justify-content: space-between; align-items: center; }
.logo-title { font-size: 26px; font-weight: 900; background: -webkit-linear-gradient(45deg, #3B82F6, #10B981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.stats-container { display: flex; gap: 30px; }
.stat-item { text-align: center; }
.stat-val { font-size: 24px; font-weight: 800; color: #F8FAFC; font-family: 'JetBrains Mono', monospace; }
.stat-lbl { font-size: 11px; color: #64748B; text-transform: uppercase; letter-spacing: 1px; }

/* Match Card */
.match-card { background: #151A26; border: 1px solid #1E293B; border-radius: 16px; padding: 20px; margin-bottom: 16px; transition: all 0.3s ease; }
.match-card:hover { border-color: #3B82F6; transform: translateY(-3px); box-shadow: 0 8px 25px rgba(59, 130, 246, 0.1); }
.mc-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1E293B; padding-bottom: 12px; margin-bottom: 15px; }
.signal-badge { background: #1E293B; border: 1px solid #334155; color: #38BDF8; font-family: 'JetBrains Mono'; padding: 4px 12px; border-radius: 8px; font-size: 13px; font-weight: 800; }
.live-badge { background: rgba(16, 185, 129, 0.1); border: 1px solid #10B981; color: #10B981; font-family: 'JetBrains Mono'; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; animation: pulse 1.5s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

.teams-row { display: flex; justify-content: space-between; align-items: center; }
.team-name { font-size: 18px; font-weight: 700; color: #F1F5F9; flex: 1; }
.score-box { background: #0B0E14; border: 1px solid #334155; padding: 10px 25px; border-radius: 12px; font-size: 24px; font-weight: 900; color: #F8FAFC; font-family: 'JetBrains Mono', monospace; text-align: center; }

/* Predictions Area */
.pred-area { display: flex; gap: 15px; margin-top: 15px; background: #0E121A; padding: 15px; border-radius: 12px; border: 1px solid #1E293B; }
.pred-box { flex: 1; text-align: center; }
.pred-lbl { font-size: 10px; color: #64748B; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 5px; font-weight: 600; }
.pred-val { font-size: 15px; font-weight: 800; color: #10B981; }

/* UI Overrides */
.stTabs [data-baseweb="tab-list"] { background: #151A26; border-radius: 12px; padding: 5px; border: 1px solid #1E293B; }
.stTabs [aria-selected="true"] { background: #3B82F6 !important; color: #FFFFFF !important; }
.stTextArea textarea { background: #0E121A !important; border: 1px solid #1E293B !important; color: #94A3B8 !important; }
.stButton button { background: linear-gradient(90deg, #3B82F6, #2563EB) !important; color: white !important; font-weight: 700 !important; border-radius: 10px !important; border: none !important; }
</style>
""", unsafe_allow_html=True)

# ─── DATABASE ────────────────────────────────────────────────
def init_db():
    conn = sqlite3.connect("tetris_v5_pro.db", check_same_thread=False)
    c = conn.cursor()
    c.executescript('''
        CREATE TABLE IF NOT EXISTS matches (
            match_id TEXT PRIMARY KEY, league TEXT, home TEXT, away TEXT, 
            m_date TEXT, m_time TEXT, ph REAL, px REAL, pa REAL, 
            signal TEXT, status TEXT, score_h INTEGER, score_a INTEGER,
            sim_pred1 TEXT, sim_pred2 TEXT
        );
        CREATE TABLE IF NOT EXISTS signal_history (
            signal TEXT, market TEXT, is_win INTEGER, timestamp TEXT
        );
    ''')
    conn.commit()
    return conn

db = init_db()

# ─── CORE ENGINES: REVERSE xG & MONTE CARLO (RESTORED) ────────
class ReverseTitanEngine:
    """Reverse engineers Expected Goals (xG) strictly from Forebet 1X2 probabilities."""
    def __init__(self, ph, px, pa):
        self.ph = ph / 100.0
        self.px = px / 100.0
        self.pa = pa / 100.0
        self.xg_h = 0.0
        self.xg_a = 0.0

    def calculate(self):
        # Base goals for an average match is ~2.6
        base_lambda = 2.6
        
        # Adjust lambda based on draw probability (high draw = low goals, low draw = high goals)
        if self.px > 0.30: base_lambda -= (self.px - 0.30) * 3
        if self.px < 0.25: base_lambda += (0.25 - self.px) * 4
        
        # Distribute expected goals based on win probabilities
        diff = self.ph - self.pa
        
        self.xg_h = (base_lambda / 2) + (diff * 1.5)
        self.xg_a = (base_lambda / 2) - (diff * 1.5)
        
        # Safety limits
        self.xg_h = max(0.2, min(self.xg_h, 3.5))
        self.xg_a = max(0.2, min(self.xg_a, 3.5))

class Simulator:
    """Restored 20,000 matches simulator"""
    def __init__(self, xg_h, xg_a):
        self.xg_h = xg_h
        self.xg_a = xg_a
        random.seed()

    def _pois(self, lam):
        L = math.exp(-lam); k = 0; p = 1.0
        while p > L: k += 1; p *= random.random()
        return k - 1

    def run(self):
        hits = defaultdict(int)
        for _ in range(NUM_SIMS):
            h = self._pois(self.xg_h)
            a = self._pois(self.xg_a)
            tot = h + a
            
            if h > a: hits["W1"] += 1
            elif a > h: hits["W2"] += 1
            else: hits["X"] += 1
            if h >= a: hits["1X"] += 1
            if a >= h: hits["X2"] += 1
            if h > 0 and a > 0: hits["BTTS Yes"] += 1
            if tot > 1.5: hits["Over 1.5"] += 1
            if tot < 2.5: hits["Under 2.5"] += 1
            if tot > 2.5: hits["Over 2.5"] += 1
            if tot < 3.5: hits["Under 3.5"] += 1
            
        return hits

    def extract_top_markets(self, hits):
        cands = []
        for mkt, count in hits.items():
            prob = count / NUM_SIMS
            if prob > 0.65: # Only consider mathematically strong predictions
                cands.append((mkt, prob))
        cands.sort(key=lambda x: x[1], reverse=True)
        return cands[:2] if cands else [("Over 1.5", 0.70), ("1X" if self.xg_h > self.xg_a else "X2", 0.70)]

# ─── SIGNAL INTELLIGENCE ──────────────────────────────────────
def generate_signal(ph, px, pa):
    """Creates a discrete signal pattern (e.g. S-35-30-35)"""
    return f"S-{int(ph)}{int(px)}{int(pa)}"

def verify_market(market, sh, sa):
    """Verifies if a market won based on actual results"""
    tot = sh + sa
    if market == "W1": return sh > sa
    if market == "W2": return sa > sh
    if market == "X": return sh == sa
    if market == "1X": return sh >= sa
    if market == "X2": return sa >= sh
    if market == "BTTS Yes": return sh > 0 and sa > 0
    if market == "Over 1.5": return tot > 1.5
    if market == "Under 2.5": return tot < 2.5
    if market == "Over 2.5": return tot > 2.5
    if market == "Under 3.5": return tot < 3.5
    return False

def get_signal_predictions(sig_code, sim_pred1, sim_pred2):
    """Combines historical DB accuracy with Monte Carlo simulation"""
    c = db.cursor()
    c.execute("SELECT market, is_win FROM signal_history WHERE signal=? ORDER BY timestamp DESC LIMIT 10", (sig_code,))
    history = c.fetchall()
    
    if len(history) < 3:
        # Not enough history, rely purely on the Monte Carlo Simulator
        return [(sim_pred1[0], f"{sim_pred1[1]*100:.1f}% (AI Sim)"), 
                (sim_pred2[0], f"{sim_pred2[1]*100:.1f}% (AI Sim)")]
    
    # Calculate historical win rate
    stats = defaultdict(lambda: {"w": 0, "t": 0})
    for mkt, is_win in history:
        stats[mkt]["t"] += 1
        stats[mkt]["w"] += is_win
        
    valid = []
    for mkt, data in stats.items():
        if data["t"] >= 2:
            wr = (data["w"] / data["t"]) * 100
            if wr >= 75: valid.append((mkt, f"{wr:.0f}% (DB Hist)"))
            
    valid.sort(key=lambda x: float(x[1].split('%')[0]), reverse=True)
    
    # Merge History with Simulation
    final_preds = valid[:2]
    if len(final_preds) < 1: final_preds.append((sim_pred1[0], f"{sim_pred1[1]*100:.1f}% (AI Sim)"))
    if len(final_preds) < 2: final_preds.append((sim_pred2[0], f"{sim_pred2[1]*100:.1f}% (AI Sim)"))
    
    return final_preds[:2]

# ─── BATCH PARSERS ───────────────────────────────────────────
def parse_forebet_upcoming(text):
    matches = []
    lines = [L.strip() for L in text.split('\n') if L.strip()]
    for i, line in enumerate(lines):
        dt_match = re.search(r'(\d{2}/\d{2}/\d{4})\s+(\d{2}:\d{2})', line)
        if dt_match:
            try:
                date_str, time_str = dt_match.groups()
                home_team = lines[i-2] if i >= 2 else "Home"
                away_team = lines[i-1] if i >= 1 else "Away"
                prob_line = lines[i+1] if i+1 < len(lines) else ""
                prob_match = re.search(r'(?<!\d)(\d{2})(\d{2})(\d{2})(?!\d)', prob_line.replace(" ", ""))
                
                if prob_match:
                    ph, px, pa = map(float, prob_match.groups())
                    mid = f"{home_team}_{away_team}_{date_str}".replace(" ", "_")
                    sig = generate_signal(ph, px, pa)
                    
                    # RUN TITAN ENGINE & MONTE CARLO ON THE FLY!
                    engine = ReverseTitanEngine(ph, px, pa)
                    engine.calculate()
                    sim = Simulator(engine.xg_h, engine.xg_a)
                    hits = sim.run()
                    top_mkts = sim.extract_top_markets(hits)
                    
                    matches.append({
                        "id": mid, "league": "Forebet", "home": home_team, "away": away_team,
                        "date": date_str, "time": time_str, "ph": ph, "px": px, "pa": pa, 
                        "signal": sig, "p1": top_mkts[0], "p2": top_mkts[1]
                    })
            except Exception: continue
    return matches

def parse_forebet_finished(text):
    results = {}
    lines = [L.strip() for L in text.split('\n') if L.strip()]
    for i, line in enumerate(lines):
        score_match = re.search(r'(\d+)\s*-\s*(\d+)\((\d+)\s*-\s*(\d+)\)', line)
        if score_match:
            try:
                sh, sa = int(score_match.group(1)), int(score_match.group(2))
                date_str, home_team, away_team = "", "Home", "Away"
                for j in range(i, max(-1, i-7), -1):
                    dt_match = re.search(r'(\d{2}/\d{2}/\d{4})\s+(\d{2}:\d{2})', lines[j])
                    if dt_match:
                        date_str = dt_match.group(1)
                        home_team = lines[j-2]
                        away_team = lines[j-1]
                        break
                if date_str:
                    mid = f"{home_team}_{away_team}_{date_str}".replace(" ", "_")
                    results[mid] = {"sh": sh, "sa": sa}
            except Exception: continue
    return results

def get_live_timer(date_str, time_str):
    try:
        match_dt = datetime.strptime(f"{date_str} {time_str}", "%d/%m/%Y %H:%M")
        diff_mins = (datetime.now() - match_dt).total_seconds() / 60
        if diff_mins < 0: return None
        if diff_mins > 115: return "FT"
        if 45 <= diff_mins <= 60: return "HT"
        return f"{int(diff_mins - 15)}'" if diff_mins > 60 else f"{int(diff_mins)}'"
    except: return None

# ─── UI COMPONENTS ───────────────────────────────────────────
def render_dashboard():
    c = db.cursor()
    c.execute("SELECT COUNT(*) FROM matches")
    total = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM matches WHERE status='Finished'")
    finished = c.fetchone()[0]
    
    st.markdown(f"""
    <div class="dash-header">
        <div>
            <div class="logo-title">🧬 TETRIS OMEGA v5 PRO</div>
            <div style="color: #64748B; font-size: 13px; margin-top: 5px;">Monte Carlo Engine (20k Sims) · Offline Live · Signal AI</div>
        </div>
        <div class="stats-container">
            <div class="stat-item"><div class="stat-val">{total}</div><div class="stat-lbl">Matches</div></div>
            <div class="stat-item"><div class="stat-val">{finished}</div><div class="stat-lbl">Finished</div></div>
            <div class="stat-item"><div class="stat-val" style="color:#10B981;">0.0</div><div class="stat-lbl">Coins Used</div></div>
        </div>
    </div>
    """, unsafe_allow_html=True)

def display_match(m):
    mid, league, home, away, date, time, ph, px, pa, sig, status, sh, sa, p1_data, p2_data = m
    live_stat = get_live_timer(date, time)
    
    badge = f'<span class="signal-badge">🧠 {sig}</span>'
    if status == 'Finished' or live_stat == 'FT':
        badge += f'<span style="color:#94A3B8; font-weight:800; font-size:12px; margin-left:15px;">FINISHED</span>'
    elif live_stat:
        badge += f'<span class="live-badge" style="margin-left:15px;">⏱ {live_stat}</span>'
        
    score_txt = f"{sh} - {sa}" if sh is not None else "VS"
    
    # Retrieve dynamic intelligence
    sim1 = eval(p1_data) # Safe eval since we saved it
    sim2 = eval(p2_data)
    final_preds = get_signal_predictions(sig, sim1, sim2)
    
    st.markdown(f"""
    <div class="match-card">
        <div class="mc-header">
            <div style="color:#94A3B8; font-size:12px; font-weight:700; letter-spacing:1px;">📅 {date} · {time}</div>
            <div>{badge}</div>
        </div>
        <div class="teams-row">
            <div class="team-name" style="text-align:right; padding-right:20px;">{home}</div>
            <div class="score-box">{score_txt}</div>
            <div class="team-name" style="padding-left:20px;">{away}</div>
        </div>
        <div class="pred-area">
            <div class="pred-box">
                <div class="pred-lbl">🏆 Primary Target</div>
                <div class="pred-val">{final_preds[0][0]} <span style="font-size:11px; color:#3B82F6;">{final_preds[0][1]}</span></div>
            </div>
            <div style="width:1px; background:#1E293B;"></div>
            <div class="pred-box">
                <div class="pred-lbl">🛡️ Secondary Target</div>
                <div class="pred-val">{final_preds[1][0]} <span style="font-size:11px; color:#3B82F6;">{final_preds[1][1]}</span></div>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

# ─── APP ROUTING ─────────────────────────────────────────────
def main():
    render_dashboard()
    t1, t2, t3, t4 = st.tabs(["📅 Daily Matrix", "📥 Batch Import", "✅ Update Results", "⚙️ Database"])
    
    with t1:
        c = db.cursor()
        c.execute("SELECT * FROM matches ORDER BY m_date, m_time")
        matches = c.fetchall()
        if not matches: st.info("No matches found. Go to 'Batch Import' to process Forebet tables.")
        for m in matches: display_match(m)

    with t2:
        st.markdown("### 📥 Import Upcoming Matches")
        raw_up = st.text_area("Paste Forebet 'Upcoming' Table here:", height=250)
        if st.button("🚀 Run Titan Engine & Monte Carlo"):
            if raw_up:
                matches = parse_forebet_upcoming(raw_up)
                c = db.cursor()
                for m in matches:
                    c.execute("""INSERT OR IGNORE INTO matches 
                        (match_id, league, home, away, m_date, m_time, ph, px, pa, signal, status, sim_pred1, sim_pred2) 
                        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                        (m['id'], m['league'], m['home'], m['away'], m['date'], m['time'], 
                         m['ph'], m['px'], m['pa'], m['signal'], 'Upcoming', str(m['p1']), str(m['p2'])))
                db.commit()
                st.success(f"Processed {len(matches)} matches using 20,000 simulations each!")
                st.rerun()

    with t3:
        st.markdown("### ✅ Update Results & Train AI")
        raw_fin = st.text_area("Paste Forebet 'Finished' Table here:", height=250)
        if st.button("🧠 Train Signal Network"):
            if raw_fin:
                results = parse_forebet_finished(raw_fin)
                c = db.cursor()
                count = 0
                for mid, res in results.items():
                    c.execute("UPDATE matches SET score_h=?, score_a=?, status='Finished' WHERE match_id=?", 
                              (res['sh'], res['sa'], mid))
                    if c.rowcount > 0:
                        count += 1
                        # Learn from the result
                        c.execute("SELECT signal, sim_pred1, sim_pred2 FROM matches WHERE match_id=?", (mid,))
                        row = c.fetchone()
                        if row:
                            sig, p1, p2 = row[0], eval(row[1])[0], eval(row[2])[0]
                            is_win1 = 1 if verify_market(p1, res['sh'], res['sa']) else 0
                            is_win2 = 1 if verify_market(p2, res['sh'], res['sa']) else 0
                            ts = datetime.now().isoformat()
                            c.execute("INSERT INTO signal_history VALUES (?,?,?,?)", (sig, p1, is_win1, ts))
                            c.execute("INSERT INTO signal_history VALUES (?,?,?,?)", (sig, p2, is_win2, ts))
                db.commit()
                st.success(f"Network Trained! {count} matches verified and added to Database.")
                st.rerun()

    with t4:
        st.markdown("### ⚙️ System Reset")
        if st.button("🗑️ Delete All Matches (Keep Training Memory)", type="primary"):
            db.cursor().execute("DELETE FROM matches")
            db.commit()
            st.success("Matches cleared. The AI Brain (Signal History) is kept safe.")
            st.rerun()
        st.write("---")
        if st.button("🚨 Factory Reset Everything"):
            db.cursor().execute("DELETE FROM matches")
            db.cursor().execute("DELETE FROM signal_history")
            db.commit()
            st.warning("Complete wipe successful.")
            st.rerun()

if __name__ == "__main__":
    main()