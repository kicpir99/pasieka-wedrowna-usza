import React from 'react';

export class ErrorBoundary extends (React.Component as any) {
  state: { hasError: boolean; error: Error | null } = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Błąd aplikacji w ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    try {
      sessionStorage.clear();
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#1A1511] text-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#261E17] border border-[#523F2D] shadow-2xl space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#E5983A]/20 border border-[#E5983A]/40 flex items-center justify-center text-3xl">
              🍯
            </div>
            
            <h1 className="text-2xl font-serif font-black text-[#FAF7F2]">
              Pasieka Usza
            </h1>
            
            <p className="text-sm text-[#C5BCAD] leading-relaxed">
              Wystąpił drobny błąd podczas wczytywania widoku. Kliknij poniższy przycisk, aby odświeżyć stronę.
            </p>

            <button
              onClick={this.handleReload}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#E5983A] hover:bg-[#D48628] active:scale-[0.98] text-[#1A1511] font-bold text-sm tracking-wide shadow-lg transition-all cursor-pointer"
            >
              Odśwież stronę
            </button>
          </div>
        </div>
      );
    }

    return (this.props as any).children;
  }
}
