import { useState, useEffect } from "react";
import { getProducts, createSale } from "../services/api";
import Cart from "../components/Cart";
import ReceiptModal from "../components/ReceiptModal";

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
      setError(`Cannot add "${product.name}" - Out of stock.`);
      return;
    }

    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          setError(`Cannot add more "${product.name}". Max available stock is ${product.stockQuantity}.`);
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

      // Order success!
      setCompletedSale(newSale);
      setSuccessMsg(`Order #${newSale.id} placed successfully! Total: ₹${Number(newSale.totalAmount).toFixed(2)}`);
      setCartItems([]);

      // Refresh product stock in real-time
      await fetchProducts();
    } catch (err) {
      console.error("Order error:", err);
      const errMsg =
        err.response?.data?.message ||
        "Failed to place order. Please check stock availability.";
      setError(errMsg);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">POS Terminal & Billing</h1>
          <p className="page-subtitle">Select products, customize quantities, and place transactional orders</p>
        </div>
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

      <div className="pos-layout">
        {/* Left Column: Products Catalog */}
        <div className="products-catalog">
          <div className="card catalog-search-bar">
            <input
              type="text"
              className="input"
              placeholder="🔍 Search items by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="btn btn-secondary btn-sm" onClick={() => setSearch("")}>
                Clear
              </button>
            )}
          </div>

          {loading ? (
            <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
              Loading inventory catalog...
            </div>
          ) : products.length === 0 ? (
            <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
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
                      <div className="pos-product-name">{product.name}</div>
                      <div className="pos-product-price">₹{Number(product.price).toFixed(2)}</div>
                      <div className="pos-product-stock">
                        {isOutOfStock ? (
                          <span style={{ color: "var(--danger)", fontWeight: 600 }}>Out of Stock</span>
                        ) : product.stockQuantity <= 5 ? (
                          <span style={{ color: "var(--warning-text)", fontWeight: 600 }}>
                            Only {product.stockQuantity} left
                          </span>
                        ) : (
                          <span>Stock: {product.stockQuantity} available</span>
                        )}
                        {inCart && (
                          <span style={{ display: "block", color: "var(--primary)", fontWeight: 600, marginTop: "2px" }}>
                            In cart: {inCart.quantity}
                          </span>
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
                        ? "Max in Cart"
                        : "+ Add to Cart"}
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
