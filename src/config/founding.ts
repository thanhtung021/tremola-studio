/**
 * Fallback only. The live Founding counter is stored in the database (table `founding_slots`) and
 * edited in /admin. These numbers are used if the database cannot be reached.
 */
export const founding = {
  total: 20,
  remaining: 20,
};
