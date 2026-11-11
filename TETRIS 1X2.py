# ============================================================
# OMEGA CHAOS LOGIC v4.0 ULTRA — Streamlit Edition
# Dual-Leg Engine · Signal S09-S19 · xG Profile DB
# Full Forebet Parser · Self-Learning Brain
# ============================================================
import streamlit as st
import sqlite3, re, math, random, hashlib, os
from collections import defaultdict
from datetime import datetime, date
import pandas as pd

st.set_page_config(page_title="CHAOS LOGIC v4.0", page_icon="🧠",
    layout="wide", initial_sidebar_state="collapsed")

# ── CSS ─────────────────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;700&family=Rajdhani:wght@400;600;700&display=swap');
*{box-sizing:border-box}
html,body,.stApp{background:#07111e!important;color:#cfe0ff!important;font-family:'Rajdhani',sans-serif!important}
#MainMenu,footer,header{visibility:hidden}
.block-container{padding:1.2rem 1.5rem 3rem!important;max-width:1100px;margin:auto}
/* HEADER */
.cl-hdr{background:linear-gradient(135deg,#0d1f3c,#091525);border:1px solid #1a3060;
  border-radius:20px;padding:20px 24px;margin-bottom:14px;
  display:flex;align-items:center;justify-content:space-between;
  box-shadow:0 0 50px rgba(30,80,180,.1)}
.cl-logo{font-size:1.8rem;font-weight:700;color:#fff;letter-spacing:2px;
  display:flex;align-items:center;gap:12px}
.cl-icon{background:linear-gradient(135deg,#5a30ff,#3a90ff);border-radius:13px;
  width:48px;height:48px;display:flex;align-items:center;justify-content:center;font-size:1.4rem}
.cl-meta{color:#3a6090;font-size:.78rem;margin-top:5px}
.live-b{background:rgba(0,255,120,.1);border:1px solid #00cc55;color:#00ff88;
  border-radius:20px;padding:5px 13px;font-size:.78rem;font-weight:700;
  display:inline-flex;align-items:center;gap:6px}
.ldot{width:7px;height:7px;background:#00ff88;border-radius:50%;animation:pulse 1.4s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.2}}
/* STAT GRID */
.sg{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px}
.sc{background:#0d1f3c;border:1px solid #1a3060;border-radius:13px;
  padding:14px 10px 12px;text-align:center;position:relative;overflow:hidden}
.sc::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;border-radius:13px 13px 0 0}
.sc.b::before{background:linear-gradient(90deg,#3a90ff,#70b0ff)}
.sc.y::before{background:linear-gradient(90deg,#ffcc00,#ffaa00)}
.sc.g::before{background:linear-gradient(90deg,#00ff88,#00cc55)}
.sc.gr::before{background:linear-gradient(90deg,#333,#555)}
.sn{font-size:1.9rem;font-weight:700;line-height:1;font-family:'JetBrains Mono',monospace}
.sn.b{color:#3a90ff}.sn.y{color:#ffcc00}.sn.g{color:#00ff88}.sn.gr{color:#444}
.sl{font-size:.7rem;color:#3a6090;letter-spacing:1px;text-transform:uppercase;margin-top:4px}
.ss{font-size:.65rem;color:#253050;margin-top:2px}
/* INPUT */
.inp-card{background:#0d1f3c;border:1px solid #1a3060;border-radius:15px;padding:18px;margin-bottom:12px}
.inp-title{font-size:1rem;font-weight:700;color:#fff;margin-bottom:3px}
.inp-hint{font-size:.76rem;color:#3a6090;margin-bottom:10px}
.stTextArea textarea{background:#060f1e!important;color:#5a80aa!important;
  border:1px solid #1a3060!important;border-radius:10px!important;
  font-family:'JetBrains Mono',monospace!important;font-size:.78rem!important}
/* BUTTON */
.stButton>button{background:linear-gradient(135deg,#5a30ff,#3a90ff)!important;
  color:#fff!important;border:none!important;border-radius:12px!important;
  padding:13px 26px!important;font-weight:700!important;font-size:.95rem!important;
  width:100%!important;letter-spacing:1px!important;
  box-shadow:0 4px 20px rgba(90,48,255,.3)!important}
/* TABS */
.stTabs [data-baseweb="tab-list"]{background:#0d1f3c!important;border-radius:13px!important;
  padding:5px!important;gap:3px!important;border:1px solid #1a3060!important}
.stTabs [data-baseweb="tab"]{background:transparent!important;color:#3a6090!important;
  border-radius:9px!important;padding:8px 15px!important;
  font-family:'Rajdhani',sans-serif!important;font-weight:600!important;font-size:.86rem!important}
.stTabs [aria-selected="true"]{background:linear-gradient(135deg,#1a3060,#1e3a70)!important;color:#3a90ff!important}
.stTabs [data-baseweb="tab-panel"]{background:transparent!important;padding-top:12px!important}
/* MATCH DETAIL */
.md-card{background:#0d1f3c;border:1px solid #1a3060;border-radius:17px;
  padding:20px;margin-bottom:13px;box-shadow:0 0 40px rgba(30,80,180,.1)}
.prob-bar{height:8px;border-radius:6px;display:flex;overflow:hidden;margin-bottom:5px}
.xg-box{background:#080f1e;border:1px solid #1a3060;border-radius:11px;padding:13px;text-align:center}
.xg-lbl{font-size:.66rem;letter-spacing:2px;color:#3a6090;text-transform:uppercase;margin-bottom:5px}
.xg-val{font-size:1.35rem;font-weight:700;color:#fff;font-family:'JetBrains Mono',monospace}
.dl-card{background:#080f1e;border:1px solid #1a3060;border-radius:11px;padding:15px;margin:11px 0}
.sp-card{background:#080f1e;border:1px solid #1a3060;border-radius:11px;padding:13px 15px;margin:7px 0}
.sp-type{font-size:.68rem;letter-spacing:2px;text-transform:uppercase;margin-bottom:7px;
  display:flex;align-items:center;gap:5px}
.sp-market{font-size:1.05rem;font-weight:700;color:#fff;margin-bottom:4px}
/* MATCH CARD */
.mc{background:#0d1f3c;border:1px solid #1a3060;border-radius:13px;
  padding:13px 15px;margin-bottom:9px;transition:border-color .2s}
.mc:hover{border-color:#3a90ff}
/* PILLS */
.pill{display:inline-block;border-radius:7px;padding:3px 9px;font-size:.73rem;font-weight:600;margin:2px}
.pb{background:rgba(58,144,255,.12);border:1px solid rgba(58,144,255,.3);color:#3a90ff}
.pg{background:rgba(0,200,100,.1);border:1px solid rgba(0,200,100,.3);color:#00ff88}
.py{background:rgba(255,200,0,.1);border:1px solid rgba(255,200,0,.3);color:#ffcc00}
.pr{background:rgba(255,60,60,.1);border:1px solid rgba(255,60,60,.3);color:#ff5555}
.pp{background:rgba(150,80,255,.12);border:1px solid rgba(150,80,255,.3);color:#aa70ff}
.pgr{background:#0d1525;border:1px solid #1a3060;color:#3a6090}
/* SIGNAL */
.sig-row{background:#0d1f3c;border:1px solid #1a3060;border-radius:11px;
  padding:12px 15px;margin-bottom:7px;display:flex;align-items:center;justify-content:space-between}
.sig-row:hover{border-color:#3a90ff}
.sig-code{font-size:1.05rem;font-weight:700;color:#ffcc00;font-family:'JetBrains Mono',monospace;min-width:48px}
.sb-p{background:rgba(255,160,0,.15);border:1px solid #ffaa00;color:#ffcc00;
  border-radius:7px;padding:3px 8px;font-size:.7rem;font-weight:700}
.sb-w{background:rgba(0,200,100,.1);border:1px solid #00cc55;color:#00ff88;
  border-radius:7px;padding:3px 8px;font-size:.7rem;font-weight:700}
.sb-t{background:#0a1525;border:1px solid #1a3060;color:#3a6090;
  border-radius:7px;padding:3px 8px;font-size:.7rem}
/* SECTION */
.sec-card{background:#0d1f3c;border:1px solid #1a3060;border-radius:13px;padding:15px;margin-bottom:11px}
.sec-hdr{font-size:.7rem;letter-spacing:2px;color:#253050;text-transform:uppercase;margin-bottom:9px}
/* STREAMLIT */
.stSelectbox>div>div,.stTextInput>div>input,.stNumberInput>div>input{
  background:#0d1f3c!important;border-color:#1a3060!important;color:#cfe0ff!important}
[data-testid="stMetric"]{background:#0d1f3c;border:1px solid #1a3060;border-radius:11px;padding:12px}
[data-testid="stMetricLabel"]{color:#3a6090!important;font-size:.7rem!important;letter-spacing:1px}
[data-testid="stMetricValue"]{color:#3a90ff!important;font-family:'JetBrains Mono',monospace!important}
div.stAlert{border-radius:9px!important}
hr{border-color:#1a3060!important}
[data-testid="stDataFrameResizable"]{border:1px solid #1a3060!important;border-radius:11px;overflow:hidden}
</style>
""", unsafe_allow_html=True)

# ── CONSTANTS ────────────────────────────────────────────────
NUM_SIMS   = 20000
MIN_ODDS   = 1.618
MAX_ODDS   = 16.18
ELITE_CONF = 0.575
DB_FILE    = "omega_ultra.db"

MARKETS = [
    "W1","X","W2","1X","X2","12",
    "AH Home -0.5","AH Away -0.5","AH Home +0.5","AH Away +0.5",
    "AH Home -1.0","AH Away -1.0","AH Home -1.5","AH Away -1.5",
    "Over 0.5","Under 0.5","Over 1.5","Under 1.5",
    "Over 2.5","Under 2.5","Over 3.5","Under 3.5","Over 4.5","Under 4.5",
    "Over 1.75","Under 1.75","Over 2.25","Under 2.25","Over 2.75","Under 2.75",
    "Over 3.25","Under 3.25","Over 3.75","Under 3.75",
    "BTTS Yes","BTTS No","Home Win to Nil","Away Win to Nil",
    "HT W1","HT X","HT W2","HT Over 0.5","HT Under 0.5","HT Over 1.5","HT Under 1.5",
    "2H Over 0.5","2H Over 1.5","2H Under 1.5",
    "1/1","1/X","1/2","X/1","X/X","X/2","2/1","2/X","2/2",
    "Home Clean Sheet","Away Clean Sheet",
    "Home Over 0.5","Home Over 1.5","Home Over 2.5",
    "Away Over 0.5","Away Over 1.5","Away Over 2.5",
    "Exact Goals Total 0","Exact Goals Total 1","Exact Goals Total 2",
    "Exact Goals Total 3","Exact Goals Total 4",
    "Total Goals Even","Total Goals Odd",
    "Over 8.5 Corners","Under 8.5 Corners","Over 9.5 Corners","Under 9.5 Corners",
    "Over 10.5 Corners","Under 10.5 Corners",
    "Total Cards Over 3.5","Total Cards Under 3.5",
    "Total Cards Over 4.5","Total Cards Under 4.5",
    "2-3 Goals","4-5 Goals","6-7 Goals",
    "Goal in 1st Half Yes","Goal in 2nd Half Yes",
    "First goal: Home","First goal: Away",
]

VERIFIABLE = {
    "W1","X","W2","1X","X2","12",
    "Over 0.5","Under 0.5","Over 1.5","Under 1.5","Over 2.5","Under 2.5",
    "Over 3.5","Under 3.5","Over 4.5","Under 4.5",
    "BTTS Yes","BTTS No","Home Win to Nil","Away Win to Nil",
    "Home Clean Sheet","Away Clean Sheet",
    "Home Over 0.5","Home Over 1.5","Home Over 2.5",
    "Away Over 0.5","Away Over 1.5","Away Over 2.5",
    "Exact Goals Total 0","Exact Goals Total 1","Exact Goals Total 2","Exact Goals Total 3",
    "Total Goals Even","Total Goals Odd",
    "AH Home -0.5","AH Away -0.5","AH Home +0.5","AH Away +0.5",
    "2-3 Goals","4-5 Goals","6-7 Goals",
    "Goal in 1st Half Yes","Goal in 2nd Half Yes",
    "First goal: Home","First goal: Away",
}

def mkt_grade(m):
    if any(x in m for x in ["Over 0.5","1X","X2","12","AH Home +0.5","AH Away +0.5"]): return "S"
    if any(x in m for x in ["Over 1.5","BTTS","Home Over 0.5","Away Over 0.5"]): return "A"
    if any(x in m for x in ["W1","W2","Over 2.5","AH"]): return "B"
    return "C"

def gc(g): return {"S":"#00ff88","A":"#3a90ff","B":"#ffcc00","C":"#ff8844"}.get(g,"#888")

SIGNAL_DEFS = {
    "S09":{"name":"Ultra Under",   "desc":"λ<1.4 · Both very low scoring"},
    "S10":{"name":"Low Scoring",   "desc":"λ 1.4-1.8 · Under 2.5 zone"},
    "S11":{"name":"Home Fortress", "desc":"xG ratio>2.2 · Strong home dominance"},
    "S12":{"name":"Away Siege",    "desc":"Away xG superior · Away attack"},
    "S13":{"name":"Goal Fest",     "desc":"λ>3.2 · High scoring"},
    "S14":{"name":"Draw Magnet",   "desc":"Draw prob>38% · Balanced"},
    "S15":{"name":"Under Trend",   "desc":"Under 2.5 rate>75% both"},
    "S16":{"name":"Home Dominant", "desc":"xG_H>1.8 · Home attack"},
    "S17":{"name":"BTTS Lock",     "desc":"BTTS rate>55% both"},
    "S18":{"name":"Prot. Under",   "desc":"λ 1.8-2.4 · Protected mode"},
    "S19":{"name":"Chaos Mode",    "desc":"Surprise idx>5.5 · Unpredictable"},
}

def assign_signal(stats, xg_h, xg_a, si):
    lam  = xg_h + xg_a
    ratio= xg_h / max(xg_a, 0.01)
    u25_h= stats.get("under_2_5_h", 0.55)
    u25_a= stats.get("under_2_5_a", 0.55)
    btts_h=stats.get("btts_yes_h", 0.33)
    btts_a=stats.get("btts_yes_a", 0.33)
    dp   = stats.get("draw_prob", 0.33)
    if si > 5.5: return "S19"
    if lam < 1.4: return "S09"
    if lam < 1.8: return "S10"
    if ratio > 2.2: return "S16" if xg_h > 1.6 else "S11"
    if xg_a > xg_h * 1.8: return "S12"
    if lam > 3.2: return "S13"
    if btts_h > 0.55 and btts_a > 0.55 and lam > 2.0: return "S17"
    if u25_h > 0.78 and u25_a > 0.70: return "S15"
    if dp > 0.38: return "S14"
    if lam < 2.4: return "S18"
    return "S16" if xg_h > 1.8 else "S11"

# ── FULL FOREBET PARSER ──────────────────────────────────────
class DataHarvester:
    @staticmethod
    def parse(content):
        s = {
            "home":"Home","away":"Away",
            "league":"Unknown League","match_date":None,"match_time":"",
            "h_prob":0.35,"draw_prob":0.33,"a_prob":0.32,
            "forebet_pred_score":"","forebet_coeff":0.0,
            "h_gs_avg":1.25,"h_gc_avg":1.25,
            "a_gs_avg":1.25,"a_gc_avg":1.25,
            "h_form_w":2,"h_form_d":1,"h_form_l":3,
            "a_form_w":1,"a_form_d":2,"a_form_l":3,
            "h_home_w":0,"h_home_d":1,"h_home_l":2,
            "a_away_w":1,"a_away_d":2,"a_away_l":2,
            "h_shots_avg":9.0,"a_shots_avg":9.0,
            "h_on_target_pct":0.33,"a_on_target_pct":0.33,
            "h_da_avg":55.0,"a_da_avg":55.0,
            "btts_yes_h":0.33,"btts_yes_a":0.33,
            "under_2_5_h":0.55,"under_2_5_a":0.55,
            "over_1_5_h":0.55,"over_1_5_a":0.55,
            "h_corners_avg":5.0,"a_corners_avg":5.0,
            "h_cards_avg":2.5,"a_cards_avg":2.5,
            "actual_result":None,"seed":12345,
        }
        try:
            # ── TEAM NAMES ──
            for line in content.split('\n'):
                if re.search(r'\bVS\b', line, re.IGNORECASE) and 10 < len(line) < 120:
                    parts = re.split(r'\s+VS\s+', line.strip(), flags=re.IGNORECASE)
                    if len(parts) >= 2:
                        def cl(n):
                            n = re.sub(r'\s*[-–]\s*Logo.*$','',n,flags=re.IGNORECASE)
                            n = re.sub(r'^.*Prediction\s*','',n,flags=re.IGNORECASE)
                            return n.strip()
                        h,a = cl(parts[0]), cl(parts[1])
                        if len(h)>2 and len(a)>2:
                            s['home'],s['away'] = h,a
                    break

            # ── LEAGUE ──
            lg_pat = (r'(Premier League|La Liga|Bundesliga|Serie A|Ligue 1|Eredivisie|'
                      r'Champions League|Europa League|Conference League|MLS|'
                      r'Nacional\s*B|Primera\s*Divisi[oó]n|Superliga|'
                      r'Primeira\s*Liga|Ekstraklasa|Super\s*Lig|'
                      r'Championship|League One|League Two|'
                      r'Bundesliga\s*2|2\.?\s*Bundesliga|Serie\s*B|'
                      r'La\s*Liga\s*2|Segunda|Scottish\s*Prem|Jupiler)')
            lm = re.search(lg_pat, content, re.IGNORECASE)
            if lm:
                idx = lm.start()
                ctx = content[max(0,idx-80):idx+60]
                cm = re.search(r'(Argentina|Spain|England|Germany|France|Italy|'
                    r'Brazil|Portugal|Netherlands|Belgium|Turkey|Poland|'
                    r'Scotland|Mexico|USA|Greece|Russia|Ukraine|Sweden)',
                    ctx, re.IGNORECASE)
                s['league'] = f"{cm.group(1)} {lm.group(1)}" if cm else lm.group(1)

            # ── DATE & TIME ──
            for pat in [r'(\d{2}/\d{2}/\d{4})\s+(\d{2}:\d{2})',
                        r'(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})',
                        r'(\d{2}/\d{2}/\d{4})',r'(\d{4}-\d{2}-\d{2})']:
                dm = re.search(pat, content)
                if dm:
                    ds = dm.group(1)
                    s['match_time'] = dm.group(2) if dm.lastindex and dm.lastindex>=2 else ""
                    for fmt in ("%d/%m/%Y","%Y-%m-%d"):
                        try: s['match_date']=datetime.strptime(ds,fmt).date().isoformat(); break
                        except: pass
                    if s['match_date']: break
            if not s['match_date']: s['match_date'] = date.today().isoformat()

            # ── FT RESULT ──
            for pat in [r'FT\s+(\d+)\s*-\s*(\d+)',
                        r'(\d+)\s*-\s*(\d+)\s*\(\d+\s*-\s*\d+\)',
                        r'Score[:\s]+(\d+)\s*-\s*(\d+)']:
                fm = re.search(pat, content, re.IGNORECASE)
                if fm:
                    s['actual_result'] = (int(fm.group(1)), int(fm.group(2)))
                    break

            # ── FOREBET 1X2 PROBABILITIES ──
            # Pattern: something like "353233" or "35 32 33" then prediction score then coeff
            txt1 = content.replace('\n',' ')
            pb = re.search(
                r'(?<!\d)(\d{2})\s*(\d{2})\s*(\d{2})(?!\d)\s*\d\s*([\d]+-[\d]+)\s*([\d.]+)',
                txt1)
            if pb:
                ph,pd,pa = int(pb.group(1)),int(pb.group(2)),int(pb.group(3))
                if 85 <= ph+pd+pa <= 115:
                    s['h_prob']    = ph/100
                    s['draw_prob'] = pd/100
                    s['a_prob']    = pa/100
                    s['forebet_pred_score'] = pb.group(4)
                    try: s['forebet_coeff'] = float(pb.group(5))
                    except: pass
            else:
                for m in re.finditer(r'(?<!\d)(\d{2})%?\s+(\d{2})%?\s+(\d{2})%?(?!\d)', txt1):
                    ph,pd,pa = int(m.group(1)),int(m.group(2)),int(m.group(3))
                    if 90 <= ph+pd+pa <= 110:
                        s['h_prob'],s['draw_prob'],s['a_prob'] = ph/100,pd/100,pa/100
                        break

            # ── GOALS AVERAGES ──
            avgs = re.findall(r'Avg\.\s*(?:\[.*?\])?\s*per game\s+([\d.]+)', content)
            ca = [float(x) for x in avgs if 0 <= float(x) <= 7.0]
            if len(ca)>=4: s['h_gs_avg'],s['h_gc_avg'],s['a_gs_avg'],s['a_gc_avg']=ca[0],ca[1],ca[2],ca[3]
            elif len(ca)>=2: s['h_gs_avg'],s['h_gc_avg']=ca[0],ca[1]

            # ── FORM ──
            fm_all = re.findall(r'Win\s+(\d+)\s*\d+%\s*Draw\s+(\d+)\s*\d+%\s*Lost\s+(\d+)',content)
            if len(fm_all)>=1: s['h_form_w'],s['h_form_d'],s['h_form_l']=[int(x) for x in fm_all[0]]
            if len(fm_all)>=2: s['a_form_w'],s['a_form_d'],s['a_form_l']=[int(x) for x in fm_all[1]]
            if len(fm_all)>=3: s['h_home_w'],s['h_home_d'],s['h_home_l']=[int(x) for x in fm_all[2]]
            if len(fm_all)>=4: s['a_away_w'],s['a_away_d'],s['a_away_l']=[int(x) for x in fm_all[3]]

            # ── SHOTS ──
            sh_avgs = re.findall(r'Total shots\s+\d+\s+([\d.]+)',content)
            if len(sh_avgs)>=1: s['h_shots_avg']=float(sh_avgs[0])
            if len(sh_avgs)>=2: s['a_shots_avg']=float(sh_avgs[1])
            ot = re.findall(r'(\d+)%\s*ON target',content)
            if len(ot)>=1: s['h_on_target_pct']=int(ot[0])/100
            if len(ot)>=2: s['a_on_target_pct']=int(ot[1])/100

            # ── DANGEROUS ATTACKS ──
            da_vals = re.findall(r'Avg\.\s*([\d.]+)\n',content)
            da_clean = [float(x) for x in da_vals if 10<=float(x)<=200]
            if len(da_clean)>=2: s['h_da_avg'],s['a_da_avg']=da_clean[0],da_clean[1]

            # ── BTTS ──
            btts_m = re.findall(r'Yes\s+\d+\s+(\d+)%\d+%\s*\nNo',content)
            if len(btts_m)>=1: s['btts_yes_h']=int(btts_m[0])/100
            if len(btts_m)>=2: s['btts_yes_a']=int(btts_m[1])/100

            # ── UNDER/OVER 2.5 STATS ──
            # Matches "8\n1\n89%11%\n2.5\nGoals" style in txt1
            uo25 = re.findall(
                r'(\d+)\s+(\d+)\s+(\d+)%(\d+)%\s+2\.5\s+Goals[^%]{0,30}?(\d+)\s+(\d+)\s+(\d+)%(\d+)%',
                txt1)
            if uo25:
                s['under_2_5_h']=int(uo25[0][2])/100
                s['under_2_5_a']=int(uo25[0][6])/100

            # ── CORNERS ──
            cm2 = re.search(r'([\d.]+)\s+\d+\s+Corners\s+\d+\s+([\d.]+)',content)
            if cm2: s['h_corners_avg'],s['a_corners_avg']=float(cm2.group(1)),float(cm2.group(2))

            # ── CARDS ──
            yc = re.findall(r'([\d.]+)\s+\d+\s+Yellow cards',content)
            if len(yc)>=1: s['h_cards_avg']=float(yc[0])
            if len(yc)>=2: s['a_cards_avg']=float(yc[1])

            # ── SEED ──
            uid = f"{s['home']}{s['away']}{s['match_date']}v4ultra".encode()
            s['seed'] = int(hashlib.md5(uid).hexdigest(),16)%(2**32)
        except:
            pass
        return s

# ── TITAN ENGINE v2 ──────────────────────────────────────────
class TitanEngine:
    def __init__(self, s):
        self.s = s
        self.xg_h = self.xg_a = 0.0
        self.surprise_idx = 0

    def calculate(self):
        s = self.s; L = 2.70
        h_att = s['h_gs_avg']/(L/2); h_def = s['h_gc_avg']/(L/2)
        a_att = s['a_gs_avg']/(L/2); a_def = s['a_gc_avg']/(L/2)
        base_h = h_att * a_def * 1.35
        base_a = a_att * h_def * 1.20
        # Form
        hg = max(s['h_form_w']+s['h_form_d']+s['h_form_l'],1)
        ag = max(s['a_form_w']+s['a_form_d']+s['a_form_l'],1)
        fadj_h = (s['h_form_w']-s['h_form_l'])/hg * 0.12
        fadj_a = (s['a_form_w']-s['a_form_l'])/ag * 0.12
        # Shot quality
        sq_h = s['h_shots_avg']*s['h_on_target_pct']*0.04
        sq_a = s['a_shots_avg']*s['a_on_target_pct']*0.04
        # Dangerous attacks
        da_tot = s['h_da_avg']+s['a_da_avg']
        if da_tot>0:
            da_r = s['h_da_avg']/da_tot
            da_h = (da_r-0.5)*0.20; da_a = -da_h*0.8
        else: da_h=da_a=0.0
        # Forebet prob anchor
        p_ratio = s['h_prob']/max(s['a_prob'],0.05)
        anchor  = math.log(max(p_ratio,0.1))*0.08
        # Home/away specific
        hg2 = max(s['h_home_w']+s['h_home_d']+s['h_home_l'],1)
        ag2 = max(s['a_away_w']+s['a_away_d']+s['a_away_l'],1)
        hsp = (s['h_home_w']/hg2-0.33)*0.10
        asp = (s['a_away_w']/ag2-0.33)*0.10
        # Under/Over calibration
        u25_adj_h = (0.55-s['under_2_5_h'])*0.15
        u25_adj_a = (0.55-s['under_2_5_a'])*0.15
        self.xg_h = max(0.20, base_h+fadj_h+sq_h+da_h+anchor+hsp+u25_adj_h)
        self.xg_a = max(0.10, base_a+fadj_a+sq_a+da_a+asp+u25_adj_a)
        # Surprise
        diff  = abs(self.xg_h-self.xg_a); tot = self.xg_h+self.xg_a
        si = 0
        if diff<0.25: si+=4
        if tot<1.9:  si+=3
        if s['h_gc_avg']>1.7 or s['a_gc_avg']>1.7: si+=2
        if s['h_form_d']>=3: si+=1
        if s['a_form_d']>=3: si+=1
        self.surprise_idx = si

    def profile_key(self): return f"{round(self.xg_h*10)/10:.1f}_{round(self.xg_a*10)/10:.1f}"
    def lam(self): return self.xg_h+self.xg_a
    def mode(self):
        l=self.lam()
        if l<1.8: return "UNDER"
        if l<2.6: return "PROTECTED"
        return "OVER"
    def zone_text(self):
        l=self.lam()
        if l<1.5: return "Deep Under Zone: Both teams very low scoring — Under 1.5 strongly favoured"
        if l<1.8: return "Under Zone: Low goals expected — Under 2.5 is the safe play"
        if l<2.2: return "Protected Over Zone: Over 1.5 protected — Under 2.5 still viable"
        if l<2.6: return "Neutral Zone: Over 2.5 possible but not confirmed"
        if l<3.2: return f"Over Zone: λ={l:.2f} → High scoring expected, overs favoured"
        return f"Caution Zone: λ={l:.2f} → Very high goals, BTTS and Over 2.5 favoured"
    def zone_pct(self): return min(100,max(0,self.lam()/5*100))

# ── SIMULATOR ────────────────────────────────────────────────
class Simulator:
    def __init__(self, engine):
        self.e = engine
        random.seed(engine.s['seed'])

    def _pois(self, lam):
        L=math.exp(-lam); k=0; p=1.0
        while p>L: k+=1; p*=random.random()
        return k-1

    def modal_score(self):
        best=0; res=(1,0)
        for h in range(7):
            for a in range(7):
                ph=math.exp(-self.e.xg_h)*self.e.xg_h**h/math.factorial(h)
                pa=math.exp(-self.e.xg_a)*self.e.xg_a**a/math.factorial(a)
                if ph*pa>best: best=ph*pa; res=(h,a)
        return res

    def run(self):
        hits=defaultdict(int)
        hr,ar=self.e.xg_h,self.e.xg_a
        if self.e.surprise_idx>6:
            avg=(hr+ar)/2; hr=hr*.7+avg*.3; ar=ar*.7+avg*.3
        tcorn=9.0+(hr+ar)*.5; tcard=4.0-(hr+ar)*.2
        for _ in range(NUM_SIMS):
            fh=self._pois(hr); fa=self._pois(ar)
            hh=sum(1 for _ in range(fh) if random.random()<.45)
            ha=sum(1 for _ in range(fa) if random.random()<.45)
            sh=fh-hh; sa=fa-ha; total=fh+fa; btts=fh>0 and fa>0
            fg_h=fg_a=False; early=late=False
            if total>0:
                if fh>0 and fa==0: fg_h=True
                elif fa>0 and fh==0: fg_a=True
                elif fh>0 and fa>0: fg_h=random.random()<(hr/(hr+ar+1e-9))
                if random.random()<.16*total: early=True
                if random.random()<.20*total: late=True
            tc=self._pois(tcorn); hcr=hr/(hr+ar+.1)
            hc=sum(1 for _ in range(tc) if random.random()<hcr); ac=tc-hc
            tca=self._pois(tcard)
            hca=sum(1 for _ in range(tca) if random.random()<.5); aca=tca-hca
            pen=random.random()<.25; red=random.random()<.15
            self._hits(hits,fh,fa,hh,ha,sh,sa,tc,hc,ac,tca,hca,aca,fg_h,fg_a,early,late,pen,red)
        return dict(hits)

    def _hits(self,hits,h,a,hh,ha,sh,sa,tc,hc,ac,tca,hca,aca,fg_h,fg_a,early,late,pen,red):
        tot=h+a; btts=h>0 and a>0
        if h>a: hits["W1"]+=1
        elif a>h: hits["W2"]+=1
        else: hits["X"]+=1
        if h>=a: hits["1X"]+=1
        if a>=h: hits["X2"]+=1
        if h!=a: hits["12"]+=1
        rht="1"if hh>ha else("2"if ha>hh else"X"); rft="1"if h>a else("2"if a>h else"X")
        if hh>ha: hits["HT W1"]+=1
        elif ha>hh: hits["HT W2"]+=1
        else: hits["HT X"]+=1
        hits[f"{rht}/{rft}"]+=1
        for t,l in [(.5,"0.5"),(1.,"1.0"),(1.5,"1.5"),(2.,"2.0"),(2.5,"2.5")]:
            if (h-a)>t: hits[f"AH Home -{l}"]+=1
            if (a-h)>t: hits[f"AH Away -{l}"]+=1
            if (h-a)>-t: hits[f"AH Home +{l}"]+=1
            if (a-h)>-t: hits[f"AH Away +{l}"]+=1
        for line in [.5,1.5,1.75,2.25,2.5,2.75,3.25,3.5,3.75,4.5]:
            if tot>line: hits[f"Over {line}"]+=1
            else: hits[f"Under {line}"]+=1
        ht_t=hh+ha; sh_t=sh+sa
        for line in [.5,1.5]:
            if ht_t>line: hits[f"HT Over {line}"]+=1
            else: hits[f"HT Under {line}"]+=1
            if sh_t>line: hits[f"2H Over {line}"]+=1
            else: hits[f"2H Under {line}"]+=1
        if sh_t>.5: hits["2H Over 0.5"]+=1
        if btts: hits["BTTS Yes"]+=1
        else: hits["BTTS No"]+=1
        for t in [.5,1.5,2.5]:
            if h>t: hits[f"Home Over {t}"]+=1
            if a>t: hits[f"Away Over {t}"]+=1
        if h==0: hits["Away Clean Sheet"]+=1
        if a==0: hits["Home Clean Sheet"]+=1
        if h>a and a==0: hits["Home Win to Nil"]+=1
        if a>h and h==0: hits["Away Win to Nil"]+=1
        for n in range(5):
            if tot==n: hits[f"Exact Goals Total {n}"]+=1
        hits["Total Goals Even"]+=tot%2==0; hits["Total Goals Odd"]+=tot%2==1
        for line in [8.5,9.5,10.5]:
            if tc>line: hits[f"Over {line} Corners"]+=1
            else: hits[f"Under {line} Corners"]+=1
        for line in [3.5,4.5]:
            if tca>line: hits[f"Total Cards Over {line}"]+=1
            else: hits[f"Total Cards Under {line}"]+=1
        if fg_h: hits["First goal: Home"]+=1
        elif fg_a: hits["First goal: Away"]+=1
        if 2<=tot<=3: hits["2-3 Goals"]+=1
        elif 4<=tot<=5: hits["4-5 Goals"]+=1
        elif 6<=tot<=7: hits["6-7 Goals"]+=1
        if ht_t>0: hits["Goal in 1st Half Yes"]+=1
        if sh_t>0: hits["Goal in 2nd Half Yes"]+=1

# ── JUDGE v2 ─────────────────────────────────────────────────
class Judge:
    @staticmethod
    def candidates(hits, engine, db):
        out=[]
        for mkt,cnt in hits.items():
            if mkt not in MARKETS: continue
            prob=cnt/NUM_SIMS
            if prob<=0: continue
            impl=1/prob
            if impl<MIN_ODDS or impl>MAX_ODDS: continue
            g=mkt_grade(mkt); si=engine.surprise_idx
            ev=1.0
            if si>6:
                if g=="B": ev=0.6
                elif g=="S": ev=1.2
            elif si<2:
                if g=="B": ev=1.2
                elif g=="C": ev=0.7
            bias    = db.brain_bias(mkt)
            xg_bias = db.profile_bias(engine.profile_key(), mkt)
            score   = (prob*100)*ev*bias*(1+xg_bias*.1)
            out.append({"market":mkt,"prob":prob,"odds":round(impl,2),
                "grade":g,"score":score,"ev":ev,"bias":bias})
        out.sort(key=lambda x:x['score'],reverse=True)
        return out

    @staticmethod
    def joker_v3(main_mkt, engine, stats):
        lam=engine.lam(); mode=engine.mode()
        xg_h,xg_a=engine.xg_h,engine.xg_a
        u25_h=stats.get('under_2_5_h',.55)
        u25_a=stats.get('under_2_5_a',.55)
        btts_h=stats.get('btts_yes_h',.33)
        btts_a=stats.get('btts_yes_a',.33)
        cands=[]
        if mode=="UNDER":
            if "Over 0.5"!=main_mkt: cands.append(("Over 0.5",.93))
            cands.append(("Under 2.5",max(u25_h,u25_a)))
            cands.append(("BTTS No",1-max(btts_h,btts_a)))
        elif mode=="OVER":
            if btts_h>.50 and btts_a>.50: cands.append(("BTTS Yes",(btts_h+btts_a)/2))
            if xg_h>1.5: cands.append(("Home Over 0.5",.88))
            cands.append(("Over 1.5",.80))
        else:
            if "Under 2.5"!=main_mkt: cands.append(("Under 2.5",max(u25_h,u25_a)))
            if xg_h>xg_a*1.5: cands.append(("1X",stats.get('h_prob',.35)+stats.get('draw_prob',.33)))
            else: cands.append(("Over 1.5",.75))
        cands=[c for c in cands if c[0]!=main_mkt]
        if not cands: return ("Over 0.5",.92)
        cands.sort(key=lambda x:x[1],reverse=True)
        return cands[0]

    @staticmethod
    def verify(mkt, h, a):
        tot=h+a
        if mkt=="W1": return h>a
        if mkt=="W2": return a>h
        if mkt=="X": return h==a
        if mkt=="1X": return h>=a
        if mkt=="X2": return a>=h
        if mkt=="12": return h!=a
        if mkt=="BTTS Yes": return h>0 and a>0
        if mkt=="BTTS No": return h==0 or a==0
        if mkt=="Home Win to Nil": return h>a and a==0
        if mkt=="Away Win to Nil": return a>h and h==0
        if mkt=="Home Clean Sheet": return a==0
        if mkt=="Away Clean Sheet": return h==0
        if mkt=="AH Home -0.5": return (h-a)>.5
        if mkt=="AH Away -0.5": return (a-h)>.5
        if mkt=="AH Home +0.5": return (h-a)>-.5
        if mkt=="AH Away +0.5": return (a-h)>-.5
        if mkt=="AH Home -1.0": return (h-a)>1
        if mkt=="AH Away -1.0": return (a-h)>1
        if "Over" in mkt and "Corners" not in mkt and "Cards" not in mkt \
           and "Home" not in mkt and "Away" not in mkt:
            try:
                line=float(re.search(r"([\d.]+)",mkt.split("Over")[1]).group(1))
                return tot>line
            except: pass
        if "Under" in mkt and "Corners" not in mkt and "Cards" not in mkt:
            try:
                line=float(re.search(r"([\d.]+)",mkt.split("Under")[1]).group(1))
                return tot<line
            except: pass
        if "Home Over" in mkt:
            try: return h>float(re.search(r"([\d.]+)",mkt.split("Over")[1]).group(1))
            except: pass
        if "Away Over" in mkt:
            try: return a>float(re.search(r"([\d.]+)",mkt.split("Over")[1]).group(1))
            except: pass
        if "Exact Goals Total" in mkt:
            try: return tot==int(mkt.split()[-1])
            except: pass
        if "Total Goals Even"==mkt: return tot%2==0
        if "Total Goals Odd"==mkt: return tot%2==1
        if "2-3 Goals"==mkt: return 2<=tot<=3
        if "4-5 Goals"==mkt: return 4<=tot<=5
        if "6-7 Goals"==mkt: return 6<=tot<=7
        if "Goal in 1st Half Yes"==mkt: return tot>0
        if "Goal in 2nd Half Yes"==mkt: return tot>0
        if "First goal: Home"==mkt: return h>0
        if "First goal: Away"==mkt: return a>0
        return False

# ── DATABASE ─────────────────────────────────────────────────
@st.cache_resource
def get_db(): return Database()

class Database:
    def _conn(self): return sqlite3.connect(DB_FILE)
    def __init__(self): self._init()

    def _init(self):
        with self._conn() as c:
            c.executescript("""
            CREATE TABLE IF NOT EXISTS picks(
                match_id TEXT PRIMARY KEY,home TEXT,away TEXT,
                league TEXT,match_date TEXT,match_time TEXT,
                market TEXT,probability REAL,fair_odds REAL,
                confidence REAL,surprise_idx REAL,
                xg_h REAL,xg_a REAL,lambda REAL,
                grade TEXT,signal TEXT,joker_market TEXT,joker_prob REAL,
                mode TEXT,pred_score TEXT,
                h_prob REAL,draw_prob REAL,a_prob REAL,
                status TEXT DEFAULT 'pending',
                actual_result TEXT,did_win INTEGER,
                added_ts TEXT,finished_ts TEXT);
            CREATE TABLE IF NOT EXISTS brain(
                market TEXT PRIMARY KEY,wins INT DEFAULT 0,losses INT DEFAULT 0);
            CREATE TABLE IF NOT EXISTS brain_meta(key TEXT PRIMARY KEY,value TEXT);
            CREATE TABLE IF NOT EXISTS xg_profiles(
                profile_key TEXT,market TEXT,
                wins INT DEFAULT 0,losses INT DEFAULT 0,
                h_bias_sum REAL DEFAULT 0,a_bias_sum REAL DEFAULT 0,
                cnt INT DEFAULT 1,PRIMARY KEY(profile_key,market));
            CREATE TABLE IF NOT EXISTS signals(
                signal TEXT,match_id TEXT,market TEXT,
                result INTEGER,match_date TEXT,PRIMARY KEY(signal,match_id));
            CREATE TABLE IF NOT EXISTS history(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                match_id TEXT,home TEXT,away TEXT,league TEXT,
                match_date TEXT,market TEXT,predicted_prob REAL,
                actual_result TEXT,did_win INTEGER,timestamp TEXT);
            CREATE TABLE IF NOT EXISTS parlay(
                match_id TEXT PRIMARY KEY,home TEXT,away TEXT,
                match_date TEXT,primary_market TEXT,secondary_market TEXT,
                confidence REAL,fair_odds REAL,signal TEXT,added_time TEXT);
            INSERT OR IGNORE INTO brain_meta VALUES('matches_learned','0');
            """)

    def stats(self):
        with self._conn() as c:
            total   =c.execute("SELECT COUNT(*) FROM picks").fetchone()[0]
            pending =c.execute("SELECT COUNT(*) FROM picks WHERE status='pending'").fetchone()[0]
            finished=c.execute("SELECT COUNT(*) FROM picks WHERE status='finished'").fetchone()[0]
            won     =c.execute("SELECT COUNT(*) FROM picks WHERE did_win=1").fetchone()[0]
            lost    =c.execute("SELECT COUNT(*) FROM picks WHERE did_win=0").fetchone()[0]
            today_p =c.execute("SELECT COUNT(*) FROM picks WHERE match_date=? AND status='pending'",
                (date.today().isoformat(),)).fetchone()[0]
            learned =c.execute("SELECT value FROM brain_meta WHERE key='matches_learned'").fetchone()
            n_prof  =c.execute("SELECT COUNT(DISTINCT profile_key) FROM xg_profiles").fetchone()[0]
            n_hist  =c.execute("SELECT COUNT(*) FROM history").fetchone()[0]
            n_mkt   =c.execute("SELECT COUNT(DISTINCT market) FROM brain").fetchone()[0]
        return dict(total=total,pending=pending,finished=finished,won=won,lost=lost,
            today=today_p,learned=int(learned[0]) if learned else 0,
            profiles=n_prof,history=n_hist,mkt_stats=n_mkt)

    def brain_bias(self,mkt):
        with self._conn() as c:
            row=c.execute("SELECT wins,losses FROM brain WHERE market=?",(mkt,)).fetchone()
        if not row: return 1.0
        w,l=row; t=w+l
        if t<5: return 1.0
        r=w/t
        if r>.65: return 1.10
        if r<.40: return 0.85
        return 1.0

    def brain_learn(self,mkt,won,prof="",rh=0,xgh=0,ra=0,xga=0):
        with self._conn() as c:
            c.execute("INSERT OR IGNORE INTO brain(market) VALUES(?)",(mkt,))
            if won: c.execute("UPDATE brain SET wins=wins+1 WHERE market=?",(mkt,))
            else:   c.execute("UPDATE brain SET losses=losses+1 WHERE market=?",(mkt,))
            c.execute("UPDATE brain_meta SET value=CAST(CAST(value AS INT)+1 AS TEXT) WHERE key='matches_learned'")
            if prof:
                c.execute("INSERT OR IGNORE INTO xg_profiles(profile_key,market) VALUES(?,?)",(prof,mkt))
                if won:
                    c.execute("UPDATE xg_profiles SET wins=wins+1,cnt=cnt+1,"
                        "h_bias_sum=h_bias_sum+?,a_bias_sum=a_bias_sum+? "
                        "WHERE profile_key=? AND market=?",(rh-xgh,ra-xga,prof,mkt))
                else:
                    c.execute("UPDATE xg_profiles SET losses=losses+1,cnt=cnt+1 WHERE profile_key=? AND market=?",(prof,mkt))

    def brain_all(self):
        with self._conn() as c:
            rows=c.execute("SELECT market,wins,losses FROM brain ORDER BY (wins+losses) DESC").fetchall()
            lrn=c.execute("SELECT value FROM brain_meta WHERE key='matches_learned'").fetchone()
        return rows,int(lrn[0]) if lrn else 0

    def profile_bias(self,pk,mkt):
        with self._conn() as c:
            row=c.execute("SELECT wins,losses FROM xg_profiles WHERE profile_key=? AND market=?",(pk,mkt)).fetchone()
        if not row or (row[0]+row[1])<3: return 0.0
        w,l=row; return w/(w+l)-.5

    def top_profiles(self,limit=10):
        with self._conn() as c:
            return c.execute("""SELECT profile_key,SUM(wins),SUM(losses),
                AVG(h_bias_sum/NULLIF(cnt,0)),AVG(a_bias_sum/NULLIF(cnt,0)),SUM(cnt)
                FROM xg_profiles GROUP BY profile_key HAVING SUM(cnt)>1
                ORDER BY SUM(cnt) DESC LIMIT ?""",(limit,)).fetchall()

    def add_pick(self,d):
        try:
            with self._conn() as c:
                c.execute("""INSERT OR IGNORE INTO picks
                    (match_id,home,away,league,match_date,match_time,
                     market,probability,fair_odds,confidence,surprise_idx,
                     xg_h,xg_a,lambda,grade,signal,joker_market,joker_prob,mode,pred_score,
                     h_prob,draw_prob,a_prob,status,added_ts)
                    VALUES(:match_id,:home,:away,:league,:match_date,:match_time,
                     :market,:probability,:fair_odds,:confidence,:surprise_idx,
                     :xg_h,:xg_a,:lambda,:grade,:signal,:joker_market,:joker_prob,:mode,:pred_score,
                     :h_prob,:draw_prob,:a_prob,'pending',:added_ts)""",d)
                return c.rowcount>0
        except: return False

    def finish_pick(self,mid,result,won):
        with self._conn() as c:
            c.execute("UPDATE picks SET status='finished',actual_result=?,did_win=?,finished_ts=? WHERE match_id=?",
                (result,1 if won else 0,datetime.now().isoformat(),mid))

    def get_picks(self,status=None,limit=200):
        with self._conn() as c:
            if status: rows=c.execute("SELECT * FROM picks WHERE status=? ORDER BY added_ts DESC LIMIT ?",(status,limit)).fetchall()
            else: rows=c.execute("SELECT * FROM picks ORDER BY added_ts DESC LIMIT ?",(limit,)).fetchall()
        cols=["match_id","home","away","league","match_date","match_time",
              "market","probability","fair_odds","confidence","surprise_idx",
              "xg_h","xg_a","lambda","grade","signal","joker_market","joker_prob","mode","pred_score",
              "h_prob","draw_prob","a_prob","status","actual_result","did_win","added_ts","finished_ts"]
        return [dict(zip(cols,r)) for r in rows]

    def add_signal(self,sig,mid,mkt,mdate):
        with self._conn() as c:
            c.execute("INSERT OR IGNORE INTO signals(signal,match_id,market,result,match_date) VALUES(?,?,?,NULL,?)",(sig,mid,mkt,mdate))

    def upd_signal(self,sig,mid,res):
        with self._conn() as c:
            c.execute("UPDATE signals SET result=? WHERE signal=? AND match_id=?",(res,sig,mid))

    def sig_stats(self):
        with self._conn() as c:
            return c.execute("""SELECT signal,
                SUM(CASE WHEN result IS NULL THEN 1 ELSE 0 END),
                SUM(CASE WHEN result=1 THEN 1 ELSE 0 END),COUNT(*)
                FROM signals GROUP BY signal ORDER BY signal""").fetchall()

    def sig_matches(self,sig):
        with self._conn() as c:
            rows=c.execute("""SELECT s.match_id,s.result,s.market,s.match_date,
                p.home,p.away,p.fair_odds,p.confidence,p.actual_result
                FROM signals s LEFT JOIN picks p ON s.match_id=p.match_id
                WHERE s.signal=? ORDER BY s.match_date DESC""",(sig,)).fetchall()
        cols=["match_id","result","market","match_date","home","away","fair_odds","confidence","actual_result"]
        return [dict(zip(cols,r)) for r in rows]

    def save_history(self,d):
        with self._conn() as c:
            c.execute("""INSERT INTO history(match_id,home,away,league,match_date,market,
                predicted_prob,actual_result,did_win,timestamp)
                VALUES(:match_id,:home,:away,:league,:match_date,:market,
                :predicted_prob,:actual_result,:did_win,:timestamp)""",d)

    def get_history(self,limit=300):
        with self._conn() as c:
            rows=c.execute("SELECT * FROM history ORDER BY timestamp DESC LIMIT ?",(limit,)).fetchall()
        cols=["id","match_id","home","away","league","match_date","market","predicted_prob","actual_result","did_win","timestamp"]
        return [dict(zip(cols,r)) for r in rows]

    def add_parlay(self,d):
        with self._conn() as c:
            try: c.execute("""INSERT OR IGNORE INTO parlay
                (match_id,home,away,match_date,primary_market,secondary_market,
                 confidence,fair_odds,signal,added_time)
                VALUES(:match_id,:home,:away,:match_date,:primary_market,:secondary_market,
                 :confidence,:fair_odds,:signal,:added_time)""",d)
            except: pass

    def get_today_parlay(self):
        with self._conn() as c:
            rows=c.execute("SELECT * FROM parlay WHERE match_date=? ORDER BY confidence DESC",(date.today().isoformat(),)).fetchall()
        cols=["match_id","home","away","match_date","primary_market","secondary_market","confidence","fair_odds","signal","added_time"]
        return [dict(zip(cols,r)) for r in rows]

    def clear_old_parlay(self):
        with self._conn() as c: c.execute("DELETE FROM parlay WHERE match_date<?",(date.today().isoformat(),))

    def safe_picks(self,min_conf=.70):
        return [p for p in self.get_picks(status='pending') if p['confidence']>=min_conf]

# ── PROCESS MATCH ────────────────────────────────────────────
def make_id(home,away,mdate): return f"{home}_{away}_{mdate}".replace(" ","_")

def process(content, db):
    stats  = DataHarvester.parse(content)
    engine = TitanEngine(stats); engine.calculate()
    sim    = Simulator(engine); hits=sim.run()
    cands  = Judge.candidates(hits,engine,db)
    pred   = sim.modal_score()
    if not cands: return None,stats,engine,[]
    best=cands[0]
    main_mkt=best['market']; main_prob=best['prob']; main_odds=best['odds']
    conf=best['score']/100
    joker_mkt,joker_prob=Judge.joker_v3(main_mkt,engine,stats)
    sig=assign_signal(stats,engine.xg_h,engine.xg_a,engine.surprise_idx)
    mid=make_id(stats['home'],stats['away'],stats['match_date'])
    pick=dict(
        match_id=mid,home=stats['home'],away=stats['away'],
        league=stats['league'],match_date=stats['match_date'],match_time=stats['match_time'],
        market=main_mkt,probability=main_prob,fair_odds=main_odds,confidence=conf,
        surprise_idx=engine.surprise_idx,xg_h=engine.xg_h,xg_a=engine.xg_a,
        lambda_=engine.lam(),grade=best['grade'],signal=sig,
        joker_market=joker_mkt,joker_prob=joker_prob,mode=engine.mode(),
        pred_score=f"{pred[0]}-{pred[1]}",
        h_prob=stats['h_prob'],draw_prob=stats['draw_prob'],a_prob=stats['a_prob'],
        added_ts=datetime.now().isoformat()
    )
    # fix key name for db
    pick_db={**pick,"lambda":pick.pop("lambda_")}
    added=db.add_pick(pick_db)
    if added: db.add_signal(sig,mid,main_mkt,stats['match_date'])
    if conf>=ELITE_CONF and engine.surprise_idx<=6.5:
        db.clear_old_parlay()
        db.add_parlay(dict(match_id=mid,home=stats['home'],away=stats['away'],
            match_date=stats['match_date'],primary_market=main_mkt,secondary_market=joker_mkt,
            confidence=conf,fair_odds=main_odds,signal=sig,added_time=datetime.now().isoformat()))
    if stats['actual_result'] and main_mkt in VERIFIABLE:
        rh,ra=stats['actual_result']; won=Judge.verify(main_mkt,rh,ra)
        db.brain_learn(main_mkt,won,engine.profile_key(),rh,engine.xg_h,ra,engine.xg_a)
        db.finish_pick(mid,f"{rh}-{ra}",won)
        db.upd_signal(sig,mid,1 if won else 0)
        db.save_history(dict(match_id=mid,home=stats['home'],away=stats['away'],
            league=stats['league'],match_date=stats['match_date'],market=main_mkt,
            predicted_prob=main_prob,actual_result=f"{rh}-{ra}",
            did_win=1 if won else 0,timestamp=datetime.now().isoformat()))
    return pick_db,stats,engine,cands[:8]

# ── UI HELPERS ───────────────────────────────────────────────
def hdr(db):
    st=db.stats()
    ts=f"{st['today']}/{st['pending']}" if st['pending']>0 else str(st['today'])
    parlay=db.get_today_parlay()
    if parlay:
        tot=1.0
        for p in parlay: tot*=p['fair_odds']
        ostr=f"{tot:.2f}"; ocls="g"
    else: ostr="--"; ocls="gr"
    wr=""
    if st['finished']>0: wr=f" · WR:{st['won']/st['finished']*100:.0f}%"
    st2.markdown(f"""
    <div class="cl-hdr">
      <div>
        <div class="cl-logo">
          <div class="cl-icon">🧠</div>
          <div>CHAOS&nbsp;<span style="color:#3a90ff">LOGIC</span>&nbsp;
            <span style="font-size:1.3rem;color:#3a90ff">v4.0</span></div>
        </div>
        <div class="cl-meta">Poisson · Dual-Leg · Self-Learning · SQLite · Brain:{st['learned']}{wr}</div>
      </div>
      <div style="text-align:right">
        <div class="live-b"><span class="ldot"></span>Live · Local</div>
        <div style="color:#253050;font-size:.7rem;margin-top:5px">TETRIS v18.3 · Signals S09-S19</div>
      </div>
    </div>
    <div class="sg">
      <div class="sc b"><div class="sn b">{st['total']}</div><div class="sl">Processed</div></div>
      <div class="sc y"><div class="sn y">{ts}</div><div class="sl">Upcoming</div><div class="ss">Today/Pending</div></div>
      <div class="sc g"><div class="sn g">{st['finished']}</div><div class="sl">Finished</div></div>
      <div class="sc {ocls}"><div class="sn {ocls}">{ostr}</div><div class="sl">Omega Odds</div></div>
    </div>""",unsafe_allow_html=True)

def render_detail(pick,stats,engine,cands):
    hp=int(pick.get('h_prob',.35)*100); dp=int(pick.get('draw_prob',.33)*100); ap=100-hp-dp
    si=engine.surprise_idx; sic="si-good" if si<3 else("si-med" if si<6 else"si-bad")
    si_txt="OK" if si<3 else("CAUTION" if si<6 else"HIGH")
    si_col="#00ff88" if si<3 else("#ffcc00" if si<6 else"#ff5050")
    lam=engine.lam(); mode=engine.mode()
    mc={"UNDER":"#5a30ff","PROTECTED":"#ffcc00","OVER":"#3a90ff"}.get(mode,"#3a90ff")
    zp=engine.zone_pct(); pred=pick.get('pred_score','?-?')
    main_mkt=pick['market']; prob=pick.get('probability',.5)*100
    odds=pick.get('fair_odds',2.0); joker=pick.get('joker_market','--')
    jp=pick.get('joker_prob',.9)*100; sig=pick.get('signal','S14')
    g=pick.get('grade','B'); conf=pick.get('confidence',.5)*100
    cc="#00ff88" if conf>=70 else("#ffcc00" if conf>=57 else"#ff8844")
    league=pick.get('league',''); xgh=f"{engine.xg_h:.2f}"; xga=f"{engine.xg_a:.2f}"
    prof=engine.profile_key()
    hist_txt=" · ".join([f"{c['market']} ({c['prob']*100:.0f}%)" for c in cands[1:4]]) if len(cands)>1 else "Build more history"

    st2.markdown(f"""
    <div class="md-card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
        <div style="text-align:center;flex:1">
          <div style="font-size:1rem;font-weight:700;color:#dde8ff">{pick['home']}</div>
          <div style="font-size:.7rem;color:#3a6090;margin-top:2px">Home</div>
        </div>
        <div style="background:#080f1e;border:1px solid #1a3060;border-radius:12px;padding:10px 18px;text-align:center;min-width:86px">
          <div style="font-size:1.7rem;font-weight:700;color:#3a90ff;font-family:'JetBrains Mono',monospace;line-height:1">{pred}</div>
          <div style="font-size:.6rem;color:#3a6090;letter-spacing:2px;margin-top:2px">SYSTEM</div>
        </div>
        <div style="text-align:center;flex:1">
          <div style="font-size:1rem;font-weight:700;color:#dde8ff">{pick['away']}</div>
          <div style="font-size:.7rem;color:#3a6090;margin-top:2px">Away</div>
        </div>
      </div>
      <div class="prob-bar">
        <div style="background:linear-gradient(90deg,#3a70ff,#5a90ff);width:{hp}%"></div>
        <div style="background:linear-gradient(90deg,#ffcc00,#ffaa00);width:{dp}%"></div>
        <div style="background:linear-gradient(90deg,#ff5050,#ff3030);flex:1"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:.8rem;font-weight:700;margin-bottom:10px">
        <span style="color:#3a70ff">{hp}%</span><span style="color:#ffcc00">{dp}%</span><span style="color:#ff5050">{ap}%</span>
      </div>
      <div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px">
        <span style="background:#5a30ff;color:#fff;border-radius:7px;padding:4px 10px;font-size:.74rem;font-weight:700">Signal {sig}</span>
        <span style="background:#0a1525;border:1px solid #1a3060;color:#3a6090;border-radius:7px;padding:4px 10px;font-size:.74rem">{pick.get('match_date','')} {pick.get('match_time','')}</span>
        <span style="background:rgba(0,180,80,.15);border:1px solid #00cc55;color:#00ff88;border-radius:7px;padding:4px 10px;font-size:.74rem;font-weight:700">🧠 AI Active</span>
        <span class="pill pgr">{league}</span>
        <span style="color:{gc(g)};font-weight:700;font-size:.8rem;padding:4px">Grade {g}</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:11px">
        <div class="xg-box">
          <div class="xg-lbl">XG Expected</div>
          <div class="xg-val">{xgh} — {xga}</div>
          <div style="font-size:.7rem;color:#3a6090;margin-top:3px">Profile: {prof} · λ={lam:.2f}</div>
        </div>
        <div class="xg-box">
          <div class="xg-lbl">Surprise Index</div>
          <div class="xg-val" style="color:{si_col}">{si:.0f}</div>
          <div style="font-size:.7rem;color:{si_col};margin-top:3px">✓ {si_txt}</div>
        </div>
      </div>
      <!-- DUAL LEG ENGINE -->
      <div class="dl-card">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:9px">
          <div>
            <div style="font-size:.78rem;font-weight:700;letter-spacing:1.5px;color:{mc};text-transform:uppercase">
              ⚡ DUAL-LEG ENGINE · {mode} MODE</div>
            <div style="font-size:.74rem;color:#3a6090;margin-top:3px">λ={lam:.3f} · xG:{xgh}H/{xga}A</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:.95rem;font-weight:700;color:#fff">{main_mkt}</div>
            <div style="font-size:.8rem;color:#00ff88;font-weight:700">{prob:.1f}%</div>
          </div>
        </div>
        <div style="position:relative">
          <div style="height:8px;border-radius:6px;display:flex;overflow:hidden;margin-bottom:4px">
            <div style="background:linear-gradient(90deg,#5a30ff,#7a50ff);flex:3"></div>
            <div style="background:linear-gradient(90deg,#ffaa00,#ff8800);flex:3"></div>
            <div style="background:linear-gradient(90deg,#ff5050,#ff3030);flex:3"></div>
          </div>
          <div style="position:absolute;top:-2px;left:{zp}%;transform:translateX(-50%);
            width:13px;height:13px;background:#fff;border-radius:50%;border:2px solid #3a90ff"></div>
          <div style="display:flex;justify-content:space-between;font-size:.66rem;color:#3a6090;margin-top:6px">
            <span>Under</span><span>Prot.Over</span><span>Caution</span>
          </div>
        </div>
        <div style="font-size:.78rem;color:#5a7aaa;padding:9px;background:#0d1525;
          border-radius:8px;border-left:3px solid #3a90ff;margin-top:9px">{engine.zone_text()}</div>
      </div>
      <!-- SYSTEM PICKS -->
      <div style="font-size:.68rem;letter-spacing:2px;color:#253050;text-transform:uppercase;margin:11px 0 7px">System Picks</div>
      <div class="sp-card">
        <div class="sp-type" style="color:#ffcc00">🏆 MAIN PICK</div>
        <div class="sp-market">{main_mkt}</div>
        <div style="font-size:.84rem"><span style="color:#00ff88;font-weight:700">{prob:.1f}%</span>
          <span style="color:#3a6090"> · Odds </span><span style="color:#ffcc00;font-weight:700">{odds:.2f}</span>
          <span style="color:#3a6090"> · Conf </span><span style="color:{cc};font-weight:700">{conf:.1f}%</span></div>
      </div>
      <div class="sp-card">
        <div class="sp-type" style="color:#aa70ff">🧩 SMART JOKER V3</div>
        <div class="sp-market">{joker}</div>
        <div style="font-size:.84rem"><span style="color:#00ff88;font-weight:700">{jp:.1f}%</span>
          <span style="color:#3a6090"> · Secondary market</span></div>
      </div>
      <div class="sp-card">
        <div class="sp-type" style="color:#3a90ff">🔄 HISTORY PATTERN</div>
        <div style="font-size:.8rem;color:#3a6090;margin-bottom:4px">Similar xG profiles (λ≈{lam:.1f})</div>
        <div style="font-size:.84rem;color:#5a7aaa">{hist_txt}</div>
      </div>
    </div>""",unsafe_allow_html=True)

def render_card(pick,show_result=False,db=None):
    g=pick.get('grade','B'); status=pick.get('status','pending')
    sig=pick.get('signal','S14'); mode=pick.get('mode','PROTECTED')
    conf=pick.get('confidence',.5)*100
    if status=='finished':
        dw=pick.get('did_win')
        stxt=pick.get('actual_result','?-?'); slbl="RESULT"
        sclr="#00ff88" if dw==1 else"#ff5050"
        ptxt="✓ WON" if dw==1 else"✗ LOST"; pcls="pg" if dw==1 else"pr"
    else:
        stxt=f"{pick.get('fair_odds',0):.2f}"; slbl="ODDS"; sclr="#3a90ff"
        ptxt=f"Signal {sig}"; pcls="pp"
    cc="#00ff88" if conf>=70 else("#ffcc00" if conf>=57 else"#ff8844")
    mc={"UNDER":"#5a30ff","PROTECTED":"#ffcc00","OVER":"#3a90ff"}.get(mode,"#3a90ff")
    pred=pick.get('pred_score','?-?'); league=pick.get('league','')
    lam=pick.get('lambda',0)
    st2.markdown(f"""
    <div class="mc">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div style="flex:1;min-width:0">
          <div style="font-size:.96rem;font-weight:700;color:#dde8ff">
            🕐 {pick['home']} <span style="color:#253050">vs</span> {pick['away']}</div>
          <div style="font-size:.74rem;color:#3a6090;margin-top:2px">{pick.get('match_date','')} · {league}</div>
          <div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:3px">
            <span class="pill {pcls}">{ptxt}</span>
            <span class="pill" style="background:rgba(80,80,80,.2);border:1px solid rgba(80,80,80,.3);color:{mc}">⚡ {mode}</span>
            <span class="pill pgr">Pred:{pred}</span>
          </div>
          <div style="margin-top:5px">
            <span class="pill pb">MAIN:{pick.get('market','')[:28]}</span>
            <span class="pill py">🃏 {pick.get('joker_market','')[:22]}</span>
          </div>
          <div style="font-size:.74rem;color:{cc};margin-top:4px">
            Conf:<b>{conf:.1f}%</b> · <span style="color:#253050">xG:{pick.get('xg_h',0):.2f}–{pick.get('xg_a',0):.2f} λ={lam:.2f}</span>
          </div>
        </div>
        <div style="min-width:62px;text-align:center;padding-left:10px">
          <div style="background:#060f1e;border:1px solid #1a3060;border-radius:9px;padding:8px 10px">
            <div style="font-size:1.05rem;font-weight:700;color:{sclr};font-family:'JetBrains Mono',monospace">{stxt}</div>
            <div style="font-size:.6rem;color:#253050;letter-spacing:1px">{slbl}</div>
          </div>
        </div>
      </div>
    </div>""",unsafe_allow_html=True)
    if show_result and status=='pending' and db is not None:
        mid=pick['match_id']
        with st2.expander(f"📥 Result: {pick['home']} vs {pick['away']}"):
            c1,c2=st2.columns([3,1])
            with c1: ri=st2.text_input("Score",key=f"r_{mid}",placeholder="2-1")
            with c2:
                st2.write(""); st2.write("")
                if st2.button("✅",key=f"b_{mid}"):
                    pts=ri.strip().split('-')
                    if len(pts)==2:
                        try:
                            rh,ra=int(pts[0]),int(pts[1]); mkt=pick['market']
                            won=Judge.verify(mkt,rh,ra)
                            prof=f"{round(pick.get('xg_h',1.2)*10)/10:.1f}_{round(pick.get('xg_a',1.2)*10)/10:.1f}"
                            db.brain_learn(mkt,won,prof,rh,pick.get('xg_h',1.2),ra,pick.get('xg_a',1.2))
                            db.finish_pick(mid,f"{rh}-{ra}",won)
                            db.upd_signal(pick.get('signal','S14'),mid,1 if won else 0)
                            db.save_history(dict(match_id=mid,home=pick['home'],away=pick['away'],
                                league=pick.get('league',''),match_date=pick['match_date'],market=mkt,
                                predicted_prob=pick.get('probability',.5),actual_result=f"{rh}-{ra}",
                                did_win=1 if won else 0,timestamp=datetime.now().isoformat()))
                            st2.success("✓ WON — Brain updated!" if won else "✗ LOST — Brain updated.")
                            st2.rerun()
                        except: st2.error("Format: 2-1")
                    else: st2.error("Format: 2-1")

# ── TABS ─────────────────────────────────────────────────────
def tab_matches(db):
    st2.markdown('<div class="sec-hdr">⚽ ALL MATCHES</div>',unsafe_allow_html=True)
    c1,c2=st2.columns([2,3])
    with c1: view=st2.radio("",["Upcoming","Finished","All"],horizontal=True,label_visibility="collapsed")
    with c2: srch=st2.text_input("","",placeholder="🔍 Search team / league...",label_visibility="collapsed")
    sm={"Upcoming":"pending","Finished":"finished","All":None}
    picks=db.get_picks(status=sm[view],limit=300)
    if srch:
        s=srch.lower()
        picks=[p for p in picks if s in p['home'].lower() or s in p['away'].lower() or s in (p.get('league') or'').lower()]
    if not picks: st2.info("No matches. Process a match to start."); return
    for p in picks: render_card(p,show_result=(view in["Upcoming","All"]),db=db)

def tab_safe(db):
    st2.markdown('<div class="sec-hdr">🛡️ SAFE PICKS — Confidence ≥ 70%</div>',unsafe_allow_html=True)
    picks=db.safe_picks(.70)
    if not picks: st2.info("No high-confidence picks yet."); return
    for p in picks: render_card(p,show_result=True,db=db)

def tab_omega(db):
    st2.markdown('<div class="sec-hdr">⚡ OMEGA — Elite Parlay</div>',unsafe_allow_html=True)
    parlay=db.get_today_parlay()
    if not parlay: st2.info("Elite Parlay building... Process matches with confidence ≥ 57.5%"); return
    tot=1.0
    for p in parlay: tot*=p['fair_odds']
    st2.markdown(f"""
    <div style="text-align:center;padding:16px;background:#0d1f3c;
      border:1px solid #ffcc00;border-radius:14px;margin-bottom:14px">
      <div style="font-size:2rem;font-weight:700;color:#ffcc00;font-family:'JetBrains Mono',monospace">{tot:.2f}x</div>
      <div style="color:#3a6090;font-size:.76rem;letter-spacing:2px">TODAY'S PARLAY · {len(parlay)} MATCHES</div>
    </div>""",unsafe_allow_html=True)
    for i,p in enumerate(parlay,1):
        conf=p['confidence']*100; cc="#00ff88" if conf>=70 else("#ffcc00" if conf>=58 else"#ff8844")
        st2.markdown(f"""
        <div class="sec-card" style="margin-bottom:7px">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div><span style="color:#253050;margin-right:5px">#{i}</span><b>{p['home']} vs {p['away']}</b>
              <span class="pill pp" style="margin-left:5px">Signal {p.get('signal','--')}</span></div>
            <div style="text-align:right">
              <div style="color:#ffcc00;font-weight:700;font-family:'JetBrains Mono',monospace">{p['fair_odds']:.2f}</div>
              <div style="color:{cc};font-size:.73rem">{conf:.1f}%</div>
            </div>
          </div>
          <div style="margin-top:7px">
            <span class="pill pb">⚡ {p['primary_market']}</span>
            <span class="pill py">🃏 {p['secondary_market']}</span>
          </div>
        </div>""",unsafe_allow_html=True)

def tab_signals(db):
    sig_data=db.sig_stats(); picks=db.get_picks()
    total=len(picks); pending=sum(1 for p in picks if p['status']=='pending')
    done=sum(1 for p in picks if p['status']=='finished')
    n_sigs=len(sig_data)
    st2.markdown(f"""
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px">
      <div class="sc y"><div class="sn y" style="font-size:1.5rem">{n_sigs}</div><div class="sl">Signals</div></div>
      <div class="sc b"><div class="sn b" style="font-size:1.5rem">{total}</div><div class="sl">Total</div></div>
      <div class="sc gr"><div class="sn gr" style="font-size:1.5rem">{pending}</div><div class="sl">Upcoming</div></div>
      <div class="sc g"><div class="sn g" style="font-size:1.5rem">{done}</div><div class="sl">Done</div></div>
    </div>""",unsafe_allow_html=True)
    srch=st2.text_input("","",placeholder="🔍 Search signals...",label_visibility="collapsed")
    if not sig_data: st2.info("No signals yet."); return
    for sig,pend,wins,tot in sig_data:
        if srch and srch.upper() not in sig: continue
        info=SIGNAL_DEFS.get(sig,{"name":sig,"desc":""})
        wr=wins/tot*100 if tot>0 else 0
        wc="#00ff88" if wr>=70 else("#ffcc00" if wr>=50 else"#ff5050")
        bf=min(100,int(wr))
        pb=f'<span class="sb-p">↑{pend}</span>' if pend>0 else""
        wb=f'<span class="sb-w">{wins}✓</span>' if wins>0 else""
        st2.markdown(f"""
        <div class="sig-row">
          <div style="flex:1">
            <div class="sig-code">{sig}</div>
            <div style="font-size:.8rem;color:#5a7aaa;margin-top:2px">{info['name']}
              <span style="color:#253050;font-size:.73rem"> · {info['desc']}</span></div>
            <div style="width:100px;height:5px;background:#0a1525;border-radius:4px;margin-top:4px">
              <div style="width:{bf}%;height:5px;border-radius:4px;background:{wc}"></div></div>
          </div>
          <div style="display:flex;gap:5px;align-items:center;flex-shrink:0;margin-left:10px">
            {pb}{wb}<span class="sb-t">{tot}</span>
            <span style="color:{wc};font-weight:700;font-size:.82rem;min-width:34px;text-align:right">{wr:.0f}%</span>
          </div>
        </div>""",unsafe_allow_html=True)
        with st2.expander(f"  {sig} — matches"):
            matches=db.sig_matches(sig)
            if not matches: st2.write("No matches yet")
            for m in matches[:15]:
                res=m['result']
                rt,rc=("⏳ Pending","#ffcc00") if res is None else(("✓ WIN","#00ff88") if res==1 else("✗ LOSS","#ff5050"))
                act=f" → {m['actual_result']}" if m.get('actual_result') else""
                st2.markdown(f"""<div style="padding:6px 0;border-bottom:1px solid #1a3060;font-size:.81rem">
                  <b>{m.get('home','?')} vs {m.get('away','?')}</b>
                  <span class="pill pb">{m['market']}</span>
                  <span style="color:{rc}"> {rt}{act}</span>
                  <span style="color:#253050"> · {m['match_date']}</span>
                </div>""",unsafe_allow_html=True)

def tab_coupon(db):
    st2.markdown('<div class="sec-hdr">🎫 COUPON BUILDER</div>',unsafe_allow_html=True)
    pending=db.get_picks(status='pending')
    if not pending: st2.info("No picks. Process matches first."); return
    today=date.today().isoformat()
    c1,c2=st2.columns(2)
    with c1: opt=st2.selectbox("Pool",["Today's picks","All pending","High conf only"])
    with c2: n=st2.number_input("Max picks",2,12,5)
    if opt=="Today's picks": pool=[p for p in pending if p.get('match_date')==today]
    elif opt=="High conf only": pool=[p for p in pending if p['confidence']>=.65]
    else: pool=pending
    pool.sort(key=lambda x:x['confidence'],reverse=True); selected=pool[:n]
    if not selected: st2.info("No picks in pool."); return
    tot=1.0
    for p in selected: tot*=p['fair_odds']
    st2.markdown(f"""
    <div style="text-align:center;padding:16px;background:#0d1f3c;border:1px solid #ffcc00;
      border-radius:13px;margin-bottom:14px">
      <div style="font-size:1.9rem;font-weight:700;color:#ffcc00;font-family:'JetBrains Mono',monospace">{tot:.2f}x</div>
      <div style="color:#3a6090;font-size:.76rem;letter-spacing:2px">COUPON TOTAL · {len(selected)} PICKS</div>
    </div>""",unsafe_allow_html=True)
    for i,p in enumerate(selected,1):
        conf=p['confidence']*100; cc="#00ff88" if conf>=70 else("#ffcc00" if conf>=57 else"#ff8844")
        st2.markdown(f"""
        <div class="sec-card" style="margin-bottom:7px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div><span style="color:#253050;margin-right:5px">#{i}</span><b>{p['home']} vs {p['away']}</b>
              <span style="color:#3a6090;font-size:.74rem;margin-left:5px">{p.get('match_date','')}</span></div>
            <div style="color:#ffcc00;font-weight:700;font-family:'JetBrains Mono',monospace">{p['fair_odds']:.2f}</div>
          </div>
          <div style="margin-top:5px">
            <span class="pill pb">{p['market']}</span>
            <span style="color:{cc};font-size:.76rem;margin-left:6px">{conf:.1f}%</span>
            <span class="pill pp">Sig {p.get('signal','--')}</span>
          </div>
        </div>""",unsafe_allow_html=True)

def tab_db(db):
    st_data=db.stats(); brain_rows,learned=db.brain_all(); profiles=db.top_profiles()
    st2.markdown(f"""
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <div style="font-size:.95rem;font-weight:700;color:#fff;letter-spacing:2px">LEARNING DATABASE</div>
      <div style="color:#00ff88;font-size:.77rem">🌐 Local · SQLite · Free</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:13px">
      <div class="sec-card" style="text-align:center">
        <div style="font-size:1.7rem;font-weight:700;color:#3a90ff;font-family:'JetBrains Mono',monospace">{st_data['total']}</div>
        <div style="color:#3a6090;font-size:.72rem">Matches Processed</div></div>
      <div class="sec-card" style="text-align:center">
        <div style="font-size:1.7rem;font-weight:700;color:#aa70ff;font-family:'JetBrains Mono',monospace">{st_data['profiles']}</div>
        <div style="color:#3a6090;font-size:.72rem">Learning Profiles</div></div>
      <div class="sec-card" style="text-align:center">
        <div style="font-size:1.7rem;font-weight:700;color:#3a90ff;font-family:'JetBrains Mono',monospace">{st_data['history']}</div>
        <div style="color:#3a6090;font-size:.72rem">History Records</div></div>
      <div class="sec-card" style="text-align:center">
        <div style="font-size:1.7rem;font-weight:700;color:#ffcc00;font-family:'JetBrains Mono',monospace">{st_data['mkt_stats']}</div>
        <div style="color:#3a6090;font-size:.72rem">Market Stats</div></div>
    </div>""",unsafe_allow_html=True)
    if profiles:
        st2.markdown('<div class="sec-card"><div class="sec-hdr">📊 TOP LEARNING PROFILES</div>',unsafe_allow_html=True)
        for pk,w,l,hb,ab,cnt in profiles:
            if not pk: continue
            wr=w/(w+l)*100 if (w+l)>0 else 0; wc="#00ff88" if wr>=65 else("#ffcc00" if wr>=50 else"#ff5050")
            hbs=f"{(hb or 0):+.3f}"; abs_=f"{(ab or 0):+.3f}"
            st2.markdown(f"""<div style="display:flex;align-items:center;padding:9px 0;border-bottom:1px solid #1a3060">
              <div style="font-family:'JetBrains Mono',monospace;color:#fff;font-weight:700;font-size:.88rem;min-width:95px">{pk}</div>
              <div style="font-size:.75rem"><span style="color:#3a90ff">H:{hbs}</span>&nbsp;&nbsp;<span style="color:#ff7070">A:{abs_}</span></div>
              <div style="margin-left:auto;display:flex;align-items:center;gap:9px">
                <span style="color:{wc};font-size:.78rem;font-weight:700">{wr:.0f}%</span>
                <span style="color:#253050;font-size:.73rem">{cnt}×</span>
              </div>
            </div>""",unsafe_allow_html=True)
        st2.markdown('</div>',unsafe_allow_html=True)
    st2.markdown("---")
    sub=st2.radio("",["📋 Picks","🧠 Brain","📜 History","⚙️ Tools"],horizontal=True,label_visibility="collapsed")
    if sub=="📋 Picks":
        picks=db.get_picks(limit=500)
        if picks:
            df=pd.DataFrame(picks)
            cols=['home','away','league','match_date','market','probability','fair_odds','confidence','grade','signal','mode','pred_score','status','actual_result','did_win']
            df2=df[[c for c in cols if c in df.columns]].copy()
            df2['probability']=df2['probability'].apply(lambda x:f"{x*100:.1f}%")
            df2['confidence']=df2['confidence'].apply(lambda x:f"{x*100:.1f}%")
            st2.dataframe(df2,use_container_width=True,hide_index=True,height=380)
        else: st2.info("No picks yet.")
    elif sub=="🧠 Brain":
        if brain_rows:
            data=[{"Market":m,"Wins":w,"Losses":l,"Total":w+l,"WR":f"{w/(w+l)*100:.0f}%" if (w+l)>0 else"N/A"}for m,w,l in brain_rows]
            st2.dataframe(pd.DataFrame(data),use_container_width=True,hide_index=True,height=380)
        else: st2.info("Brain empty. Enter results to start learning.")
    elif sub=="📜 History":
        hist=db.get_history(300)
        if hist:
            df=pd.DataFrame(hist)
            df['did_win']=df['did_win'].apply(lambda x:"✓ WIN" if x==1 else"✗ LOSS")
            df['predicted_prob']=df['predicted_prob'].apply(lambda x:f"{x*100:.1f}%")
            st2.dataframe(df[['home','away','league','match_date','market','predicted_prob','actual_result','did_win']],
                use_container_width=True,hide_index=True,height=380)
        else: st2.info("No history yet.")
    elif sub=="⚙️ Tools":
        c1,c2=st2.columns(2)
        with c1:
            if st2.button("🗑️ Clear Old Parlay"): db.clear_old_parlay(); st2.success("Done.")
        with c2:
            picks=db.get_picks(limit=1000)
            if picks and st2.button("⬇️ Export CSV"):
                csv=pd.DataFrame(picks).to_csv(index=False)
                st2.download_button("Download",csv,"omega_picks.csv","text/csv")
        st2.markdown("---")
        with st2.expander("🔴 Danger Zone"):
            st2.error("Irreversible!")
            conf=st2.text_input("Type DELETE")
            if conf=="DELETE" and st2.button("Delete ALL data"):
                with db._conn() as c:
                    c.executescript("DELETE FROM picks;DELETE FROM parlay;DELETE FROM signals;"
                        "DELETE FROM brain;DELETE FROM xg_profiles;DELETE FROM history;"
                        "UPDATE brain_meta SET value='0' WHERE key='matches_learned';")
                st2.success("All data deleted."); st2.rerun()

# ── MAIN ─────────────────────────────────────────────────────
# Use st alias to avoid conflict with local var name
st2 = st

def main():
    db = get_db()
    hdr(db)
    st2.markdown("""
    <div class="inp-card">
      <div class="inp-title">📋 Paste Forebet Match Page</div>
      <div class="inp-hint">(copy full Forebet page text — teams, date, league, stats, form, result...)</div>
    </div>""",unsafe_allow_html=True)
    match_text=st2.text_area("",height=155,placeholder=(
        "Paste full Forebet page text here...\n\n"
        "Example:\nFerro Carril Oeste VS Almirante Brown\n"
        "Argentina Nacional B\n28/04/2026 22:30\n"
        "35 32 33 ... Avg. per game 0.78 ...\n"
        "Win 2 33% Draw 1 17% Lost 3 50%..."),
        label_visibility="collapsed",key="minput")
    proc=st2.button("⚡  Process Match",key="proc")
    if proc:
        if not match_text.strip(): st2.error("Please paste match data first.")
        else:
            with st2.spinner("🧠 Running Dual-Leg Titan AI — 20,000 simulations..."):
                result=process(match_text,db)
            if result[0] is None: st2.warning("No suitable market found. Check data format.")
            else:
                pick,stats,engine,cands=result
                st2.success(f"✅ Processed! League: **{stats.get('league','?')}** · "
                    f"Signal: **{pick.get('signal','?')}** · Mode: **{pick.get('mode','?')}** · "
                    f"Profile: **{engine.profile_key()}**")
                render_detail(pick,stats,engine,cands)
    tabs=st2.tabs(["🏠 Matches","🛡️ Safe","⚡ Omega","🎫 Coupon","📡 Signals","🗄️ DB"])
    with tabs[0]: tab_matches(db)
    with tabs[1]: tab_safe(db)
    with tabs[2]: tab_omega(db)
    with tabs[3]: tab_coupon(db)
    with tabs[4]: tab_signals(db)
    with tabs[5]: tab_db(db)

if __name__=="__main__":
    main()
