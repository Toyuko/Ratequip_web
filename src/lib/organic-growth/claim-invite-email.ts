export function renderClaimInviteEmail(vars: {
  companyName: string;
  companyContext: string;
  profileUrl: string;
  claimUrl: string;
  expiresDate: string;
  reportOrCorrectUrl: string;
  emailPreferencesUrl: string;
  supportUrl: string;
  recipientName?: string;
  inviterDisplay?: string;
  personalNote?: string;
}) {
  const greeting = vars.recipientName
    ? `Hello ${vars.recipientName},`
    : "Hello,";
  const inviter = vars.inviterDisplay
    ? `<p>Added by: ${vars.inviterDisplay}</p>`
    : "";
  const note = vars.personalNote
    ? `<p>Message from the person who added the company:<br/><em>“${vars.personalNote}”</em></p>`
    : "";

  const subject = `${vars.companyName} has been added to RateQuip`;
  const html = `
    <div style="font-family:Montserrat,Arial,sans-serif;color:#0f172a;line-height:1.5">
      <p>${greeting}</p>
      <p>A RateQuip user has added <strong>${vars.companyName}</strong> to RateQuip.</p>
      <p>Company: ${vars.companyContext}</p>
      ${inviter}
      ${note}
      <p>The profile is currently marked <strong>Unclaimed</strong>. If you are authorised to represent this company, you can claim the profile free of charge. RateQuip will ask you to verify your email and your authority before granting company access.</p>
      <p><a href="${vars.claimUrl}">Claim the company profile</a></p>
      <p><a href="${vars.profileUrl}">View the public profile</a></p>
      <p>This secure invitation expires on ${vars.expiresDate}. Do not forward the claim link.</p>
      <p><a href="${vars.reportOrCorrectUrl}">Not your company, or are the details wrong?</a></p>
      <p><a href="${vars.emailPreferencesUrl}">Manage invitation emails</a> · <a href="${vars.supportUrl}">Support</a></p>
      <p style="color:#64748b;font-size:12px">RateQuip — independent industrial company reputation, procurement and equipment intelligence. Template v10.1-en-1</p>
    </div>
  `.trim();

  return { subject, html };
}
