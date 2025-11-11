export default function ResultCardSimple({ title, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className="p-3 pl-4 rounded-lg bg-[#2B2F36] border-l-4 border-yellow-500/80 border-white/10 hover:bg-[#3A3F46] cursor-pointer mt-3 transition-all duration-200 shadow-md"
    >
      <p className="text-sm text-gray-200 font-medium">{title}</p>
      <p className="text-xs text-yellow-400/80 mt-0.5">Click to view result</p>
    </div>
  );
}
