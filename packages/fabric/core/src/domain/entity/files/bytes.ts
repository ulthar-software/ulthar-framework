export function KiBs(value: number): number {
  return value * 1024;
}

export function MiBs(value: number): number {
  return KiBs(value * 1024);
}

export function GiBs(value: number): number {
  return MiBs(value * 1024);
}
