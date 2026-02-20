import api from "./api";

const getWarehousesList = async () => {
  const response = await api.get("/warehouses");
  return response.data;
};

const getWarehouseStockMetrics = async (id) => {
  const response = await api.get(`/warehouses/${id}/metrics`);
  return response.data;
};

const getWarehouseStock = async (id) => {
  const response = await api.get(`/warehouses/${id}/stock`);
  return response.data;
};

export { getWarehousesList, getWarehouseStock, getWarehouseStockMetrics };
