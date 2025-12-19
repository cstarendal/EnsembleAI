function HomePage(): JSX.Element {
  return (
    <div className="container mx-auto p-lg">
      <header className="mb-xl">
        <h1 className="text-4xl font-bold text-foreground">Ensemble AI Research System</h1>
        <p className="text-muted-foreground mt-md">Multi-model debate for research questions</p>
      </header>
      <main className="bg-card p-lg rounded-lg shadow-card">
        <p className="text-foreground">
          Application is ready for development. Start building features!
        </p>
      </main>
    </div>
  );
}

export default HomePage;
