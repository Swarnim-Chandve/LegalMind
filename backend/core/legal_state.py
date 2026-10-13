from typing import TypedDict, Optional


class LegalState(TypedDict):
    question: str
    intent: str
    context: str
    sources: list
    analysis: str
    risk_level: str
    issues: list
    risk_plain_english: str   # plain English explanation from RiskAgent
    answer: str
    redlines: list            # list of {risky_clause, recommended_replacement, negotiation_rationale}
    events: list              # list of {agent, time, duration_ms}
    source_filter: Optional[str]
