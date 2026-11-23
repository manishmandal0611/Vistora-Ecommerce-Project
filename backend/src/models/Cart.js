import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },
    priceAtAddition: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
  },
  { _id: true },
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
  },
);

cartSchema.methods.calculateSubtotal = function () {
  if (!Array.isArray(this.items) || this.items.length === 0) {
    return 0;
  }

  return this.items.reduce((sum, item) => {
    const unitPrice =
      item.product && typeof item.product.price === "number"
        ? item.product.price
        : item.priceAtAddition;
    return sum + unitPrice * item.quantity;
  }, 0);
};

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
