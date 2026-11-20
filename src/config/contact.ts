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
