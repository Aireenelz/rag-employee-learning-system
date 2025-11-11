import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./router/Router";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import { BookmarkProvider } from "./context/BookmarkContext";
import { GamificationProvider } from "./context/GamificationContext";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <GamificationProvider>
        <BookmarkProvider>
          <AppRouter />
        </BookmarkProvider>
      </GamificationProvider>
    </AuthProvider>
  </React.StrictMode>
)