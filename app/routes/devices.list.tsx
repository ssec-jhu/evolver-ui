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
import { BeakerIcon } from "@heroicons/react/16/solid";

const IntentEnum = z.enum(["add_device", "delete_device"], {
  required_error: "intent is required",
  invalid_type_error: "must be one of, add_device or delete_device",
});

const schema = z.object({
  intent: IntentEnum,
  // The preprocess step is required for zod to perform the required check properly
  // as the value of an empty input is usually an empty string
  ip_addr: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z
      .string({ required_error: "ip address is required" })
      .ip("ip address is invalid"),
  ),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });
  if (submission.status !== "success") {
    return submission.reply();
  }
  const { intent, ip_addr } = submission.value;

  switch (intent) {
    case IntentEnum.Enum.add_device:
      try {
        const { online: isOnline } = await pingDevice(ip_addr as string);
        if (isOnline) {
          await db.device.create({ data: { ip_addr } });
        } else {
          throw Error("no evolver detected at that ip");
        }
      } catch (error) {
        const errorMessages = ["unable to add device"];
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            errorMessages.push(`${ip_addr} already exists`);
          }
        } else if (error instanceof Error) {
          errorMessages.push(error.message);
        }
        return submission.reply({ formErrors: errorMessages });
      }
      return redirect(`/devices/${ip_addr}`);
    case IntentEnum.Enum.delete_device:
      try {
        await db.device.delete({ where: { ip_addr } });
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
  const deviceStatusPromises = devices.map(({ ip_addr }) =>
    pingDevice(ip_addr),
  );
  const resolved = await Promise.allSettled(deviceStatusPromises);
  const results = resolved.map((result, index) => {
    return {
      name: result.status === "fulfilled" ? result.value.name : "unknown",
      ip_addr: devices[index].ip_addr,
      createdAt: devices[index].createdAt,
      status:
        result.status === "fulfilled" && result.value ? "online" : "offline",
    };
  });
  return json(results);
};

export default function Devices() {
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

  const removeDevice = (ip_addr: string) => {
    const formData = new FormData();
    formData.append("ip_addr", ip_addr);
    formData.append("intent", IntentEnum.Enum.delete_device);
    submit(formData, { method: "delete" });
  };

  const deviceTableItems = loaderData.map(
    ({ ip_addr, status, createdAt, name }, ix) => {
      return (
        <tr key={ip_addr}>
          <th>{ix + 1}</th>
          <td>{new Date(createdAt).toDateString()}</td>
          <td>{name}</td>
          <td>
            {status === "online" && (
              <Link to={`/devices/${ip_addr}/config`}>
                <div
                  className={clsx(status === "online" && "link link-primary")}
                >
                  {ip_addr}
                </div>
              </Link>
            )}
            {status === "offline" && <div className={clsx("")}>{ip_addr}</div>}
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
            <button
              onClick={() => removeDevice(ip_addr)}
              className={clsx(
                ip_addr !== "127.0.0.1" && "link",
                ip_addr === "127.0.0.1" && "hidden",
              )}
            >
              forget
            </button>
          </td>
        </tr>
      );
    },
  );

  return (
    <>
      <div className="mt-4 flex flex-wrap justify-between gap-4 min-h-28">
        <h1 className="flex-none text-2xl">Devices</h1>
        <Form
          method="POST"
          action="/devices"
          className="flex flex-none w-100 space-x-4 items-baseline"
          {...getFormProps(form)}
        >
          <input
            name={"intent"}
            defaultValue={IntentEnum.Enum.add_device}
            className="hidden"
          ></input>
          <div className="join">
            <div className="flex flex-col space-y-1">
              <input
                {...getInputProps(fields.ip_addr, { type: "text" })}
                className={clsx(
                  "join-item input input-bordered  max-w-xs",
                  fields.ip_addr.errors && "input-error",
                )}
              />
              {fields.ip_addr.errors &&
                fields.ip_addr.errors.map(
                  (message) =>
                    message && (
                      <div
                        key={message}
                        className="text-error text-wrap max-w-xs"
                        id={fields.ip_addr.errorId}
                        role="alert"
                      >
                        {message.toLocaleLowerCase()}
                      </div>
                    ),
                )}
              {form.errors &&
                form.errors.map(
                  (message) =>
                    message && (
                      <div
                        key={message}
                        className="text-error text-wrap max-w-xs"
                        id={form.errorId}
                        role="alert"
                      >
                        {message.toLocaleLowerCase()}
                      </div>
                    ),
                )}
            </div>
            <button
              type="submit"
              className="btn btn-primary join-item rounded-r-md pr-6 pl-6"
            >
              Add
            </button>
          </div>
        </Form>
      </div>
      {deviceTableItems.length === 0 && (
        <div className="flex flex-col justify-center items-center">
          <BeakerIcon className="max-h-20 max-w-2010" />
          <div>Enter an ip address to get started...</div>
        </div>
      )}
      {deviceTableItems.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th></th>
                <th>Added</th>
                <th>Name</th>
                <th>Address</th>
                <th>Status</th>
                <th>Forget</th>
              </tr>
            </thead>
            <tbody>{deviceTableItems}</tbody>
          </table>
        </div>
      )}
    </>
  );
}
