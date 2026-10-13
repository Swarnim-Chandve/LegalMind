from agents.query_agent import QueryAgent
from agents.research_agent import ResearchAgent
from agents.risk_agent import RiskAgent
from agents.summary_agent import SummaryAgent
from agents.contract_agent import ContractAgent
from agents.compliance_agent import ComplianceAgent
from agents.general_agent import GeneralAgent

contract_agent = ContractAgent()
compliance_agent = ComplianceAgent()
general_agent = GeneralAgent()
query_agent = QueryAgent()
research_agent = ResearchAgent()
risk_agent = RiskAgent()
summary_agent = SummaryAgent()


def query_node(state):
    return query_agent.run(state)


def research_node(state):
    return research_agent.run(state)


def contract_node(state):
    return contract_agent.run(state)


def compliance_node(state):
    return compliance_agent.run(state)


def general_node(state):
    return general_agent.run(state)


def risk_node(state):
    return risk_agent.run(state)


def summary_node(state):
    return summary_agent.run(state)


def route_question(state):
    intent = state["intent"]
    print(f"\nRouting based on intent: {intent}")
    if intent == "general":
        return "general"
    if intent == "contract":
        return "contract"
    return "compliance"
