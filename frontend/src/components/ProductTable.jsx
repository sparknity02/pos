import { EditIcon, TrashIcon } from "./Icons";

export default function ProductTable({ products, onEdit, onDelete }) {
  if (!products || products.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
        <p style={{ fontWeight: 600, color: "var(--text-main)" }}>No products found</p>
        <p style={{ fontSize: "0.8rem", marginTop: "4px" }}>Add a product or try a different search filter.</p>
      </div>
    );
  }

  const getStockBadge = (stock) => {
    if (stock <= 0) {
      return <span className="badge badge-danger">Out of stock</span>;
    }
    if (stock <= 5) {
      return <span className="badge badge-warning">Low ({stock})</span>;
    }
    return <span className="badge badge-success">{stock} in stock</span>;
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: "60px" }}>SKU</th>
            <th>Item Name</th>
            <th style={{ width: "120px" }}>Price</th>
            <th style={{ width: "130px" }}>Stock Status</th>
            <th style={{ width: "140px", textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.775rem" }}>
                #{p.id}
              </td>
              <td style={{ fontWeight: 600 }}>{p.name}</td>
              <td className="currency" style={{ fontWeight: 600 }}>
                ₹{Number(p.price).toFixed(2)}
              </td>
              <td>{getStockBadge(p.stockQuantity)}</td>
              <td style={{ textAlign: "right" }}>
                <div style={{ display: "inline-flex", gap: "6px" }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onEdit(p)}
                    title="Edit Item"
                  >
                    <EditIcon size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => onDelete(p.id, p.name)}
                    title="Delete Item"
                  >
                    <TrashIcon size={13} />
                    <span>Delete</span>
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
