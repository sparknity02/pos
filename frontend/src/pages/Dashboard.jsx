import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats, getSales } from "../services/api";
import ReceiptModal from "../components/ReceiptModal";
import { RefreshIcon, PosIcon, ProductIcon, SalesIcon, AlertIcon } from "../components/Icons";

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
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Store summary, inventory levels, and recent transactions</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn btn-secondary" onClick={fetchDashboardData} disabled={loading}>
            <RefreshIcon size={14} />
            <span>Refresh</span>
          </button>
          <Link to="/billing" className="btn btn-primary">
            <PosIcon size={15} />
            <span>New Sale</span>
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
        <div className="card" style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
          Loading dashboard data...
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <span>Total Catalog Items</span>
                <ProductIcon size={16} />
              </div>
              <div className="stat-value">{stats.totalProducts}</div>
            </div>

            <div className={`stat-card ${stats.lowStockProducts > 0 ? "alert-card" : ""}`}>
              <div className="stat-header">
                <span>Low Stock Items</span>
                <AlertIcon size={16} />
              </div>
              <div className="stat-value" style={stats.lowStockProducts > 0 ? { color: "var(--warning)" } : {}}>
                {stats.lowStockProducts}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span>Total Orders</span>
                <SalesIcon size={16} />
              </div>
              <div className="stat-value">{stats.totalSales}</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span>Today's Sales</span>
                <span style={{ fontWeight: 700 }}>INR</span>
              </div>
              <div className="stat-value currency">
                ₹{Number(stats.todaySales || 0).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h2 style={{ fontSize: "1rem", fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>
                Recent Transactions
              </h2>
              <Link to="/sales" style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 500, textDecoration: "none" }}>
                View all transactions &rarr;
              </Link>
            </div>

            {recentSales.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", padding: "16px 0", textAlign: "center" }}>
                No transactions recorded yet.
              </p>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date / Time</th>
                      <th>Items</th>
                      <th>Total</th>
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
                              {sale.items.reduce((acc, i) => acc + i.quantity, 0)} units ({sale.items.length} lines)
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="currency" style={{ fontWeight: 700 }}>
                          ₹{Number(sale.totalAmount).toFixed(2)}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedSale(sale)}
                          >
                            View
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
