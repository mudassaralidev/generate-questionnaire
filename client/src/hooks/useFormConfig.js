import { useState, useCallback } from 'react';
import {
  resolveFormConfig,
  listFormConfigs,
  createFormConfig,
  updateFormConfig,
  deleteFormConfig,
} from '../api/formBuilder.api';

export const useFormBuilder = () => {
  const [configs, setConfigs] = useState([]);
  const [resolvedConfig, setResolvedConfig] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resolveConfig = useCallback(async (params) => {
    try {
      setLoading(true);
      setError(null);

      const data = await resolveFormConfig(params);
      setResolvedConfig(data);

      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConfigs = useCallback(async (params) => {
    try {
      setLoading(true);
      setError(null);

      const data = await listFormConfigs(params);
      setConfigs(data.data || []);

      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createConfig = useCallback(async (payload) => {
    const result = await createFormConfig(payload);
    return result;
  }, []);

  const editConfig = useCallback(async (id, payload) => {
    const result = await updateFormConfig(id, payload);
    return result;
  }, []);

  const removeConfig = useCallback(async (id) => {
    const result = await deleteFormConfig(id);
    return result;
  }, []);

  return {
    configs,
    resolvedConfig,
    loading,
    error,

    fetchConfigs,
    resolveConfig,
    createConfig,
    editConfig,
    removeConfig,
  };
};