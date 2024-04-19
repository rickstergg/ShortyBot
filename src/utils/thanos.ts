const quotes = [
  "When I'm done, half of humanity will still be alive.",
  "You should've gone for the head.",
  'I am inevitable.',
];

export const shuffleNames = (userNames: string[]): string[] => {
  const names = userNames.slice(0);
  for (let i = names.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [names[i], names[j]] = [names[j], names[i]];
  }
  return names;
};

export const randomQuote = () => {
  return quotes[Math.floor(Math.random() * quotes.length)];
};
