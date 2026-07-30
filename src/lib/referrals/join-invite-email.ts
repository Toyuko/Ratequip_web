export function renderJoinInviteEmail(vars: {
  kindLabel: string;
  title: string;
  body: string;
  joinUrl: string;
  signUpUrl: string;
  inviterName?: string;
  companyName?: string;
  personalNote?: string;
  supportUrl: string;
}) {
  const greeting = "Hello,";
  const inviter = vars.inviterName
    ? `<p>Invited by: <strong>${vars.inviterName}</strong></p>`
    : "";
  const company = vars.companyName
    ? `<p>Company: <strong>${vars.companyName}</strong></p>`
    : "";
  const note = vars.personalNote
    ? `<p>Personal message:<br/><em>“${vars.personalNote}”</em></p>`
    : "";

  const subject = vars.title;
  const html = `
    <div style="font-family:Montserrat,Arial,sans-serif;color:#0f172a;line-height:1.5">
      <p>${greeting}</p>
      <p>${vars.body}</p>
      ${inviter}
      ${company}
      ${note}
      <p><a href="${vars.joinUrl}" style="display:inline-block;background:#ea580c;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600">Accept invite</a></p>
      <p>Or <a href="${vars.signUpUrl}">create an account</a> with this referral.</p>
      <p style="color:#64748b;font-size:13px">Invite type: ${vars.kindLabel}</p>
      <p><a href="${vars.supportUrl}">Support</a></p>
      <p style="color:#64748b;font-size:12px">RateQuip — independent industrial company reputation, procurement and equipment intelligence.</p>
    </div>
  `.trim();

  return { subject, html };
}
