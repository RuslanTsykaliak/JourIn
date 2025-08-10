// app/utils/debounce.ts

// Use a generic type for the arguments of the function being debounced
export const debounce = <Args extends unknown[]>(func: (...args: Args) => void, delay: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: Args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};
