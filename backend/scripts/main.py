"""CLI runner — invokes the LangGraph workflow with a test question."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from core.langgraph_workflow import app

question = "Analyze risks in the High-Risk Service Agreement"

result = app.invoke({"question": question, "events": []})

print("\n========== FINAL ANSWER ==========\n")
print(result["answer"])
