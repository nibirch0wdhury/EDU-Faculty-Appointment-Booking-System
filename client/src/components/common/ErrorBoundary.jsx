import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import MagneticButton from '../ui/MagneticButton';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error in component:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 bg-slate-50/80 dark:bg-slate-950/80">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 shadow-card dark:shadow-card-dark border border-red-500/20 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">
                Something went wrong
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                An unexpected error occurred while rendering this page.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 text-[11px] text-red-600 dark:text-red-400 font-mono text-left overflow-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <MagneticButton
                variant="primary"
                onClick={this.handleReload}
                className="py-2.5 px-5 text-xs shadow-md shadow-primary-500/20"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </MagneticButton>
              
              <a href="/">
                <MagneticButton
                  variant="secondary"
                  className="py-2.5 px-5 text-xs"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Go Home</span>
                </MagneticButton>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
