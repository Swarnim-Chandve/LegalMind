import apiClient from "./apiClient";

export const getDocuments = () => apiClient.get("/documents");
