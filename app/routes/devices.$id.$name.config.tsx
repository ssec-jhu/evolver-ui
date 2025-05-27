import {
  Link,
  useActionData,
  useLocation,
  useParams,
  useRouteLoaderData,
  useSearchParams,
  useSubmit,
  redirect,
} from "react-router";
import type { Route } from "./+types/devices.$id.$name.config";
import { ROUTES } from "~/utils/routes";
import { EditJson } from "~/components/EditJson.client";
import { ClientOnly } from "remix-utils/client-only";
import { useEffect, useState } from "react";
import { exportData } from "~/utils/exportData";
import { type loader } from "./devices.$id.$name";
import { handleFileUpload } from "~/utils/handleFileUpload";
import type { EvolverConfigWithoutDefaults } from "client";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import * as Evolver from "client/services.gen";
import { db } from "~/utils/db.server";
import { createEvolverClient } from "~/utils/evolverClient.client";
import { deviceInfo } from "~/cookies.server";
import { useFormErrorNotifications } from "~/utils/useFormErrorNotifications";

export const handle = {
  breadcrumb: ({ params }: { params: { id: string; name: string } }) => {
    const { id, name } = params;
    return <Link to={ROUTES.device.config({ id, name })}>config</Link>;
  },
};

// The action function is typically responsible for handling the form submission at the route.
// Since the action function can handle different form submissions, we use intent to determine the action to take.
// Branching on the intent field of the submitted form.
// In this case, the intent is to update the evolver config. Later there may be an intent to delete a config, or undo a change etc...
// Refs: https://sergiodxa.com/articles/multiple-forms-per-route-in-remix

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
});

const serverSchema = z.object({
  intent: z.literal(ServerIntentEnum.Enum.update_device_name),
  id: z.string(),
  name: z.string(),
});

// Server action handles database operations
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
        const device = await db.device.update({
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
  const { intent, id, data, name } = submission.value;

  try {
    // Get device URL from cookie
    const cookieHeader = request.headers.get("Cookie");
    const deviceData = await deviceInfo.parse(cookieHeader);

    if (!deviceData?.url) {
      return {
        ...submission.reply({
          formErrors: ["Device URL not found. Please refresh the page."],
        }),
        success: false,
      };
    }

    const evolverClient = createEvolverClient(deviceData.url);

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

export default function DeviceConfig() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { pathname } = useLocation();

  // This should be what comes back from the action at /devices/:id that the form was submitted to.
  const actionData = useActionData<typeof clientAction>();

  const submit = useSubmit();
  const mode = searchParams.get("mode") === "edit" ? "edit" : "view";

  const loaderData = useRouteLoaderData<typeof loader>(
    "routes/devices.$id.$name",
  );
  let description;

  if (loaderData?.description?.config) {
    description = loaderData.description;
  }

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
