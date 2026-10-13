import time
import logging
from datetime import datetime
from rag.vectordb import collection

logger = logging.getLogger(__name__)


class ResearchAgent:

    def run(self, state):
        t0 = time.perf_counter()

        question = state["question"]
        source_filter = state.get("source_filter")

        try:
            query_kwargs = dict(query_texts=[question], n_results=4)
            if source_filter:
                if isinstance(source_filter, list):
                    if len(source_filter) == 1:
                        query_kwargs["where"] = {"source": source_filter[0]}
                    else:
                        query_kwargs["where"] = {"source": {"$in": source_filter}}
                else:
                    query_kwargs["where"] = {"source": source_filter}

            results = collection.query(**query_kwargs)
            docs  = results["documents"][0]
            metas = results["metadatas"][0]

        except Exception as exc:
            logger.error("ChromaDB query failed: %s", exc)
            state["context"] = ""
            state["sources"] = []
            duration_ms = round((time.perf_counter() - t0) * 1000)
            state["events"].append({
                "agent": "Research Agent",
                "time": datetime.now().strftime("%H:%M:%S"),
                "duration_ms": duration_ms,
            })
            return state

        context = "\n\n---\n\n".join(docs)

        seen, sources = set(), []
        for item in metas:
            src = item.get("source", "unknown")
            if src not in seen:
                seen.add(src)
                sources.append(src)

        state["context"] = context
        state["sources"] = sources

        duration_ms = round((time.perf_counter() - t0) * 1000)
        state["events"].append({
            "agent": "Research Agent",
            "time": datetime.now().strftime("%H:%M:%S"),
            "duration_ms": duration_ms,
        })
        return state
