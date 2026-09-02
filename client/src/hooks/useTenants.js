import { useState, useEffect } from "react";
import { fetchTenants } from "../api/tenant.api";

export const useTenants = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTenants = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchTenants();
      setTenants(response.data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  return {
    tenants,
    loading,
    error,
    setError,
  };
};
