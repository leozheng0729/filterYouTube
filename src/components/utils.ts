export const presets = [
  'magenta',
  'red',
  'volcano',
  'orange',
  'gold',
  'lime',
  'green',
  'cyan',
  'blue',
  'geekblue',
  'purple',
];

export const getColor = () => {
  return presets[Math.floor(Math.random() * presets.length)];
}