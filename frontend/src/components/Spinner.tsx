export default function Spinner({ full = false }: { full?: boolean }) {
  return (
    <div className={full ? 'flex min-h-screen items-center justify-center' : 'flex items-center justify-center p-8'}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
    </div>
  );
}