import { useState, useEffect } from "react";
import { CloseIcon } from "./Icons";

export default function ProductForm({ product, onSubmit, onClose, isSubmitting }) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stockQuantity: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        price: product.price || "",
        stockQuantity: product.stockQuantity !== undefined ? product.stockQuantity : "",
      });
    } else {
      setFormData({ name: "", price: "", stockQuantity: "" });
    }
  }, [product]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = "Item name is required";
    }
    if (!formData.price || Number(formData.price) <= 0) {
      errs.price = "Price must be greater than 0";
    }
    if (formData.stockQuantity === "" || Number(formData.stockQuantity) < 0) {
      errs.stockQuantity = "Stock cannot be negative";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      stockQuantity: parseInt(formData.stockQuantity, 10),
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{product ? "Edit Product" : "New Product"}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <CloseIcon size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="prod-name">Item Name *</label>
            <input
              id="prod-name"
              type="text"
              className="input"
              placeholder="e.g. Wireless Mouse"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: null });
              }}
              autoFocus
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="prod-price">Unit Price (₹) *</label>
              <input
                id="prod-price"
                type="number"
                step="0.01"
                min="0.01"
                className="input"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => {
                  setFormData({ ...formData, price: e.target.value });
                  if (errors.price) setErrors({ ...errors, price: null });
                }}
              />
              {errors.price && <div className="form-error">{errors.price}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="prod-stock">Initial Stock *</label>
              <input
                id="prod-stock"
                type="number"
                min="0"
                className="input"
                placeholder="0"
                value={formData.stockQuantity}
                onChange={(e) => {
                  setFormData({ ...formData, stockQuantity: e.target.value });
                  if (errors.stockQuantity) setErrors({ ...errors, stockQuantity: null });
                }}
              />
              {errors.stockQuantity && <div className="form-error">{errors.stockQuantity}</div>}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "18px" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : product ? "Update Item" : "Create Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
