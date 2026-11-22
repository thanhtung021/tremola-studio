/**
 * Public contact details shown in the footer and in the Organization JSON-LD.
 * The first e-mail is the primary address.
 */
export const contact = {
  emails: ["hello@tremola.studio", "hello@tremolastudio.com"],
  phone: "+84869206323",
  phoneDisplay: "+84 869 206 323",
} as const;

export const primaryEmail = contact.emails[0];

/**
 * Public profiles (footer "Social" column and Organization `sameAs`). The column stays hidden
 * while this list is empty — add `{ label: "LinkedIn", href: "https://…" }` when a profile is live.
 */
export const socialProfiles: { label: string; href: string }[] = [];

/** The founder's own sites, linked from the footer bottom bar. */
export const founderSites = [
  { label: "sylvanusfinnian.com", href: "https://sylvanusfinnian.com" },
  { label: "sylvanusaudio.com", href: "https://sylvanusaudio.com" },
] as const;
