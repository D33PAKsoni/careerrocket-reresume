export default function PrivatePortfolioMessage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-surface">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 bg-surface-card border border-surface-border rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 11c0 .552-.448 1-1 1s-1-.448-1-1 .448-1 1-1 1 .448 1 1zm0 0v3m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v2" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-white mb-2">This portfolio is private</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          The owner of this page hasn&apos;t made it public yet. Check back later, or reach out to them directly.
        </p>
      </div>
    </main>
  );
}
