import { useState, useEffect } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../services/api";
import ProductTable from "../components/ProductTable";
import ProductForm from "../components/ProductForm";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProducts(search);
      const data = Array.isArray(response.data) ? response.data : response.data.content || [];
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
      setError("Failed to load products from server.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
        showNotification("Product updated successfully!");
      } else {
        await createProduct(formData);
        showNotification("Product created successfully!");
      }
      handleCloseModal();
      fetchProducts();
    } catch (err) {
      console.error("Save error:", err);
      const msg = err.response?.data?.message || "Failed to save product.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }
    try {
      await deleteProduct(id);
      showNotification(`Product "${name}" deleted.`);
      fetchProducts();
    } catch (err) {
      console.error("Delete error:", err);
      const msg = err.response?.data?.message || "Failed to delete product.";
      setError(msg);
    }
  };

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Product Inventory</h1>
          <p className="page-subtitle">Manage items, unit prices, and stock inventory</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          + Add New Product
        </button>
      </div>

      {successMsg && (
        <div className="alert-banner alert-success">
          <span>✓ {successMsg}</span>
          <button className="modal-close" onClick={() => setSuccessMsg(null)}>&times;</button>
        </div>
      )}

      {error && (
        <div className="alert-banner alert-error">
          <span>⚠ {error}</span>
          <button className="modal-close" onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      <div className="card" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <input
            type="text"
            className="input"
            placeholder="🔍 Search products by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: "400px" }}
          />
          {search && (
            <button className="btn btn-secondary btn-sm" onClick={() => setSearch("")}>
              Clear Search
            </button>
          )}
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginLeft: "auto" }}>
            Total Items: <strong>{products.length}</strong>
          </span>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
          Loading products...
        </div>
      ) : (
        <ProductTable
          products={products}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
        />
      )}

      {isModalOpen && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleFormSubmit}
          onClose={handleCloseModal}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
