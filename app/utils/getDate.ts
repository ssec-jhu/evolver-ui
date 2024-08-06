export const getDate = () => {
  const today = new Date();

  const options: { month: "short"; day: "2-digit"; year: "numeric" } = {
    month: "short",
    day: "2-digit",
    year: "numeric",
  };

  return today
    .toLocaleDateString("en-US", options)
    .replace(" ", "_")
    .replace(",", "_");
};
