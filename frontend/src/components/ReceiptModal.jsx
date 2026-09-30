import { CloseIcon, PrinterIcon } from "./Icons";

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
        style={{ maxWidth: "420px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">Transaction Receipt</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="receipt-box" id="printable-receipt">
          <div className="receipt-header">
            <div style={{ fontSize: "1rem", fontWeight: 700 }}>SPARKNITY POS</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Retail Sales Receipt</div>
            <div style={{ marginTop: "8px", fontSize: "0.775rem", color: "var(--text-main)" }}>
              <div><strong>Receipt #:</strong> {sale.id}</div>
              <div><strong>Date:</strong> {formatDate(sale.createdAt)}</div>
            </div>
          </div>

          <table style={{ width: "100%", fontSize: "0.8rem", borderCollapse: "collapse", marginBottom: "12px" }}>
            <thead>
              <tr style={{ borderBottom: "1px dashed var(--border-dark)", textAlign: "left" }}>
                <th style={{ paddingBottom: "5px" }}>Item</th>
                <th style={{ paddingBottom: "5px", textAlign: "center" }}>Qty</th>
                <th style={{ paddingBottom: "5px", textAlign: "right" }}>Price</th>
                <th style={{ paddingBottom: "5px", textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items && sale.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px dotted #e5e7eb" }}>
                  <td style={{ padding: "5px 0" }}>{item.productName}</td>
                  <td style={{ padding: "5px 0", textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ padding: "5px 0", textAlign: "right" }}>₹{Number(item.unitPrice).toFixed(2)}</td>
                  <td style={{ padding: "5px 0", textAlign: "right", fontWeight: 600 }}>₹{Number(item.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ borderTop: "1px dashed var(--border-dark)", paddingTop: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "0.95rem" }}>
              <span>Total Paid:</span>
              <span>₹{Number(sale.totalAmount).toFixed(2)}</span>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: "14px", fontSize: "0.725rem", color: "var(--text-muted)" }}>
            Paid in Full &bull; Customer Copy
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
          <button type="button" className="btn btn-secondary" onClick={handlePrint}>
            <PrinterIcon size={14} />
            <span>Print</span>
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
