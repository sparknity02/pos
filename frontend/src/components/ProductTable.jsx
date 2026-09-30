export default function ProductTable({ products, onEdit, onDelete }) {
  if (!products || products.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-muted)" }}>
        <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-main)" }}>No products found</p>
        <p style={{ fontSize: "0.875rem", marginTop: "4px" }}>Add your first product or adjust your search filter.</p>
      </div>
    );
  }

  const getStockBadge = (stock) => {
    if (stock <= 0) {
      return <span className="badge badge-danger">Out of Stock</span>;
    }
    if (stock <= 5) {
      return <span className="badge badge-warning">Low ({stock})</span>;
    }
    return <span className="badge badge-success">In Stock ({stock})</span>;
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Product Name</th>
            <th>Unit Price</th>
            <th>Stock Status</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
                #{p.id}
              </td>
              <td style={{ fontWeight: 600 }}>{p.name}</td>
              <td className="currency" style={{ color: "var(--primary)" }}>
                ₹{Number(p.price).toFixed(2)}
              </td>
              <td>{getStockBadge(p.stockQuantity)}</td>
              <td style={{ textAlign: "right" }}>
                <div style={{ display: "inline-flex", gap: "8px" }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onEdit(p)}
                    title="Edit Product"
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => onDelete(p.id, p.name)}
                    title="Delete Product"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
