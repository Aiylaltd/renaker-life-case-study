"use client";

import { Component, type ReactNode } from "react";

interface Props {
  name: string;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Prevents one failed GLB from taking down the whole WebGL scene. */
export class ModelErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(`[ModelErrorBoundary] ${this.props.name} failed:`, error);
  }

  render() {
    if (this.state.error) {
      return null;
    }
    return this.props.children;
  }
}
