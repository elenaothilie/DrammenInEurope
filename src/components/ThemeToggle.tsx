import { Sun, Moon } from 'lucide-react';
import { useStore } from '../store';

type ThemeToggleVariant = 'default' | 'on-dark';

export function ThemeToggle({ variant = 'default' }: { variant?: ThemeToggleVariant }) {
  const darkMode = useStore((s) => s.darkMode);
  const toggleDarkMode = useStore((s) => s.toggleDarkMode);

  const isOnDark = variant === 'on-dark';

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      className={`flex items-center rounded-full border p-0.5 transition-colors focus:outline-none focus:ring-2 ${
        isOnDark
          ? 'border-white/30 bg-white/10 hover:border-white/50 focus:ring-white/30'
          : 'border-royal/20 bg-royal/5 hover:border-royal/40 focus:ring-royal/30'
      }`}
      aria-label={darkMode ? 'Bytt til lys modus' : 'Bytt til mørk modus'}
      aria-pressed={darkMode}
    >
      <span
        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-mono uppercase transition-colors ${
          !darkMode
            ? isOnDark
              ? 'bg-white text-royal'
              : 'bg-royal text-white'
            : isOnDark
              ? 'text-white/70 hover:text-white'
              : 'text-royal/70 hover:text-royal'
        }`}
      >
        <Sun size={14} /> Lys
      </span>
      <span
        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-mono uppercase transition-colors ${
          darkMode
            ? isOnDark
              ? 'bg-white text-royal'
              : 'bg-royal text-white'
            : isOnDark
              ? 'text-white/70 hover:text-white'
              : 'text-royal/70 hover:text-royal'
        }`}
      >
        <Moon size={14} /> Mørk
      </span>
    </button>
  );
}
