import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { loadMapboxConfig } from "@/lib/mapbox";
import "./index.css";

void loadMapboxConfig().finally(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
