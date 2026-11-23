import crypto from "crypto";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const getMockSecret = () =>
  process.env.MOCK_PAYMENT_SECRET ||
  "mock_payment_gateway_secret_key_987654321";

const computeMockSignature = (gatewayOrderId, gatewayPaymentId) => {
  return crypto
    .createHmac("sha256", getMockSecret())
    .update(`${gatewayOrderId}|${gatewayPaymentId}`)
    .digest("hex");
};

// @desc    Create a pending order & mock payment order (Razorpay/Stripe style)
// @route   POST /api/payments/create-order
// @access  Private
export const createMockPaymentOrder = async (req, res, next) => {
  try {
    const { provider = "mock_razorpay", shippingAddress } = req.body;

    if (!["mock_razorpay", "mock_stripe"].includes(provider)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment provider. Use mock_razorpay or mock_stripe",
      });
    }

    const address = shippingAddress || req.user.address;
    if (
      !address ||
      !address.street?.trim() ||
      !address.city?.trim() ||
      !address.state?.trim() ||
      !address.postalCode?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Complete shipping address (street, city, state, postalCode) is required",
      });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
    );
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = item.product;
      if (!product) {
        return res.status(400).json({
          success: false,
          message: "One of the products in your cart is no longer available",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}`,
        });
      }

      subtotal += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: item.quantity,
      });
    }

    const taxAmount = Number((subtotal * 0.18).toFixed(2));
    const shippingFee = subtotal >= 999 ? 0 : 79;
    const totalAmount = Number((subtotal + taxAmount + shippingFee).toFixed(2));

    const prefix =
      provider === "mock_razorpay" ? "order_mock_rzp" : "pi_mock_stripe";
    const gatewayOrderId = `${prefix}_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress: {
        street: address.street.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        postalCode: address.postalCode.trim(),
        country: address.country?.trim() || "India",
      },
      subtotal,
      taxAmount,
      shippingFee,
      totalAmount,
      paymentInfo: {
        provider,
        gatewayOrderId,
        status: "pending",
      },
      orderStatus: "pending_payment",
    });

    res.status(201).json({
      success: true,
      message: "Mock payment order created",
      order,
      gateway: {
        provider,
        gatewayOrderId,
        amount: totalAmount,
        currency: "INR",
        keyHint:
          provider === "mock_razorpay"
            ? "rzp_test_mock_key"
            : "pk_test_mock_key",
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify mock payment & confirm order (deducts stock & clears cart)
// @route   POST /api/payments/verify
// @access  Private
export const verifyMockPayment = async (req, res, next) => {
  try {
    const {
      orderId,
      gatewayOrderId,
      gatewayPaymentId: providedPaymentId,
      signature: providedSignature,
      simulateFailure = false,
    } = req.body;

    const order = orderId
      ? await Order.findById(orderId)
      : await Order.findOne({ "paymentInfo.gatewayOrderId": gatewayOrderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to verify payment for this order",
      });
    }

    if (order.paymentInfo.status === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified for this order",
        order,
      });
    }

    const targetGatewayOrderId =
      gatewayOrderId || order.paymentInfo.gatewayOrderId;
    if (targetGatewayOrderId !== order.paymentInfo.gatewayOrderId) {
      return res.status(400).json({
        success: false,
        message: "Gateway order ID mismatch",
      });
    }

    if (simulateFailure) {
      order.paymentInfo.status = "failed";
      order.orderStatus = "cancelled";
      await order.save();

      return res.status(400).json({
        success: false,
        message: "Mock payment failed or was declined",
        order,
      });
    }

    const gatewayPaymentId =
      providedPaymentId ||
      `pay_mock_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;

    const expectedSignature = computeMockSignature(
      targetGatewayOrderId,
      gatewayPaymentId,
    );

    // If client passed a signature, verify it strictly; if using quick-pay checkout modal,
    // generate/verify signature using the server secret.
    const signatureToVerify = providedSignature || expectedSignature;
    const isValidSignature =
      providedSignature && providedSignature.length === expectedSignature.length
        ? crypto.timingSafeEqual(
            Buffer.from(providedSignature),
            Buffer.from(expectedSignature),
          )
        : signatureToVerify === expectedSignature;

    if (!isValidSignature) {
      order.paymentInfo.status = "failed";
      await order.save();

      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed",
      });
    }

    // Atomically verify & decrement stock for each item
    for (const item of order.items) {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true },
      );

      if (!updatedProduct) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${item.name}" at payment confirmation`,
        });
      }
    }

    order.paymentInfo.gatewayPaymentId = gatewayPaymentId;
    order.paymentInfo.signature = signatureToVerify;
    order.paymentInfo.status = "paid";
    order.paymentInfo.paidAt = new Date();
    order.orderStatus = "confirmed";
    await order.save();

    // Clear user's cart after successful payment
    await Cart.findOneAndUpdate({ user: order.user }, { $set: { items: [] } });

    res.status(200).json({
      success: true,
      message: "Mock payment verified and order confirmed",
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user's orders
// @route   GET /api/payments/orders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID
// @route   GET /api/payments/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};
