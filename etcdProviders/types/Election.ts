/*
  Events:
    strictly type the event listeners and events output by the election provider

    promote --> on the completion of a campaign, the promote event with fire containing truthy for 
      if current system is elected leader, and falsy if the system has been delegated to follower
*/
export type ElectionEvent = 'promoted';
export type ElectionListener = (electionRes: boolean) => void;

export const ALLOWED_EVENTS: Record<ElectionEvent, ElectionEvent> = {
  promoted: 'promoted'
};

/*
  Error Timeout:
    if an error event is fired from the client, timeout for this period until attempting to campaign again
*/
export const ERROR_TIMEOUT_IN_MS = 5000;