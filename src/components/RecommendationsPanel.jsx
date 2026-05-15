import { POSITIONS } from '../utils/gameState.js';

export default function RecommendationsPanel({ recommendations, onApplySub }) {
  return (
    <section className="recommendations">
      <h2>Suggested Next Subs</h2>
      {recommendations.nextSubs.length === 0 && <p className="muted">Fill field slots to see paired recommendations.</p>}
      {POSITIONS.map((position) => {
        const items = recommendations.byPosition[position] || [];
        if (items.length === 0) return null;
        return (
          <div className="rec-group" key={position}>
            <h3>{position} Subs</h3>
            {items.slice(0, 4).map((rec) => (
              <article className="rec-card" key={`${position}-${rec.inPlayer.id}-${rec.outPlayer.id}-${rec.slot.id}`}>
                <div className="rec-pair">
                  <strong>{rec.inPlayer.name}</strong>
                  <span>{'->'} for</span>
                  <strong>{rec.outPlayer.name}</strong>
                </div>
                <span className="badge recommended">Recommended sub</span>
                <p>{rec.slot.label}</p>
                <ul>
                  {rec.reasons.slice(0, 4).map((reason) => <li key={reason}>{reason}</li>)}
                </ul>
                <div className="rec-impact">
                  <span>S impact: {rec.strengthImpact >= 0 ? '+' : ''}{rec.strengthImpact}</span>
                  <span>Playing-time impact: {Math.ceil(rec.playingTimeImpact)} min need covered</span>
                </div>
                <button className="primary action-wide" onClick={() => onApplySub(rec)}>Apply {rec.inPlayer.name} for {rec.outPlayer.name}</button>
              </article>
            ))}
          </div>
        );
      })}
    </section>
  );
}
