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
  return (
    <div className="card bg-base-100  shadow-xl">
      <ul className="list card-body">
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
