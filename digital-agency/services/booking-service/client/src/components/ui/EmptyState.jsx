export default function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="text-center py-16 text-gray-400">
      <div className="text-5xl mb-3">{icon}</div>
      <p className="text-lg font-medium">{title}</p>
      {subtitle && <p className="text-sm">{subtitle}</p>}
    </div>
  );
}
