import { z } from "zod";
import { type ActionFunctionArgs, redirect, json } from "@remix-run/node";
import { parseWithZod, getZodConstraint } from "@conform-to/zod";
import { pingDevice } from "~/utils/pingDevice.server";
import { db } from "~/utils/db.server";
import { Prisma } from "@prisma/client";
import { useForm, getFormProps, getInputProps } from "@conform-to/react";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";
import clsx from "clsx";
import { CloudIcon } from "@heroicons/react/24/outline";
import { generateDeviceId } from "~/utils/generateDeviceId.server";
import { toast as notify } from "react-toastify";
import { useEffect } from "react";

const IntentEnum = z.enum(["add_device", "delete_device"], {
  required_error: "intent is required",
  invalid_type_error: "must be one of, add_device or delete_device",
});

const schema = z.discriminatedUnion("intent", [
  z.object({
    intent: z.literal(IntentEnum.Enum.add_device),
    url: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.string().url(),
    ),
  }),
  z.object({
    intent: z.literal(IntentEnum.Enum.delete_device),
    id: z.string(),
  }),
]);

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });
  if (submission.status !== "success") {
    return submission.reply();
  }
  const { intent } = submission.value;

  let id = "";
  switch (intent) {
    case IntentEnum.Enum.add_device:
      try {
        const { url } = submission.value;
        const { online: isOnline } = await pingDevice(url as string);
        if (isOnline) {
          id = await generateDeviceId(url);
          await db.device.create({ data: { url, device_id: id } });
        } else {
          throw Error("no evolver detected at that address");
        }
      } catch (error) {
        const { url } = submission.value;
        const errorMessages = ["unable to add device"];
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            errorMessages.push(`device at ${url} already exists`);
          }
        } else if (error instanceof Error) {
          errorMessages.push(error.message);
        }
        return submission.reply({ formErrors: errorMessages });
      }

      return redirect(`/devices/${id}/state`);
    case IntentEnum.Enum.delete_device:
      try {
        const { id } = submission.value;
        await db.device.delete({ where: { device_id: id } });
        return redirect("/devices/list");
      } catch (error) {
        const errorMessages = ["unable to delete device"];
        return submission.reply({ formErrors: errorMessages });
      }
      return null;
    default:
      break;
  }
}

export const loader = async () => {
  const devices = await db.device.findMany();
  const deviceStatusPromises = devices.map(({ url }) => pingDevice(url));
  const resolved = await Promise.allSettled(deviceStatusPromises);
  const results = resolved.map((result, index) => {
    return {
      name: result.status === "fulfilled" && result.value.name,
      device_id: devices[index].device_id,
      url: devices[index].url,
      createdAt: devices[index].createdAt,
      status:
        result.status === "fulfilled" && result.value.online
          ? "online"
          : "offline",
    };
  });
  return json(results);
};

export default function DevicesList() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();

  const [form, fields] = useForm({
    lastResult: actionData,
    constraint: getZodConstraint(schema),
    // validate field once user leaves the field
    shouldValidate: "onInput",
    // revalidate field as user types again
    shouldRevalidate: "onInput",
    // run validation logic on the client
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  useEffect(() => {
    if (form?.errors) {
      notify.dismiss();
      form.errors.forEach((message) => {
        notify.error(message);
      });
    }
  }, [form.errors]);

  const removeDevice = (id: string) => {
    const formData = new FormData();
    formData.append("id", id);
    formData.append("intent", IntentEnum.Enum.delete_device);
    submit(formData, { method: "delete" });
  };

  const deviceTableItems = loaderData.map(
    ({ device_id, url, status, createdAt, name }, ix) => {
      return (
        <tr key={device_id}>
          <th>{ix + 1}</th>
          <td>{new Date(createdAt).toDateString()}</td>
          <td>{name}</td>
          <td>
            {status === "online" && (
              <Link to={`/devices/${device_id}/state`}>
                <div
                  className={clsx(status === "online" && "link link-primary")}
                >
                  {device_id}
                </div>
              </Link>
            )}
            {status === "offline" && (
              <div className={clsx("")}>{device_id}</div>
            )}
          </td>

          <td>
            {status === "online" && <div>{url}</div>}
            {status === "offline" && (
              <div className={clsx("")}>{device_id}</div>
            )}
          </td>
          <td>
            <div
              className={clsx(
                "badge",
                status === "online" && "badge-accent",
                status === "offline" && "badge-ghost badge-outline",
              )}
            >
              {status}
            </div>
          </td>
          <td>
            <button onClick={() => removeDevice(device_id)}>forget</button>
          </td>
        </tr>
      );
    },
  );

  return (
    <>
      <div className="mt-4 mb-4 flex flex-wrap justify-between gap-4">
        <h1 className="flex-none text-2xl">Devices</h1>
        <Form
          method="POST"
          action="/devices/list"
          className="flex flex-none w-100 space-x-4 items-baseline"
          {...getFormProps(form)}
        >
          <input
            name={"intent"}
            defaultValue={IntentEnum.Enum.add_device}
            className="hidden"
          ></input>
          <div className="join">
            <div className="flex flex-col">
              <input
                placeholder="url address"
                {...getInputProps(fields.url, { type: "text" })}
                className={clsx(
                  "input input-bordered  max-w-xs join-item",
                  fields.url.errors && "input-error",
                )}
              />
              <div className="text-error">
                {fields.url.errors && (
                  <div>
                    {fields.url.errors.map((message) =>
                      message.toLocaleLowerCase(),
                    )}
                  </div>
                )}
              </div>
            </div>
            <button type="submit" className="btn btn-primary join-item ">
              Add
            </button>
          </div>
        </Form>
      </div>
      <div className="bg-base-300 rounded-box p-8">
        {deviceTableItems.length === 0 && (
          <div className="flex flex-col justify-center items-center gap-4">
            <CloudIcon className="w-16 h-16 text-gray-500" />
            <div>
              Enter the url where an instance of the{" "}
              <a
                href="https://github.com/ssec-jhu/evolver-ng"
                className="link link-primary"
                target="_blank"
                rel="noreferrer"
              >
                evolver-ng service
              </a>{" "}
              is running to get started.
            </div>
          </div>
        )}
        {deviceTableItems.length > 0 && (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th></th>
                  <th>added</th>
                  <th>name</th>
                  <th>id</th>
                  <th>url</th>
                  <th>status</th>
                  <th>forget</th>
                </tr>
              </thead>
              <tbody>{deviceTableItems}</tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
