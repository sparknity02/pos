import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getProducts = (search = "") => {
  const params = {};
  if (search && search.trim() !== "") {
    params.search = search.trim();
  }
  return api.get("/products", { params });
};

export const getProduct = (id) => api.get(`/products/${id}`);

export const createProduct = (productData) => api.post("/products", productData);

export const updateProduct = (id, productData) => api.put(`/products/${id}`, productData);

export const deleteProduct = (id) => api.delete(`/products/${id}`);

export const createSale = (saleData) => api.post("/sales", saleData);

export const getSales = () => api.get("/sales");

export const getSale = (id) => api.get(`/sales/${id}`);

export const getDashboardStats = () => api.get("/sales/stats");

export default api;
