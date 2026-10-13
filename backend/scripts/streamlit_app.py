"""Streamlit UI — alternative to the React frontend. Run with: streamlit run scripts/streamlit_app.py"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import streamlit as st
from core.langgraph_workflow import app
from rag.pdf_ingest import ingest_pdf

st.set_page_config(page_title="LegalMind AI", page_icon="⚖️")
st.title("⚖️ LegalMind AI")

uploaded_file = st.file_uploader("Upload Legal PDF", type=["pdf"])

if uploaded_file:
    save_path = f"data/contracts/{uploaded_file.name}"
    with open(save_path, "wb") as f:
        f.write(uploaded_file.getbuffer())
    chunks = ingest_pdf(save_path, uploaded_file.name)
    st.success(f"PDF Ingested ({chunks} chunks)")

question = st.text_area("Enter your legal question")

if st.button("Analyze"):
    result = app.invoke({"question": question, "events": []})
    st.markdown("## Response")
    st.write(result["answer"])
