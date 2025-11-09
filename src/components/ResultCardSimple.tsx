export default function ResultCardSimple({ title, onClick }) {
  return (
    <div
      onClick={onClick}
      className="p-3 rounded-lg bg-[#2B2F36] border border-white/10 hover:bg-[#3A3F46] cursor-pointer mt-3"
    >
      <p className="text-sm text-gray-200">{title}</p>
    </div>
  );
}
