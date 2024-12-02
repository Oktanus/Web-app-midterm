export function calculateAverage(scores) {
  const sum = scores.reduce((total, score) => total + score, 0);
  return sum / scores.length;
}