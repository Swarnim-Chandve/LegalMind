import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { getChats, getChat } from "../api/chatApi";
import { getDocuments } from "../api/documentApi";
import apiClient from "../api/apiClient";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  const [chats, setChats] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [result, setResult] = useState(null);
  const [chatsError, setChatsError] = useState(null);
  const [documentsError, setDocumentsError] = useState(null);

  // ── Toast system ──────────────────────────────────────────
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const loadChats = useCallback(async () => {
    try {
      setChatsError(null);
      const data = await getChats();
      setChats(data);
    } catch (err) {
      setChatsError(err.message);
    }
  }, []);

  const loadDocuments = useCallback(async () => {
    try {
      setDocumentsError(null);
      const data = await getDocuments();
      setDocuments(data);
    } catch (err) {
      setDocumentsError(err.message);
    }
  }, []);

  const openChat = useCallback(async (chatId) => {
    try {
      const data = await getChat(chatId);
      setSelectedChat(chatId);
      setMessages(data);
    } catch (err) {
      console.error("Failed to load chat:", err.message);
    }
  }, []);

  const resetSession = useCallback(() => {
    setResult(null);
    setMessages([]);
    setSelectedChat(null);
  }, []);

  const deleteChatById = useCallback(async (chatId) => {
    try {
      await apiClient.delete(`/chat/${chatId}`);
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      if (selectedChat === chatId) {
        setSelectedChat(null);
        setMessages([]);
        setResult(null);
      }
      addToast("Chat deleted", "success");
    } catch (err) {
      addToast(err.message ?? "Failed to delete chat", "error");
    }
  }, [selectedChat, addToast]);

  const deleteDocumentById = useCallback(async (documentId) => {
    try {
      await apiClient.delete(`/document/${documentId}`);
      setDocuments((prev) => prev.filter((d) => d.id !== documentId));
      addToast("Document removed from knowledge base", "success");
    } catch (err) {
      addToast(err.message ?? "Failed to delete document", "error");
    }
  }, [addToast]);

  useEffect(() => {
    loadChats();
    loadDocuments();
  }, [loadChats, loadDocuments]);

  return (
    <AppContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        chats,
        documents,
        selectedChat,
        messages,
        setMessages,
        result,
        setResult,
        chatsError,
        documentsError,
        loadChats,
        loadDocuments,
        openChat,
        resetSession,
        deleteChatById,
        deleteDocumentById,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
