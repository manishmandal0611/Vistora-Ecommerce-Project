import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const formatCartResponse = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate(
    "items.product",
    "name price image stock category brand",
  );

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  // Filter out items whose product was deleted from catalog
  const validItems = cart.items.filter((item) => item.product !== null);
  if (validItems.length !== cart.items.length) {
    cart.items = validItems;
    await cart.save();
  }

  const subtotal = cart.calculateSubtotal();
  const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  return {
    id: cart._id,
    items: cart.items,
    totalItems,
    subtotal,
  };
};

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res, next) => {
  try {
    const cartData = await formatCartResponse(req.user._id);
    res.status(200).json({
      success: true,
      cart: cartData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to cart or increment quantity
// @route   POST /api/cart/items
// @access  Private
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const qtyToAdd = Number(quantity);

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "productId is required",
      });
    }

    if (!Number.isInteger(qtyToAdd) || qtyToAdd < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock < 1) {
      return res.status(400).json({
        success: false,
        message: "Product is currently out of stock",
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString(),
    );

    if (existingItemIndex > -1) {
      const newQuantity = cart.items[existingItemIndex].quantity + qtyToAdd;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} unit(s) available in stock`,
        });
      }
      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].priceAtAddition = product.price;
    } else {
      if (qtyToAdd > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} unit(s) available in stock`,
        });
      }
      cart.items.push({
        product: product._id,
        quantity: qtyToAdd,
        priceAtAddition: product.price,
      });
    }

    await cart.save();
    const cartData = await formatCartResponse(req.user._id);

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      cart: cartData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update quantity of a cart item
// @route   PUT /api/cart/items/:productId
// @access  Private
export const updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const quantity = Number(req.body.quantity);

    if (!Number.isInteger(quantity)) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be an integer",
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString(),
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product no longer exists",
        });
      }
      if (quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} unit(s) available in stock`,
        });
      }
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].priceAtAddition = product.price;
    }

    await cart.save();
    const cartData = await formatCartResponse(req.user._id);

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart: cartData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a single item from cart
// @route   DELETE /api/cart/items/:productId
// @access  Private
export const removeCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId.toString(),
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    await cart.save();
    const cartData = await formatCartResponse(req.user._id);

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart: cartData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all items from cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    } else {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: "Cart cleared",
      cart: {
        id: cart._id,
        items: [],
        totalItems: 0,
        subtotal: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
