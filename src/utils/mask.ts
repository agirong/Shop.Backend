export function maskEmail(email: string | undefined | null): string {
  if (!email) return '***';
  const [user, domain] = email.split('@');
  if (!domain || user.length <= 2) return `***@${domain ?? '???'}`;
  return `${user.slice(0, 2)}***@${domain}`;
}
