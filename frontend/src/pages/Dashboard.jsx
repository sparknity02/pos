import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats, getSales } from "../services/api";
import ReceiptModal from "../components/ReceiptModal";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    totalSales: 0,
    todaySales: 0,
  });
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, salesRes] = await Promise.all([
        getDashboardStats(),
        getSales(),
      ]);
      setStats(statsRes.data);
      // Grab top 5 most recent sales
      const salesList = Array.isArray(salesRes.data)
        ? salesRes.data
        : salesRes.data.content || [];
      setRecentSales(salesList.slice(0, 5));
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Unable to connect to POS Backend service. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Real-time statistics and billing activity</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button className="btn btn-secondary" onClick={fetchDashboardData} disabled={loading}>
            Refresh
          </button>
          <Link to="/billing" className="btn btn-primary">
            ⚡ Open POS Terminal
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert-banner alert-error">
          <span>{error}</span>
          <button className="btn btn-secondary btn-sm" onClick={fetchDashboardData}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
          Loading dashboard metrics...
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <span>Total Products</span>
                <span>📦</span>
              </div>
              <div className="stat-value">{stats.totalProducts}</div>
            </div>

            <div className={`stat-card ${stats.lowStockProducts > 0 ? "alert-card" : ""}`}>
              <div className="stat-header">
                <span>Low Stock Items</span>
                <span>⚠️</span>
              </div>
              <div className="stat-value">{stats.lowStockProducts}</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span>Total Sales</span>
                <span>🧾</span>
              </div>
              <div className="stat-value">{stats.totalSales}</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span>Today&apos;s Revenue</span>
                <span>₹</span>
              </div>
              <div className="stat-value currency" style={{ color: "var(--primary)" }}>
                ₹{Number(stats.todaySales || 0).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Recent Completed Transactions</h2>
              <Link to="/sales" style={{ fontSize: "0.875rem", color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
                View All Sales &rarr;
              </Link>
            </div>

            {recentSales.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", padding: "20px 0", textAlign: "center" }}>
                No sales recorded yet. Start billing in the POS terminal!
              </p>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Sale ID</th>
                      <th>Date & Time</th>
                      <th>Items Sold</th>
                      <th>Total Amount</th>
                      <th style={{ textAlign: "right" }}>Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSales.map((sale) => (
                      <tr key={sale.id}>
                        <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>#{sale.id}</td>
                        <td style={{ color: "var(--text-muted)" }}>{formatDate(sale.createdAt)}</td>
                        <td>
                          {sale.items ? (
                            <span>
                              {sale.items.reduce((acc, i) => acc + i.quantity, 0)} items ({sale.items.length} types)
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="currency" style={{ fontWeight: 700, color: "var(--text-main)" }}>
                          ₹{Number(sale.totalAmount).toFixed(2)}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedSale(sale)}
                          >
                            View Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {selectedSale && (
        <ReceiptModal sale={selectedSale} onClose={() => setSelectedSale(null)} />
      )}
    </div>
  );
}
