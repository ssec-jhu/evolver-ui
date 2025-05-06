import { Link, useLoaderData, useParams, useSubmit } from "react-router";
import { useEffect } from "react";
import { toast } from "react-toastify";
import SchemaForm from "./SchemaForm";
import {
  loader,
  action,
  Intent,
} from "~/routes/devices.$id.$name.experiments.$experiment_id.controllers.$controller_id.config";

type ControllerConfigProps = {
  controller: {
    classinfo: string;
    config: Record<string, unknown>;
  };
  actionData?: typeof action;
};

export function ControllerConfig({
  controller,
  actionData,
}: ControllerConfigProps) {
  const { classinfo, classinfoSchema } = useLoaderData<typeof loader>();
  const { id, experiment_id, controller_id } = useParams();
  const submit = useSubmit();

  // Display any error messages from the action
  useEffect(() => {
    if (actionData?.error) {
      if (typeof actionData.error === "string") {
        toast.error(actionData.error);
      }
      if (typeof actionData.error === "object") {
        const errorMessages: string[] = [];
        Object.entries(actionData.error).forEach(([key, value]) => {
          errorMessages.push(`${key}: ${value}`);
        });
        errorMessages.forEach((message) => {
          toast.error(message);
        });
      }
    }
  }, [actionData]);

  const handleSubmit = (data) => {
    toast.dismiss();

    const formData = new FormData();
    formData.append("intent", Intent.Enum.update_controller);
    formData.append("id", id || "");
    formData.append("experiment_id", experiment_id || "");
    formData.append("controller_id", controller_id || "");
    formData.append("controller_config", JSON.stringify(data));

    submit(formData, {
      method: "POST",
    });
  };

  const originalSchema = classinfoSchema?.config;

  // replace the schema.properties.name (which is an anyOf - and makes no sense from UI) with a string field (which is what it is.)
  const schemaToUse = {
    ...originalSchema,
    title: `configuration`,
    properties: {
      ...originalSchema.properties,
      name: { type: "string", title: "Name" },
    },
  };

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
            <Link className="btn btn-primary" to={`/devices/${id}/list/config`}>
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
