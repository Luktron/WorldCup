import { getFlag } from '@/lib/copaData';

export default function FlagIcon({ team, size = 'md' }) {
  const code = getFlag(team);
  const sizes = { sm: 'text-sm', md: 'text-lg', lg: 'text-2xl', xl: 'text-4xl' };
  
  if (!code) return <span className={sizes[size]}>🏳</span>;
  return <span className={`fi fi-${code} ${sizes[size]}`} style={{ borderRadius: 2 }} />;
}