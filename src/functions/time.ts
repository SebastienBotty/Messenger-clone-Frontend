export const timeSince = (date: Date): string => {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

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
