import time
from datetime import datetime


class GeneralAgent:

    def run(self, state):
        t0 = time.perf_counter()

        question = state.get("question", "").strip()
        state["analysis"] = (
            "This app is designed for legal document analysis and legal question answering. "
            "Please ask about a contract, NDA, employment agreement, privacy policy, "
            "compliance issue, or other legal topic."
        )
        state["answer"] = (
            f"I can help with legal document review and legal questions, but '{question}' is outside the scope of this legal analysis tool. "
            "Please ask about a contract clause, compliance issue, termination, obligations, risk, or policy question."
        )
        state["risk_level"] = "Unknown"
        state["issues"] = []
        state["risk_plain_english"] = "This question is outside the legal-document workflow."
        state["sources"] = []

        duration_ms = round((time.perf_counter() - t0) * 1000)
        state["events"].append({
            "agent": "General Agent",
            "time": datetime.now().strftime("%H:%M:%S"),
            "duration_ms": duration_ms,
        })
        return state
