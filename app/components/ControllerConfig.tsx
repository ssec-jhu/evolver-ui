import {
  WrenchIcon,
  AdjustmentsVerticalIcon,
} from "@heroicons/react/24/outline";

type ControllerConfigProps = {
  controller: {
    classinfo: string;
    config: Record<string, any>;
  };
};

export function ControllerConfig({ controller }: ControllerConfigProps) {
  const controllerName =
    controller.config.name ||
    controller.classinfo.split(".").pop() ||
    "Controller";

  const controllerClass = controller.classinfo;

  return (
    <div>
      <div>FOO</div>
      <span className="status"></span>
      <ul className="list bg-base-100 rounded-box shadow-md">
        <li className="p-4 pb-2 text-xs opacity-60 tracking-wide flex items-center gap-2">
          {controllerName}
        </li>

        {Object.entries(controller.config).map(([key, value]) => (
          <li key={key} className="list-row">
            <div>
              <AdjustmentsVerticalIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="font-medium">{key}</div>
              <div className="text-xs font-mono opacity-70">
                {typeof value === "object"
                  ? JSON.stringify(value)
                  : String(value)}
              </div>
            </div>
            <div>
              <WrenchIcon className="h-5 w-5" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
