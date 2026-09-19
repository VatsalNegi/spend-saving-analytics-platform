import axios from "axios";
const API_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Automatically refresh expired access token
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Only try refresh when:
    // 1. API returned 401
    // 2. We haven't already retried this request
    // 3. A refresh token exists
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem("refresh_token")
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");

        const response = await axios.post(
          `${API_URL}/auth/refresh/`,
          {
            refresh: refreshToken,
          }
        );

        const newAccessToken = response.data.access;

        // Store new access token
        localStorage.setItem("access_token", newAccessToken);

        // Update original request
        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        // Retry original request
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh token is also invalid/expired
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        window.location.reload();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


export const loginUser = async (username, password) => {
  const response = await api.post("/auth/login/", {
    username,
    password,
  });

  localStorage.setItem("access_token", response.data.access);
  localStorage.setItem("refresh_token", response.data.refresh);

  return response.data;
};


export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};


export const getDashboard = async (filters = {}) => {
  const params = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (
      value !== "" &&
      value !== null &&
      value !== undefined
    ) {
      params[key] = value;
    }
  });

  const response = await api.get("/dashboard/", {
    params,
  });

  return response.data;
};


export const getSpends = async (params = {}) => {
  const response = await api.get("/spends/", {
    params,
  });

  return response.data;
};


export const createSpend = async (data) => {
  const response = await api.post("/spends/", data);

  return response.data;
};


export const updateSpend = async (id, data) => {
  const response = await api.patch(
    `/spends/${id}/`,
    data
  );

  return response.data;
};


export const deleteSpend = async (id) => {
  await api.delete(`/spends/${id}/`);
};


export default api;