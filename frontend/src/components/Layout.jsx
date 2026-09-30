import { NavLink, Outlet } from "react-router-dom";
import { DashboardIcon, PosIcon, ProductIcon, SalesIcon } from "./Icons";

export default function Layout() {
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-badge">
            <div className="brand-icon">S</div>
            <span>Sparknity POS</span>
          </div>
          <div className="brand-tagline">Retail &amp; Billing System</div>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <DashboardIcon size={16} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/billing"
            className={({ isActive }) => `nav-link ${isActive ? "active-pos" : ""}`}
          >
            <PosIcon size={16} />
            <span>POS Register</span>
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <ProductIcon size={16} />
            <span>Products</span>
          </NavLink>

          <NavLink
            to="/sales"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <SalesIcon size={16} />
            <span>Sales History</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <a
            href="http://localhost:8761"
            target="_blank"
            rel="noreferrer"
            className="footer-link"
          >
            <span className="status-indicator"></span>
            <span>Eureka: pos-service</span>
          </a>
          <a
            href="http://localhost:8080/swagger-ui/index.html"
            target="_blank"
            rel="noreferrer"
            className="footer-link"
          >
            <span>OpenAPI / Swagger</span>
          </a>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
