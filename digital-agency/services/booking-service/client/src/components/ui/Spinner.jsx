export default function Spinner({ size = 'md', className = '' }) {
  const dims = size === 'lg' ? 'w-12 h-12 border-4' : size === 'sm' ? 'w-6 h-6 border-2' : 'w-8 h-8 border-4';
  return (
    <div className={`${dims} border-teal-200 border-t-teal-600 rounded-full animate-spin ${className}`} />
  );
}

export function SpinnerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center">
      <Spinner size="lg" className="border-white/30 border-t-white" />
    </div>
  );
}

export function SpinnerCenter({ className = '' }) {
  return (
    <div className={`flex justify-center py-12 ${className}`}>
      <Spinner />
    </div>
  );
}
