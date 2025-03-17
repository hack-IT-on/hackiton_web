export const ARRAY_SIZE = 30;
export const MIN_VALUE = 8;
export const MAX_VALUE = 99;
export const DEFAULT_SPEED = 500;

export const pseudoCode = {
  bubble: `ALGORITHM BubbleSort(A[1...n])
  for i = 1 to n-1
    for j = 1 to n-i
      if A[j] > A[j+1]
        swap A[j] and A[j+1]
  return A`,

  selection: `ALGORITHM SelectionSort(A[1...n])
  for i = 1 to n-1
    minIndex = i
    for j = i+1 to n
      if A[j] < A[minIndex]
        minIndex = j
    swap A[i] and A[minIndex]
  return A`,

  insertion: `ALGORITHM InsertionSort(A[1...n])
  for i = 2 to n
    key = A[i]
    j = i - 1
    while j > 0 and A[j] > key
      A[j+1] = A[j]
      j = j - 1
    A[j+1] = key
  return A`,

  quick: `ALGORITHM QuickSort(A, low, high)
  if low < high
    pivot = partition(A, low, high)
    QuickSort(A, low, pivot-1)
    QuickSort(A, pivot+1, high)
  return A
  
ALGORITHM Partition(A, low, high)
  pivot = A[high]
  i = low - 1
  for j = low to high-1
    if A[j] ≤ pivot
      i = i + 1
      swap A[i] and A[j]
  swap A[i+1] and A[high]
  return i+1`,

  merge: `ALGORITHM MergeSort(A, left, right)
  if left < right
    mid = (left + right) / 2
    MergeSort(A, left, mid)
    MergeSort(A, mid+1, right)
    Merge(A, left, mid, right)
  return A
  
ALGORITHM Merge(A, left, mid, right)
  create L[1...n1], R[1...n2]
  copy A[left...mid] to L
  copy A[mid+1...right] to R
  i = j = 1, k = left
  while i ≤ n1 and j ≤ n2
    if L[i] ≤ R[j]
      A[k] = L[i]; i++
    else
      A[k] = R[j]; j++
    k++
  copy remaining elements`,
};

// Sorting algorithms implementation
export const sortingAlgorithms = {
  bubble: {
    name: "Bubble Sort",
    generate: (arr) => {
      const steps = [];
      const auxiliaryArray = [...arr];
      const n = arr.length;
      let passes = 0;

      for (let i = 0; i < n - 1; i++) {
        passes++;
        for (let j = 0; j < n - i - 1; j++) {
          steps.push({
            array: [...auxiliaryArray],
            comparing: [j, j + 1],
            swapping: [],
            passes,
          });

          if (auxiliaryArray[j] > auxiliaryArray[j + 1]) {
            [auxiliaryArray[j], auxiliaryArray[j + 1]] = [
              auxiliaryArray[j + 1],
              auxiliaryArray[j],
            ];
            steps.push({
              array: [...auxiliaryArray],
              comparing: [],
              swapping: [j, j + 1],
              passes,
            });
          }
        }
      }
      return steps;
    },
  },
  selection: {
    name: "Selection Sort",
    generate: (arr) => {
      const steps = [];
      const auxiliaryArray = [...arr];
      const n = arr.length;
      let passes = 0;

      for (let i = 0; i < n - 1; i++) {
        passes++;
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
          steps.push({
            array: [...auxiliaryArray],
            comparing: [minIdx, j],
            swapping: [],
            passes,
          });

          if (auxiliaryArray[j] < auxiliaryArray[minIdx]) {
            minIdx = j;
          }
        }
        if (minIdx !== i) {
          [auxiliaryArray[i], auxiliaryArray[minIdx]] = [
            auxiliaryArray[minIdx],
            auxiliaryArray[i],
          ];
          steps.push({
            array: [...auxiliaryArray],
            comparing: [],
            swapping: [i, minIdx],
            passes,
          });
        }
      }
      return steps;
    },
  },
  insertion: {
    name: "Insertion Sort",
    generate: (arr) => {
      const steps = [];
      const auxiliaryArray = [...arr];
      const n = arr.length;
      let passes = 0;

      for (let i = 1; i < n; i++) {
        let key = auxiliaryArray[i];
        let j = i - 1;
        passes++;

        while (j >= 0 && auxiliaryArray[j] > key) {
          steps.push({
            array: [...auxiliaryArray],
            comparing: [j, j + 1],
            swapping: [],
            passes,
          });

          auxiliaryArray[j + 1] = auxiliaryArray[j];
          steps.push({
            array: [...auxiliaryArray],
            comparing: [],
            swapping: [j, j + 1],
            passes,
          });
          j--;
        }
        auxiliaryArray[j + 1] = key;
      }
      return steps;
    },
  },
  quick: {
    name: "Quick Sort",
    generate: (arr) => {
      const steps = [];
      const auxiliaryArray = [...arr];
      let passes = 0;

      const partition = (low, high) => {
        passes++;
        const pivot = auxiliaryArray[high];
        let i = low - 1;

        steps.push({
          array: [...auxiliaryArray],
          comparing: [],
          swapping: [],
          passes,
          pivot: high,
          partitionRange: [low, high],
        });

        for (let j = low; j < high; j++) {
          steps.push({
            array: [...auxiliaryArray],
            comparing: [j, high],
            swapping: [],
            passes,
            pivot: high,
            partitionRange: [low, high],
          });

          if (auxiliaryArray[j] < pivot) {
            i++;
            [auxiliaryArray[i], auxiliaryArray[j]] = [
              auxiliaryArray[j],
              auxiliaryArray[i],
            ];
            steps.push({
              array: [...auxiliaryArray],
              comparing: [],
              swapping: [i, j],
              passes,
              pivot: high,
              partitionRange: [low, high],
            });
          }
        }

        [auxiliaryArray[i + 1], auxiliaryArray[high]] = [
          auxiliaryArray[high],
          auxiliaryArray[i + 1],
        ];
        steps.push({
          array: [...auxiliaryArray],
          comparing: [],
          swapping: [i + 1, high],
          passes,
          pivot: i + 1,
          partitionRange: [low, high],
        });

        return i + 1;
      };

      const quickSort = (low, high) => {
        if (low < high) {
          const pi = partition(low, high);
          quickSort(low, pi - 1);
          quickSort(pi + 1, high);
        }
      };

      quickSort(0, auxiliaryArray.length - 1);
      return steps;
    },
  },

  merge: {
    name: "Merge Sort",
    generate: (arr) => {
      const steps = [];
      const auxiliaryArray = [...arr];
      let passes = 0;

      const merge = (left, mid, right) => {
        passes++;
        const leftArray = auxiliaryArray.slice(left, mid + 1);
        const rightArray = auxiliaryArray.slice(mid + 1, right + 1);
        let i = 0,
          j = 0,
          k = left;

        steps.push({
          array: [...auxiliaryArray],
          comparing: [],
          swapping: [],
          passes,
          subArrays: {
            left: [left, mid],
            right: [mid + 1, right],
          },
        });

        while (i < leftArray.length && j < rightArray.length) {
          steps.push({
            array: [...auxiliaryArray],
            comparing: [left + i, mid + 1 + j],
            swapping: [],
            passes,
            subArrays: {
              left: [left, mid],
              right: [mid + 1, right],
            },
          });

          if (leftArray[i] <= rightArray[j]) {
            auxiliaryArray[k] = leftArray[i];
            i++;
          } else {
            auxiliaryArray[k] = rightArray[j];
            j++;
          }

          steps.push({
            array: [...auxiliaryArray],
            comparing: [],
            swapping: [k],
            passes,
            subArrays: {
              left: [left, mid],
              right: [mid + 1, right],
            },
          });
          k++;
        }

        // Copy remaining elements
        while (i < leftArray.length || j < rightArray.length) {
          if (i < leftArray.length) {
            auxiliaryArray[k] = leftArray[i];
            steps.push({
              array: [...auxiliaryArray],
              comparing: [],
              swapping: [k],
              passes,
              subArrays: {
                left: [left, mid],
                right: [mid + 1, right],
              },
            });
            i++;
            k++;
          } else {
            auxiliaryArray[k] = rightArray[j];
            steps.push({
              array: [...auxiliaryArray],
              comparing: [],
              swapping: [k],
              passes,
              subArrays: {
                left: [left, mid],
                right: [mid + 1, right],
              },
            });
            j++;
            k++;
          }
        }
      };

      const mergeSort = (left, right) => {
        if (left < right) {
          const mid = Math.floor((left + right) / 2);
          mergeSort(left, mid);
          mergeSort(mid + 1, right);
          merge(left, mid, right);
        }
      };

      mergeSort(0, auxiliaryArray.length - 1);
      return steps;
    },
  },
};
