function solution(a, m, k) {
  let count = 0;
  for (let i = 0; i < a.length - m + 1; i++) {
    if (checkSubSum(a, i, m, k)) count++;
  }
  return count;
}

function checkSubSum(a, x, m, k) {
  let lastIndex = x + m;
  let b = a.slice(x, lastIndex).sort((a, b) => a - b);
  for (let i = 0; i < b.length; i++) {
    for (let j = i + 1; j < b.length; j++) {
      if (b[i] + b[j] === k) return true;
      if (b[i] + b[j] > k) continue;
    }
  }
  return false;
}

console.log(solution([2, 4, 7, 5, 3, 5, 8, 5, 1, 7], 4, 10));
