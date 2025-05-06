import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add support for Remix Icons
const remixIconsLink = document.createElement("link");
remixIconsLink.rel = "stylesheet";
remixIconsLink.href = "https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.css";
document.head.appendChild(remixIconsLink);

// Add Google Fonts: Inter and Poppins
const googleFontsLink = document.createElement("link");
googleFontsLink.rel = "stylesheet";
googleFontsLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap";
document.head.appendChild(googleFontsLink);

// Add page title
const titleElement = document.createElement("title");
titleElement.textContent = "Hamna Tec - YouTube SEO Command Center";
document.head.appendChild(titleElement);

createRoot(document.getElementById("root")!).render(<App />);
