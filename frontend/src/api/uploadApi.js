import apiClient from "./apiClient";

export const uploadPdf = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
