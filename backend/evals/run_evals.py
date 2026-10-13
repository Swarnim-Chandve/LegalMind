#!/usr/bin/env python3
"""
LegalMind AI — Automated LLM & Multi-Agent Evaluation Benchmark
Evaluates the LangGraph multi-agent legal intelligence pipeline against
a curated golden dataset across accuracy, fact recall, hallucination, and latency.
"""

import sys
import os
import json
import time
from datetime import datetime

# Add backend directory to sys.path
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from core.langgraph_workflow import app as langgraph_app


def calculate_fact_recall(answer: str, key_facts: list[str]) -> float:
    """Computes the fraction of required key facts captured in the generated answer."""
    if not key_facts:
        return 1.0
    answer_lower = answer.lower()
    matches = sum(1 for fact in key_facts if fact.lower() in answer_lower)
    return round((matches / len(key_facts)) * 100, 1)


def check_faithfulness(answer: str, contract_text: str) -> bool:
    """Basic check ensuring the answer contains concrete terminology derived from the contract."""
    contract_words = set(contract_text.lower().split())
    answer_words = set(answer.lower().split())
    overlap = contract_words.intersection(answer_words)
    # If there is meaningful overlap with source contract text
    return len(overlap) >= 10


def run_benchmark():
    dataset_path = os.path.join(os.path.dirname(__file__), "golden_dataset.json")
    if not os.path.exists(dataset_path):
        print(f"Error: Golden dataset not found at {dataset_path}")
        sys.exit(1)

    with open(dataset_path, "r", encoding="utf-8") as f:
        test_cases = json.load(f)

    print("=" * 70)
    print("⚖️  LEGALMIND AI — MULTI-AGENT EVALUATION BENCHMARK")
    print("=" * 70)
    print(f"Loaded {len(test_cases)} test cases from golden dataset.\n")

    results = []
    total_latency = 0
    correct_risks = 0
    total_fact_recall = 0

    for idx, case in enumerate(test_cases, 1):
        print(f"[{idx}/{len(test_cases)}] Evaluating {case['id']}: {case['name']}...")
        
        payload = {
            "question": f"{case['question']}\n\nContract Text:\n{case['contract_text']}",
            "context": case["contract_text"],
            "events": [],
        }

        start_time = time.perf_counter()
        try:
            output = langgraph_app.invoke(payload)
            elapsed_ms = round((time.perf_counter() - start_time) * 1000)
            status = "PASSED"
        except Exception as exc:
            elapsed_ms = round((time.perf_counter() - start_time) * 1000)
            status = f"FAILED: {exc}"
            output = {"answer": "", "risk_level": "Unknown", "redlines": []}

        predicted_risk = output.get("risk_level", "Unknown")
        expected_risk = case["expected_risk"]
        risk_match = predicted_risk.lower() == expected_risk.lower()
        if risk_match:
            correct_risks += 1

        answer = output.get("answer", "")
        fact_recall = calculate_fact_recall(answer, case.get("key_facts", []))
        total_fact_recall += fact_recall

        faithfulness = check_faithfulness(answer, case["contract_text"])
        redlines_count = len(output.get("redlines", []))

        total_latency += elapsed_ms

        res = {
            "id": case["id"],
            "name": case["name"],
            "domain": case["domain"],
            "expected_risk": expected_risk,
            "predicted_risk": predicted_risk,
            "risk_match": risk_match,
            "fact_recall": fact_recall,
            "faithfulness": faithfulness,
            "redlines_count": redlines_count,
            "latency_ms": elapsed_ms,
            "status": status,
        }
        results.append(res)

        badge = "✅" if risk_match and fact_recall >= 50 else "⚠️"
        print(f"     {badge} Risk Match: {risk_match} (Got: {predicted_risk}, Expected: {expected_risk})")
        print(f"        Fact Recall: {fact_recall}% | Redlines: {redlines_count} | Latency: {elapsed_ms}ms\n")
        time.sleep(3)

    # Aggregate metrics
    n = len(test_cases)
    risk_accuracy = round((correct_risks / n) * 100, 1) if n > 0 else 0
    avg_fact_recall = round(total_fact_recall / n, 1) if n > 0 else 0
    avg_latency = round(total_latency / n) if n > 0 else 0
    overall_score = round((risk_accuracy * 0.5) + (avg_fact_recall * 0.5), 1)

    print("=" * 70)
    print("📊 BENCHMARK SUMMARY")
    print("=" * 70)
    print(f"Overall Benchmark Score:     {overall_score}%")
    print(f"Risk Classification Accuracy: {risk_accuracy}% ({correct_risks}/{n} correct)")
    print(f"Average Fact Recall:          {avg_fact_recall}%")
    print(f"Average Pipeline Latency:     {avg_latency} ms")
    print("=" * 70)

    # Generate Markdown Report
    report_md_path = os.path.join(os.path.dirname(__file__), "eval_report.md")
    with open(report_md_path, "w", encoding="utf-8") as f:
        f.write("# ⚖️ LegalMind AI — Benchmark Evaluation Report\n\n")
        f.write(f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  \n")
        f.write(f"**Overall Score:** **{overall_score}%** | **Risk Accuracy:** **{risk_accuracy}%** | **Fact Recall:** **{avg_fact_recall}%** | **Avg Latency:** **{avg_latency}ms**\n\n")
        f.write("---\n\n")
        f.write("## 📈 Performance Summary\n\n")
        f.write("| Metric | Score | Target | Status |\n")
        f.write("| :--- | :---: | :---: | :---: |\n")
        f.write(f"| **Overall Quality Score** | **{overall_score}%** | > 85% | {'✅ Pass' if overall_score >= 85 else '⚠️ Review'} |\n")
        f.write(f"| **Risk Classification Accuracy** | **{risk_accuracy}%** | > 80% | {'✅ Pass' if risk_accuracy >= 80 else '⚠️ Review'} |\n")
        f.write(f"| **Key Fact Recall** | **{avg_fact_recall}%** | > 75% | {'✅ Pass' if avg_fact_recall >= 75 else '⚠️ Review'} |\n")
        f.write(f"| **Average Pipeline Latency** | **{avg_latency}ms** | < 5000ms | {'✅ Pass' if avg_latency < 5000 else '⚠️ Review'} |\n\n")
        f.write("---\n\n")
        f.write("## 🔬 Test Case Results\n\n")
        f.write("| Case ID | Scenario | Domain | Expected Risk | Predicted Risk | Fact Recall | Redlines | Latency |\n")
        f.write("| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |\n")
        for r in results:
            risk_badge = "✅" if r["risk_match"] else "❌"
            f.write(f"| `{r['id']}` | {r['name']} | {r['domain']} | `{r['expected_risk']}` | {risk_badge} `{r['predicted_risk']}` | {r['fact_recall']}% | {r['redlines_count']} edits | {r['latency_ms']}ms |\n")
        f.write("\n---\n")
        f.write("Generated automatically by `evals/run_evals.py`.\n")

    print(f"\n✅ Detailed evaluation report written to:\n   {report_md_path}\n")


if __name__ == "__main__":
    run_benchmark()
