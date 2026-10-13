"""
OpenAI-compatible LLM module — used on the company laptop with the Capgemini proxy.
To switch: set PROVIDER=openai in .env and ensure api.py / agents import from this module.
The public interface is identical to llm.py so swapping is a one-line import change.
"""
import json
import logging
import time
import os
from openai import OpenAI
from dotenv import load_dotenv

try:
    from langsmith import traceable
except ImportError:
    def traceable(*args, **kwargs):
        def decorator(f):
            return f
        return decorator

load_dotenv()

logger = logging.getLogger(__name__)

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL"),
)

_CHAT_MODEL = os.getenv("CHAT_MODEL", "openai.gpt-4o")

# ── System prompts (identical to llm.py) ─────────────────────────────────────

_SUMMARY_SYSTEM = (
    "You are an expert legal analysis assistant helping non-lawyers understand contracts. "
    "You have two sources of knowledge:\n"
    "1. The DOCUMENT CONTEXT provided — specific clauses, terms and facts from the uploaded legal document.\n"
    "2. Your own GENERAL LEGAL KNOWLEDGE — standard legal practices, definitions, regulatory requirements.\n\n"
    "Rules:\n"
    "- Always prioritise the document context for specific facts (dates, amounts, names, obligations).\n"
    "- Where the document is silent or ambiguous, supplement with general legal knowledge and clearly "
    "label it as 'Standard practice:' or 'Generally speaking:'.\n"
    "- If a clause is unusual or risky by industry norms, say so even if the document itself does not.\n"
    "- Use plain English. Avoid legal jargon unless you explain it.\n"
    "- Be direct and actionable. A non-lawyer should walk away knowing exactly what to do."
)

_ANALYSIS_SYSTEM = {
    "contract": (
        "You are a contract lawyer advising a non-lawyer client. "
        "Analyse the provided clause and extract:\n"
        "1. Key obligations on each party\n"
        "2. Rights granted\n"
        "3. Risks or missing terms — flag anything non-standard or dangerous\n"
        "Use plain English. Max 6 bullet points."
    ),
    "compliance": (
        "You are a compliance officer advising a non-lawyer client. "
        "Analyse the provided clause and extract:\n"
        "1. Regulatory obligations\n"
        "2. Data / privacy requirements\n"
        "3. Compliance gaps or risks\n"
        "Use plain English. Max 6 bullet points."
    ),
}

_RISK_SYSTEM = (
    "You are a risk assessment lawyer reviewing a legal document for a non-lawyer. "
    "You MUST respond with ONLY valid JSON — no markdown, no code fences, no extra text. "
    "Format JSON strictly as:\n"
    "{\n"
    '  "risk_level": "High" | "Medium" | "Low",\n'
    '  "issues": ["issue1", "issue2"],\n'
    '  "plain_english_summary": "2-3 sentence plain English explanation",\n'
    '  "redlines": [\n'
    '    {\n'
    '      "risky_clause": "original problematic clause or summary",\n'
    '      "recommended_replacement": "proposed safer replacement wording",\n'
    '      "negotiation_rationale": "why this change protects the client"\n'
    '    }\n'
    '  ]\n'
    "}"
)

_GENERAL_LEGAL_SYSTEM = (
    "You are a friendly, expert legal assistant helping a non-lawyer understand legal concepts. "
    "Answer in plain English. Always remind the user to consult a qualified lawyer."
)

# ─────────────────────────────────────────────────────────────────────────────


@traceable(name="groq_chat_completion", run_type="llm")
def _chat(system: str, user: str, max_retries: int = 3) -> str:
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model=_CHAT_MODEL,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user",   "content": user},
                ],
            )
            return response.choices[0].message.content
        except Exception as exc:
            err_str = str(exc)
            if ("429" in err_str or "rate_limit" in err_str.lower()) and attempt < max_retries - 1:
                wait_time = 3 * (attempt + 1)
                logger.warning(
                    "Rate limit hit (attempt %d/%d). Backing off for %ds...",
                    attempt + 1, max_retries, wait_time
                )
                time.sleep(wait_time)
            else:
                raise exc
    return ""


@traceable(name="ask_llm_summary")
def ask_llm(context: str, question: str) -> str:
    prompt = (
        f"Document Context:\n{context or '(none)'}\n\n"
        f"Question / Task:\n{question}"
    )
    return _chat(_SUMMARY_SYSTEM, prompt)


@traceable(name="ask_llm_analysis")
def ask_llm_analysis(context: str, perspective: str) -> str:
    instruction = _ANALYSIS_SYSTEM.get(perspective, _ANALYSIS_SYSTEM["contract"])
    return _chat(instruction, f"Clause to analyse:\n{context}")


@traceable(name="ask_llm_risk")
def ask_llm_risk(context: str, analysis: str) -> dict:
    raw = _chat(
        _RISK_SYSTEM,
        f"Contract context:\n{context}\n\nExpert analysis:\n{analysis}",
    )
    cleaned = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
    try:
        result = json.loads(cleaned)
        risk_level = result.get("risk_level", "Low")
        if risk_level not in ("High", "Medium", "Low"):
            risk_level = "Low"
        redlines = result.get("redlines", [])
        if not isinstance(redlines, list):
            redlines = []
        return {
            "risk_level": risk_level,
            "issues": result.get("issues", []),
            "plain_english_summary": result.get("plain_english_summary", ""),
            "redlines": redlines,
        }
    except Exception:
        return {"risk_level": "Unknown", "issues": [], "plain_english_summary": "", "redlines": []}


@traceable(name="ask_llm_general")
def ask_llm_general(question: str) -> str:
    return _chat(_GENERAL_LEGAL_SYSTEM, question)

