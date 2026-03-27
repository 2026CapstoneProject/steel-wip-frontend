import { useState, useEffect } from 'react';
import { wipService } from '../services/wipService';

// 잔재 목록 조회 훅
export const useWipList = () => {
  const [wips, setWips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const res = await wipService.getAll();
        setWips(res.data.data);
      } catch (e) {
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  return { wips, isLoading, error };
};
