import { useState, useCallback } from "react";
import { Alert } from "react-native";

/**
 * Custom hook for handling authentication errors
 */
export const useAuthError = () => {
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleError = useCallback((err) => {
    let message = "An error occurred";
    let fieldErrors = {};

    if (err.response?.data) {
      const data = err.response.data;

      if (typeof data === "string") {
        message = data;
      } else if (typeof data === "object") {
        // Handle field-specific errors
        if (data.errors || data.fieldErrors) {
          fieldErrors = data.errors || data.fieldErrors;
        }
        message = data.message || data.error || message;
      }
    } else if (err.message) {
      message = err.message;
    }

    setError(message);
    setFieldErrors(fieldErrors);

    // Show alert for critical errors
    if (err.response?.status >= 500) {
      Alert.alert("Server Error", "Please try again later.");
    }

    return { message, fieldErrors };
  }, []);

  const clearError = useCallback(() => {
    setError("");
    setFieldErrors({});
  }, []);

  return {
    error,
    fieldErrors,
    handleError,
    clearError,
    setError,
    setFieldErrors,
  };
};

/**
 * Custom hook for handling loading states
 */
export const useLoading = (initialState = false) => {
  const [loading, setLoading] = useState(initialState);

  const startLoading = useCallback(() => setLoading(true), []);
  const stopLoading = useCallback(() => setLoading(false), []);

  return {
    loading,
    setLoading,
    startLoading,
    stopLoading,
  };
};

/**
 * Custom hook for handling form data
 */
export const useForm = (initialData = {}) => {
  const [formData, setFormData] = useState(initialData);

  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateForm = useCallback((newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialData);
  }, [initialData]);

  return {
    formData,
    setFormData,
    updateField,
    updateForm,
    resetForm,
  };
};
