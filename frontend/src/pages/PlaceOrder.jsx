import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  getWarehouseStock,
  getWarehousesList,
} from "../services/warehouseService";
import { placeOrder } from "../services/orderService";
import { formatCurrency, formatDate } from "../utils/formatters";
import PersonIcon from "@mui/icons-material/Person";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import {
  Box,
  Button,
  TextField,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Container,
} from "@mui/material";

const PlaceOrder = () => {
  const emptyForm = {
    customer_name: "",
    warehouse_id: "",
  };

  const [inputs, setInputs] = useState(emptyForm);
  const [warehouses, setWarehouses] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [step, setStep] = useState(1);
  const [newOrderId, setNewOrderId] = useState(null);
  const [formError, setFormError] = useState({});
  const [error, setError] = useState(null);
  const [loadingWarehouses, setLoadingWarehouses] = useState(true);
  const [loadingStockItems, setLoadingStockItems] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const loadWarehouses = async () => {
    try {
      setLoadingWarehouses(true);
      const data = await getWarehousesList();
      setWarehouses(data);
    } catch (error) {
      console.error(`API Error ${error.status}: ${error.message}`);
      setError("Failed to load warehouses");
    } finally {
      setLoadingWarehouses(false);
    }
  };

  const loadStock = async (id) => {
    try {
      setLoadingStockItems(true);
      const data = await getWarehouseStock(id);
      setStockItems(data);
    } catch (error) {
      console.error(`API Error ${error.status}: ${error.message}`);
      setError("Failed to load warehouse stock");
    } finally {
      setLoadingStockItems(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  const handleInputs = (event) => {
    const { name, value } = event.target;
    setInputs((prev) => ({ ...prev, [name]: value }));

    if (formError[name]) {
      setFormError((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleQuantityChange = (product, value) => {
    if (value < 0) value = 0;
    if (value > product.quantity) value = product.quantity;

    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.product_id === product.product_id,
      );

      if (existing) {
        if (value === 0) {
          return prev.filter((item) => item.product_id !== product.product_id);
        }

        return prev.map((item) =>
          item.product_id === product.product_id
            ? { ...item, quantity: value }
            : item,
        );
      }

      if (value > 0) {
        return [
          ...prev,
          {
            product_id: product.product_id,
            product_name: product.product_name,
            price: product.price,
            quantity: value,
            availableStock: product.quantity,
          },
        ];
      }

      return prev;
    });
  };

  const validateForm = () => {
    setError(null);
    const newErrors = {};

    if (step === 1) {
      if (!inputs.customer_name.trim()) {
        newErrors.customer_name = "Customer name is required";
      } else if (inputs.customer_name.length < 3) {
        newErrors.customer_name = "Must be at least 3 characters long";
      } else if (!/^[A-Za-z\s]+$/.test(inputs.customer_name)) {
        newErrors.customer_name = "Only letters and spaces are allowed";
      }

      if (!inputs.warehouse_id) {
        newErrors.warehouse_id = "Please select a warehouse";
      }
    }

    if (step === 2) {
      if (cartItems.length === 0) {
        setError("Please select at least one product");
        return false;
      }
    }

    setFormError(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return false;
    }

    setStep((prev) => prev + 1);
    return true;
  };

  const handlePlaceOrder = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        warehouse_id: Number(inputs.warehouse_id),
        customer_name: inputs.customer_name,
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      };

      const response = await placeOrder(payload);

      setNewOrderId(response.order_id);
      setSuccess(true);
    } catch (error) {
      console.error(`API Error ${error.status}: ${error.message}`);
      setError("Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  const prevStep = () => {
    setError(null);
    setStep((prev) => (prev > 1 ? prev - 1 : prev));
  };

  if (success) {
    const selectedWarehouse = warehouses.find(
      (warehouse) => warehouse.warehouse_id == inputs.warehouse_id,
    );

    const grandTotal = cartItems.reduce(
      (accumulator, item) => accumulator + item.quantity * item.price,
      0,
    );

    return (
      <Container maxWidth="xl">
        <Paper
          elevation={3}
          sx={{
            mt: 4,
            p: 4,
            borderRadius: 3,
            textAlign: "center",
          }}
        >
          <Typography
            variant="h4"
            fontWeight={700}
            color="success.main"
            gutterBottom
          >
            ✔ Order Placed Successfully
          </Typography>

          <Typography variant="subtitle1" sx={{ mb: 3 }}>
            Your order has been created successfully.
          </Typography>

          <Box
            sx={{
              backgroundColor: "action.hover",
              borderRadius: 2,
              p: 3,
              mb: 3,
              textAlign: "left",
              maxWidth: 500,
              mx: "auto",
            }}
          >
            <Typography fontWeight={600}>Order ID: #{newOrderId}</Typography>

            <Typography>Customer: {inputs.customer_name}</Typography>

            <Typography>
              Warehouse: {selectedWarehouse?.warehouse_name}
            </Typography>

            <Typography>
              Order Date: {formatDate(new Date().toISOString())}
            </Typography>

            <Typography fontWeight={600} sx={{ mt: 1 }}>
              Total Amount: {formatCurrency(grandTotal)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            <Button
              variant="contained"
              component={NavLink}
              to={`/orderItems/${newOrderId}`}
            >
              View Order
            </Button>

            <Button
              variant="outlined"
              onClick={() => {
                setInputs(emptyForm);
                setCartItems([]);
                setStockItems([]);
                setStep(1);
                setSuccess(false);
              }}
            >
              Place Another Order
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          <Typography fontWeight={600}>{error}</Typography>
        </Alert>
      )}

      {(loadingStockItems || loadingWarehouses) && (
        <Typography align="center" fontWeight={600} sx={{ mt: 2 }}>
          Loading Data...
          <CircularProgress sx={{ display: "block", mx: "auto", mt: 1 }} />
        </Typography>
      )}

      <Typography align="center" mb={3}>
        Step {step} of 3
      </Typography>

      {step === 1 && (
        <>
          <Box component="form" sx={{ maxWidth: 500, mx: "auto" }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Customer & Warehouse Information
            </Typography>

            <TextField
              label="Customer Name"
              name="customer_name"
              value={inputs.customer_name}
              onChange={handleInputs}
              fullWidth
              margin="normal"
            />
            {formError.customer_name && (
              <Alert severity="error">{formError.customer_name}</Alert>
            )}

            <TextField
              select
              label="Warehouse"
              name="warehouse_id"
              value={inputs.warehouse_id}
              onChange={handleInputs}
              fullWidth
              margin="normal"
            >
              {warehouses.map((warehouse) => (
                <MenuItem
                  key={warehouse.warehouse_id}
                  value={warehouse.warehouse_id}
                >
                  {warehouse.warehouse_name} - {warehouse.location}
                </MenuItem>
              ))}
            </TextField>
            {formError.warehouse_id && (
              <Alert severity="error">{formError.warehouse_id}</Alert>
            )}

            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => {
                if (validateForm()) {
                  setCartItems([]);
                  loadStock(inputs.warehouse_id);
                }
              }}
              disabled={loadingWarehouses}
            >
              Next
            </Button>
          </Box>
        </>
      )}

      {step === 2 && (
        <>
          <Typography variant="h4" fontWeight={700} mb={4}>
            {
              warehouses.find(
                (warehouse) => warehouse.warehouse_id == inputs.warehouse_id,
              )?.warehouse_name
            }
          </Typography>

          <Typography variant="h5" fontWeight={600} gutterBottom>
            Select Product
          </Typography>

          <Paper
            elevation={1}
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Table
              size="medium"
              sx={{
                "& th": {
                  fontWeight: 600,
                  backgroundColor: "action.hover",
                },
                "& td, & th": {
                  borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                  textAlign: "center",
                },
                "& tr:last-child td": {
                  borderBottom: "none",
                },
                "& tbody tr:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>Product ID</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Available Stock</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Quantity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stockItems
                  .filter((stock) => stock.quantity > 0)
                  .map((stock) => (
                    <TableRow key={stock.product_id}>
                      <TableCell>{stock.product_id}</TableCell>
                      <TableCell>{stock.product_name}</TableCell>
                      <TableCell>{stock.sku}</TableCell>
                      <TableCell>{stock.quantity}</TableCell>
                      <TableCell>
                        <Chip
                          label={stock.stock_status}
                          sx={{ fontWeight: "700" }}
                          color={
                            stock.stock_status.toLowerCase() === "in stock"
                              ? "success"
                              : stock.stock_status.toLowerCase() === "low stock"
                                ? "warning"
                                : stock.stock_status.toLowerCase() ===
                                    "out of stock"
                                  ? "error"
                                  : "default"
                          }
                        />
                      </TableCell>
                      <TableCell>{formatCurrency(stock.price)}</TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          value={
                            cartItems.find(
                              (item) => item.product_id === stock.product_id,
                            )?.quantity || 0
                          }
                          onChange={(e) => {
                            const value =
                              Number(e.target.value) > stock.quantity
                                ? stock.quantity
                                : Number(e.target.value) < 0
                                  ? 0
                                  : Number(e.target.value);

                            handleQuantityChange(stock, value);
                          }}
                          inputProps={{
                            min: 0,
                            max: stock.quantity,
                          }}
                          sx={{ width: 80 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Paper>

          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button variant="outlined" onClick={prevStep}>
              Back
            </Button>
            <Button
              variant="contained"
              onClick={validateForm}
              disabled={cartItems.length === 0}
            >
              Next
            </Button>
          </Box>
        </>
      )}

      {step === 3 && (
        <>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Review Your Order
          </Typography>

          <Paper sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                mb: 2,
                borderRadius: 2,
                backgroundColor: "action.hover",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PersonIcon fontSize="small" color="disabled" />
                <Typography fontWeight={600}>{inputs.customer_name}</Typography>
              </Box>

              <Divider orientation="vertical" flexItem />

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WarehouseIcon fontSize="small" color="disabled" />
                <Typography fontWeight={600}>
                  {
                    warehouses.find(
                      (w) => w.warehouse_id == inputs.warehouse_id,
                    )?.warehouse_name
                  }
                </Typography>
              </Box>

              <Divider orientation="vertical" flexItem />

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarTodayIcon fontSize="small" color="disabled" />
                <Typography fontWeight={600}>
                  {formatDate(new Date().toISOString())}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {cartItems.map((item) => (
              <Box key={item.product_id} sx={{ mb: 2 }}>
                <Typography>Product: {item.product_name}</Typography>
                <Typography>Quantity: {item.quantity}</Typography>
                <Typography>Price: {formatCurrency(item.price)}</Typography>
                <Typography>
                  Subtotal: {formatCurrency(item.quantity * item.price)}
                </Typography>
                <Divider sx={{ my: 1 }} />
              </Box>
            ))}

            <Typography fontWeight={700}>
              Grand Total:{" "}
              {formatCurrency(
                cartItems.reduce(
                  (accumulator, item) =>
                    accumulator + item.quantity * item.price,
                  0,
                ),
              )}
            </Typography>
          </Paper>

          <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
            <Button variant="outlined" onClick={prevStep}>
              Back
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handlePlaceOrder}
              disabled={submitting || cartItems.length === 0}
            >
              {submitting ? "Placing Order..." : "Place Order"}
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
};

export default PlaceOrder;
