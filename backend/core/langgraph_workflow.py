from langgraph.graph import StateGraph, END

from core.legal_state import LegalState
from core.graph_nodes import (
    query_node,
    research_node,
    contract_node,
    compliance_node,
    general_node,
    risk_node,
    summary_node,
    route_question,
)

graph = StateGraph(LegalState)

graph.add_node("query", query_node)
graph.add_node("research", research_node)
graph.add_node("contract", contract_node)
graph.add_node("compliance", compliance_node)
graph.add_node("general", general_node)
graph.add_node("risk", risk_node)
graph.add_node("summary", summary_node)

graph.set_entry_point("query")

graph.add_edge("query", "research")

graph.add_conditional_edges(
    "research",
    route_question,
    {
        "general": "general",
        "contract": "contract",
        "compliance": "compliance",
    },
)

graph.add_edge("general", END)
graph.add_edge("contract", "risk")
graph.add_edge("compliance", "risk")
graph.add_edge("risk", "summary")
graph.add_edge("summary", END)

app = graph.compile()
