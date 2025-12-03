// healthcare-frontend/src/hooks/useApi.js
import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    return {
      Authorization: `Bearer ${token}`
    };
  };

  const get = useCallback(async (url) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}${url}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi lấy dữ liệu');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const post = useCallback(async (url, data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_BASE_URL}${url}`, data, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi gửi dữ liệu');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const put = useCallback(async (url, data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put(`${API_BASE_URL}${url}`, data, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật dữ liệu');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const delete_ = useCallback(async (url) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.delete(`${API_BASE_URL}${url}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa dữ liệu');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: delete_
  };
};

export default useApi;
