'use client';

import { useState } from 'react';

export default function InitDbPage() {
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const initializeDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/setup-fresh', { method: 'POST' });
      const data = await response.json();
      setResult(data);
    } catch {
      setResult({ error: 'Failed to initialize database' });
    }
    setLoading(false);
  };

  const checkDebug = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug');
      const data = await response.json();
      setResult(data);
    } catch {
      setResult({ error: 'Failed to check database' });
    }
    setLoading(false);
  };

  const testEndpoints = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-endpoints');
      const data = await response.json();
      setResult(data);
    } catch {
      setResult({ error: 'Failed to test endpoints' });
    }
    setLoading(false);
  };

  const cleanupVotes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/recalculate', { method: 'POST' });
      const data = await response.json();
      setResult(data);
    } catch {
      setResult({ error: 'Failed to recalculate results' });
    }
    setLoading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Management</h1>
      
      <div className="space-x-4 mb-4">
        <button 
          onClick={initializeDatabase}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Setup Fresh Database'}
        </button>
        
        <button 
          onClick={checkDebug}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Check Database'}
        </button>

        <button 
          onClick={testEndpoints}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Test Endpoints'}
        </button>

        <button 
          onClick={cleanupVotes}
          disabled={loading}
          className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Fix Vote Counting'}
        </button>
      </div>

      {result && (
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
