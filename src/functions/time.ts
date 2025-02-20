import { dayNames, monthNames } from "../constants/time";

export const timeSince = (date: Date): string => {
  const newDate = new Date(date);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - newDate.getTime()) / 1000);

  const intervals = [
    { label: "semaine", seconds: 604800 },
    { label: "jour", seconds: 86400 },
    { label: "heure", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      switch (interval.label) {
        case "minute":
          return count === 1 ? "1min" : `${count}min`;
        case "heure":
          return count === 1 ? "1h" : `${count}h`;
        case "jour":
          return count === 1 ? "1j" : `${count}j`;
        case "semaine":
          return count === 1 ? "1sem" : `${count}sem`;

        default:
          return "Il y a un certain temps";
      }
    }
  }

  return "1min";
};

export const formatDateMsg = (date: Date | undefined): string => {
  if (!date) return "pa trouvé";
  const newdate = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  //console.log(newdate.toLocaleDateString("fr-FR", options));

  return newdate.toLocaleDateString("fr-FR", options);
};

export const moreThanXmins = (startDate: Date, nbMins: number) => {
  startDate = new Date(startDate);
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - startDate.getTime();
  const minutesPassed = Math.floor(timeDifference / (1000 * 60));
  return minutesPassed >= nbMins;
};

const formatMinutes = (minutes: number): string => {
  return minutes < 10 ? `0${minutes}` : `${minutes}`;
};

export const compareNowToDate = (previousDateToForm: Date): string | false => {
  const currentDate = new Date();
  const previousDate = new Date(previousDateToForm);
  const differenceInMilliseconds = Math.abs(previousDate.getTime() - currentDate.getTime());
  const differenceInMinutes = differenceInMilliseconds / (1000 * 60);
  const differenceInDays = differenceInMinutes / 60 / 24;

  if (differenceInDays > 7) {
    // Format : "15 Oct 2023, 10:05"
    const formattedDate = `${previousDate.getDate()} ${monthNames[
      previousDate.getMonth()
    ].substring(0, 3)} ${previousDate.getFullYear()}, ${previousDate.getHours()}:${formatMinutes(
      previousDate.getMinutes()
    )}`;
    return formattedDate;
  } else if (previousDate.getDate() < currentDate.getDate()) {
    // Format : "Mon 10:05"
    const formattedDate = `${dayNames[previousDate.getDay()].substring(
      0,
      3
    )} ${previousDate.getHours()}:${formatMinutes(previousDate.getMinutes())}`;
    return formattedDate;
  } else {
    return false;
  }
};
