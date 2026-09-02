import { useState, useCallback } from 'react';
import { createFormConfig, updateFormConfig } from '../api/formBuilder.api';

export const useFormBuilder = () => {
  const [loading, setLoading] = useState(false);

  const createConfig = useCallback(async (payload) => {
    try {
      setLoading(true);
      return await createFormConfig(payload);
    } finally {
      setLoading(false);
    }
  }, []);

  const editConfig = useCallback(async (id, payload) => {
    try {
      setLoading(true);
      return await updateFormConfig(id, payload);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    createConfig,
    editConfig,
  };
};
