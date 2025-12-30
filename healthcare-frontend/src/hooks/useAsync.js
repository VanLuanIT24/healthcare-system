// src/hooks/useAsync.js
import { useCallback, useEffect, useReducer } from 'react';

const initialState = {
  status: 'idle',
  data: null,
  error: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'PENDING':
      return { ...state, status: 'pending' };
    case 'SUCCESS':
      return { status: 'success', data: action.payload, error: null };
    case 'ERROR':
      return { status: 'error', data: null, error: action.payload };
    default:
      return state;
  }
};

export const useAsync = (asyncFunction, immediate = true) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const execute = useCallback(async () => {
    dispatch({ type: 'PENDING' });
    try {
      const response = await asyncFunction();
      dispatch({ type: 'SUCCESS', payload: response });
      return response;
    } catch (error) {
      dispatch({ type: 'ERROR', payload: error });
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { ...state, execute };
};
