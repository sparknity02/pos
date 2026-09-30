export default function ReceiptModal({ sale, onClose }) {
  if (!sale) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth: "460px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">Order Receipt</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className="receipt-box" id="printable-receipt">
          <div className="receipt-header">
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>SPARKNITY POS</h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Simple. Fast. Reliable.
            </p>
            <div style={{ marginTop: "10px", fontSize: "0.8rem", color: "var(--text-main)" }}>
              <div><strong>Receipt #:</strong> {sale.id}</div>
              <div><strong>Date:</strong> {formatDate(sale.createdAt)}</div>
            </div>
          </div>

          <table style={{ width: "100%", fontSize: "0.825rem", borderCollapse: "collapse", marginBottom: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "1px dashed #94a3b8", textAlign: "left" }}>
                <th style={{ paddingBottom: "6px" }}>Item</th>
                <th style={{ paddingBottom: "6px", textAlign: "center" }}>Qty</th>
                <th style={{ paddingBottom: "6px", textAlign: "right" }}>Price</th>
                <th style={{ paddingBottom: "6px", textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items && sale.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px dotted #e2e8f0" }}>
                  <td style={{ padding: "6px 0" }}>{item.productName}</td>
                  <td style={{ padding: "6px 0", textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ padding: "6px 0", textAlign: "right" }}>₹{Number(item.unitPrice).toFixed(2)}</td>
                  <td style={{ padding: "6px 0", textAlign: "right", fontWeight: 600 }}>₹{Number(item.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ borderTop: "1px dashed #94a3b8", paddingTop: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1.05rem" }}>
              <span>Total Paid:</span>
              <span style={{ color: "var(--primary)" }}>₹{Number(sale.totalAmount).toFixed(2)}</span>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: "16px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Thank you for your business!
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
          <button type="button" className="btn btn-secondary" onClick={handlePrint}>
            Print Receipt
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
