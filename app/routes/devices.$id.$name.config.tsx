import {
  Link,
  useActionData,
  useLocation,
  useParams,
  useSearchParams,
  useSubmit,
  redirect,
  useLoaderData,
} from "react-router";
import type { Route } from "./+types/devices.$id.$name.config";
import { ROUTES } from "~/utils/routes";
import { EditJson } from "~/components/EditJson.client";
import { ClientOnly } from "remix-utils/client-only";
import { useEffect, useState } from "react";
import { exportData } from "~/utils/exportData";
import { handleFileUpload } from "~/utils/handleFileUpload";
import type { EvolverConfigWithoutDefaults } from "client";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import * as Evolver from "client/services.gen";
import { db } from "~/utils/db.server";
import { createEvolverClient } from "~/utils/evolverClient.client";
import { deviceInfo } from "~/cookies.server";
import { useFormErrorNotifications } from "~/utils/useFormErrorNotifications";
import type { Prisma } from "@prisma/client";
import { toast as notify } from "react-toastify";

export const handle = {
  breadcrumb: ({ params }: { params: { id: string; name: string } }) => {
    const { id, name } = params;
    return <Link to={ROUTES.device.config({ id, name })}>config</Link>;
  },
};

const UpdateDeviceIntentEnum = z.enum(["update_evolver"], {
  required_error: "an intent is required",
  invalid_type_error: "must be one of, update_device",
});

const ServerIntentEnum = z.enum(["update_device_name"], {
  required_error: "an intent is required",
});

const schema = z.object({
  intent: UpdateDeviceIntentEnum,
  // The preprocess step is required for zod to perform the required check properly
  // as the value of an empty input is usually an empty string
  id: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string({ required_error: "an id is required" }),
  ),
  name: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string({ required_error: "a name is required" }),
  ),
  // Assume this is valid, client side AJV validation.
  data: z.string({ required_error: "an evolver config is required" }),
  url: z.string().url(),
});

const serverSchema = z.object({
  intent: z.literal(ServerIntentEnum.Enum.update_device_name),
  id: z.string(),
  name: z.string(),
});

// Server action handles database operations, no Evolver API call here.
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: serverSchema });

  if (submission.status !== "success") {
    return { ...submission.reply(), success: false };
  }

  const { intent, id, name } = submission.value;

  try {
    switch (intent) {
      case ServerIntentEnum.Enum.update_device_name: {
        // Update the database with the new config's name
        const device = await (db.device as Prisma.DeviceDelegate).update({
          where: { device_id: id },
          data: { name },
        });

        return { device, success: true };
      }

      default:
        return { success: false };
    }
  } catch (error) {
    return {
      ...submission.reply({
        formErrors: ["Database error"],
      }),
      success: false,
    };
  }
}

// Client action handles Evolver API calls
export async function clientAction({
  request,
  serverAction,
}: Route.ClientActionArgs) {
  const formData = await request.formData();

  // prelim validation, just checks request has intent, ip and a config.
  const submission = parseWithZod(formData, { schema: schema });

  if (submission.status !== "success") {
    return submission.reply();
  }
  const { intent, id, data, name, url } = submission.value;

  try {
    const evolverClient = createEvolverClient(url);

    switch (intent) {
      case UpdateDeviceIntentEnum.Enum.update_evolver:
        try {
          const { response, error } = await Evolver.update({
            body: JSON.parse(data),
            client: evolverClient,
          });

          if (error) {
            const errors: { [id: string]: string[] } = {};
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
              return {
                ...submission.reply({ fieldErrors: errors }),
                success: false,
              };
            }
          }
          if (response.status !== 200) {
            return {
              ...submission.reply({
                formErrors: [
                  `Got an unexpected response: ${response.status}. ${JSON.stringify(response)}`,
                ],
              }),
              success: false,
            };
          }

          // Call server action to update database
          const updateFormData = new FormData();
          updateFormData.append(
            "intent",
            ServerIntentEnum.Enum.update_device_name,
          );
          updateFormData.append("id", id);
          updateFormData.append("name", name);
          const updateResult = await serverAction({ formData: updateFormData });

          // Check if server action failed
          if (!updateResult?.success) {
            return { ...updateResult, success: false };
          }

          return redirect(`${ROUTES.device.config({ id, name })}?mode=view`);
        } catch (error) {
          return {
            ...submission.reply({
              formErrors: [
                "unable to update device",
                " error object: " + JSON.stringify(error),
              ],
            }),
            success: false,
          };
        }
      default:
        return { success: false };
    }
  } catch (error) {
    return {
      ...submission.reply({
        formErrors: [
          "Failed to connect to device: " + (error.message || "Unknown error"),
        ],
      }),
      success: false,
    };
  }
}
export async function loader({ request }: Route.LoaderArgs) {
  return {
    device: await deviceInfo.parse(request.headers.get("Cookie")),
  };
}

export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
  const { device } = await serverLoader();
  const evolverClient = createEvolverClient(device.url); // (5) create an Evolver client.

  const [describeEvolver, evolverState] = await Promise.all([
    Evolver.describe({ client: evolverClient }),
    Evolver.state({ client: evolverClient }),
  ]);

  return {
    device,
    description: describeEvolver.data,
    ok: true,
    state: evolverState.data,
  };
}

export default function DeviceConfig() {
  const { device, description } = useLoaderData<typeof clientLoader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { pathname } = useLocation();
  const { id } = useParams<Route.LoaderArgs["params"]>();

  // This should be what comes back from the action at /devices/:id that the form was submitted to.
  const actionData = useActionData<typeof clientAction>();

  const submit = useSubmit();
  const mode = searchParams.get("mode") === "edit" ? "edit" : "view";

  const evolverConfig = description?.config as EvolverConfigWithoutDefaults;

  useFormErrorNotifications(actionData);

  const [updatedEvolverConfig, setEvolverConfig] =
    useState<typeof evolverConfig>(evolverConfig);

  useEffect(() => {
    setEvolverConfig(updatedEvolverConfig);
  }, [updatedEvolverConfig]);

  return (
    <div className="p-4 bg-base-300 rounded-box relative overflow-x-auto">
      <div className="flex flex-col gap-4">
        {mode === "view" && (
          <div className="flex gap-4">
            <button
              className="btn btn-neutral"
              onClick={() => {
                exportData(evolverConfig);
              }}
            >
              download
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                const params = new URLSearchParams();
                params.set("mode", "edit");
                setSearchParams(params);
              }}
            >
              edit
            </button>
          </div>
        )}

        {mode === "edit" && (
          <div className="flex flex-wrap gap-4">
            <input
              onChange={(e) =>
                handleFileUpload({
                  e,
                  setData: setEvolverConfig,
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
                // get the name from the updated evolver config.
                formData.append("name", updatedEvolverConfig.name);
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
        <div className="flex items-start gap-4 mb-8 justify-between">
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
    </div>
  );
}
