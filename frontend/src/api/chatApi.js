import apiClient from "./apiClient";

export const getChats = () => apiClient.get("/chats");

export const getChat = (chatId) => apiClient.get(`/chat/${chatId}`);
