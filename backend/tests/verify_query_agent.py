import sys

sys.path.insert(0, r'C:\Users\swarkail\OneDrive - Capgemini\Desktop\legalmind\backend')

from agents.query_agent import QueryAgent
from core.langgraph_workflow import app

state = {"question": "what is the price of apple per kg?", "events": []}
result = QueryAgent().run(state)
print("intent:", result["intent"])
assert result["intent"] == "general", result

state2 = {"question": "what is the termination notice period in this agreement?", "events": []}
result2 = QueryAgent().run(state2)
print("legal intent:", result2["intent"])
assert result2["intent"] == "contract", result2

final = app.invoke({"question": "what is the price of apple per kg?", "events": []})
print("final answer:", final.get("answer", ""))
assert "outside the scope" in final.get("answer", "") or "legal document analysis" in final.get("answer", "")
