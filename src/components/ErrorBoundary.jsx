import React from 'react';
import { AlertCircle, RefreshCw, LayoutDashboard } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full py-12 px-4 flex flex-col items-center justify-center text-center">
          <div className="max-w-md w-full nude-card p-6 sm:p-8 rounded-3xl bg-white shadow-nude-soft border border-amber-200/80 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200/60 shadow-xs">
              <AlertCircle size={28} />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Terjadi Kendala Memuat Tampilan
              </h3>
              <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                Tampilan mengalami kendala sementara. Anda dapat memuat ulang komponen ini tanpa perlu me-refresh seluruh halaman.
              </p>
            </div>
            {this.state.error?.message && (
              <div className="text-left bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-[11px] text-stone-600 font-mono break-all">
                <span className="font-bold text-rose-600">Info: </span>
                {this.state.error.message}
              </div>
            )}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-stone-900 to-stone-800 hover:from-amber-700 hover:to-rose-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>Muat Ulang Tampilan</span>
              </button>
              {this.props.onGoHome && (
                <button
                  type="button"
                  onClick={() => {
                    this.handleReset();
                    this.props.onGoHome();
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LayoutDashboard size={13} />
                  <span>Ke Dashboard</span>
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
