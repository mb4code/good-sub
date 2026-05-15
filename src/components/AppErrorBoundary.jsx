import React from 'react';
import { clearGame } from '../utils/storage.js';

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  clearSavedState = () => {
    clearGame();
    localStorage.removeItem('soccerSubs.roster');
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="screen">
        <section className="crash-panel">
          <h1>Soccer Subs could not load</h1>
          <p>The saved browser data is likely from an older app version or became malformed.</p>
          <pre>{this.state.error.message}</pre>
          <button className="danger" onClick={this.clearSavedState}>Clear Saved Browser Data</button>
        </section>
      </main>
    );
  }
}
