import streamlit as st
import random
import time

# --- Page Configuration ---
st.set_page_config(
    page_title="Football Predictor Pro — AI VIP",
    page_icon="⚽",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- Custom Styling (Dark/Modern Sports Theme) ---
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
        border-radius: 8px;
        padding: 0.6rem 1.5rem;
        border: none;
        box-shadow: 0 4px 14px rgba(255, 75, 43, 0.4);
        transition: all 0.3s ease;
    }
    .stButton>button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(255, 75, 43, 0.6);
    }
    .report-card {
        background: linear-gradient(145deg, #1e2530, #141821);
        padding: 24px;
        border-radius: 16px;
        border: 1px solid #2d3748;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .metric-box {
        background-color: #1a202c;
        padding: 15px;
        border-radius: 12px;
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

# --- Session State for New Simulation Option ---
if 'run_simulation' not in st.session_state:
    st.session_state.run_simulation = False

# --- App Header ---
st.markdown("<h1 style='text-align: center; color: #FF4B2B;'>⚽ FOOTBALL PREDICTOR PRO — VIP AI</h1>", unsafe_allow_html=True)
st.markdown("<p style='text-align: center; color: #a0aec0;'>Advanced Offline Match Intelligence & Betting Market Simulations</p>", unsafe_allow_html=True)
st.markdown("---")

# --- Sidebar Inputs ---
st.sidebar.header("⚙️ Match Parameters")

with st.sidebar.form("prediction_form"):
    st.subheader("Team Forms (Last 5)")
    home_form = st.text_input("Home Form (W/D/L)", value="WDLDW").strip().upper()
    away_form = st.text_input("Away Form (W/D/L)", value="LWDWL").strip().upper()
    h2h_form  = st.text_input("H2H Last 3 (Home view)", value="LDL").strip().upper()
    
    st.subheader("Goals Statistics")
    col_s1, col_s2 = st.columns(2)
    with col_s1:
        home_gs = st.number_input("Home Avg Scored", min_value=0.0, max_value=10.0, value=1.5, step=0.1)
        home_gc = st.number_input("Home Avg Conceded", min_value=0.0, max_value=10.0, value=1.2, step=0.1)
    with col_s2:
        away_gs = st.number_input("Away Avg Scored", min_value=0.0, max_value=10.0, value=1.3, step=0.1)
        away_gc = st.number_input("Away Avg Conceded", min_value=0.0, max_value=10.0, value=1.4, step=0.1)
        
    st.subheader("Market Odds & Risk")
    odds_str = st.text_input("Odds (Home Draw Away)", value="2.10 3.30 3.40")
    surprise = st.slider("Surprise Factor (Volatility)", min_value=0.0, max_value=0.2, value=0.05, step=0.01)
    
    submitted = st.form_submit_button("🚀 Run AI Analysis")
    if submitted:
        st.session_state.run_simulation = True

# --- Reset / New Simulation Button (Outside Form) ---
if st.session_state.run_simulation:
    if st.button("🔄 Start New Simulation / Reset"):
        st.session_state.run_simulation = False
        st.rerun()

# --- Main Logic & Report Display ---
if not st.session_state.run_simulation:
    st.info("👈 Please fill in the match statistics on the sidebar and click **'Run AI Analysis'** to generate the professional VIP report.")
else:
    # --- Data Prep ---
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

    # --- Compute Internal Scores ---
    base_home = (home_mom * 0.4 + h2h_mom * 0.3 + home_gs/(away_gc+0.01)*0.3)
    base_away = (away_mom * 0.4 + (1-h2h_mom)*0.3 + away_gs/(home_gc+0.01)*0.3)
    total_goals = home_gs + away_gs

    # --- Generate Base Probabilities ---
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

    # --- Normalize and Choose Top Market ---
    for k in market_scores:
        market_scores[k] = market_confidence(market_scores[k], surprise)
    best_market = max(market_scores, key=market_scores.get)
    confidence = round(market_scores[best_market]*100, 1)

    # --- Simulate Scenarios with Spinner ---
    with st.spinner("Running Monte Carlo simulations across 300 tactical models..."):
        time.sleep(0.4)
        sim_results = simulate_markets(data, 300)
        stable_market, stable_rate = sim_results[0]
        stability = round((stable_rate/300)*100, 1)

    # --- Safety Adjustments (Preserved from original script) ---
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

    # --- Beautiful Report Presentation ---
    st.markdown("<div class='report-card'>", unsafe_allow_html=True)
    st.markdown("### 🏟️ VIP Match Intelligence Report")
    st.markdown("---")

    # Metrics Row
    m1, m2, m3, m4 = st.columns(4)
    with m1:
        st.markdown(f"<div class='metric-box'><h4>🎯 VIP Final Pick</h4><h2 style='color:#FF4B2B;'>{best_market}</h2></div>", unsafe_allow_html=True)
    with m2:
        st.markdown(f"<div class='metric-box'><h4>📊 Confidence</h4><h2 style='color:#48bb78;'>{confidence}%</h2></div>", unsafe_allow_html=True)
    with m3:
        st.markdown(f"<div class='metric-box'><h4>🧠 Stability</h4><h2 style='color:#4299e1;'>{stability}%</h2></div>", unsafe_allow_html=True)
    with m4:
        st.markdown(f"<div class='metric-box'><h4>⚡ Top Sim Market</h4><h2 style='color:#ed8936;'>{stable_market}</h2></div>", unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # Summary Details
    col_d1, col_d2 = st.columns(2)
    with col_d1:
        st.markdown("#### 📋 Team Metrics & Form")
        st.write(f"- **Home Form (Last 5):** `{home_form}` (Momentum: {home_mom:.2f})")
        st.write(f"- **Away Form (Last 5):** `{away_form}` (Momentum: {away_mom:.2f})")
        st.write(f"- **H2H Momentum (Last 3):** `{h2h_form}`")
    with col_d2:
        st.markdown("#### ⚽ Goal Profiles & Odds")
        st.write(f"- **Home Goals (Scored/Conceded):** {home_gs} / {home_gc}")
        st.write(f"- **Away Goals (Scored/Conceded):** {away_gs} / {away_gc}")
        st.write(f"- **Market Odds:** `{odds_str}` | **Surprise Factor:** {surprise}")

    st.markdown("---")
    
    # Expert Insight Banner
    st.markdown("#### 💡 Tactical Recommendation & Analysis")
    if best_market in ["W1", "W2"]:
        st.success("📈 **Trend Alert:** Possible early goal detected — consider HT markets (1/1 or 2/2). Strong momentum edge for the favored side.")
    elif "Over" in best_market:
        st.info("🔥 **Style Alert:** Expect open play and multiple scoring chances from both sides. High offensive output projected.")
    elif best_market in ["Under 2.5", "Under 3.5"]:
        st.warning("🛡️ **Tactical Alert:** Defensive match expected with tactical control — low goals anticipated, safer under bet.")
    elif "BTTS" in best_market:
        st.success("⚡ **Goal Alert:** Both teams display strong attacking momentum with vulnerable backlines.")
    elif best_market == "X":
        st.info("🧊 **Balance Alert:** Balanced forces on the pitch — low-risk draw scenario highly likely.")
    elif best_market in ["1X", "X2"]:
        st.warning("🔒 **Coverage Alert:** High volatility detected — safer double chance option recommended to secure value.")
    else:
        st.markdown("🎲 **Neutral Alert:** Match could swing both ways; cautious double chance advised.")

    st.markdown("</div>", unsafe_allow_html=True)