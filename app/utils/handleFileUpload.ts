import Ajv from "ajv";
import { SomeJSONSchema } from "ajv/dist/types/json-schema";
import { EvolverConfigWithoutDefaults } from "client";

export const handleFileUpload = ({
  e,
  configSchema,
  setErrorMessages,
  setEvolverConfig,
}: {
  e: React.ChangeEvent<HTMLInputElement>;
  configSchema: SomeJSONSchema;
  setErrorMessages: (errorMessages: string[]) => void;
  setEvolverConfig: (evolverConfig: EvolverConfigWithoutDefaults) => void;
}) => {
  const fileReader = new FileReader();

  if (e.target.files?.[0]) {
    fileReader.readAsText(e.target.files[0], "UTF-8");

    fileReader.onload = (event) => {
      if (configSchema) {
        const ajv = new Ajv();
        const validate = ajv.compile(configSchema);
        const uploadedConfig: EvolverConfigWithoutDefaults = JSON.parse(
          event.target?.result as string,
        );
        const valid = validate(uploadedConfig);

        if (!valid && validate.errors) {
          const errorMessages = validate.errors
            .filter((error) => !!error.message)
            .map((error) => error.message as string);

          setErrorMessages(errorMessages);
        }
        if (valid) {
          setEvolverConfig(uploadedConfig);
        }
      }
    };
  }
};
