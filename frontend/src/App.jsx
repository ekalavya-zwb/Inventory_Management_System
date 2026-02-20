import { Routes, Route } from "react-router-dom";
import "./App.css";
import { CustomThemeProvider } from "./context/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import OrderList from "./pages/OrdersList";
import PageNotFound from "./pages/PageNotFound";
import OrderDetails from "./orders/OrderDetails";
import WarehouseStocks from "./warehouses/WarehouseStocks";
import WarehousesList from "./pages/WarehousesList";
import PlaceOrder from "./pages/PlaceOrder";

function App() {
  return (
    <>
      <CustomThemeProvider>
        <ErrorBoundary>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/orders" element={<OrderList />} />
              <Route path="/orders/place" element={<PlaceOrder />} />
              <Route path="/orderItems/:id" element={<OrderDetails />} />
              <Route path="/warehouses" element={<WarehousesList />} />
              <Route
                path="/warehouses/:id/stock"
                element={<WarehouseStocks />}
              />
              <Route path="*" element={<PageNotFound />} />
            </Route>
          </Routes>
        </ErrorBoundary>
      </CustomThemeProvider>
    </>
  );
}

export default App;
