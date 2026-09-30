import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-badge">
            <div className="brand-icon">S</div>
            <span>Sparknity POS</span>
          </div>
          <div className="brand-tagline">Simple. Fast. Reliable.</div>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <span>📊</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/billing"
            className={({ isActive }) => `nav-link ${isActive ? "active-pos" : ""}`}
          >
            <span>⚡</span>
            <span>POS Billing</span>
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <span>📦</span>
            <span>Products</span>
          </NavLink>

          <NavLink
            to="/sales"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <span>🧾</span>
            <span>Sales History</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <a
            href="http://localhost:8761"
            target="_blank"
            rel="noreferrer"
            className="eureka-badge"
            title="Eureka Service Discovery"
          >
            <span className="eureka-dot"></span>
            <span>Eureka: pos-service</span>
          </a>
          <a
            href="http://localhost:8080/swagger-ui/index.html"
            target="_blank"
            rel="noreferrer"
            style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.75rem", paddingLeft: "4px" }}
          >
            📘 Swagger OpenAPI Docs
          </a>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
