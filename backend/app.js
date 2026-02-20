const express = require("express");
const cors = require("cors");
const con = require("./db/db.js");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));
app.set("json spaces", 2);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to my Express application!",
  });
});

app.get("/api/orders", async (req, res) => {
  try {
    const [rows] = await con.query(
      `SELECT o.order_id, o.warehouse_id, o.customer_name, w.warehouse_name, o.order_date, o.status, SUM(oi.price * oi.quantity) AS total_amount FROM ORDERS o
        JOIN warehouses w ON o.warehouse_id = w.warehouse_id 
        JOIN order_items oi ON oi.order_id = o.order_id 
        GROUP BY o.order_id, o.customer_name, o.warehouse_id ,w.warehouse_name, o.order_date, o.status 
        ORDER BY o.order_id`,
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error(`GET /api/orders error:`, error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

app.get("/api/orders/recent", async (req, res) => {
  try {
    const [rows] = await con.query(
      `SELECT o.order_id, o.customer_name, o.order_date, o.status, SUM(oi.price * oi.quantity) AS total_amount FROM ORDERS o
        JOIN order_items oi ON oi.order_id = o.order_id 
        GROUP BY o.order_id, o.customer_name, o.order_date, o.status 
        ORDER BY o.order_date DESC 
        LIMIT 5`,
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error(`GET /api/orders/recent error:`, error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

app.get("/api/orders/:id", async (req, res) => {
  const order_id = Number(req.params.id);

  if (Number.isNaN(order_id)) {
    return res.status(400).json({ message: "Invalid order ID" });
  }

  try {
    const [rows] = await con.query(
      `SELECT o.order_id, o.warehouse_id, o.customer_name, w.warehouse_name, o.order_date, o.status, SUM(oi.price * oi.quantity) AS total_amount FROM ORDERS o
        JOIN warehouses w ON o.warehouse_id = w.warehouse_id 
        JOIN order_items oi ON oi.order_id = o.order_id 
        GROUP BY o.order_id, o.customer_name, o.warehouse_id ,w.warehouse_name, o.order_date, o.status 
        HAVING order_id = ?
        ORDER BY o.order_id`,
      [order_id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Order does not exist" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(`GET /api/orders/${order_id} error:`, error);
    res.status(500).json({ message: "Failed to fetch order" });
  }
});

app.get("/api/orderItems/:id", async (req, res) => {
  const order_id = Number(req.params.id);

  if (Number.isNaN(order_id)) {
    return res.status(400).json({ message: "Invalid order ID" });
  }

  try {
    const [rows] = await con.query(
      `SELECT * FROM order_items WHERE order_id = ?`,
      [order_id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Order does not exist" });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error(`GET /api/orderItems/${order_id} error:`, error);
    res.status(500).json({ message: "Failed to fetch order items" });
  }
});

app.post("/api/orders", async (req, res) => {
  const { warehouse_id, product_id, customer_name, quantity } = req.body;

  try {
    const sql = `CALL order_placement (?, ?, ?, ?, @order_id);`;
    const values = [warehouse_id, product_id, customer_name, quantity];

    await con.query(sql, values);

    const [result] = await con.query("SELECT @order_id AS order_id");

    res.status(201).json({
      message: "Order placed successfully",
      order_id: result[0].order_id,
    });
  } catch (error) {
    console.error(`POST /api/orders:`, error);
    res.status(400).json({
      message: error.sqlMessage || "Order placement failed",
    });
  }
});

app.put("/api/orders/:id/cancel", async (req, res) => {
  const order_id = Number(req.params.id);

  if (Number.isNaN(order_id)) {
    return res.status(400).json({ message: "Invalid order ID" });
  }

  try {
    await con.query("CALL order_cancellation (?)", [order_id]);

    res.status(201).json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error(`PUT /api/orders/${order_id}/cancel":`, error);
    res.status(400).json({
      message: error.sqlMessage || "Order cancellation failed",
    });
  }
});

app.get("/api/warehouses", async (req, res) => {
  try {
    const [rows] = await con.query(`SELECT * FROM warehouses`);

    res.status(200).json(rows);
  } catch (error) {
    console.error(`GET /api/warehouses error:`, error);
    res.status(500).json({ message: "Failed to fetch warehouses" });
  }
});

app.get("/api/warehouses/:id/metrics", async (req, res) => {
  const warehouse_id = Number(req.params.id);

  if (Number.isNaN(warehouse_id)) {
    return res.status(400).json({ message: "Invalid warehouse ID" });
  }

  try {
    const [totalUnits] = await con.query(
      "SELECT SUM(quantity) AS total_units FROM warehouse_stock WHERE warehouse_id = ?",
      [warehouse_id],
    );

    const [totalProducts] = await con.query(
      "SELECT COUNT(*) AS total_products FROM warehouse_stock WHERE warehouse_id = ?",
      [warehouse_id],
    );

    const [lowStockCount] = await con.query(
      "SELECT COUNT(*) AS low_stock_count FROM warehouse_stock WHERE warehouse_id = ? AND (quantity >= 1 AND quantity <= 20)",
      [warehouse_id],
    );

    const [outOfStockCount] = await con.query(
      "SELECT COUNT(*) AS out_of_stock_count FROM warehouse_stock WHERE warehouse_id = ? AND quantity < 1",
      [warehouse_id],
    );

    if (
      totalProducts.length === 0 ||
      totalUnits.length === 0 ||
      lowStockCount.length === 0 ||
      outOfStockCount.length === 0
    ) {
      return res.status(404).json({ message: "Warehouse does not exist" });
    }

    res.status(200).json({
      totalProducts: totalProducts[0].total_products,
      totalUnits: totalUnits[0].total_units,
      lowStockCount: lowStockCount[0].low_stock_count,
      outOfStockCount: outOfStockCount[0].out_of_stock_count,
    });
  } catch (error) {
    console.error(`GET /api/warehouses/${warehouse_id}/metrics error:`, error);
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/warehouses/:id/stock", async (req, res) => {
  const warehouse_id = Number(req.params.id);

  if (Number.isNaN(warehouse_id)) {
    return res.status(400).json({ message: "Invalid warehouse ID" });
  }

  try {
    const [rows] = await con.query(
      `SELECT p.product_id, ws.warehouse_id, p.product_name, p.sku, ws.quantity, p.price, 
       CASE
	          WHEN ws.quantity > 20 THEN "In Stock"
            WHEN ws.quantity >= 1 AND ws.quantity <= 20 THEN "Low Stock"
            ELSE "Out of Stock"
       END AS stock_status
       FROM products p
       JOIN warehouse_stock ws 
       ON p.product_id = ws.product_id
       WHERE ws.warehouse_id = ?`,
      [warehouse_id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Warehouse does not exist" });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error(`GET /api/warehouses/${warehouse_id}/stock error:`, error);
    res.status(500).json({ message: "Failed to fetch warehouse stocks" });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const [rows] = await con.query(`SELECT * FROM products`);

    res.status(200).json(rows);
  } catch (error) {
    console.error(`GET /api/warehouses error:`, error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

app.get("/api/dashboard", async (req, res) => {
  try {
    const [totalOrders] = await con.query(
      "SELECT COUNT(*) AS total_orders FROM orders",
    );

    const [pendingOrders] = await con.query(
      "SELECT COUNT(*) AS pending_orders FROM orders WHERE status = 'PLACED'",
    );

    const [completedOrders] = await con.query(
      "SELECT COUNT(*) AS completed_orders FROM orders WHERE status = 'COMPLETED'",
    );

    const [cancelledOrders] = await con.query(
      "SELECT COUNT(*) AS cancelled_orders FROM orders WHERE status = 'CANCELLED'",
    );

    res.status(200).json({
      totalOrders: totalOrders[0].total_orders,
      pendingOrders: pendingOrders[0].pending_orders,
      completedOrders: completedOrders[0].completed_orders,
      cancelledOrders: cancelledOrders[0].cancelled_orders,
    });
  } catch (error) {
    console.error(`GET /api/dashboard error:`, error);
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
