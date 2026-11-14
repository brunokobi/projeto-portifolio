export interface LabelBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function overlapsAny(box: LabelBox, placed: LabelBox[]): boolean {
  return placed.some(
    (other) =>
      box.x < other.x + other.w && other.x < box.x + box.w && box.y < other.y + other.h && other.y < box.y + box.h
  );
}
