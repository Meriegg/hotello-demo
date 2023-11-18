export const calculateStayDuration = (
  checkInDate: Date,
  checkOutDate: Date,
) => {
  const timeDifference = checkOutDate.getTime() - checkInDate.getTime();

  const daysStayed = timeDifference / (1000 * 60 * 60 * 24);

  return Math.round(daysStayed);
};
