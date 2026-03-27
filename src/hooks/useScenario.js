import { useState, useEffect } from 'react';
import { scenarioService } from '../services/scenarioService';

// 시나리오 목록 조회 훅
export const useScenarioList = () => {
  const [scenarios, setScenarios] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const res = await scenarioService.getAll();
        setScenarios(res.data.data);
      } catch (e) {
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  return { scenarios, isLoading, error };
};
