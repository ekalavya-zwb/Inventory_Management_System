import api from "./api";

const getOrdersList = async () => {
  const response = await api.get("/orders");
  return response.data;
};

const getOrder = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

const orderCancel = async (id) => {
  const response = await api.put(`/orders/${id}/cancel`);
  return response.data;
};

const getOrderItems = async (id) => {
  const response = await api.get(`/orderItems/${id}`);
  return response.data;
};

const placeOrder = async (orderData) => {
  const response = await api.post("/orders", orderData);
  return response.data;
};

export { getOrdersList, getOrder, orderCancel, getOrderItems, placeOrder };
