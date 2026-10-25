import type { Feed, Poll } from '../../shared/contracts';
import { ageDays, dateLabel, percent, pollMargin } from '../lib/format';
import { ArrowIcon } from './icons';

export function PollDisplay({ feed, compact = false }: { feed: Feed<Poll[]>; compact?: boolean }) {
  const poll = feed.status === 'ok' ? feed.data[0] : undefined;
  if (!poll)
    return (
      <div className="poll-empty">
        <span className="eyebrow">Latest poll</span>
        <p>{feed.status === 'ok' ? 'No matching poll yet.' : feed.message}</p>
      </div>
    );
  const margin = pollMargin(poll);
  const age = ageDays(poll.endDate);
  return (
    <div className={`poll-display ${compact ? 'compact' : ''}`}>
      <div className="poll-top">
        <span className="eyebrow">Latest poll · vote share</span>
        <span className={`margin ${margin.party === 'D' ? 'dem' : 'rep'}`}>{margin.label}</span>
      </div>
      <div className="poll-values">
        {poll.answers.map((answer) => (
          <div key={answer.party}>
            <span>
              <i className={`party-dot ${answer.party === 'D' ? 'bg-dem' : 'bg-rep'}`} />
              {answer.name}
            </span>
            <strong className="number">{percent(answer.value)}</strong>
          </div>
        ))}
      </div>
      <div className="vote-bar" aria-hidden="true">
        {poll.answers.map((answer) => (
          <span
            key={answer.party}
            className={answer.party === 'D' ? 'bg-dem' : 'bg-rep'}
            style={{ width: `${answer.value}%` }}
          />
        ))}
      </div>
      <div className="poll-meta">
        <a href={poll.sourceUrl} target="_blank" rel="noreferrer">
          {poll.pollster}
          <ArrowIcon diagonal />
        </a>
        <span>
          {dateLabel(poll.endDate)}
          {age > 14 && <span className="age-note"> · {age}d old</span>}
        </span>
      </div>
      {!compact && (
        <div className="poll-sample">
          {poll.sampleSize ? `n=${poll.sampleSize.toLocaleString('en-US')} · ` : ''}
          {poll.population.toUpperCase()} · {dateLabel(poll.startDate)}–{dateLabel(poll.endDate)}
          {poll.partisan ? ` · ${poll.partisan} partisan` : ''}
          {poll.internal ? ' · Internal' : ''}
        </div>
      )}
    </div>
  );
}
