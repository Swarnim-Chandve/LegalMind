import re
import time
from datetime import datetime


class QueryAgent:

    CONTRACT_KEYWORDS = {
        "contract", "agreement", "clause", "termination", "terminate",
        "notice", "salary", "payment", "liability", "indemnity", "indemnify",
        "breach", "penalty", "damages", "warranty", "guarantee", "obligation",
        "rights", "renewal", "expiry", "expiration", "duration", "term",
        "nda", "non-disclosure", "confidential", "confidentiality",
        "employment", "employee", "employer", "vendor", "supplier",
        "intellectual property", "ip", "ownership", "assignment",
        "governing law", "jurisdiction", "dispute", "arbitration",
        "force majeure", "amendment", "waiver", "severability",
        "summarize", "summarise", "summary", "explain", "overview",
        "document", "documents", "highlight", "key points", "selected docs",
        "review", "read", "analyze", "analyse", "key clauses",
    }

    COMPLIANCE_KEYWORDS = {
        "privacy", "gdpr", "data protection", "personal data", "retention",
        "compliance", "regulation", "regulatory", "policy", "lawful basis",
        "consent", "data subject", "controller", "processor", "dpa",
        "hipaa", "ccpa", "audit", "breach notification", "dsar",
        "right to erasure", "right to access", "data transfer",
        "third party sharing", "cookies", "tracking",
    }

    def run(self, state):
        t0 = time.perf_counter()

        question = state["question"].lower()
        question_clean = re.sub(r"[^\w\s]", " ", question)
        words = set(question_clean.split())

        compliance_score = sum(
            1 for kw in self.COMPLIANCE_KEYWORDS
            if kw in question_clean or kw in words
        )
        contract_score = sum(
            1 for kw in self.CONTRACT_KEYWORDS
            if kw in question_clean or kw in words
        )

        if compliance_score == 0 and contract_score == 0:
            state["intent"] = "general"
        else:
            state["intent"] = "compliance" if compliance_score > contract_score else "contract"

        duration_ms = round((time.perf_counter() - t0) * 1000)
        state["events"].append({
            "agent": "Query Agent",
            "time": datetime.now().strftime("%H:%M:%S"),
            "duration_ms": duration_ms,
        })
        return state
