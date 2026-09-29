import { Component, type ErrorInfo, type ReactNode } from "react";

type State = { error: Error | null; stack: string };

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null, stack: "" };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(_error: Error, info: ErrorInfo) {
    this.setState({ stack: info.componentStack ?? "" });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ padding: 16, fontFamily: "sans-serif" }}>
        <h2 style={{ color: "crimson" }}>Something went wrong</h2>
        <p>{this.state.error.message}</p>
        {this.state.stack && <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{this.state.stack}</pre>}
        <button onClick={() => window.location.reload()}>Reload page</button>
      </div>
    );
  }
}
