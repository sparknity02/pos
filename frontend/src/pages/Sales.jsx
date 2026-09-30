import { useState, useEffect } from "react";
import { getSales } from "../services/api";
import ReceiptModal from "../components/ReceiptModal";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSales();
      const list = Array.isArray(response.data) ? response.data : response.data.content || [];
      setSales(list);
    } catch (err) {
      console.error("Failed to load sales history:", err);
      setError("Failed to load sales history from server.");
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
          <h1 className="page-title">Sales History</h1>
          <p className="page-subtitle">Historical records of completed billing transactions</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchSales} disabled={loading}>
          Refresh History
        </button>
      </div>

      {error && (
        <div className="alert-banner alert-error">
          <span>⚠ {error}</span>
          <button className="modal-close" onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
          Loading sales records...
        </div>
      ) : sales.length === 0 ? (
        <div className="card" style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)" }}>
          <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-main)" }}>No sales recorded yet</p>
          <p style={{ fontSize: "0.875rem", marginTop: "4px" }}>Completed orders will appear here automatically.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sale ID</th>
                <th>Transaction Date</th>
                <th>Purchased Items</th>
                <th>Total Paid</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => {
                const totalItemsCount = sale.items
                  ? sale.items.reduce((sum, item) => sum + item.quantity, 0)
                  : 0;

                return (
                  <tr key={sale.id}>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>#{sale.id}</td>
                    <td style={{ color: "var(--text-muted)" }}>{formatDate(sale.createdAt)}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {totalItemsCount} {totalItemsCount === 1 ? "unit" : "units"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        {sale.items?.map((i) => `${i.productName} (×${i.quantity})`).join(", ")}
                      </div>
                    </td>
                    <td className="currency" style={{ fontSize: "1rem", color: "var(--text-main)" }}>
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedSale && (
        <ReceiptModal
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
        />
      )}
    </div>
  );
}
