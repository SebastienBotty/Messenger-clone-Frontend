export const statusTranslate = (status: string | undefined) => {
  if (status === undefined) {
    return "";
  }

  switch (status) {
    case "Online":
      return "En ligne";
    case "Offline":
      return "Hors ligne";
    case "Busy":
      return "Ne pas déranger";
    default:
      return "";
  }
};
