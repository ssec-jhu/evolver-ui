import React from "react";

export function handleFileUpload<T>({
  e,
  setData,
}: {
  e: React.ChangeEvent<HTMLInputElement>;
  setData: React.Dispatch<React.SetStateAction<T>>;
}) {
  const fileReader = new FileReader();
  if (e.target.files?.[0]) {
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = (event) => {
      const uploadedConfig = JSON.parse(event.target?.result as string);
      setData(uploadedConfig);
    };
  }
}
