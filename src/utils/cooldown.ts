export const cooldownsWithAbilityHaste = (
  cooldowns: number[],
  haste: number,
): string => {
  const factor = 100 / (100 + haste);
  return cooldowns.map((cd) => cd * factor).join(', ');
};
