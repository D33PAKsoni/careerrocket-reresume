import type { ProfileBundle, ResumeContent, ResumeTemplate } from "@/types/profile";
import { shapeResumeData } from "@/lib/resume/shapeResumeData";
import { Briefcase02Icon } from "hugeicons-react";

function RegenerateButton({ onClick, isLoading }: { onClick: () => void; isLoading: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      title="Regenerate this section"
      className="text-gray-400 hover:text-brand transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 print:hidden"
    >
      <svg className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </button>
  );
}

interface ResumePreviewProps {
  bundle: ProfileBundle;
  content: ResumeContent | null;
  template?: ResumeTemplate;
  onRegenerateSummary?: () => void;
  onRegenerateExperience?: (experienceId: string) => void;
  onRegenerateProject?: (projectId: string) => void;
  regeneratingKey?: string | null;
}

export default function ResumePreview({
  bundle,
  content,
  template = "classic",
  onRegenerateSummary,
  onRegenerateExperience,
  onRegenerateProject,
  regeneratingKey,
}: ResumePreviewProps) {
  if (!bundle.profile?.full_name) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 gap-3">
        <span className="text-3xl opacity-30"><Briefcase02Icon /></span>
        <p className="text-sm text-gray-500 max-w-xs">
          Fill in your basic info in the Profile section to see your resume take shape here.
        </p>
      </div>
    );
  }

  const data = shapeResumeData(bundle, content);
  const regenProps = { onRegenerateSummary, onRegenerateExperience, onRegenerateProject, regeneratingKey };

  switch (template) {
    case "modern":
      return <ModernTemplate data={data} {...regenProps} />;
    case "minimal":
      return <MinimalTemplate data={data} {...regenProps} />;
    case "classic":
    default:
      return <ClassicTemplate data={data} {...regenProps} />;
  }
}

interface TemplateProps {
  data: ReturnType<typeof shapeResumeData>;
  onRegenerateSummary?: () => void;
  onRegenerateExperience?: (experienceId: string) => void;
  onRegenerateProject?: (projectId: string) => void;
  regeneratingKey?: string | null;
}

function ClassicTemplate({ data, onRegenerateSummary, onRegenerateExperience, onRegenerateProject, regeneratingKey }: TemplateProps) {
  return (
    <div className="bg-white text-gray-900 rounded-lg p-8 text-sm leading-relaxed shadow-xl">
      <div className="text-center mb-5 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold tracking-tight">{data.fullName}</h1>
        {data.headline && <p className="text-gray-600 mt-0.5">{data.headline}</p>}
        {data.contactLine && <p className="text-xs text-gray-500 mt-2">{data.contactLine}</p>}
      </div>

      {data.summary && (
        <section className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Summary</h2>
            {onRegenerateSummary && <RegenerateButton onClick={onRegenerateSummary} isLoading={regeneratingKey === "summary"} />}
          </div>
          <p className="text-gray-800">{data.summary}</p>
        </section>
      )}

      {data.education.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Education</h2>
          <div className="space-y-2.5">
            {data.education.map((edu, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline">
                  <p className="font-semibold">{edu.institution}</p>
                  <p className="text-xs text-gray-500">{edu.years}</p>
                </div>
                <p className="text-gray-700">{edu.degreeAndField}{edu.grade ? ` · ${edu.grade}` : ""}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.experience.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Experience</h2>
          <div className="space-y-3">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline gap-2">
                  <p className="font-semibold">{exp.role}</p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <p className="text-xs text-gray-500 whitespace-nowrap">{exp.dateRange}</p>
                    {onRegenerateExperience && exp.bullets.length > 0 && (
                      <RegenerateButton onClick={() => onRegenerateExperience(exp.id)} isLoading={regeneratingKey === `exp:${exp.id}`} />
                    )}
                  </div>
                </div>
                <p className="text-gray-700">{exp.organisation}{exp.location ? ` · ${exp.location}` : ""}</p>
                {exp.bullets.length > 0 ? (
                  <ul className="list-disc list-inside text-gray-800 mt-1 space-y-0.5">
                    {exp.bullets.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                ) : exp.description ? (
                  <p className="text-gray-800 mt-1">{exp.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}

      {data.projects.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Projects</h2>
          <div className="space-y-2.5">
            {data.projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">
                    {proj.title}
                    {proj.techStack && <span className="text-gray-500 font-normal"> — {proj.techStack}</span>}
                  </p>
                  {onRegenerateProject && proj.bullets.length > 0 && (
                    <RegenerateButton onClick={() => onRegenerateProject(proj.id)} isLoading={regeneratingKey === `proj:${proj.id}`} />
                  )}
                </div>
                {proj.bullets.length > 0 ? (
                  <ul className="list-disc list-inside text-gray-800 mt-1 space-y-0.5">
                    {proj.bullets.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                ) : proj.description ? (
                  <p className="text-gray-800">{proj.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}

      {data.skillsByCategory.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Skills</h2>
          <div className="space-y-1">
            {data.skillsByCategory.map(({ category, names }) => (
              <p key={category} className="text-gray-800">
                <span className="font-semibold">{category}:</span> {names.join(", ")}
              </p>
            ))}
          </div>
        </section>
      )}

      {data.certifications.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Certifications</h2>
          <div className="space-y-1">
            {data.certifications.map((cert, i) => (
              <p key={i} className="text-gray-800">{cert.title}{cert.issuer ? ` — ${cert.issuer}` : ""}</p>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ModernTemplate({ data, onRegenerateSummary, onRegenerateExperience, onRegenerateProject, regeneratingKey }: TemplateProps) {
  return (
    <div className="bg-white text-gray-900 rounded-lg overflow-hidden text-sm leading-relaxed shadow-xl">
      <div className="bg-gray-900 text-white px-8 py-6">
        <h1 className="text-2xl font-bold tracking-tight">{data.fullName}</h1>
        {data.headline && <p className="text-gray-300 mt-0.5">{data.headline}</p>}
        {data.contactLine && <p className="text-xs text-gray-400 mt-2">{data.contactLine}</p>}
      </div>

      <div className="p-8">
        {data.summary && (
          <section className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-brand">Summary</h2>
              {onRegenerateSummary && <RegenerateButton onClick={onRegenerateSummary} isLoading={regeneratingKey === "summary"} />}
            </div>
            <p className="text-gray-800">{data.summary}</p>
          </section>
        )}

        {data.experience.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand mb-2">Experience</h2>
            <div className="space-y-3">
              {data.experience.map((exp) => (
                <div key={exp.id} className="border-l-2 border-gray-200 pl-3">
                  <div className="flex justify-between items-baseline gap-2">
                    <p className="font-semibold">{exp.role} <span className="text-gray-500 font-normal">@ {exp.organisation}</span></p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <p className="text-xs text-gray-500 whitespace-nowrap">{exp.dateRange}</p>
                      {onRegenerateExperience && exp.bullets.length > 0 && (
                        <RegenerateButton onClick={() => onRegenerateExperience(exp.id)} isLoading={regeneratingKey === `exp:${exp.id}`} />
                      )}
                    </div>
                  </div>
                  {exp.bullets.length > 0 ? (
                    <ul className="list-disc list-inside text-gray-800 mt-1 space-y-0.5">
                      {exp.bullets.map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                  ) : exp.description ? (
                    <p className="text-gray-800 mt-1">{exp.description}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.projects.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand mb-2">Projects</h2>
            <div className="space-y-2.5">
              {data.projects.map((proj) => (
                <div key={proj.id} className="border-l-2 border-gray-200 pl-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">
                      {proj.title}
                      {proj.techStack && <span className="text-gray-500 font-normal"> — {proj.techStack}</span>}
                    </p>
                    {onRegenerateProject && proj.bullets.length > 0 && (
                      <RegenerateButton onClick={() => onRegenerateProject(proj.id)} isLoading={regeneratingKey === `proj:${proj.id}`} />
                    )}
                  </div>
                  {proj.bullets.length > 0 ? (
                    <ul className="list-disc list-inside text-gray-800 mt-1 space-y-0.5">
                      {proj.bullets.map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                  ) : proj.description ? (
                    <p className="text-gray-800">{proj.description}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-2 gap-6">
          {data.education.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-brand mb-2">Education</h2>
              <div className="space-y-2">
                {data.education.map((edu, i) => (
                  <div key={i}>
                    <p className="font-semibold text-xs">{edu.institution}</p>
                    <p className="text-gray-600 text-xs">{edu.degreeAndField}</p>
                    <p className="text-gray-500 text-xs">{edu.years}{edu.grade ? ` · ${edu.grade}` : ""}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.skillsByCategory.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-brand mb-2">Skills</h2>
              <div className="flex flex-wrap gap-1">
                {data.skillsByCategory.flatMap((g) => g.names).map((name, i) => (
                  <span key={i} className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{name}</span>
                ))}
              </div>
            </section>
          )}
        </div>

        {data.certifications.length > 0 && (
          <section className="mt-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand mb-2">Certifications</h2>
            <div className="space-y-1">
              {data.certifications.map((cert, i) => (
                <p key={i} className="text-gray-800 text-xs">{cert.title}{cert.issuer ? ` — ${cert.issuer}` : ""}</p>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function MinimalTemplate({ data, onRegenerateSummary, onRegenerateExperience, onRegenerateProject, regeneratingKey }: TemplateProps) {
  return (
    <div className="bg-white text-gray-900 rounded-lg p-10 text-sm leading-relaxed shadow-xl">
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight">{data.fullName}</h1>
        {data.headline && <p className="text-gray-500 mt-1 font-light">{data.headline}</p>}
        {data.contactLine && <p className="text-xs text-gray-400 mt-3">{data.contactLine}</p>}
      </div>

      {data.summary && (
        <section className="mb-7">
          <div className="flex items-center justify-between mb-2">
            <span></span>
            {onRegenerateSummary && <RegenerateButton onClick={onRegenerateSummary} isLoading={regeneratingKey === "summary"} />}
          </div>
          <p className="text-gray-700 italic">{data.summary}</p>
        </section>
      )}

      {data.experience.length > 0 && (
        <section className="mb-7">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-gray-400 mb-3">Experience</h2>
          <div className="space-y-4">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline gap-2">
                  <p className="font-medium">{exp.role}</p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <p className="text-xs text-gray-400 whitespace-nowrap">{exp.dateRange}</p>
                    {onRegenerateExperience && exp.bullets.length > 0 && (
                      <RegenerateButton onClick={() => onRegenerateExperience(exp.id)} isLoading={regeneratingKey === `exp:${exp.id}`} />
                    )}
                  </div>
                </div>
                <p className="text-gray-500 text-xs mb-1">{exp.organisation}{exp.location ? `, ${exp.location}` : ""}</p>
                {exp.bullets.length > 0 ? (
                  <div className="text-gray-700 space-y-0.5">
                    {exp.bullets.map((b, i) => <p key={i}>{b}</p>)}
                  </div>
                ) : exp.description ? (
                  <p className="text-gray-700">{exp.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}

      {data.projects.length > 0 && (
        <section className="mb-7">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-gray-400 mb-3">Projects</h2>
          <div className="space-y-3">
            {data.projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">
                    {proj.title}
                    {proj.techStack && <span className="text-gray-400"> · {proj.techStack}</span>}
                  </p>
                  {onRegenerateProject && proj.bullets.length > 0 && (
                    <RegenerateButton onClick={() => onRegenerateProject(proj.id)} isLoading={regeneratingKey === `proj:${proj.id}`} />
                  )}
                </div>
                {proj.bullets.length > 0 ? (
                  <div className="text-gray-700 space-y-0.5">
                    {proj.bullets.map((b, i) => <p key={i}>{b}</p>)}
                  </div>
                ) : proj.description ? (
                  <p className="text-gray-700">{proj.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}

      {data.education.length > 0 && (
        <section className="mb-7">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-gray-400 mb-3">Education</h2>
          <div className="space-y-2">
            {data.education.map((edu, i) => (
              <div key={i} className="flex justify-between items-baseline">
                <div>
                  <p className="font-medium">{edu.institution}</p>
                  <p className="text-gray-500 text-xs">{edu.degreeAndField}{edu.grade ? ` · ${edu.grade}` : ""}</p>
                </div>
                <p className="text-xs text-gray-400">{edu.years}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.skillsByCategory.length > 0 && (
        <section className="mb-7">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-gray-400 mb-3">Skills</h2>
          <p className="text-gray-700">{data.skillsByCategory.flatMap((g) => g.names).join(" · ")}</p>
        </section>
      )}

      {data.certifications.length > 0 && (
        <section>
          <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-gray-400 mb-3">Certifications</h2>
          <p className="text-gray-700">{data.certifications.map((c) => c.title).join(" · ")}</p>
        </section>
      )}
    </div>
  );
}
