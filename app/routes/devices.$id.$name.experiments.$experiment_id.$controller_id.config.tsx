import {
  Link,
  useActionData,
  useLoaderData,
  useParams,
} from "@remix-run/react";
import { EvolverConfigWithoutDefaults } from "client";
import { WrenchScrewdriverIcon } from "@heroicons/react/24/solid";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { db } from "~/utils/db.server";
import { z } from "zod";
import { parseWithZod } from "@conform-to/zod";
import { toast as notify } from "react-toastify";
import * as Evolver from "client/services.gen";
import { useEffect } from "react";

import { createClient } from "@hey-api/client-fetch";
import { ControllerConfig } from "~/components/ControllerConfig";

export const handle = {
  breadcrumb: ({
    params,
  }: {
    params: {
      id: string;
      experiment_id: string;
      name: string;
      controller_id: string;
    };
  }) => {
    const { id, experiment_id, name, controller_id } = params;
    return (
      <Link
        to={`/devices/${id}/${name}/experiments/${experiment_id}/${controller_id}/config`}
      >
        {controller_id}
      </Link>
    );
  },
};

export function ErrorBoundary() {
  const { id, experiment_id, name } = useParams();
  return (
    <div className="flex flex-col gap-4 bg-base-300 p-4 rounded-box">
      <WrenchScrewdriverIcon className="w-10 h-10" />
      <div>
        <div>
          <h1 className="font-mono">{`Error loading experiment ${experiment_id}. Check config experiments attribute.`}</h1>
        </div>
      </div>

      <Link to={`/devices/${id}/${name}/config`} className="link">
        config
      </Link>
    </div>
  );
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { id, experiment_id, controller_id } = params;
  const targetDevice = await db.device.findUnique({ where: { device_id: id } });

  const { url } = targetDevice;
  const evolverClient = createClient({
    baseUrl: url,
  });

  const results = Promise.allSettled([
    Evolver.getExperimentsExperimentGet({
      client: evolverClient,
    }),
  ]).then((results) => {
    return results.map((result) => result.value.data);
  });

  const [experiments] = await results;

  const classinfo = experiments[experiment_id].controllers.find(
    (controller) => controller.config.name == controller_id,
  )?.classinfo;

  const controllerClassinfoSchema = await Evolver.schema({
    query: {
      classinfo: classinfo,
    },
  });

  return {
    experiments,
    classinfoSchema: controllerClassinfoSchema.data,
  };
}

const Intent = z.enum(["update_controller"], {
  required_error: "an intent is required",
  invalid_type_error: "must be one of: update_controller",
});

const schema = z.discriminatedUnion("intent", [
  z.object({
    intent: z.literal(Intent.Enum.update_controller),
    id: z.string(),
    experiment_id: z.string(),
    controller_id: z.string(),
    controller_config: z.string(),
  }),
]);

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  // preliminary validation
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { intent, id } = submission.value;

  // Get the device URL from the database
  const targetDevice = await db.device.findUnique({ where: { device_id: id } });

  if (!targetDevice) {
    return submission.reply({ formErrors: ["Device not found"] });
  }

  const { url, name } = targetDevice;
  const evolverClient = createClient({
    baseUrl: url,
  });

  switch (intent) {
    case Intent.Enum.update_controller: {
      const { controller_config, experiment_id, controller_id } =
        submission.value;

      // Get the current full configuration
      const { data: describeData, error: describeError } =
        await Evolver.describe({
          client: evolverClient,
        });

      if (describeError) {
        return submission.reply({
          formErrors: ["Failed to retrieve device configuration"],
        });
      }

      // Extract the configuration from the describe data
      const deviceConfig = describeData.config as EvolverConfigWithoutDefaults;

      // Create a deep copy of the device configuration
      const configToUpdate = JSON.parse(JSON.stringify(deviceConfig));

      // Make sure we have the experiments object
      if (!configToUpdate.experiments) {
        return submission.reply({
          formErrors: ["Invalid configuration: missing experiments object"],
        });
      }

      // Make sure the specified experiment exists
      const experiment = configToUpdate.experiments[experiment_id];
      if (!experiment) {
        return submission.reply({
          formErrors: [
            `Experiment '${experiment_id}' not found in configuration`,
          ],
        });
      }
      // Make sure the experiment has a controllers array
      if (!Array.isArray(experiment.controllers)) {
        return submission.reply({
          formErrors: [
            `Experiment '${experiment_id}' does not have a controllers array`,
          ],
        });
      }

      // Find the specific controller by its name in the controllers array
      const controllerIndex = experiment.controllers.findIndex(
        (controller) =>
          controller.config && controller.config.name === controller_id,
      );

      if (controllerIndex === -1) {
        return submission.reply({
          formErrors: [
            `Controller '${controller_id}' not found in experiment '${experiment_id}'`,
          ],
        });
      }

      // Parse the new controller config
      let parsedControllerConfig;
      try {
        parsedControllerConfig = JSON.parse(controller_config);
      } catch (error) {
        return submission.reply({
          formErrors: ["Invalid controller configuration JSON"],
        });
      }

      // Update just the controller's config, preserving other properties
      configToUpdate.experiments[experiment_id].controllers[
        controllerIndex
      ].config = parsedControllerConfig;

      // Send the updated config to the device
      try {
        const { response, error } = await Evolver.update({
          body: configToUpdate,
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
          return submission.reply({
            formErrors: [
              `Got an unexpected response: ${response.status}. ${JSON.stringify(response)}`,
            ],
          });
        }

        // Get the new controller name from the updated config
        const newControllerName = parsedControllerConfig.name || controller_id;

        return redirect(
          `/devices/${id}/${name}/experiments/${experiment_id}/${newControllerName}/config#${newControllerName}config`,
        );
      } catch (error) {
        return submission.reply({
          formErrors: [
            "Unable to update controller configuration",
            "Error: " + JSON.stringify(error),
          ],
        });
      }

      break;
    }
    default:
      break;
  }

  return submission.reply({
    formErrors: [
      "Could not find the specified controller in the configuration",
    ],
  });
}

export default function Controllers() {
  const actionData = useActionData<typeof action>();
  const { experiment_id, controller_id } = useParams();
  const { experiments } = useLoaderData<typeof loader>();

  useEffect(() => {
    if (actionData?.formErrors?.length) {
      actionData.formErrors.forEach((error) => {
        notify.error(error);
      });
    }

    if (actionData?.fieldErrors) {
      Object.entries(actionData.fieldErrors).forEach(([field, errors]) => {
        if (Array.isArray(errors)) {
          errors.forEach((error) => {
            notify.error(`${field}: ${error}`);
          });
        }
      });
    }
  }, [actionData]);

  return (
    <div className="flex flex-col gap-4">
      <div className="font-mono">{`${experiment_id} > ${controller_id}`}</div>
      <div className="bg-base-300 rounded-box relative overflow-x-auto">
        {Object.entries(experiments)
          .filter(([experimentId]) => experimentId == experiment_id)
          .map(([experimentId, experimentData]) => (
            <div key={experimentId}>
              {experimentData.controllers &&
                experimentData.controllers
                  .filter(
                    (controller) => controller.config.name == controller_id,
                  )
                  .map((controller, idx) => (
                    <div key={`${experimentId}-controller-${idx}`}>
                      <ControllerConfig
                        controller={controller}
                        actionData={actionData}
                      />
                    </div>
                  ))}
            </div>
          ))}
      </div>
    </div>
  );
}
