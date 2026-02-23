import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  getDashboardMetrics,
  getRecentOrders,
} from "../services/dashboardService";
import { formatDate, formatCurrency } from "../utils/formatters";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Stack,
  Button,
  IconButton,
} from "@mui/material";

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
  });
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loadingKPIs, setLoadingKPIs] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const loadDashboardMetrics = async () => {
    try {
      setError(null);
      setLoadingKPIs(true);
      const data = await getDashboardMetrics();
      setMetrics(data);
    } catch (error) {
      console.error(`API Error ${error.status}: ${error.message}`);
      setError("Failed to load order metrics");
    } finally {
      setLoadingKPIs(false);
    }
  };

  const loadRecentOrders = async () => {
    try {
      setError(null);
      setLoadingOrders(true);
      const data = await getRecentOrders();
      setOrders(data);
    } catch (error) {
      console.error(`API Error ${error.status}: ${error.message}`);
      setError("Failed to load orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadDashboardMetrics();
    loadRecentOrders();
  }, []);

  const KPIs = [
    { label: "Total Orders", value: metrics.totalOrders },
    { label: "Pending Orders", value: metrics.pendingOrders },
    { label: "Completed Orders", value: metrics.completedOrders },
    { label: "Cancelled Orders", value: metrics.cancelledOrders },
  ];

  return (
    <Container maxWidth="xl">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          <Typography fontWeight={600}>{error}</Typography>
        </Alert>
      )}

      {(loadingKPIs || loadingOrders) && (
        <Typography align="center" fontWeight={600} sx={{ mt: 2 }}>
          Loading Data...
          <CircularProgress sx={{ display: "block", mx: "auto", mt: 1 }} />
        </Typography>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          <Typography variant="h4" fontWeight={700}>
            Dashboard
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
              loadDashboardMetrics();
              loadRecentOrders();
            }}
            disabled={loadingKPIs || loadingOrders}
          >
            <RefreshIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color="primary"
            component={NavLink}
            to="/orders"
          >
            View Orders
          </Button>

          <Button
            variant="contained"
            color="primary"
            component={NavLink}
            to="/orders/place"
          >
            Place Order
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3} mb={5}>
        {KPIs.map((item, index) => (
          <Grid size={{ xs: 12, sm: 3 }} key={index}>
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

              <Typography variant="h4" fontWeight={700} mt={1}>
                {item.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

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
                <TableCell>Order Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Total Amount</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.order_id}>
                  <TableCell>{order.order_id}</TableCell>
                  <TableCell>{order.customer_name} </TableCell>
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
                      size="medium"
                    />
                  </TableCell>
                  <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;
