import crypto from 'crypto';

export function getSHA1Base64(input: string): string {
    return crypto.createHash('sha1').update(input, 'utf8').digest('base64');
}