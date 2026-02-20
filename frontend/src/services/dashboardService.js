import api from "./api";

const getDashboardMetrics = async () => {
  const response = await api.get("/dashboard");
  return response.data;
};

const getRecentOrders = async () => {
  const response = await api.get("/orders/recent");
  return response.data;
};

export { getDashboardMetrics, getRecentOrders };
