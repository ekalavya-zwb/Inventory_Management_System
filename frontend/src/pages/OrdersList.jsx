import React, { useState, useEffect, useMemo } from "react";
import { getOrdersList, orderCancel } from "../services/orderService";
import { formatCurrency, formatDate } from "../utils/formatters";
import { getWarehousesList } from "../services/warehouseService";
import { NavLink } from "react-router-dom";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Typography,
  Button,
  TextField,
  Stack,
  MenuItem,
  FormControl,
  Select,
  Box,
  Paper,
  Alert,
  Chip,
  Container,
  IconButton,
} from "@mui/material";

const OrderList = () => {
  const emptyFilters = {
    order_id: "",
    customer_name: "",
    warehouse_id: "",
    status: "",
    order_date: "",
    total_amount: "",
  };

  const [orders, setOrders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingWarehouses, setLoadingWarehouses] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const cancelOrder = async (id) => {
    try {
      setError(null);
      setCancellingId(id);
      await orderCancel(id);
      const updatedOrders = await getOrdersList();
      setOrders(updatedOrders);
      setSuccess(true);
    } catch (error) {
      console.error(`API Error ${error.status}: ${error.message}`);
      setError("Failed to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  const loadOrdersList = async () => {
    try {
      setError(null);
      setLoadingOrders(true);
      const data = await getOrdersList();
      setOrders(data);
    } catch (error) {
      console.error(`API Error ${error.status}: ${error.message}`);
      setError("Failed to load orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadWarehousesList = async () => {
    try {
      setError(null);
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

  useEffect(() => {
    loadWarehousesList();
  }, []);

  useEffect(() => {
    loadOrdersList();
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [success]);

  let updateFilters = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  let filteredOrders = useMemo(() => {
    let result = orders.filter((order) => {
      const { order_id, customer_name, warehouse_id, status } = filters;

      if (order_id && Number(order.order_id) !== Number(order_id)) return false;

      if (warehouse_id && Number(order.warehouse_id) !== Number(warehouse_id))
        return false;

      if (
        customer_name &&
        !order.customer_name
          .toLowerCase()
          .includes(customer_name.toLowerCase().trim())
      )
        return false;

      if (status && order.status.toLowerCase() !== status.toLowerCase())
        return false;

      return true;
    });

    if (filters.order_date) {
      result.sort((a, b) =>
        filters.order_date === "asc"
          ? a.order_date.localeCompare(b.order_date)
          : b.order_date.localeCompare(a.order_date),
      );
    } else if (filters.total_amount) {
      result.sort((a, b) =>
        filters.total_amount === "asc"
          ? Number(a.total_amount) - Number(b.total_amount)
          : Number(b.total_amount) - Number(a.total_amount),
      );
    }

    return result;
  }, [orders, filters]);

  const filtersCount = useMemo(() => {
    return Object.values(filters).filter(
      (value) => value !== "" && value !== null && value !== undefined,
    ).length;
  }, [filters]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const handleOrderCancel = async (id) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      await cancelOrder(id);
    }
  };

  return (
    <Container maxWidth="xl">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography fontWeight={600}>{error}</Typography>
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess(false)}
        >
          <Typography fontWeight={600}>
            Order cancelled successfully!
          </Typography>
        </Alert>
      )}

      {(loadingOrders || loadingWarehouses) && (
        <Typography align="center" fontWeight={600} sx={{ mt: 2 }}>
          Loading Data...
          <CircularProgress sx={{ display: "block", mx: "auto", mt: 1 }} />
        </Typography>
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
          Orders
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
            loadOrdersList();
            loadWarehousesList();
          }}
          disabled={loadingWarehouses || loadingOrders}
        >
          <RefreshIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={3} useFlexGap flexWrap="wrap">
          <TextField
            size="small"
            label="Customer"
            sx={{ width: 180 }}
            value={filters.customer_name}
            onChange={(e) => updateFilters("customer_name", e.target.value)}
          />

          <FormControl size="small" sx={{ width: 200 }}>
            <Select
              displayEmpty
              value={filters.warehouse_id}
              onChange={(e) => updateFilters("warehouse_id", e.target.value)}
            >
              <MenuItem value="">All Warehouses</MenuItem>
              {warehouses.map((warehouse) => (
                <MenuItem
                  key={warehouse.warehouse_id}
                  value={warehouse.warehouse_id}
                >
                  {warehouse.warehouse_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ width: 200 }}>
            <Select
              displayEmpty
              value={filters.total_amount}
              onChange={(e) => {
                updateFilters("total_amount", e.target.value);
                updateFilters("order_date", "");
              }}
            >
              <MenuItem value="">Sort By Total Amount</MenuItem>
              <MenuItem value="desc">Highest First</MenuItem>
              <MenuItem value="asc">Lowest First</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ width: 200 }}>
            <Select
              displayEmpty
              value={filters.order_date}
              onChange={(e) => {
                updateFilters("order_date", e.target.value);
                updateFilters("total_amount", "");
              }}
            >
              <MenuItem value="">Sort By Order Date</MenuItem>
              <MenuItem value="desc">Newest First</MenuItem>
              <MenuItem value="asc">Oldest First</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ width: 140 }}>
            <Select
              displayEmpty
              value={filters.status}
              onChange={(e) => updateFilters("status", e.target.value)}
            >
              <MenuItem value="">All Orders</MenuItem>
              <MenuItem value="Placed">Placed</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>

          <Button
            color="inherit"
            variant="outlined"
            size="medium"
            sx={{ height: 40 }}
            onClick={() => setFilters(emptyFilters)}
          >
            Clear
          </Button>
        </Stack>

        <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>
          Filters ({filtersCount})
        </Typography>
      </Box>

      {filteredOrders.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            mb: 8,
            color: "text.secondary",
          }}
        >
          <Typography variant="h6" gutterBottom>
            No orders found
          </Typography>
          <Typography variant="body2">
            Try adjusting your filters or clear them.
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => setFilters(emptyFilters)}
          >
            Clear Filters
          </Button>
        </Box>
      )}

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
                <TableCell>Customer</TableCell>
                <TableCell>Warehouse</TableCell>
                <TableCell>Order Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedOrders.map((order) => (
                <TableRow key={order.order_id}>
                  <TableCell>{order.order_id}</TableCell>
                  <TableCell>{order.customer_name} </TableCell>
                  <TableCell>{order.warehouse_name} </TableCell>
                  <TableCell>{formatDate(order.order_date)}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      sx={{ fontWeight: "700" }}
                      color={
                        order.status.toLowerCase() === "completed"
                          ? "success"
                          : order.status.toLowerCase() === "placed"
                            ? "info"
                            : order.status.toLowerCase() === "cancelled"
                              ? "error"
                              : "default"
                      }
                    />
                  </TableCell>
                  <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                  <TableCell>
                    <Stack
                      direction="row"
                      spacing={1.5}
                      justifyContent="center"
                    >
                      <Button
                        component={NavLink}
                        to={`/orderItems/${order.order_id}`}
                        variant="outlined"
                        color="info"
                      >
                        View
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        disabled={
                          order.status.toLowerCase() !== "placed" ||
                          cancellingId === order.order_id
                        }
                        onClick={() => handleOrderCancel(order.order_id)}
                      >
                        {cancellingId === order.order_id
                          ? "Cancelling..."
                          : "Cancel"}
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {filteredOrders.length > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 3,
              mt: 3,
            }}
          >
            <Button
              variant="outlined"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </Button>

            <Typography fontWeight={600}>
              Page {currentPage} of {totalPages || 1}
            </Typography>

            <Button
              variant="outlined"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default OrderList;
