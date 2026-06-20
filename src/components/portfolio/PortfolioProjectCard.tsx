import type { Project } from "@/types/profile";

export default function PortfolioProjectCard({ project }: { project: Project }) {
  const techTags = project.tech_stack
    ? project.tech_stack.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl p-6 flex flex-col hover:border-brand/30 transition-colors">
      <h3 className="text-lg font-semibold text-white mb-2">{project.title}</h3>
      {project.description && (
        <p className="text-sm text-gray-400 leading-relaxed mb-4 flex-1">{project.description}</p>
      )}

      {techTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {techTags.map((tag, i) => (
            <span key={i} className="text-[11px] bg-brand/10 border border-brand/20 text-brand px-2.5 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {(project.link || project.repo_link) && (
        <div className="flex gap-3 mt-auto pt-3 border-t border-surface-border">
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-gray-300 hover:text-brand transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Live Demo
            </a>
          )}
          {project.repo_link && (
            <a
              href={project.repo_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-gray-300 hover:text-brand transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
              </svg>
              Repository
            </a>
          )}
        </div>
      )}
    </div>
  );
}
