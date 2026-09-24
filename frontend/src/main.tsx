import { useState } from "react";
import { createRoot } from "react-dom/client";
import { routes } from "./router/routes";
import "./styles.css";

function App() {
  const [active, setActive] = useState<string>(routes[0]?.route ?? "/fixtures");
  const current = routes.find((route) => route.route === active) ?? routes[0];
  const CurrentPage = current.page;
  return (
    <div className="shell">
      <aside>
        <div className="brand">舞台灯光编排模拟器</div>
        <nav>
          {routes.map((route) => (
            <button
              key={route.route}
              className={active === route.route ? "active" : ""}
              onClick={() => setActive(route.route)}
            >
              {route.name}
            </button>
          ))}
        </nav>
      </aside>
      <CurrentPage />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
