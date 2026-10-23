// Starting values from PRD chapter 8. Calibrate after the family test.

/** Number of most recent answers per skill that are evaluated. */
export const WINDOW_SIZE = 10;
/** Window sum at or above which the level goes up (or the skill is mastered on level 4). */
export const LEVEL_UP_THRESHOLD = 9;
/** Window sum at or below which the level goes down. */
export const LEVEL_DOWN_THRESHOLD = 6.5;

export const MIN_LEVEL = 1;
export const MAX_LEVEL = 4;

export const SCORE_FIRST_TRY = 1;
export const SCORE_AFTER_HINT = 0.5;
export const SCORE_OTHER = 0;

/** Every Nth task is a review task. */
export const REVIEW_EVERY = 5;
/** A task solved only after this many mistakes goes to the review queue. */
export const REVIEW_AFTER_MISTAKES = 3;
export const REVIEW_QUEUE_MAX = 20;

/** Tasks per mission (PRD: 3 to 5). With 5, the last task of each mission is the review task. */
export const TASKS_PER_MISSION = 5;
/** The map offers at most this many missions. */
export const MAX_MISSIONS_OFFERED = 3;

export const LOG_MAX = 500;

export const DEFAULT_MISSIONS_BEFORE_BREAK = 3;
export const MIN_MISSIONS_BEFORE_BREAK = 1;
export const MAX_MISSIONS_BEFORE_BREAK = 5;

/** Number of answer choices for tap-to-answer tasks. */
export const CHOICE_COUNT = 3;
