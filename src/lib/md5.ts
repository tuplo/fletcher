import crypto from 'crypto';

export default function md5(input: string): string {
  return crypto.createHash('md5').update(input).digest('hex');
}
