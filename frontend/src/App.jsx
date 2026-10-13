import { AppProvider } from "./context/AppContext";
import ChatPage from "./pages/ChatPage";

export default function App() {
  return (
    <AppProvider>
      <ChatPage />
    </AppProvider>
  );
}
