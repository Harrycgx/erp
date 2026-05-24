export function calculateBoardArea(width = 0, height = 0, depth = 0) {
  const area = 2 * (width * height + width * depth + height * depth);
  return {
    width,
    height,
    depth,
    area,
  };
}
