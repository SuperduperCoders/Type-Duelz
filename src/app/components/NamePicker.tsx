// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NamePicker({ onNameSet }: { onNameSet: (name: string) => void }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
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
        onNameSet(name); // Save name to game
        router.push('/duel'); // Redirect to solo mode
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
    <form className="flex flex-col gap-2 items-center" onSubmit={handleSave}>
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
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded" disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </button>
      {error && <div className="text-red-600 font-semibold">{error}</div>}
    </form>
  );
}
