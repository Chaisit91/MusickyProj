// Entry point ของ WebAdmin — mount App ลง DOM, ครอบด้วย Redux Provider และ BrowserRouter
//
// หลักการทำงาน:
// 1. Entry point ของ Vite React app
// 2. ครอบ App ด้วย Redux Provider (store) + BrowserRouter
// 3. ReactDOM.createRoot render App ลง #root element

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);