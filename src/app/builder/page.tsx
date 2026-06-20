import Link from "next/link";
import { listDocuments } from "@/app/actions/documents";
import NewDocumentButton from "@/components/dashboard/NewDocumentButton";
import DocumentCard from "@/components/dashboard/DocumentCard";
import { File01Icon, Briefcase01Icon, Mail01Icon } from "hugeicons-react";

export default async function BuilderLandingPage() {
  const documents = await listDocuments();

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <Link href="/dashboard" className="hover:text-gray-300 transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-white">Builder</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">AI Builder</h1>
            <p className="text-gray-400 text-sm">
              Generate resumes, cover letters, and LinkedIn copy tailored to any role.
            </p>
          </div>
          <NewDocumentButton />
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="card border-dashed text-center py-16">
          <div className="flex justify-center gap-4 mb-5 text-2xl opacity-40">
            <span><File01Icon /></span>
            <span><Mail01Icon /></span>
            <span><Briefcase01Icon /></span>
          </div>
          <p className="text-gray-500 text-sm mb-4">No documents yet — create your first one</p>
          <NewDocumentButton />
        </div>
      ) : (
        <>
          <h2 className="text-base font-semibold text-white mb-4">Your documents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
