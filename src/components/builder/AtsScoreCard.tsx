import type { AtsScore } from "@/types/profile";

function scoreColor(percentage: number): string {
  if (percentage >= 70) return "text-green-400";
  if (percentage >= 40) return "text-yellow-400";
  return "text-red-400";
}

function barColor(percentage: number): string {
  if (percentage >= 70) return "bg-green-500";
  if (percentage >= 40) return "bg-yellow-500";
  return "bg-red-500";
}

export default function AtsScoreCard({ score }: { score: AtsScore }) {
  return (
    <div className="card mt-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-white">ATS Match Score</p>
        <span className={`text-lg font-bold ${scoreColor(score.percentage)}`}>{score.percentage}%</span>
      </div>
      <div className="w-full h-2 bg-surface rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor(score.percentage)}`}
          style={{ width: `${score.percentage}%` }}
        />
      </div>

      {score.matchedKeywords.length > 0 && (
        <div className="mb-2">
          <p className="text-[11px] text-gray-500 mb-1.5">Matched keywords ({score.matchedKeywords.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {score.matchedKeywords.map((kw) => (
              <span key={kw} className="text-[11px] bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {score.missingKeywords.length > 0 && (
        <div>
          <p className="text-[11px] text-gray-500 mb-1.5">Missing keywords ({score.missingKeywords.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {score.missingKeywords.map((kw) => (
              <span key={kw} className="text-[11px] bg-surface border border-surface-border text-gray-500 px-2 py-0.5 rounded-full">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
