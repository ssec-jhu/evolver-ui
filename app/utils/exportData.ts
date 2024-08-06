import { EvolverConfigWithoutDefaults } from "client";
import { getDate } from "./getDate";

export const exportData = (data: EvolverConfigWithoutDefaults) => {
  const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
    JSON.stringify(data),
  )}`;
  const dateTime = getDate();
  const link = document.createElement("a");
  link.href = jsonString;
  link.download = `${data.name}_${dateTime}.json`;

  link.click();
};
