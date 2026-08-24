import { randomInt } from 'crypto';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

/**
 * Generates a random temporary password for an admin-triggered password reset
 * (ALIGNMENT_PLAN.md P3) — used in place of predictable defaults (e.g. `createStudent` hashing
 * the student's own `studentId` as their first password) since a *reset* has to actually change
 * what the credential is. `randomInt` (not `Math.random`) because this becomes a real login
 * credential, shown once to the admin to hand off out-of-band (there's no email/SMS integration
 * in this codebase — see CLAUDE.md). Excludes visually-ambiguous characters (0/O, 1/l/I) since
 * this is meant to be read aloud or retyped, not pasted.
 */
export const generateTemporaryPassword = (length = 10): string => {
  let password = '';
  for (let i = 0; i < length; i++) {
    password += ALPHABET[randomInt(ALPHABET.length)];
  }
  return password;
};
