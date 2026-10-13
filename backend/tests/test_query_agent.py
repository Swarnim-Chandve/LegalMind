import unittest

from agents.query_agent import QueryAgent


class QueryAgentTests(unittest.TestCase):
    def test_non_legal_question_is_marked_general(self):
        state = {"question": "what is the price of apple per kg?", "events": []}
        result = QueryAgent().run(state)
        self.assertEqual(result["intent"], "general")

    def test_legal_question_is_marked_contract(self):
        state = {"question": "what is the termination notice period in this agreement?", "events": []}
        result = QueryAgent().run(state)
        self.assertEqual(result["intent"], "contract")

    def test_document_summary_request_is_marked_contract(self):
        state = {"question": "Summarise these documents and highlight the key points.", "events": []}
        result = QueryAgent().run(state)
        self.assertEqual(result["intent"], "contract")


if __name__ == "__main__":
    unittest.main()
