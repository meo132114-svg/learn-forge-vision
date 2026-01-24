import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { HollandResults } from '@/components/HollandTest';
import type { Roadmap } from '@/components/RoadmapBuilder';

interface BigFiveResults {
  scores: Record<string, number>;
  percentages: Record<string, number>;
  timestamp: Date;
  answers: Record<number, number>;
}

interface AppContextType {
  // Test Results
  hollandResults: HollandResults | null;
  bigFiveResults: BigFiveResults | null;
  setHollandResults: (results: HollandResults | null) => void;
  setBigFiveResults: (results: BigFiveResults | null) => void;

  // Roadmap
  roadmap: Roadmap | null;
  setRoadmap: (roadmap: Roadmap | null) => void;

  // Data sync
  saveToCloud: () => Promise<void>;
  loadFromCloud: () => Promise<void>;
  isSyncing: boolean;
}

const STORAGE_KEYS = {
  HOLLAND_RESULTS: 'futureme_holland_results',
  BIGFIVE_RESULTS: 'futureme_bigfive_results',
  ROADMAP: 'futureme_roadmap',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [hollandResults, setHollandResultsState] = useState<HollandResults | null>(null);
  const [bigFiveResults, setBigFiveResultsState] = useState<BigFiveResults | null>(null);
  const [roadmap, setRoadmapState] = useState<Roadmap | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedHolland = localStorage.getItem(STORAGE_KEYS.HOLLAND_RESULTS);
    const savedBigFive = localStorage.getItem(STORAGE_KEYS.BIGFIVE_RESULTS);
    const savedRoadmap = localStorage.getItem(STORAGE_KEYS.ROADMAP);

    if (savedHolland) {
      try {
        const parsed = JSON.parse(savedHolland);
        parsed.timestamp = new Date(parsed.timestamp);
        setHollandResultsState(parsed);
      } catch (e) {
        console.error('Error parsing holland results:', e);
      }
    }

    if (savedBigFive) {
      try {
        const parsed = JSON.parse(savedBigFive);
        parsed.timestamp = new Date(parsed.timestamp);
        setBigFiveResultsState(parsed);
      } catch (e) {
        console.error('Error parsing big five results:', e);
      }
    }

    if (savedRoadmap) {
      try {
        const parsed = JSON.parse(savedRoadmap);
        parsed.createdAt = new Date(parsed.createdAt);
        setRoadmapState(parsed);
      } catch (e) {
        console.error('Error parsing roadmap:', e);
      }
    }
  }, []);

  // Load from cloud when user logs in
  useEffect(() => {
    if (user) {
      loadFromCloud();
    }
  }, [user]);

  const setHollandResults = useCallback((results: HollandResults | null) => {
    setHollandResultsState(results);
    if (results) {
      localStorage.setItem(STORAGE_KEYS.HOLLAND_RESULTS, JSON.stringify(results));
    } else {
      localStorage.removeItem(STORAGE_KEYS.HOLLAND_RESULTS);
    }
  }, []);

  const setBigFiveResults = useCallback((results: BigFiveResults | null) => {
    setBigFiveResultsState(results);
    if (results) {
      localStorage.setItem(STORAGE_KEYS.BIGFIVE_RESULTS, JSON.stringify(results));
    } else {
      localStorage.removeItem(STORAGE_KEYS.BIGFIVE_RESULTS);
    }
  }, []);

  const setRoadmap = useCallback((rm: Roadmap | null) => {
    setRoadmapState(rm);
    if (rm) {
      localStorage.setItem(STORAGE_KEYS.ROADMAP, JSON.stringify(rm));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ROADMAP);
    }
  }, []);

  const saveToCloud = useCallback(async () => {
    if (!user) return;
    setIsSyncing(true);

    try {
      // Save Holland results
      if (hollandResults) {
        // Check if exists first
        const { data: existing } = await supabase
          .from('test_results')
          .select('id')
          .eq('user_id', user.id)
          .eq('test_type', 'holland')
          .maybeSingle();

        if (existing) {
          await supabase.from('test_results')
            .update({ results: JSON.parse(JSON.stringify(hollandResults)) })
            .eq('id', existing.id);
        } else {
          await supabase.from('test_results').insert({
            user_id: user.id,
            test_type: 'holland',
            results: JSON.parse(JSON.stringify(hollandResults)),
          });
        }
      }

      // Save Big Five results
      if (bigFiveResults) {
        const { data: existing } = await supabase
          .from('test_results')
          .select('id')
          .eq('user_id', user.id)
          .eq('test_type', 'bigfive')
          .maybeSingle();

        if (existing) {
          await supabase.from('test_results')
            .update({ results: JSON.parse(JSON.stringify(bigFiveResults)) })
            .eq('id', existing.id);
        } else {
          await supabase.from('test_results').insert({
            user_id: user.id,
            test_type: 'bigfive',
            results: JSON.parse(JSON.stringify(bigFiveResults)),
          });
        }
      }

      // Save roadmap
      if (roadmap) {
        const { data: existingRoadmap } = await supabase
          .from('roadmaps')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        const roadmapPayload = {
          title: roadmap.title,
          phases: JSON.parse(JSON.stringify(roadmap.phases)),
          user_info: roadmap.userInfo ? JSON.parse(JSON.stringify(roadmap.userInfo)) : null,
        };

        if (existingRoadmap) {
          await supabase.from('roadmaps')
            .update(roadmapPayload)
            .eq('id', existingRoadmap.id);
        } else {
          await supabase.from('roadmaps').insert({
            user_id: user.id,
            ...roadmapPayload,
          });
        }
      }
    } catch (error) {
      console.error('Error saving to cloud:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [user, hollandResults, bigFiveResults, roadmap]);

  const loadFromCloud = useCallback(async () => {
    if (!user) return;
    setIsSyncing(true);

    try {
      // Load test results
      const { data: testResults } = await supabase
        .from('test_results')
        .select('*')
        .eq('user_id', user.id);

      if (testResults) {
        const holland = testResults.find(r => r.test_type === 'holland');
        const bigFive = testResults.find(r => r.test_type === 'bigfive');

        if (holland?.results) {
          const parsed = holland.results as unknown as HollandResults;
          if (typeof parsed.timestamp === 'string') {
            parsed.timestamp = new Date(parsed.timestamp);
          }
          setHollandResultsState(parsed);
          localStorage.setItem(STORAGE_KEYS.HOLLAND_RESULTS, JSON.stringify(parsed));
        }

        if (bigFive?.results) {
          const parsed = bigFive.results as unknown as BigFiveResults;
          if (typeof parsed.timestamp === 'string') {
            parsed.timestamp = new Date(parsed.timestamp);
          }
          setBigFiveResultsState(parsed);
          localStorage.setItem(STORAGE_KEYS.BIGFIVE_RESULTS, JSON.stringify(parsed));
        }
      }

      // Load roadmap
      const { data: roadmapData } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (roadmapData) {
        const rm: Roadmap = {
          id: roadmapData.id,
          title: roadmapData.title,
          createdAt: new Date(roadmapData.created_at),
          phases: roadmapData.phases as any,
          userInfo: roadmapData.user_info as any,
        };
        setRoadmapState(rm);
        localStorage.setItem(STORAGE_KEYS.ROADMAP, JSON.stringify(rm));
      }
    } catch (error) {
      console.error('Error loading from cloud:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  // Auto-save when user is logged in and data changes
  useEffect(() => {
    if (user && (hollandResults || bigFiveResults || roadmap)) {
      const timeout = setTimeout(() => {
        saveToCloud();
      }, 2000); // Debounce 2 seconds
      return () => clearTimeout(timeout);
    }
  }, [user, hollandResults, bigFiveResults, roadmap, saveToCloud]);

  return (
    <AppContext.Provider
      value={{
        hollandResults,
        bigFiveResults,
        setHollandResults,
        setBigFiveResults,
        roadmap,
        setRoadmap,
        saveToCloud,
        loadFromCloud,
        isSyncing,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
