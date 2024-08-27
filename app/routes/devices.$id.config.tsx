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
import { exportData } from "~/utils/exportData";
import { type loader } from "./devices.$id";
import { handleFileUpload } from "~/utils/handleFileUpload";
import { EvolverConfigWithoutDefaults } from "client";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import { createClient } from "@hey-api/client-fetch";
import * as Evolver from "client/services.gen";
import { toast as notify } from "react-toastify";
import { db } from "~/utils/db.server";

export const handle = {
  breadcrumb: ({ params }: { params: { id: string } }) => {
    const { id } = params;
    return <Link to={`/devices/${id}/config`}>config</Link>;
  },
};

const UpdateDeviceIntentEnum = z.enum(["update_evolver"], {
  required_error: "an intent is required",
  invalid_type_error: "must be one of, update_device",
});

const schema = z.object({
  intent: UpdateDeviceIntentEnum,
  // The preprocess step is required for zod to perform the required check properly
  // as the value of an empty input is usually an empty string
  id: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string({ required_error: "an id is required" }),
  ),
  // Assume this is valid, client side AJV validation.
  data: z.string({ required_error: "an evolver config is required" }),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  // prelim validation, just checks request has intent, ip and a config.
  const submission = parseWithZod(formData, { schema: schema });

  if (submission.status !== "success") {
    return submission.reply();
  }
  const { intent, id, data } = submission.value;

  // use the db to get the url for that device id...
  const targetDevice = await db.device.findUnique({ where: { device_id: id } });

  if (!targetDevice) {
    return submission.reply({ formErrors: ["device not found"] });
  }

  const { url } = targetDevice;
  const evolverClient = createClient({
    baseUrl: url,
  });

  switch (intent) {
    case UpdateDeviceIntentEnum.Enum.update_evolver:
      try {
        const { response, error } = await Evolver.update({
          body: JSON.parse(data),
          client: evolverClient,
        });

        if (error) {
          const errors = {};
          error.detail?.forEach(({ loc, msg }) => {
            const errorKey = loc
              .map((l) => {
                switch (l) {
                  case "body":
                    return "config";
                  default:
                    return l;
                }
              })
              .join(".");
            errors[errorKey] = [msg];
          });

          if (errors) {
            return submission.reply({ fieldErrors: errors });
          }
        }
        if (response.status !== 200) {
          throw new Error();
        }
        return redirect(`/devices/${id}/config?mode=view`);
      } catch (error) {
        return submission.reply({ formErrors: ["unable to update device"] });
      }
    default:
      return null;
  }
}

export default function DeviceConfig() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { pathname } = useLocation();

  // This should be what comes back from the action at /devices/:id that the form was submitted to.
  const actionData = useActionData<typeof action>();

  const submit = useSubmit();
  const mode = searchParams.get("mode") === "edit" ? "edit" : "view";

  const loaderData = useRouteLoaderData<typeof loader>("routes/devices.$id");
  let description;

  if (loaderData?.description?.config) {
    description = loaderData.description;
  }

  const evolverConfig = description?.config as EvolverConfigWithoutDefaults;

  useEffect(() => {
    if (actionData?.error) {
      if (typeof actionData.error === "string") {
        notify.error(actionData.error);
      }
      if (typeof actionData.error === "object") {
        const errorMessages: string[] = [];
        Object.entries(actionData.error).forEach(([key, value]) => {
          errorMessages.push(`${key}: ${value}`);
        });
        errorMessages.forEach((message) => {
          notify.error(message);
        });
      }
    }
  }, [actionData]);

  const [updatedEvolverConfig, setEvolverConfig] =
    useState<typeof evolverConfig>(evolverConfig);

  useEffect(() => {
    setEvolverConfig(updatedEvolverConfig);
  }, [updatedEvolverConfig]);

  return (
    <div className="flex flex-col gap-4">
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
        <div className="flex flex-wrap gap-4">
          <input
            onChange={(e) =>
              handleFileUpload({
                e,
                setEvolverConfig,
              })
            }
            type="file"
            className="file-input w-full max-w-xs"
            accept=".json"
          />
          <button
            className="btn btn-primary"
            onClick={() => {
              notify.dismiss();
              const formData = new FormData();
              formData.append("id", id ?? "");
              formData.append(
                "intent",
                UpdateDeviceIntentEnum.Enum.update_evolver,
              );
              formData.append("data", JSON.stringify(updatedEvolverConfig));
              submit(formData, {
                method: "POST",
              });
            }}
          >
            Save
          </button>
          <button
            className="btn"
            onClick={() => {
              setEvolverConfig(evolverConfig);
              const params = new URLSearchParams();
              params.set("mode", "view");
              setSearchParams(params);
              notify.dismiss();
            }}
          >
            Cancel
          </button>
        </div>
      )}
      <div className="mt-4 flex items-start gap-4 mb-8 justify-between">
        <ClientOnly fallback={<h1>...loading</h1>}>
          {() => (
            <EditJson
              key={pathname}
              data={updatedEvolverConfig}
              mode={mode}
              setData={setEvolverConfig}
            />
          )}
        </ClientOnly>
      </div>
    </div>
  );
}
