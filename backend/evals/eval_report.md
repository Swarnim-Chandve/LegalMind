# ⚖️ LegalMind AI — Benchmark Evaluation Report

**Date:** 2026-10-13 14:53:03  
**Overall Score:** **67.5%** | **Risk Accuracy:** **80.0%** | **Fact Recall:** **55.0%** | **Avg Latency:** **42831ms**

---

## 📈 Performance Summary

| Metric | Score | Target | Status |
| :--- | :---: | :---: | :---: |
| **Overall Quality Score** | **67.5%** | > 85% | ⚠️ Review |
| **Risk Classification Accuracy** | **80.0%** | > 80% | ✅ Pass |
| **Key Fact Recall** | **55.0%** | > 75% | ⚠️ Review |
| **Average Pipeline Latency** | **42831ms** | < 5000ms | ⚠️ Review |

---

## 🔬 Test Case Results

| Case ID | Scenario | Domain | Expected Risk | Predicted Risk | Fact Recall | Redlines | Latency |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `CASE-001` | One-Sided Termination with Disproportionate Penalty | Commercial Contracts | `High` | ✅ `High` | 50.0% | 7 edits | 9523ms |
| `CASE-002` | Overly Broad Worldwide Non-Compete | Employment Law | `High` | ✅ `High` | 25.0% | 6 edits | 48895ms |
| `CASE-003` | Unlimited Indemnification & Consequential Damages | Software / Vendor Agreements | `High` | ✅ `High` | 75.0% | 8 edits | 52553ms |
| `CASE-004` | GDPR Compliance & Unregulated Cross-Border Transfer | Data Privacy & Compliance | `High` | ✅ `High` | 75.0% | 5 edits | 52227ms |
| `CASE-005` | Standard Mutual 2-Year Non-Disclosure Agreement | Confidentiality | `Low` | ❌ `High` | 50.0% | 7 edits | 50959ms |

---
Generated automatically by `evals/run_evals.py`.
