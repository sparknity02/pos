export default function Cart({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onPlaceOrder,
  isPlacingOrder,
}) {
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="cart-panel">
      <div className="cart-header">
        <div className="cart-title">
          <span>Current Cart</span>
          {cartItems.length > 0 && (
            <span className="badge badge-success" style={{ marginLeft: "6px" }}>
              {totalItemCount} {totalItemCount === 1 ? "item" : "items"}
            </span>
          )}
        </div>
        {cartItems.length > 0 && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={onClearCart}
            disabled={isPlacingOrder}
            title="Empty cart"
          >
            Clear
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <p style={{ fontWeight: 600, fontSize: "1rem", color: "var(--text-main)" }}>Cart is empty</p>
          <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>Click on products from catalog to add them to this order.</p>
        </div>
      ) : (
        <>
          <div className="cart-items-list">
            {cartItems.map((item) => {
              const subtotal = item.price * item.quantity;
              const isMaxStock = item.quantity >= item.stockQuantity;

              return (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-price">
                      ₹{Number(item.price).toFixed(2)} each &bull; Stock: {item.stockQuantity}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div className="cart-qty-control">
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isPlacingOrder}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={isMaxStock || isPlacingOrder}
                        title={isMaxStock ? "Max available stock reached" : "Increase quantity"}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div className="cart-item-subtotal">
                      ₹{subtotal.toFixed(2)}
                    </div>

                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      style={{ padding: "4px 8px" }}
                      onClick={() => onRemoveItem(item.id)}
                      disabled={isPlacingOrder}
                      aria-label="Remove item"
                      title="Remove from cart"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-footer">
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", color: "var(--text-muted)" }}>
              <span>Subtotal</span>
              <span className="currency">₹{totalAmount.toFixed(2)}</span>
            </div>
            <div className="cart-total-row">
              <span>Total Payable</span>
              <span className="cart-total-amount">₹{totalAmount.toFixed(2)}</span>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{ width: "100%", marginTop: "8px" }}
              onClick={onPlaceOrder}
              disabled={cartItems.length === 0 || isPlacingOrder}
            >
              {isPlacingOrder ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
