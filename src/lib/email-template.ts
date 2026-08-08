import { brand, publicAppUrl } from "@/lib/config";

const COLORS = {
  navy: brand.colors.navy,
  orange: brand.colors.orange,
  orangeDeep: brand.colors.orangeDeep,
  slate: brand.colors.slate,
  muted: brand.colors.muted,
  surface: brand.colors.surface,
  border: brand.colors.border,
  white: "#FFFFFF",
  page: "#EEF2F7",
} as const;

export type EmailCta = {
  label: string;
  href: string;
};

export type EmailTemplateOptions = {
  /** Inbox preview text (hidden in body). */
  preheader?: string;
  /** Optional heading shown under the logo. */
  heading?: string;
  /** Main HTML body (paragraphs, lists, etc.). */
  bodyHtml: string;
  /** Primary call-to-action button. */
  cta?: EmailCta;
  /** Secondary text link under the CTA. */
  secondaryLink?: EmailCta;
  /** Extra footer note (template version, invite type, etc.). */
  footerNote?: string;
  /** Absolute logo URL override. */
  logoUrl?: string;
};

function emailLogoUrl() {
  return `${publicAppUrl()}/brand/ratequip-logo-email.png`;
}

/** Orange CTA button — table-based for Outlook. */
export function emailButton(cta: EmailCta) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 8px">
      <tr>
        <td align="center" bgcolor="${COLORS.orangeDeep}" style="border-radius:8px;background-color:${COLORS.orangeDeep}">
          <a href="${cta.href}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 28px;font-family:Montserrat,Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;line-height:1.2;color:${COLORS.white};text-decoration:none;border-radius:8px">
            ${cta.label}
          </a>
        </td>
      </tr>
    </table>
  `.trim();
}

/** Text link styled with brand orange. */
export function emailLink(href: string, label: string) {
  return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color:${COLORS.orangeDeep};text-decoration:underline;font-weight:600">${label}</a>`;
}

/** Muted meta line. */
export function emailMeta(html: string) {
  return `<p style="margin:0 0 12px;font-family:Montserrat,Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:${COLORS.muted}">${html}</p>`;
}

/** Highlight callout — for “why you were invited” and similar context. */
export function emailCallout(opts: { label: string; bodyHtml: string }) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px">
      <tr>
        <td style="padding:16px 18px;background-color:${COLORS.surface};border:1px solid ${COLORS.border};border-left:4px solid ${COLORS.orangeDeep};border-radius:10px">
          <p style="margin:0 0 6px;font-family:Montserrat,Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;line-height:1.4;letter-spacing:0.06em;text-transform:uppercase;color:${COLORS.orangeDeep}">${opts.label}</p>
          <div style="font-family:Montserrat,Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${COLORS.navy}">${opts.bodyHtml}</div>
        </td>
      </tr>
    </table>
  `.trim();
}

/** Simple benefit list for incentive-led emails. */
export function emailBenefits(items: string[]) {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td width="22" valign="top" style="padding:0 0 10px;font-family:Montserrat,Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:${COLORS.orangeDeep};font-weight:700">✓</td>
        <td valign="top" style="padding:0 0 10px;font-family:Montserrat,Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:${COLORS.slate}">${item}</td>
      </tr>`,
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 8px">
      ${rows}
    </table>
  `.trim();
}

/**
 * Wrap transactional email content in the RateQuip branded layout.
 * Uses nested tables for broad client support (Gmail, Outlook, Apple Mail).
 */
export function renderEmailDocument(opts: EmailTemplateOptions) {
  const baseUrl = publicAppUrl();
  const logoUrl = opts.logoUrl ?? emailLogoUrl();
  const supportUrl = `${baseUrl}/contact`;
  const preheader = opts.preheader?.trim() || opts.heading?.trim() || "";

  const headingBlock = opts.heading
    ? `<h1 style="margin:0 0 16px;font-family:Montserrat,Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;line-height:1.3;color:${COLORS.navy};letter-spacing:-0.02em">${opts.heading}</h1>`
    : "";

  const ctaBlock = opts.cta ? emailButton(opts.cta) : "";

  const secondaryBlock = opts.secondaryLink
    ? `<p style="margin:4px 0 0;font-family:Montserrat,Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:${COLORS.slate}">${emailLink(opts.secondaryLink.href, opts.secondaryLink.label)}</p>`
    : "";

  const footerNote = opts.footerNote
    ? `<p style="margin:0 0 8px;font-family:Montserrat,Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:${COLORS.muted}">${opts.footerNote}</p>`
    : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${brand.name}</title>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.page};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${COLORS.page};opacity:0">
    ${preheader}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${COLORS.page};margin:0;padding:0;width:100%">
    <tr>
      <td align="center" style="padding:32px 16px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background-color:${COLORS.white};border-radius:16px;overflow:hidden;border:1px solid ${COLORS.border};box-shadow:0 8px 28px rgba(15,23,42,0.08)">
          <tr>
            <td style="padding:0;font-size:0;line-height:0">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="62%" style="height:5px;line-height:5px;font-size:0;background-color:${COLORS.navy}">&nbsp;</td>
                  <td width="38%" style="height:5px;line-height:5px;font-size:0;background-color:${COLORS.orangeDeep}">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:28px 32px 8px;background-color:${COLORS.white}">
              <a href="${baseUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration:none">
                <img src="${logoUrl}" width="200" height="133" alt="${brand.name}" style="display:block;width:200px;max-width:70%;height:auto;border:0;outline:none;text-decoration:none" />
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 32px 20px">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="72">
                <tr>
                  <td style="height:3px;line-height:3px;font-size:0;background-color:${COLORS.orange};border-radius:2px">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 36px 8px;font-family:Montserrat,Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${COLORS.navy}">
              ${headingBlock}
              <div style="font-family:Montserrat,Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:${COLORS.slate}">
                ${opts.bodyHtml}
              </div>
              ${ctaBlock}
              ${secondaryBlock}
            </td>
          </tr>
          <tr>
            <td style="padding:28px 36px 32px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${COLORS.border}">
                <tr>
                  <td style="padding-top:20px">
                    ${footerNote}
                    <p style="margin:0 0 8px;font-family:Montserrat,Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:${COLORS.muted}">
                      <a href="${supportUrl}" target="_blank" rel="noopener noreferrer" style="color:${COLORS.muted};text-decoration:underline">Support</a>
                      &nbsp;·&nbsp;
                      <a href="${baseUrl}" target="_blank" rel="noopener noreferrer" style="color:${COLORS.muted};text-decoration:underline">${brand.domain}</a>
                    </p>
                    <p style="margin:0;font-family:Montserrat,Arial,Helvetica,sans-serif;font-size:11px;line-height:1.5;letter-spacing:0.08em;text-transform:uppercase;color:${COLORS.navy}">
                      Rate <span style="color:${COLORS.orange}">·</span> Compare <span style="color:${COLORS.orange}">·</span> Connect <span style="color:${COLORS.orange}">·</span> Grow
                    </p>
                    <p style="margin:10px 0 0;font-family:Montserrat,Arial,Helvetica,sans-serif;font-size:11px;line-height:1.5;color:${COLORS.muted}">
                      ${brand.name} — independent industrial company reputation, procurement and equipment intelligence.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/** Convenience: body paragraph with brand spacing. */
export function emailParagraph(html: string) {
  return `<p style="margin:0 0 14px;font-family:Montserrat,Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:${COLORS.slate}">${html}</p>`;
}
