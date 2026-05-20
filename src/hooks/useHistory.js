import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "ielts-submissions-history";
const STATS_KEY = "ielts-user-stats";

// Initialize storage if not exists
const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(STATS_KEY)) {
    localStorage.setItem(
      STATS_KEY,
      JSON.stringify({
        totalSubmissions: 0,
        averageScore: 0,
        bestScore: 0,
        weakestCriterion: null,
        lastSubmissionDate: null,
      }),
    );
  }
};

// Calculate statistics from submissions
const calculateStats = (submissions) => {
  if (!submissions || submissions.length === 0) {
    return {
      totalSubmissions: 0,
      averageScore: 0,
      bestScore: 0,
      weakestCriterion: null,
      lastSubmissionDate: null,
    };
  }

  const totalSubmissions = submissions.length;
  const scores = submissions.map((s) => s.result?.band_score?.overall || 0);
  const averageScore = scores.reduce((a, b) => a + b, 0) / totalSubmissions;
  const bestScore = Math.max(...scores);
  const lastSubmissionDate = submissions[submissions.length - 1]?.timestamp;

  // Find weakest criterion
  const criteriaScores = {
    task_achievement: [],
    coherence_cohesion: [],
    lexical_resource: [],
    grammar: [],
  };

  submissions.forEach((sub) => {
    if (sub.result?.band_score) {
      Object.keys(criteriaScores).forEach((key) => {
        const score = sub.result.band_score[key];
        if (score) criteriaScores[key].push(score);
      });
    }
  });

  const avgCriteria = {};
  Object.keys(criteriaScores).forEach((key) => {
    const arr = criteriaScores[key];
    avgCriteria[key] =
      arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  });

  const weakestCriterion = Object.keys(avgCriteria).reduce((a, b) =>
    avgCriteria[a] < avgCriteria[b] ? a : b,
  );

  return {
    totalSubmissions,
    averageScore: Math.round(averageScore * 10) / 10,
    bestScore,
    weakestCriterion,
    lastSubmissionDate,
    criteriaAverages: avgCriteria,
  };
};

export default function useHistory() {
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load history from localStorage
  const loadHistory = useCallback(() => {
    try {
      initStorage();
      const data = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(data || "[]");
      setSubmissions(parsed);

      const calculatedStats = calculateStats(parsed);
      setStats(calculatedStats);

      // Update stats in localStorage
      localStorage.setItem(STATS_KEY, JSON.stringify(calculatedStats));
      setLoading(false);
    } catch (error) {
      console.error("Error loading history:", error);
      setSubmissions([]);
      setStats(null);
      setLoading(false);
    }
  }, []);

  // Save new submission
  const saveSubmission = useCallback(
    (promptId, promptTitle, chartType, answer, result, wordCount) => {
      try {
        const newSubmission = {
          id: Date.now().toString(),
          promptId,
          promptTitle,
          chartType,
          answer,
          result,
          wordCount,
          timestamp: new Date().toISOString(),
        };

        const updated = [...submissions, newSubmission];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setSubmissions(updated);

        const calculatedStats = calculateStats(updated);
        setStats(calculatedStats);
        localStorage.setItem(STATS_KEY, JSON.stringify(calculatedStats));

        return newSubmission;
      } catch (error) {
        console.error("Error saving submission:", error);
        return null;
      }
    },
    [submissions],
  );

  // Delete submission
  const deleteSubmission = useCallback(
    (id) => {
      try {
        const updated = submissions.filter((s) => s.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setSubmissions(updated);

        const calculatedStats = calculateStats(updated);
        setStats(calculatedStats);
        localStorage.setItem(STATS_KEY, JSON.stringify(calculatedStats));

        return true;
      } catch (error) {
        console.error("Error deleting submission:", error);
        return false;
      }
    },
    [submissions],
  );

  // Clear all history
  const clearHistory = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      setSubmissions([]);

      const emptyStats = calculateStats([]);
      setStats(emptyStats);
      localStorage.setItem(STATS_KEY, JSON.stringify(emptyStats));

      return true;
    } catch (error) {
      console.error("Error clearing history:", error);
      return false;
    }
  }, []);

  // Export history as JSON
  const exportHistory = useCallback(() => {
    try {
      const data = {
        submissions,
        stats,
        exportDate: new Date().toISOString(),
        version: "1.0",
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ielts-history-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error("Error exporting history:", error);
      return false;
    }
  }, [submissions, stats]);

  // Import history from JSON
  const importHistory = useCallback((jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.submissions && Array.isArray(data.submissions)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.submissions));
        setSubmissions(data.submissions);

        const calculatedStats = calculateStats(data.submissions);
        setStats(calculatedStats);
        localStorage.setItem(STATS_KEY, JSON.stringify(calculatedStats));

        return true;
      }
      return false;
    } catch (error) {
      console.error("Error importing history:", error);
      return false;
    }
  }, []);

  // Get submission by ID
  const getSubmission = useCallback(
    (id) => {
      return submissions.find((s) => s.id === id);
    },
    [submissions],
  );

  // Load history on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    submissions,
    stats,
    loading,
    saveSubmission,
    deleteSubmission,
    clearHistory,
    exportHistory,
    importHistory,
    getSubmission,
    refreshHistory: loadHistory,
  };
}
