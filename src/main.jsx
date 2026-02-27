import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from "@/components/theme-provider/theme-provider";
import { Toaster } from './components/ui/toaster';
import "./i18n";
import { Toaster as ReactToaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { store } from "../src/store/store";

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Provider store={store}>
      <ReactToaster
        position="top-center"
        toastOptions={{
          style: {
            marginTop: "180px",   // push it slightly down
            fontSize: "18px",    // bigger text
            padding: "16px 22px",
            borderRadius: "12px",
          },
        }}
      />
      <Toaster />
      <App />
      </Provider>
    </ThemeProvider>
  // </StrictMode>,
)
