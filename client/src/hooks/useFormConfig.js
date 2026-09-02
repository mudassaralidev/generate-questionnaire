import { useState, useCallback } from 'react';
import {
  createFormConfig,
  updateFormConfig,
  deleteFormConfig,
} from '../api/formBuilder.api';

export const useFormBuilder = () => {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const removeConfig = useCallback(async (id) => {
    try {
      setDeleting(true);
      return await deleteFormConfig(id);
    } finally {
      setDeleting(false);
    }
  }, []);

  return {
    loading,
    deleting,
    createConfig,
    editConfig,
    removeConfig,
  };
};
