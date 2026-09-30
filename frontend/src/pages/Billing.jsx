import { useState, useEffect } from "react";
import { getProducts, createSale } from "../services/api";
import Cart from "../components/Cart";
import ReceiptModal from "../components/ReceiptModal";
import { SearchIcon, CheckIcon, AlertIcon, CloseIcon } from "../components/Icons";

export default function Billing() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [completedSale, setCompletedSale] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = async () => {
    try {
      const response = await getProducts(search);
      const data = Array.isArray(response.data) ? response.data : response.data.content || [];
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load catalog products.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    setError(null);
    if (product.stockQuantity <= 0) {
      setError(`"${product.name}" is out of stock.`);
      return;
    }

    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          setError(`Max available stock (${product.stockQuantity}) reached for "${product.name}".`);
          return prevItems;
        }
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [
          ...prevItems,
          {
            id: product.id,
            name: product.name,
            price: Number(product.price),
            stockQuantity: product.stockQuantity,
            quantity: 1,
          },
        ];
      }
    });
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    setError(null);
    if (newQuantity < 1) return;

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === productId) {
          if (newQuantity > item.stockQuantity) {
            setError(`Cannot exceed available stock (${item.stockQuantity}) for "${item.name}".`);
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setError(null);
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      setError("Please add at least one product to the cart.");
      return;
    }

    setIsPlacingOrder(true);
    setError(null);

    const salePayload = {
      items: cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await createSale(salePayload);
      const newSale = response.data;

      setCompletedSale(newSale);
      setSuccessMsg(`Order #${newSale.id} completed. Total: ₹${Number(newSale.totalAmount).toFixed(2)}`);
      setCartItems([]);

      await fetchProducts();
    } catch (err) {
      console.error("Order error:", err);
      const errMsg =
        err.response?.data?.message ||
        "Failed to place order. Check product stock availability.";
      setError(errMsg);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">POS Billing Register</h1>
          <p className="page-subtitle">Select catalog items and complete checkout tickets</p>
        </div>
      </div>

      {successMsg && (
        <div className="alert-banner alert-success">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckIcon size={16} />
            <span>{successMsg}</span>
          </div>
          <button className="modal-close" onClick={() => setSuccessMsg(null)}>
            <CloseIcon size={14} />
          </button>
        </div>
      )}

      {error && (
        <div className="alert-banner alert-error">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertIcon size={16} />
            <span>{error}</span>
          </div>
          <button className="modal-close" onClick={() => setError(null)}>
            <CloseIcon size={14} />
          </button>
        </div>
      )}

      <div className="pos-layout">
        {/* Left Column: Products Catalog */}
        <div className="products-catalog">
          <div className="card catalog-search-bar" style={{ padding: "10px 14px" }}>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type="text"
                className="input"
                placeholder="Search catalog by item name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: "32px" }}
              />
              <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }}>
                <SearchIcon size={14} />
              </span>
            </div>
            {search && (
              <button className="btn btn-secondary btn-sm" onClick={() => setSearch("")}>
                Clear
              </button>
            )}
          </div>

          {loading ? (
            <div className="card" style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
              Loading catalog...
            </div>
          ) : products.length === 0 ? (
            <div className="card" style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
              No products found matching &ldquo;{search}&rdquo;.
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => {
                const inCart = cartItems.find((item) => item.id === product.id);
                const isOutOfStock = product.stockQuantity <= 0;
                const isMaxInCart = inCart && inCart.quantity >= product.stockQuantity;

                return (
                  <div
                    key={product.id}
                    className={`pos-product-card ${isOutOfStock ? "out-of-stock" : ""}`}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.725rem", color: "var(--text-light)", fontFamily: "var(--font-mono)" }}>
                          #{product.id}
                        </span>
                        {inCart && (
                          <span style={{ fontSize: "0.725rem", fontWeight: 600, color: "var(--primary)" }}>
                            In ticket: {inCart.quantity}
                          </span>
                        )}
                      </div>
                      <div className="pos-product-name">{product.name}</div>
                      <div className="pos-product-price">₹{Number(product.price).toFixed(2)}</div>
                      <div className="pos-product-stock">
                        {isOutOfStock ? (
                          <span style={{ color: "var(--danger)", fontWeight: 600 }}>Out of stock</span>
                        ) : product.stockQuantity <= 5 ? (
                          <span style={{ color: "var(--warning)", fontWeight: 600 }}>
                            Low: {product.stockQuantity} left
                          </span>
                        ) : (
                          <span>Stock: {product.stockQuantity}</span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ width: "100%" }}
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock || isMaxInCart || isPlacingOrder}
                    >
                      {isOutOfStock
                        ? "Out of Stock"
                        : isMaxInCart
                        ? "Max In Cart"
                        : "+ Add to Order"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Cart Panel */}
        <Cart
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onPlaceOrder={handlePlaceOrder}
          isPlacingOrder={isPlacingOrder}
        />
      </div>

      {completedSale && (
        <ReceiptModal
          sale={completedSale}
          onClose={() => setCompletedSale(null)}
        />
      )}
    </div>
  );
}
