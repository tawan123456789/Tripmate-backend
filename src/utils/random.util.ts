/**
 * Utility functions for generating random values
 */

/**
 * Generate random number between min and max (inclusive)
 */
export function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random string with specified length
 */
export function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate random alphanumeric ID with specified length
 */
export function randomId(length: number = 8): string {
  return randomString(length);
}

/**
 * Generate random boolean
 */
export function randomBoolean(): boolean {
  return Math.random() < 0.5;
}

/**
 * Pick random item from array
 */
export function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle array randomly
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate random date between two dates
 */
export function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Generate random email address
 */
export function randomEmail(): string {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'example.com'];
  const username = randomString(8).toLowerCase();
  const domain = randomItem(domains);
  return `${username}@${domain}`;
}

/**
 * Generate random phone number (Thai format)
 */
export function randomPhoneNumber(): string {
  const prefix = randomItem(['08', '09', '06', '07']);
  const suffix = randomNumber(10000000, 99999999);
  return `${prefix}${suffix}`;
}

/**
 * Generate random alphanumeric code with specified length (numbers + letters)
 */
export function randomAlphanumeric(length: number = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}