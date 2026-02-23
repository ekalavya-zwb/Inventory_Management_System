import React, { useState, useEffect, useMemo } from "react";
import {
  getWarehouseStock,
  getWarehouseStockMetrics,
} from "../services/warehouseService";
import { NavLink, useParams } from "react-router-dom";
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
  Button,
  TextField,
  Box,
  Paper,
  Alert,
  Chip,
  Container,
  Grid,
  IconButton,
} from "@mui/material";
import { formatCurrency } from "../utils/formatters";

const WarehouseStocks = () => {
  const [stockItems, setStockItems] = useState([]);
  const [stockMetrics, setStockMetrics] = useState({
    totalProducts: 0,
    totalUnits: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });
  const [error, setError] = useState(null);
  const [loadingStockItems, setLoadingStockItems] = useState(true);
  const [loadingKPIs, setLoadingKPIs] = useState(true);
  const [filters, setFilters] = useState({ search: "" });
  const [debouncedProduct, setDebouncedProduct] = useState(filters.search);
  const { id } = useParams();

  const loadWarehouseStocksMetrics = async (id) => {
    try {
      setError(null);
      setLoadingKPIs(true);
      const data = await getWarehouseStockMetrics(id);
      setStockMetrics(data);
    } catch (error) {
      console.error(`API Error ${error.status}: ${error.message}`);
      setError("Failed to load stock metrics");
    } finally {
      setLoadingKPIs(false);
    }
  };

  const loadStockItems = async (id) => {
    try {
      setError(null);
      setLoadingStockItems(true);
      const data = await getWarehouseStock(id);
      setStockItems(data);
    } catch (error) {
      console.error(`API Error ${error.status}: ${error.message}`);
      setError("Failed to load warehouse stocks");
    } finally {
      setLoadingStockItems(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadWarehouseStocksMetrics(id);
      loadStockItems(id);
    }
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedProduct(filters.search);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search]);

  const filteredStock = useMemo(() => {
    const searchValue = debouncedProduct.toLowerCase().trim();

    if (!searchValue) return stockItems;

    return stockItems.filter(
      (stock) =>
        stock.product_name.toLowerCase().includes(searchValue) ||
        stock.sku.toLowerCase().includes(searchValue),
    );
  }, [debouncedProduct, stockItems]);

  const KPIs = [
    { label: "Total Products", value: stockMetrics.totalProducts },
    { label: "Total Units", value: stockMetrics.totalUnits },
    { label: "Low stock items count", value: stockMetrics.lowStockCount },
    {
      label: "Out of stock items count",
      value: stockMetrics.outOfStockCount,
    },
  ];

  return (
    <Container maxWidth="xl">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          <Typography fontWeight={600}>{error}</Typography>
        </Alert>
      )}

      {(loadingStockItems || loadingKPIs) && (
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
          to="/warehouses"
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

      {!loadingKPIs && (
        <Grid container spacing={3} mb={5}>
          {KPIs.map((item) => (
            <Grid size={{ xs: 12, sm: 3 }} key={item.label}>
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
          Warehouse Stocks
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
              loadWarehouseStocksMetrics(id);
              loadStockItems(id);
            }
          }}
          disabled={loadingStockItems || loadingKPIs}
        >
          <RefreshIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <TextField
            size="small"
            label="Search"
            placeholder="Search by Product Name or SKU"
            fullWidth
            sx={{
              flex: 1,
              minWidth: 250,
            }}
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
          />

          <Button
            color="inherit"
            variant="outlined"
            size="medium"
            sx={{ height: 40 }}
            onClick={() => setFilters({ search: "" })}
            disabled={!filters.search}
          >
            Clear
          </Button>
        </Box>

        <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>
          {filteredStock.length} Results
        </Typography>
      </Box>

      {filteredStock.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            mb: 9,
            color: "text.secondary",
          }}
        >
          <Typography variant="h6" gutterBottom>
            No stock items found
          </Typography>
          <Typography variant="body2">
            Try adjusting your filter or clear it.
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => setFilters({ search: "" })}
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
                <TableCell>Product Name</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Available Quantity</TableCell>
                <TableCell>Unit Price</TableCell>
                <TableCell>Stock Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredStock.map((stock) => (
                <TableRow key={`${stock.warehouse_id}-${stock.product_id}`}>
                  <TableCell>{stock.product_name}</TableCell>
                  <TableCell>{stock.sku}</TableCell>
                  <TableCell>{stock.quantity} </TableCell>
                  <TableCell>{formatCurrency(stock.price)} </TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Container>
  );
};

export default WarehouseStocks;
