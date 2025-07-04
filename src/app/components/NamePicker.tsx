import { useState } from 'react';

export default function NamePicker({ onNameSet }: { onNameSet: (name: string) => void }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/check-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.success) {
        onNameSet(name);
      } else {
        setError(data.error || 'Name is taken.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 items-center">
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Enter your in-game name"
        className="border rounded px-3 py-2"
        required
        minLength={3}
        maxLength={20}
        disabled={loading}
      />
      <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded" disabled={loading} onClick={handleSubmit}>
        {loading ? 'Checking...' : 'Set Name'}
      </button>
      {error && <div className="text-red-600 font-semibold">{error}</div>}
    </div>
  );
}
