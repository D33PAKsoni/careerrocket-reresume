import type { GreenJobRole } from "@/lib/green/schemas";

interface GreenRoleCardProps {
  role: GreenJobRole;
  onClick: () => void;
}

export default function GreenRoleCard({ role, onClick }: GreenRoleCardProps) {
  return (
    <button
      onClick={onClick}
      className="card text-left hover:border-green-500/30 transition-colors w-full"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-base font-semibold text-white">{role.title}</h3>
        <span className="text-xl flex-shrink-0">🌱</span>
      </div>
      <span className="inline-block text-[11px] font-medium bg-green-500/10 border border-green-500/20 text-green-400 px-2.5 py-0.5 rounded-full mb-3">
        {role.sdgAlignment}
      </span>
      <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">{role.whyThisFits}</p>
      <p className="text-xs text-brand mt-3">View roadmap &amp; resources →</p>
    </button>
  );
}
