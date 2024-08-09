import {
  Link,
  useActionData,
  useLocation,
  useParams,
  useRouteLoaderData,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { EditJson } from "~/components/EditJson.client";
import { ClientOnly } from "remix-utils/client-only";
import { useEffect, useState } from "react";
import { SomeJSONSchema } from "ajv/dist/types/json-schema";
import { exportData } from "~/utils/exportData";
import { ErrorNotifs } from "~/components/ErrorNotifs";
import { HardwareTable } from "~/components/HardwareTable";
import {
  UpdateDeviceIntentEnum,
  type action,
  type loader,
} from "./devices.$ip_addr";
import { handleFileUpload } from "~/utils/handleFileUpload";

export const handle = {
  breadcrumb: ({ params }: { params: { ip_addr: string } }) => {
    const { ip_addr } = params;
    return <Link to={`/devices/${ip_addr}/config`}>config</Link>;
  },
};

export default function DeviceConfig() {
  const { ip_addr } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { pathname } = useLocation();
  const submit = useSubmit();
  const mode = searchParams.get("mode") === "edit" ? "edit" : "view";

  const { description, schema } = useRouteLoaderData<typeof loader>(
    "routes/devices.$ip_addr",
  );

  const evolverConfig = description.config;
  const configSchema = schema?.config;
  const actionData = useActionData<typeof action>();
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  useEffect(() => {
    if (actionData?.error) {
      if (typeof actionData.error === "string") {
        setErrorMessages([actionData?.error]);
      }
    }
  }, [actionData]);

  if (!configSchema) {
    throw new Error("unable to get device schema");
  }

  const [updatedEvolverConfig, setEvolverConfig] =
    useState<typeof evolverConfig>(evolverConfig);

  useEffect(() => {
    setEvolverConfig(updatedEvolverConfig);
  }, [updatedEvolverConfig]);

  return (
    <div>
      <div className="flex items-center gap-4">
        <h1 className="text-xl">Hardware</h1>
      </div>
      <div>
        <HardwareTable evolverConfig={evolverConfig} />
      </div>
      <div className="divider"></div>
      <ErrorNotifs messages={errorMessages} />
      <div className="mt-4 flex items-center gap-4 mb-8 justify-between">
        <div>
          <h1 className="text-xl">Configuration</h1>
        </div>
        <div className="flex items-center gap-4">
          {mode === "view" && (
            <div className="flex gap-4">
              <button
                className="btn btn-neutral"
                onClick={() => {
                  exportData(evolverConfig);
                }}
              >
                Download
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const params = new URLSearchParams();
                  params.set("mode", "edit");
                  setSearchParams(params);
                }}
              >
                Edit
              </button>
            </div>
          )}

          {mode === "edit" && (
            <div className="flex gap-4">
              <input
                onChange={(e) =>
                  handleFileUpload({
                    e,
                    setEvolverConfig,
                    setErrorMessages,
                    configSchema,
                  })
                }
                type="file"
                className="file-input w-full max-w-xs"
                accept=".json"
              />
              <button
                className="btn btn-primary"
                onClick={() => {
                  setErrorMessages([]);
                  const formData = new FormData();
                  formData.append("ip_addr", ip_addr ?? "");
                  formData.append(
                    "intent",
                    UpdateDeviceIntentEnum.Enum.update_evolver,
                  );
                  formData.append("data", JSON.stringify(updatedEvolverConfig));
                  submit(formData, { method: "POST" });
                }}
              >
                Save
              </button>
              <button
                className="btn "
                onClick={() => {
                  setErrorMessages([]);
                  setEvolverConfig(evolverConfig);
                  const params = new URLSearchParams();
                  params.set("mode", "view");
                  setSearchParams(params);
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <ClientOnly fallback={<h1>...loading</h1>}>
        {() => (
          <EditJson
            key={pathname}
            data={updatedEvolverConfig}
            mode={mode}
            schema={configSchema as SomeJSONSchema}
            setData={setEvolverConfig}
          />
        )}
      </ClientOnly>
    </div>
  );
}
