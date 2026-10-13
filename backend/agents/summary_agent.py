import time
import logging
from datetime import datetime
from rag.llm_openai import ask_llm

logger = logging.getLogger(__name__)


class SummaryAgent:

    def run(self, state):
        t0 = time.perf_counter()

        question   = state["question"]
        analysis   = state.get("analysis", "")
        context    = state.get("context", "")
        risk_report = {
            "risk_level": state.get("risk_level", "Unknown"),
            "issues": state.get("issues", []),
        }
        sources = state.get("sources", [])

        redlines = state.get("redlines", [])
        redlines_section = ""
        if redlines:
            redlines_section = "\nIdentified Redlines & Recommended Edits:\n"
            for idx, r in enumerate(redlines, 1):
                redlines_section += (
                    f"{idx}. Risky Clause: \"{r.get('risky_clause', '')}\"\n"
                    f"   Proposed Counter-Clause: \"{r.get('recommended_replacement', '')}\"\n"
                    f"   Negotiation Rationale: {r.get('negotiation_rationale', '')}\n"
                )

        prompt = f"""Question:
{question}

Expert Analysis (from contract/compliance review):
{analysis}

Risk Assessment:
- Risk Level: {risk_report['risk_level']}
- Issues Found: {', '.join(risk_report['issues']) if risk_report['issues'] else 'None'}
{redlines_section}
Source Documents:
{', '.join(sources) if sources else 'No documents — answering from general legal knowledge'}

Provide a clear structured response with these sections:
1. **Answer** — directly answer the question. Use the document context for specifics and your general legal knowledge for context or where the document is silent.
2. **Risk Summary** — explain in plain English what the risk level means and why, as if talking to someone with no legal background.
3. **Negotiation & Redline Recommendations** — concrete counter-clauses or wording edits to negotiate with the counterparty to eliminate risks.
4. **Actionable Recommendations** — practical next steps for the user.
5. **Sources** — list the source documents used (if any).
"""

        try:
            answer = ask_llm(context, prompt)
        except Exception as exc:
            logger.error("SummaryAgent LLM call failed: %s", exc)
            answer = (
                f"**Answer**\n{analysis}\n\n"
                f"**Risk Summary**\nRisk level: {risk_report['risk_level']}. "
                f"Issues: {', '.join(risk_report['issues']) or 'None'}\n\n"
                f"**Negotiation & Redlines**\n{redlines_section or 'None'}\n\n"
                f"**Recommendation**\nPlease review the document with a qualified lawyer.\n\n"
                f"**Sources**\n{', '.join(sources) or 'None'}"
            )


        state["answer"] = answer

        duration_ms = round((time.perf_counter() - t0) * 1000)
        state["events"].append({
            "agent": "Summary Agent",
            "time": datetime.now().strftime("%H:%M:%S"),
            "duration_ms": duration_ms,
        })
        return state
