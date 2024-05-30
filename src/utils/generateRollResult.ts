export const generateRollResult = () => {
  const symbols = ["cherry", "lemon", "orange", "watermelon"];
  const rewards = { cherry: 10, lemon: 20, orange: 30, watermelon: 40 };

  const roll = Array.from(
    { length: 3 },
    () => symbols[Math.floor(Math.random() * symbols.length)]
  );

  const isWin = roll.every((symbol, i, arr) => symbol === arr[0]);
  const reward = isWin ? rewards[roll[0] as keyof typeof rewards] : 0;

  return { roll, isWin, reward };
};
