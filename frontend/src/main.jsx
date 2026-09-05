import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";

import "highlight.js/styles/github-dark.min.css";
import "./index.css";

import App from "./App.jsx";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: "#8b5cf6",
    colorBackground: "#0d1117",
    colorForeground: "#e6edf3",
    colorInputBackground: "#161b22",
    colorInputText: "#e6edf3",
    colorBorder: "#30363d",
    colorTextSecondary: "#9da7b3",
    colorTextOnPrimaryBackground: "#ffffff",
    borderRadius: "0.625rem",
    fontFamily:
      "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
  },
  elements: {
    card: {
      boxShadow: "0 24px 80px rgba(0, 0, 0, 0.55)",
      border: "1px solid #21262d",
    },
    formButtonPrimary: {
      background: "#8b5cf6",
      ":hover": { background: "#7c3aed" },
      ":disabled": { background: "#3b2d66", opacity: 1 },
    },
    socialButtonsBlockButton: {
      borderColor: "#30363d",
      ":hover": { background: "#1c2128" },
    },
    footerActionLink: { color: "#8b5cf6" },
  },
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={clerkAppearance}
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
);
