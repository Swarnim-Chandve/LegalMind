import time
import logging
from datetime import datetime
from rag.llm_openai import ask_llm_analysis

logger = logging.getLogger(__name__)


class ComplianceAgent:

    def run(self, state):
        t0 = time.perf_counter()

        context = state.get("context", "")

        if not context:
            state["analysis"] = "No relevant context was found in the knowledge base."
        else:
            try:
                state["analysis"] = ask_llm_analysis(context, "compliance")
            except Exception as exc:
                logger.error("ComplianceAgent LLM call failed: %s", exc)
                state["analysis"] = f"Compliance analysis unavailable. Raw context:\n{context}"

        duration_ms = round((time.perf_counter() - t0) * 1000)
        state["events"].append({
            "agent": "Compliance Agent",
            "time": datetime.now().strftime("%H:%M:%S"),
            "duration_ms": duration_ms,
        })
        return state
