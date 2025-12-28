function StatCard({ icon, label, value, valueColor = 'text-white' }) {
  return (
    <div className="bg-neutral-700/50 rounded-lg p-3 border border-neutral-700 hover:border-neutral-600 transition-colors">
      <div className="flex items-center gap-2 mb-1.5">
        {icon}
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <div className={`text-sm font-bold ${valueColor}`}>
        {value}
      </div>
    </div>
  );
}

export default StatCard;
