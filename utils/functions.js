module.exports.secondsToDhms = (seconds) => {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  let timeUp = false;
  const dDisplay = d > 0 ? d + (d === 1 ? ' day, ' : ' days, ') : '';
  const hDisplay = h > 0 ? h + (h === 1 ? ' hour, ' : ' hours, ') : '';
  const mDisplay = m > 0 ? m + (m === 1 ? ' minute, ' : ' minutes, ') : '';
  const sDisplay = s > 0 ? s + (s === 1 ? ' second' : ' seconds') : '';
  if (d <= 0 && h <= 0 && m <= 0 && s <= 0) {
    timeUp = true;
  }
  return {
    timeUp,
    days: d,
    hours: h,
    minutes: m,
    seconds: s,
    format: dDisplay + hDisplay + mDisplay + sDisplay,
  };
};
