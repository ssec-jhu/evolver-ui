import { useLoaderData, useParams, useSubmit } from "@remix-run/react";
import { useEffect } from "react";
import { toast } from "react-toastify";
import SchemaForm from "./SchemaForm";
import {
  loader,
  action,
} from "~/routes/devices.$id.$name.experiments.$experiment_id.$controller_id.config";

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
  const controllerName = controller.config.name as string;
  const loaderData = useLoaderData<typeof loader>();
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
    formData.append("intent", "update_controller");
    formData.append("id", id || "");
    formData.append("experiment_id", experiment_id || "");
    formData.append("controller_id", controller_id || "");
    formData.append("controller_config", JSON.stringify(data));

    submit(formData, {
      method: "POST",
    });
  };

  return (
    <div id={controllerName + "config"}>
      <SchemaForm
        schema={loaderData.classinfoSchema.config}
        formData={controller.config}
        onSubmit={handleSubmit}
        title="Controller Configuration"
        submitText="Save Changes"
      />
    </div>
  );
}
