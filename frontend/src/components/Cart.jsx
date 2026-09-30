import { CartIcon, TrashIcon } from "./Icons";

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
          <CartIcon size={16} />
          <span>Current Ticket</span>
          {cartItems.length > 0 && (
            <span className="badge badge-success" style={{ marginLeft: "4px" }}>
              {totalItemCount} {totalItemCount === 1 ? "unit" : "units"}
            </span>
          )}
        </div>
        {cartItems.length > 0 && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={onClearCart}
            disabled={isPlacingOrder}
            title="Clear all items"
          >
            Clear
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <p style={{ fontWeight: 600, color: "var(--text-main)" }}>No items in ticket</p>
          <p style={{ fontSize: "0.8rem", marginTop: "3px" }}>Select products from the catalog to build this order.</p>
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
                      ₹{Number(item.price).toFixed(2)} &bull; Stock: {item.stockQuantity}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
                        title={isMaxStock ? "Max stock reached" : "Increase quantity"}
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
                      style={{ padding: "3px 6px" }}
                      onClick={() => onRemoveItem(item.id)}
                      disabled={isPlacingOrder}
                      aria-label="Remove item"
                      title="Remove line"
                    >
                      <TrashIcon size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-footer">
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              <span>Subtotal ({totalItemCount} units)</span>
              <span className="currency">₹{totalAmount.toFixed(2)}</span>
            </div>
            <div className="cart-total-row">
              <span>Total Payable</span>
              <span className="cart-total-amount">₹{totalAmount.toFixed(2)}</span>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{ width: "100%", marginTop: "4px" }}
              onClick={onPlaceOrder}
              disabled={cartItems.length === 0 || isPlacingOrder}
            >
              {isPlacingOrder ? "Processing..." : `Complete Sale (₹${totalAmount.toFixed(2)})`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
