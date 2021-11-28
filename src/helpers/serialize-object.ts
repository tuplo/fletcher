// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function serializeObject(obj: Record<string, any>): string {
  return Object.entries(obj)
    .map(([key, value]) => [
      key.toLowerCase(),
      encodeURI(`${value}`).toLowerCase(),
    ])
    .map(([key, value]) => `${key}=${value}`)
    .sort((a, b) => a.localeCompare(b))
    .join(',');
}
