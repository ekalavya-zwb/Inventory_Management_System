import React, { useState, useEffect } from "react";
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
  Box,
  Paper,
  Alert,
  Container,
  IconButton,
} from "@mui/material";

const WarehousesList = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [error, setError] = useState(null);
  const [loadingWarehouses, setLoadingWarehouses] = useState(true);

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

  return (
    <Container maxWidth="xl">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography fontWeight={600}>{error}</Typography>
        </Alert>
      )}

      {loadingWarehouses && (
        <Typography align="center" fontWeight={600} sx={{ mt: 2 }}>
          Loading Warehouses...
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
          Warehouses
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
            loadWarehousesList();
          }}
          disabled={loadingWarehouses}
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
                <TableCell>Warehouse ID</TableCell>
                <TableCell>Warehouse</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {warehouses.map((warehouse) => (
                <TableRow key={warehouse.warehouse_id}>
                  <TableCell>{warehouse.warehouse_id} </TableCell>
                  <TableCell>{warehouse.warehouse_name} </TableCell>
                  <TableCell>{warehouse.location} </TableCell>
                  <TableCell>
                    <Button
                      component={NavLink}
                      to={`/warehouses/${warehouse.warehouse_id}/stock`}
                      variant="outlined"
                      color="info"
                    >
                      View Stocks
                    </Button>
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

export default WarehousesList;
