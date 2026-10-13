import apiClient from "./apiClient";

export const analyzeQuestion = (question, selectedDocuments = []) => {
  const payload = { question };
  const validDocs = Array.isArray(selectedDocuments)
    ? selectedDocuments.filter(Boolean)
    : [];

  if (validDocs.length === 1) {
    payload.document = validDocs[0];
  } else if (validDocs.length > 1) {
    payload.documents = validDocs;
  }

  return apiClient.post("/analyze", payload);
};

export const askGeneral = (question) => apiClient.post("/ask", { question });
