export const ApiToken = () => {
  const stringToken = localStorage.getItem("ApiToken");
  if (stringToken) {
    const token = stringToken.slice(1, -1);
    return token;
  }
};
