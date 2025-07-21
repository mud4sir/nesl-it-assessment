import { useState, useCallback } from 'react';
import { ApiResponse, AuthResponse, UseApi } from '../types';

const apiUrl = import.meta.env.VITE_API_URL;

const useApi = () => {
  const [data, setData] = useState<ApiResponse | AuthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const request = useCallback(async ({ resource, method = 'GET', body = null, headers = {} }: UseApi) => {
    try {
      setLoading(true);
      setError(null);

      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body && JSON.stringify(body)
      };

      const response = await fetch(`${apiUrl}${resource}`, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, request };
};

export default useApi;