import { describeType } from "./eventTypes";
import React, { memo } from 'react'

const LOCALE = "en-GB";

const RELATIVE_STEPS = [
  { unit: "second", ms: 1000 },
  { unit: "minute", ms: 60 * 1000 },
  { unit: "hour", ms: 60 * 60 * 1000 },
  { unit: "day", ms: 24 * 60 * 60 * 1000 },
  { unit: "week", ms: 7 * 24 * 60 * 60 * 1000 },
  { unit: "month", ms: 30 * 24 * 60 * 60 * 1000 },
];

function relativeTime(date) {
  const diff = date.getTime() - Date.now();
  const abs = Math.abs(diff);
  let step = RELATIVE_STEPS[0];
  for (const candidate of RELATIVE_STEPS) {
    if (abs >= candidate.ms) step = candidate;
  }
  const value = Math.round(diff / step.ms);
  return new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" }).format(
    value,
    step.unit,
  );
}

function absoluteTime(date) {
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function dayLabel(date) {
  const today = new Date();
  const sameDay =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  if (sameDay) return "Today";
  return new Intl.DateTimeFormat(LOCALE, { dateStyle: "full" }).format(date);
}

function initialsFor(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

// Highlights the actor's name inside the message so it reads as "who did what".
function splitMessage(message, actor) {
  const index = message.indexOf(actor);
  if (index !== 0) return [null, message];
  return [actor, message.slice(actor.length)];
}

// Change 2: the "export default" was removed from the function so it can be
// wrapped in memo() at the bottom of the file. Nothing inside changed.
function EventRow({ event, compact }) {
  console.log("EventRow render", event.id); // TEMPORARY, remove before the PR
  const date = new Date(event.timestamp);
  const meta = describeType(event.type);
  const [actor, rest] = splitMessage(event.message, event.actor);

  return (
    <li className={`event event--${event.type}`}>
      <span className={`avatar ${compact ? "avatar--xs" : "avatar--sm"}`}>
        {initialsFor(event.actor)}
      </span>
      <div className="event__body">
        <div className="event__message">
          {actor && <strong>{actor}</strong>}
          {rest}
        </div>
        {!compact && (
          <div className="event__meta">
            <span className={`badge badge--${meta.tone}`}>{meta.label}</span>
            <span className="event__target">{event.target}</span>
          </div>
        )}
      </div>
      <time
        className="event__time"
        dateTime={event.timestamp}
        title={absoluteTime(date)}
        aria-label={`${dayLabel(date)}, ${absoluteTime(date)}`}
      >
        {compact ? absoluteTime(date) : relativeTime(date)}
      </time>
    </li>
  );
}

// Change 2: memo() remembers the last props (event, compact). If both are the
// same as last render, React skips calling EventRow, so a keystroke in the
// search box no longer re-renders every row.
export default memo(EventRow);
