import { z } from "zod";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { createClient } from "@hey-api/client-fetch";
import * as Evolver from "client/services.gen";
import {
  Link,
  useActionData,
  useLoaderData,
  useLocation,
  useParams,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import clsx from "clsx";
import { EditJson } from "~/components/EditJson.client";
import { ClientOnly } from "remix-utils/client-only";
import React, { useEffect, useState } from "react";
import { parseWithZod } from "@conform-to/zod";
import { EvolverConfigWithoutDefaults } from "client";
import { SomeJSONSchema } from "ajv/dist/types/json-schema";
import { exportData } from "~/utils/exportData";
import Ajv from "ajv";
import { ErrorNotifs } from "~/components/ErrorNotifs";

const IntentEnum = z.enum(["update_evolver"], {
  required_error: "an intent is required",
  invalid_type_error: "must be one of, update_device",
});

const schema = z.object({
  intent: IntentEnum,
  // The preprocess step is required for zod to perform the required check properly
  // as the value of an empty input is usually an empty string
  ip_addr: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string({ required_error: "an ip address is required" }),
  ),
  // Assume this is valid, client side AJV validation.
  data: z.string({ required_error: "an evolver config is required" }),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema: schema });
  if (submission.status !== "success") {
    return submission.reply();
  }
  const { intent, ip_addr, data } = submission.value;

  const evolverClient = createClient({
    baseUrl: `http://${ip_addr}:${process.env.DEFAULT_DEVICE_PORT}`,
  });

  switch (intent) {
    case IntentEnum.Enum.update_evolver:
      try {
        const { response } = await Evolver.update({
          body: JSON.parse(data),
          client: evolverClient,
        });
        console.log("response", response);
        if (response.status !== 200) {
          throw new Error();
        }
        return redirect(`/device/${ip_addr}`);
      } catch (error) {
        return json({ error: "unable to update device" }, { status: 500 });
      }
    default:
      return null;
  }
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { ip_addr } = params;

  const evolverClient = createClient({
    baseUrl: `http://${ip_addr}:${process.env.DEFAULT_DEVICE_PORT}`,
  });

  try {
    const describeEvolver = await Evolver.describe({ client: evolverClient });
    const rootClassSchema = await Evolver.getSchemaSchemaGet({
      query: { classinfo: "evolver.device.Evolver" },
      client: evolverClient,
    });
    return json({
      description: describeEvolver.data as {
        config: EvolverConfigWithoutDefaults;
      },
      schema: rootClassSchema.data,
      ok: true,
    });
  } catch (error) {
    throw new Error("unable to load device config");
  }
}

export function ErrorBoundary() {
  const { ip_addr } = useParams();

  return (
    <div className="mx-auto max-w-6xl px-4 ">
      <div className="mt-4 flex items-center gap-4 mb-8 justify-between">
        <div className="flex items-center gap-4">
          <div>
            <div>
              <h1 className="font-mono">{`${ip_addr}`}</h1>
            </div>
          </div>
          <div className={clsx("badge text-sm", "badge-ghost badge-outline")}>
            offline
          </div>
        </div>
      </div>
      <Link to="/devices" className="link">
        other devices
      </Link>
    </div>
  );
}

export default function DeviceConfig() {
  const { ip_addr } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { pathname } = useLocation();
  const submit = useSubmit();
  const mode = searchParams.get("mode") === "edit" ? "edit" : "view";
  const { description, schema } = useLoaderData<typeof loader>();
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  if (!configSchema) {
    throw new Error("unable to get device schema");
  }

  const [updatedEvolverConfig, setEvolverConfig] =
    useState<typeof evolverConfig>(evolverConfig);

  useEffect(() => {
    setEvolverConfig(updatedEvolverConfig);
  }, [updatedEvolverConfig]);

  return (
    <div className="mx-auto max-w-6xl px-4 ">
      <div className="mt-4 flex items-center gap-4 mb-8 justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl">{`${evolverConfig.name}`}</h1>
            <div>
              <h1 className="font-mono">{`${ip_addr}`}</h1>
            </div>
          </div>
          <div className={clsx("badge text-sm", "badge-accent")}>online</div>
        </div>
        <ErrorNotifs messages={errorMessages} />
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
              onChange={handleFileUpload}
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
                formData.append("intent", IntentEnum.Enum.update_evolver);
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
