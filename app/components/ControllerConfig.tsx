import { Link, type SubmitFunction } from "react-router";
import { toast } from "react-toastify";
import SchemaForm from "./SchemaForm";
import { Intent } from "~/routes/devices.$id.$name.experiments.$experiment_id.controllers.$controller_id.config";
import { ROUTES } from "~/utils/routes";
import type { SchemaResponse } from "client";

type ControllerConfigProps = {
  controller: {
    classinfo: string;
    config: Record<string, unknown>;
  };
  classinfo: string;
  classinfoSchema: SchemaResponse;
  submit: SubmitFunction;
  id: string;
  name: string;
  experiment_id: string;
  controller_id: string;
  url: string;
};

export function ControllerConfig({
  controller,
  classinfo,
  classinfoSchema,
  submit,
  id,
  name,
  experiment_id,
  controller_id,
  url,
}: ControllerConfigProps) {
  const handleSubmit = (data: object) => {
    toast.dismiss();

    const formData = new FormData();
    formData.append("intent", Intent.Enum.update_controller);

    formData.append("url", url);
    formData.append("id", id);
    formData.append("experiment_id", experiment_id);
    formData.append("controller_id", controller_id);
    formData.append("controller_config", JSON.stringify(data));

    submit(formData, {
      method: "POST",
    });
  };

  const originalSchema = classinfoSchema?.config;
  const defaultName = classinfo.split(".").pop();

  // replace the schema.properties.name (which is an anyOf - and makes no sense for the UI - because None type means no form field is rendered) with a string field (which is what it is.)
  const schemaToUse = originalSchema?.properties
    ? {
        ...originalSchema,
        title: `configuration`,
        properties: {
          ...originalSchema.properties,
          name: {
            type: "string",
            title: "Name",
            default: defaultName,
            description: `Name of the controller`,
          },
        },
      }
    : {};

  return (
    <div className="flex flex-col gap-4" id={controller_id + "config"}>
      <div className="card card-border bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="card-title font-mono">info</div>
          <ul className="font-sans">
            <li>
              <span className="font-mono">class: </span>
              {classinfo}
            </li>
          </ul>
          <div className="justify-end card-actions">
            <Link
              className="btn btn-primary"
              to={ROUTES.device.config({ id, name })}
            >
              edit
            </Link>
          </div>
        </div>
      </div>
      <SchemaForm
        schema={schemaToUse}
        formData={controller.config}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
