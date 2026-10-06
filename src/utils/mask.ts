export function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!domain || user.length <= 2) return `***@${domain ?? '???'}`;
  return `${user.slice(0, 2)}***@${domain}`;
}
