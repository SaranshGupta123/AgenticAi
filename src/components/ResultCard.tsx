export default function ResultCard({ label, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className="mt-4 p-4 bg-[#2A2F37] border border-white/10 rounded-xl cursor-pointer hover:bg-[#30353F] transition"
    >
      <h3 className="text-white text-sm font-semibold">{label}</h3>
      <p className="text-gray-400 text-xs mt-1">Click to view</p>
    </div>
  );
}
