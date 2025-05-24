// Helper function to format date and time
export const formatBookingDateTime = (startTimeStr, endTimeStr) => {
  const startDate = new Date(startTimeStr);
  const endDate = new Date(endTimeStr);

  const startYear = startDate.getFullYear();
  const startMonth = (startDate.getMonth() + 1).toString().padStart(2, '0');
  const startDay = startDate.getDate().toString().padStart(2, '0');
  const startHours = startDate.getHours().toString().padStart(2, '0');
  const startMinutes = startDate.getMinutes().toString().padStart(2, '0');

  const endYear = endDate.getFullYear();
  const endMonth = (endDate.getMonth() + 1).toString().padStart(2, '0');
  const endDay = endDate.getDate().toString().padStart(2, '0');
  const endHours = endDate.getHours().toString().padStart(2, '0');
  const endMinutes = endDate.getMinutes().toString().padStart(2, '0');

  const isSameDay = startDate.toDateString() === endDate.toDateString();
  const isSameYear = startYear === endYear;

  let formattedString = '';

  if (isSameDay) {
    formattedString += isSameYear ? `${startMonth}/${startDay}` : `${startYear}/${startMonth}/${startDay}`;
    formattedString += ` ${startHours}:${startMinutes}-${endHours}:${endMinutes}`;
  } else {
    formattedString += isSameYear ? `${startMonth}/${startDay} ${startHours}:${startMinutes}` : `${startYear}/${startMonth}/${startDay} ${startHours}:${startMinutes}`;
    formattedString += ' - ';
    formattedString += isSameYear ? `${endMonth}/${endDay} ${endHours}:${endMinutes}` : `${endYear}/${endMonth}/${endDay} ${endHours}:${endMinutes}`;
  }

  return formattedString;
};
