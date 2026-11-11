import streamlit as st
import random
import time

# --- Page Configuration ---
st.set_page_config(
    page_title="Football Predictor Pro — AI VIP",
    page_icon="⚽",
    layout="centered",
    initial_sidebar_state="collapsed"
)

# --- Custom Styling for Mobile & Compact Report ---
st.markdown("""
<style>
    .main {
        background-color: #0e1117;
        color: #ffffff;
    }
    .stButton>button {
        background: linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%);
        color: white;
        font-weight: bold;
        border-radius: 10px;
        padding: 0.7rem 1.5rem;
        border: none;
        width: 100%;
        box-shadow: 0 4px 14px rgba(255, 75, 43, 0.4);
        transition: all 0.3s ease;
    }
    .stButton>button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(255, 75, 43, 0.6);
    }
    .compact-card {
        background: linear-gradient(145deg, #1e2530, #141821);
        padding: 16px;
        border-radius: 12px;
        border: 1px solid #2d3748;
        box-shadow: 0 6px 20px rgba(0,0,0,0.4);
        margin-bottom: 12px;
    }
    .metric-pill {
        background-color: #1a202c;
        padding: 10px 8px;
        border-radius: 8px;
        text-align: center;
        border: 1px solid #2d3748;
    }
</style>
""", unsafe_allow_html=True)

# --- Helper Functions ---
def momentum(form):
    """Convert form string like 'WDLWL' into momentum score (0-1)."""
    if not form: return 0.5
    score_map = {'W': 1, 'D': 0.5, 'L': 0}
    vals = [score_map.get(c.upper(), 0.5) for c in form.strip()]
    return sum(vals)/len(vals) if vals else 0.5

def market_confidence(base, surprise):
    """Add random fluctuation controlled by surprise factor."""
    delta = random.uniform(-surprise, surprise)
    return max(0, min(1, base + delta))

def simulate_markets(data, runs=300):
    """Simulate different conditions to test stability."""
    results = {}
    for _ in range(runs):
        h, a = data['home_mom'], data['away_mom']
        h_goal = data['home_attack'] * random.uniform(0.8, 1.2)
        a_goal = data['away_attack'] * random.uniform(0.8, 1.2)
        btts = h_goal > 1.1 and a_goal > 0.8
        pick = None
        if abs(h_goal - a_goal) < 0.2:
            pick = "X"
        elif h_goal > a_goal:
            pick = random.choice(["W1", "1X", "Over 1.5"])
        else:
            pick = random.choice(["W2", "X2", "Over 1.5"])
        if btts and random.random() < 0.4: pick = "BTTS Yes"
        results[pick] = results.get(pick, 0) + 1
    best = sorted(results.items(), key=lambda x: x[1], reverse=True)
    return best

# --- Session State Management ---
if 'page' not in st.session_state:
    st.session_state.page = 'input'

# --- PAGE 1: DATA INPUT INTERFACE ---
if st.session_state.page == 'input':
    st.markdown("<h2 style='text-align: center; color: #FF4B2B;'>⚽ Match Data Input</h2>", unsafe_allow_html=True)
    st.markdown("<p style='text-align: center; color: #a0aec0; font-size: 14px;'>Enter team statistics to generate smart predictions</p>", unsafe_allow_html=True)
    
    with st.form("match_input_form"):
        st.markdown("### 📋 Last 5 Matches Form (W/D/L)")
        col_f1, col_f2 = st.columns(2)
        with col_f1:
            home_form = st.text_input("Home Form", value="WDLDW").strip().upper()
        with col_f2:
            away_form = st.text_input("Away Form", value="LWDWL").strip().upper()
            
        h2h_form = st.text_input("H2H Last 3 (Home view)", value="LDL").strip().upper()
        
        st.markdown("### ⚽ Goals Statistics (Averages)")
        col_g1, col_g2 = st.columns(2)
        with col_g1:
            home_gs_str = st.text_input("Home Avg Goals Scored", value="1.5")
            home_gc_str = st.text_input("Home Avg Goals Conceded", value="1.2")
        with col_g2:
            away_gs_str = st.text_input("Away Avg Goals Scored", value="1.3")
            away_gc_str = st.text_input("Away Avg Goals Conceded", value="1.4")
            
        st.markdown("### 💰 Market Odds")
        odds_str = st.text_input("Match Odds (Home Draw Away)", value="2.10 3.30 3.40")
        
        submitted = st.form_submit_button("🚀 Run AI Analysis & Prediction")
        if submitted:
            try:
                st.session_state.home_gs = float(home_gs_str)
                st.session_state.home_gc = float(home_gc_str)
                st.session_state.away_gs = float(away_gs_str)
                st.session_state.away_gc = float(away_gc_str)
                st.session_state.home_form = home_form
                st.session_state.away_form = away_form
                st.session_state.h2h_form = h2h_form
                st.session_state.odds_str = odds_str
                st.session_state.surprise = round(random.uniform(0.03, 0.08), 3)
                
                st.session_state.page = 'report'
                st.rerun()
            except ValueError:
                st.error("⚠️ Please make sure that goals and odds are valid numbers.")

# --- PAGE 2: COMPACT REPORT INTERFACE ---
elif st.session_state.page == 'report':
    home_form = st.session_state.home_form
    away_form = st.session_state.away_form
    h2h_form = st.session_state.h2h_form
    home_gs = st.session_state.home_gs
    home_gc = st.session_state.home_gc
    away_gs = st.session_state.away_gs
    away_gc = st.session_state.away_gc
    odds_str = st.session_state.odds_str
    surprise = st.session_state.surprise

    try:
        odds = [float(x) for x in odds_str.split()]
    except:
        odds = [2.10, 3.30, 3.40]
        
    home_mom, away_mom = momentum(home_form), momentum(away_form)
    h2h_mom = momentum(h2h_form)

    data = {
        "home_mom": home_mom, "away_mom": away_mom,
        "home_attack": home_gs, "away_attack": away_gs,
        "home_def": home_gc, "away_def": away_gc,
        "h2h": h2h_mom
    }

    base_home = (home_mom * 0.4 + h2h_mom * 0.3 + home_gs/(away_gc+0.01)*0.3)
    base_away = (away_mom * 0.4 + (1-h2h_mom)*0.3 + away_gs/(home_gc+0.01)*0.3)
    total_goals = home_gs + away_gs

    market_scores = {
        "W1": base_home,
        "W2": base_away,
        "X": 1 - abs(base_home - base_away),
        "Over 2.5": total_goals/3,
        "Under 2.5": 1 - (total_goals/3),
        "BTTS Yes": (home_gs>0.8 and away_gs>0.8)*1.0,
        "1X": (base_home + (1 - base_away))/2,
        "X2": (base_away + (1 - base_home))/2,
        "12": 1 - market_confidence(0.3, surprise),
        "Over 1.5": (total_goals/2),
    }

    for k in market_scores:
        market_scores[k] = market_confidence(market_scores[k], surprise)
    best_market = max(market_scores, key=market_scores.get)
    confidence = round(market_scores[best_market]*100, 1)

    with st.spinner("Running AI simulation..."):
        time.sleep(0.3)
        sim_results = simulate_markets(data, 300)
        stable_market, stable_rate = sim_results[0]
        stability = round((stable_rate/300)*100, 1)

    # Safety Adjustments (Original Logic)
    if best_market == "Over 1.5" and stable_market == "X":
        best_market = "Under 2.5"
    if best_market in ["BTTS Yes", "X"] and (stable_rate / 300) > 0.3:
        best_market = "Under 3.5"
    if best_market == "Over 2.5" and stable_market in ["W1", "W2"]:
        best_market = "Over 1.5"
    if best_market == "W1" and confidence < 60:
        best_market = "1X"
    elif best_market == "W2" and confidence < 60:
        best_market = "X2"
    if best_market == "BTTS No" and stable_market == "Under 2.5":
        best_market = "Under 2.5"

    # --- Compact Report Display ---
    st.markdown("<h3 style='text-align: center; color: #FF4B2B;'>🏟️ VIP Match Report</h3>", unsafe_allow_html=True)
    
    st.markdown("<div class='compact-card'>", unsafe_allow_html=True)
    
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.markdown(f"<div class='metric-pill'><span style='font-size:11px; color:#a0aec0;'>Pick</span><br><b style='color:#FF4B2B; font-size:14px;'>{best_market}</b></div>", unsafe_allow_html=True)
    with c2:
        st.markdown(f"<div class='metric-pill'><span style='font-size:11px; color:#a0aec0;'>Confidence</span><br><b style='color:#48bb78; font-size:14px;'>{confidence}%</b></div>", unsafe_allow_html=True)
    with c3:
        st.markdown(f"<div class='metric-pill'><span style='font-size:11px; color:#a0aec0;'>Stability</span><br><b style='color:#4299e1; font-size:14px;'>{stability}%</b></div>", unsafe_allow_html=True)
    with c4:
        st.markdown(f"<div class='metric-pill'><span style='font-size:11px; color:#a0aec0;'>Top Sim</span><br><b style='color:#ed8936; font-size:13px;'>{stable_market}</b></div>", unsafe_allow_html=True)

    st.markdown("<hr style='margin: 12px 0; border-color: #2d3748;'>", unsafe_allow_html=True)

    st.markdown(f"<p style='font-size: 13px; margin-bottom: 6px;'><b>🏠 Home:</b> {home_form} (Goals: {home_gs}/{home_gc})</p>", unsafe_allow_html=True)
    st.markdown(f"<p style='font-size: 13px; margin-bottom: 6px;'><b>✈️ Away:</b> {away_form} (Goals: {away_gs}/{away_gc}) | <b>H2H:</b> {h2h_form}</p>", unsafe_allow_html=True)
    
    st.markdown("<hr style='margin: 12px 0; border-color: #2d3748;'>", unsafe_allow_html=True)

    # Insight analysis
    if best_market in ["W1", "W2"]:
        st.success("📈 **Trend:** Possible early goal — consider HT markets (1/1 or 2/2).")
    elif "Over" in best_market:
        st.info("🔥 **Trend:** Expect open play and multiple scoring chances from both sides.")
    elif best_market in ["Under 2.5", "Under 3.5"]:
        st.warning("🛡️ **Trend:** Defensive match expected — low goals, safer under bet.")
    elif "BTTS" in best_market:
        st.success("⚡ **Trend:** Both teams have strong attacking momentum.")
    elif best_market == "X":
        st.info("🧊 **Trend:** Balanced forces — low-risk draw scenario likely.")
    elif best_market in ["1X", "X2"]:
        st.warning("🔒 **Trend:** Coverage for draw — safer double chance option.")
    else:
        st.markdown("🎲 **Trend:** Match could swing both ways; safer double chance advised.")

    st.markdown("</div>", unsafe_allow_html=True)

    # Button to start new simulation without closing app
    if st.button("🔄 Simulate New Match (Edit Data)"):
        st.session_state.page = 'input'
        st.rerun()