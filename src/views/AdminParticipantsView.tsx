import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, selectIsAdmin } from '../store';
import { Plus, ArrowLeft } from 'lucide-react';

function calculateAge(birthDate?: string, fallbackAge?: number): number | undefined {
  try {
    if (!birthDate) return fallbackAge;
    const [year, month, day] = birthDate.split('-').map(Number);
    if (!year || !month || !day) return fallbackAge;
    const today = new Date();
    let age = today.getFullYear() - year;
    const hasHadBirthday =
      today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day);
    if (!hasHadBirthday) age -= 1;
    return age;
  } catch {
    return fallbackAge;
  }
}

function formatBirthDateLabel(birthDate?: string) {
  if (!birthDate) return '—';
  const parsed = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return birthDate;
  return parsed.toLocaleDateString('nb-NO');
}

export function AdminParticipantsView() {
  const isAdmin = useStore(selectIsAdmin);
  const { users, addUser } = useStore();

  const [newUserName, setNewUserName] = useState('');
  const [justAddedName, setJustAddedName] = useState<string | null>(null);
  const [participantSearch, setParticipantSearch] = useState('');

  const filteredParticipants = useMemo(() => {
    const needle = participantSearch.trim().toLowerCase();
    const participants = users.filter((u) => u.role === 'participant');
    if (!needle) return participants;
    return participants.filter((u) => {
      const haystack = [u.fullName, u.displayName, u.email, u.phone, u.birthDate, String(calculateAge(u.birthDate, u.age) ?? '')]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [users, participantSearch]);

  const handleAddUser = async () => {
    const trimmed = newUserName.trim();
    if (!trimmed) return;
    const ok = await addUser(trimmed);
    if (!ok) return;
    setJustAddedName(trimmed);
    setNewUserName('');
  };

  if (!isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:p-6 md:p-12 py-8 md:py-12 space-y-6">
      <div className="mb-6">
        <Link to="/admin" className="text-royal/60 hover:text-royal flex items-center gap-2 font-mono text-xs uppercase">
          <ArrowLeft size={16} /> Tilbake til dashboard
        </Link>
      </div>

      <div className="max-w-2xl bg-white border border-royal/10 p-6 sm:p-8 space-y-5">
        <h2 className="font-display font-bold text-2xl text-royal uppercase">Administrer Deltakere</h2>
        <p className="text-sm text-royal/60 font-content">Legg til nye deltakere manuelt.</p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            className="flex-1 border border-royal/20 focus:border-royal bg-white px-3 py-2 text-sm rounded-md"
            placeholder="Navn på ny deltaker..."
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                await handleAddUser();
              }
            }}
          />
          <button
            disabled={!newUserName.trim()}
            onClick={handleAddUser}
            className="flex items-center justify-center gap-2 bg-royal text-white px-4 py-2 text-xs font-mono uppercase font-bold hover:bg-royal-dark disabled:opacity-50 rounded-md"
          >
            <Plus size={14} /> Legg til
          </button>
        </div>

        {justAddedName && (
          <p className="text-xs font-mono uppercase text-royal/60">
            La til: {justAddedName}
          </p>
        )}
      </div>

      <div className="bg-white border border-royal/10 p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="font-display font-bold text-xl text-royal uppercase">Alle deltakere</h3>
          <span className="text-xs font-mono uppercase text-royal/50">
            {filteredParticipants.length} treff
          </span>
        </div>

        <input
          className="w-full md:w-80 border border-royal/20 focus:border-royal bg-white px-3 py-2 text-sm rounded-md"
          placeholder="Søk etter deltaker..."
          value={participantSearch}
          onChange={(e) => setParticipantSearch(e.target.value)}
        />

        <div className="border border-royal/10 rounded-md max-h-[60vh] overflow-y-auto">
          {filteredParticipants.length === 0 ? (
            <p className="px-4 py-6 text-sm text-royal/50 italic">Ingen deltakere funnet.</p>
          ) : (
            <ul className="divide-y divide-royal/10">
              {filteredParticipants.map((user) => (
                <li key={user.id} className="px-4 py-3">
                  <p className="text-sm font-medium text-royal participant-name">{user.fullName}</p>
                  <p className="text-xs text-royal/60 mt-0.5 font-mono uppercase">
                    Fødselsdato: <span className="font-content normal-case">{formatBirthDateLabel(user.birthDate)}</span>
                    {' · '}
                    Alder: {calculateAge(user.birthDate, user.age) ?? '—'}
                  </p>
                  {(user.email || user.phone) && (
                    <p className="text-xs text-royal/55 mt-0.5">
                      {[user.email, user.phone].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
