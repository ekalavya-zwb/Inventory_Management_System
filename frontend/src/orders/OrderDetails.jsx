import React, { useState, useEffect } from "react";
import { getOrderItems, getOrder } from "../services/orderService";
import { NavLink, useParams } from "react-router-dom";
import { formatCurrency, formatDate } from "../utils/formatters";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Typography,
  Box,
  Paper,
  Alert,
  Container,
  Grid,
  IconButton,
} from "@mui/material";

const OrderDetails = () => {
  const [orderItems, setOrderItems] = useState([]);
  const [order, setOrder] = useState({
    customer_name: "Guest",
    warehouse_name: "XYZ Warehouse",
    order_date: new Date(),
  });
  const [error, setError] = useState(null);
  const [loadingOrderItems, setLoadingOrderItems] = useState(true);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const { id } = useParams();

  const grandTotal = orderItems.reduce(
    (accumulator, item) =>
      accumulator + Number(item.quantity) * Number(item.price),
    0,
  );

  const KPIs = [
    { label: "Customer", value: order.customer_name },
    { label: "Warehouse", value: order.warehouse_name },
    { label: "Order Date", value: formatDate(order.order_date) },
  ];

  const loadOrderItems = async (id) => {
    try {
      setError(null);
      setLoadingOrderItems(true);
      const data = await getOrderItems(id);
      setOrderItems(data);
    } catch (error) {
      console.error(`API Error ${error.status}: ${error.message}`);
      setError("Failed to load order items");
    } finally {
      setLoadingOrderItems(false);
    }
  };

  const loadOrder = async (id) => {
    try {
      setError(null);
      setLoadingOrder(true);
      const data = await getOrder(id);
      setOrder(data);
    } catch (error) {
      console.error(`API Error ${error.status}: ${error.message}`);
      setError("Failed to load order");
    } finally {
      setLoadingOrder(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadOrder(id);
      loadOrderItems(id);
    }
  }, [id]);

  return (
    <Container maxWidth="xl">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography fontWeight={600}>{error}</Typography>
        </Alert>
      )}

      {(loadingOrderItems || loadingOrder) && (
        <Typography align="center" fontWeight={600} sx={{ mt: 2 }}>
          Loading Data...
          <CircularProgress sx={{ display: "block", mx: "auto", mt: 1 }} />
        </Typography>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          mb: 4,
        }}
      >
        <IconButton
          component={NavLink}
          to="/orders"
          sx={{
            backgroundColor: "error.main",
            color: "white",
            borderRadius: "50%",
            "&:hover": {
              backgroundColor: "error.dark",
            },
          }}
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {!loadingOrder && (
        <Grid container spacing={3} mb={5}>
          {KPIs.map((item, index) => (
            <Grid size={{ xs: 12, sm: 4 }} key={index}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  textAlign: "center",
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  {item.label}
                </Typography>

                <Typography variant="h5" fontWeight={700} mt={1}>
                  {item.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          mb: 4,
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          Order Items
        </Typography>

        <IconButton
          title="Refresh"
          sx={{
            backgroundColor: "info.main",
            color: "white",
            borderRadius: "50%",
            "&:hover": {
              backgroundColor: "info.dark",
            },
          }}
          onClick={() => {
            if (id) {
              loadOrder(id);
              loadOrderItems(id);
            }
          }}
          disabled={loadingOrder || loadingOrderItems}
        >
          <RefreshIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <Box>
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
                <TableCell>Order ID</TableCell>
                <TableCell>Product ID</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Sub Total</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {orderItems.map((order) => (
                <TableRow key={`${order.order_id}-${order.product_id}`}>
                  <TableCell>{order.order_id}</TableCell>
                  <TableCell>{order.product_id} </TableCell>
                  <TableCell>{order.quantity} </TableCell>
                  <TableCell>{formatCurrency(order.price)} </TableCell>
                  <TableCell>
                    {formatCurrency(
                      Number(order.quantity) * Number(order.price),
                    )}
                  </TableCell>
                </TableRow>
              ))}

              <TableRow>
                <TableCell colSpan={3}></TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Grand Total:</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  {formatCurrency(grandTotal)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Container>
  );
};

export default OrderDetails;
