import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  getWarehouseStock,
  getWarehousesList,
} from "../services/warehouseService";
import { placeOrder } from "../services/orderService";
import { formatCurrency, formatDate } from "../utils/formatters";

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
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [step, setStep] = useState(1);
  const [formError, setFormError] = useState({});
  const [error, setError] = useState(null);
  const [loadingWarehouses, setLoadingWarehouses] = useState(true);
  const [loadingStockItems, setLoadingStockItems] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newOrderId, setNewOrderId] = useState(null);

  useEffect(() => {
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

    loadWarehouses();
  }, []);

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

  const handleInputs = (event) => {
    const { name, value } = event.target;
    setInputs((prev) => ({ ...prev, [name]: value }));

    if (formError[name]) {
      setFormError((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    setError(null);
    const newErrors = {};

    if (step === 1) {
      if (!inputs.customer_name.trim()) {
        newErrors.customer_name = "Customer name is required";
      } else if (inputs.customer_name.length < 3) {
        newErrors.customer_name = "Must be at least 3 characters";
      } else if (!/^[A-Za-z\s]+$/.test(inputs.customer_name)) {
        newErrors.customer_name = "Only letters and spaces allowed";
      }

      if (!inputs.warehouse_id) {
        newErrors.warehouse_id = "Please select a warehouse";
      }
    }

    if (step === 2) {
      if (!selectedProduct) {
        setError("Please select a product");
        return false;
      }

      if (!quantity || Number(quantity) < 1) {
        setError("Quantity must be at least 1");
        return false;
      }

      if (Number(quantity) > selectedProduct.quantity) {
        setError("Quantity exceeds available stock");
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

  const prevStep = () => {
    setError(null);
    setStep((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handlePlaceOrder = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        warehouse_id: Number(inputs.warehouse_id),
        product_id: selectedProduct.product_id,
        customer_name: inputs.customer_name,
        quantity: Number(quantity),
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

  if (success) {
    return (
      <Container maxWidth="xl">
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography fontWeight={600}>Order placed successfully!</Typography>
          <Typography variant="subtitle2">Order #{newOrderId}</Typography>
        </Alert>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Button
            variant="contained"
            component={NavLink}
            to={`/orderItems/${newOrderId}`}
            sx={{ mr: 2 }}
          >
            View Order
          </Button>

          <Button
            variant="outlined"
            onClick={() => {
              setInputs(emptyForm);
              setSelectedProduct(null);
              setQuantity(0);
              setStep(1);
              setSuccess(false);
            }}
          >
            Place Another Order
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
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
              ).warehouse_name
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
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stockItems.map((stock) => (
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
                      <Button
                        variant="contained"
                        color="info"
                        onClick={() => {
                          setSelectedProduct(stock);
                          setQuantity(0);
                        }}
                      >
                        Add to Order
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              mt: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                visibility: selectedProduct ? "visible" : "hidden",
              }}
            >
              <Typography fontWeight={600}>
                {selectedProduct?.product_name}
              </Typography>

              <TextField
                type="number"
                label="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                sx={{ width: 100 }}
                InputProps={{
                  inputProps: {
                    min: 0,
                  },
                }}
              />
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button variant="outlined" onClick={prevStep}>
                Back
              </Button>
              <Button variant="contained" onClick={validateForm}>
                Next
              </Button>
            </Box>
          </Box>
        </>
      )}

      {step === 3 && selectedProduct && (
        <>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Review Your Order
          </Typography>

          <Paper sx={{ p: 3 }}>
            <Typography>Customer: {inputs.customer_name}</Typography>
            <Typography>
              Warehouse:{" "}
              {
                warehouses.find(
                  (warehouse) => warehouse.warehouse_id == inputs.warehouse_id,
                ).warehouse_name
              }
            </Typography>
            <Typography>
              Order Date: {formatDate(new Date().toISOString())}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography>Product: {selectedProduct.product_name}</Typography>
            <Typography>Quantity: {quantity}</Typography>
            <Typography>
              Price: {formatCurrency(selectedProduct.price)}
            </Typography>
            <Typography>
              Total: {formatCurrency(Number(quantity) * selectedProduct.price)}
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
              disabled={submitting}
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
