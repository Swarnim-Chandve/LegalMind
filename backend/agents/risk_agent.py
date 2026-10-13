import time
import logging
from datetime import datetime
from rag.llm_openai import ask_llm_risk

logger = logging.getLogger(__name__)


class RiskAgent:

    def run(self, state):
        t0 = time.perf_counter()

        context  = state.get("context", "")
        analysis = state.get("analysis", "")

        try:
            result = ask_llm_risk(context, analysis)
            state["risk_level"]           = result["risk_level"]
            state["issues"]               = result["issues"]
            state["risk_plain_english"]   = result.get("plain_english_summary", "")
            state["redlines"]             = result.get("redlines", [])
        except Exception as exc:
            logger.error("RiskAgent failed: %s", exc)
            state["risk_level"]         = "Unknown"
            state["issues"]             = []
            state["risk_plain_english"] = "Risk assessment could not be completed."
            state["redlines"]           = []

        duration_ms = round((time.perf_counter() - t0) * 1000)
        state["events"].append({
            "agent": "Risk Agent",
            "time": datetime.now().strftime("%H:%M:%S"),
            "duration_ms": duration_ms,
        })
        return state
