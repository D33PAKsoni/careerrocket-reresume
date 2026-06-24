import Link from "next/link";
import GreenCareersExplorer from "@/components/green/GreenCareersExplorer";

export default function GreenPage() {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
        <Link href="/dashboard" className="hover:text-gray-300 transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-white">Green</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Green Careers</h1>
        <p className="text-gray-400 text-sm">
          Discover sustainability-focused career paths that fit your actual background — aligned with
          the UN Sustainable Development Goals.
        </p>
      </div>

      <GreenCareersExplorer />


      <div className="mt-8 bg-surface border border-surface-border rounded-lg px-4 py-3.5">
        <p className="text-xs font-semibold text-gray-400 mb-1.5">About this feature</p>
        <ul className="text-[11px] text-gray-500 leading-relaxed space-y-1 list-disc list-inside">
          <li>Your name, contact details, employer names, and links are removed before anything is sent to the AI.</li>
          <li>Suggestions are generated fresh from your current profile each time — nothing is stored or shared.</li>
          <li>Resource links open a search rather than a specific article or video, since the AI can&apos;t verify a single link still works — you judge the actual source.</li>
          <li>Role suggestions are a starting point for exploration, not a guarantee of fit or employability.</li>
        </ul>
      </div>
    </div>
  );
}
