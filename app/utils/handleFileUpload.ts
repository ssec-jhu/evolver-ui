import { EvolverConfigWithoutDefaults } from "client";

export const handleFileUpload = ({
  e,
  setEvolverConfig,
}: {
  e: React.ChangeEvent<HTMLInputElement>;
  setEvolverConfig: (evolverConfig: EvolverConfigWithoutDefaults) => void;
}) => {
  const fileReader = new FileReader();
  if (e.target.files?.[0]) {
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = (event) => {
      const uploadedConfig: EvolverConfigWithoutDefaults = JSON.parse(
        event.target?.result as string,
      );
      setEvolverConfig(uploadedConfig);
    };
  }
};
