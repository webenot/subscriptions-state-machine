export function objectToBase64(object: object): string {
  return Buffer.from(JSON.stringify(object), 'utf8').toString('base64');
}

export function objectFromBase64(string: string): object {
  // eslint-disable-next-line  @typescript-eslint/no-unsafe-return
  return JSON.parse(Buffer.from(string, 'base64').toString('utf8'));
}
