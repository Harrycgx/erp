import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(
    error,
    errorInfo
  ) {
    console.error(
      "ERP Crash:",
      error,
      errorInfo
    );
  }

  render() {
    if (
      this.state.hasError
    ) {
      return (
        <div
          className="
            flex min-h-screen
            items-center justify-center
            bg-[#020617]
            text-white
          "
        >
          <div className="text-center">
            <h1 className="text-4xl font-bold">
              ERP Error
            </h1>

            <p className="mt-4 text-slate-400">
              Something broke.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}