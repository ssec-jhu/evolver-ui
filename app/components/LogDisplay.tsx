export interface LogLine {
  [key: string]: number | string | { level: "EVENT"; message: string } | null;
  timestamp: number;
  kind: "event";
  vial: number | null;
  data: { level: "EVENT"; message: string };
}

export default function LogDisplay({
  logs,
  title,
}: {
  logs: LogLine[];
  title: string;
}) {
  const lines = logs.map((log, ix) => {
    const {
      timestamp,
      kind,
      vial,
      data: { level, message },
    } = log;
    const formattedTime = new Date(timestamp).toLocaleTimeString();
    return (
      <tr key={timestamp + message}>
        <th>{ix}</th>
        <td>{formattedTime}</td>
        <td>{kind}</td>
        <td>{vial}</td>
        <td>{level}</td>
        <td>{message}</td>
      </tr>
    );
  });
  return (
    <div>
      <div className="divider"></div>
      <div className="font-mono">title: {title}</div>
      <div className="divider"></div>
      <div className="flex h-screen w-auto">
        <div className="overflow-y-auto flex-1">
          <table className="table table-xs table-zebra table-pin-rows table-pin-cols border-base-300">
            <thead>
              <tr>
                <th></th>
                <th>timestamp</th>
                <th>kind</th>
                <th>vial</th>
                <th>level</th>
                <th>message</th>
              </tr>
            </thead>
            <tbody>{lines}</tbody>
            <tfoot>
              <tr>
                <th></th>
                <th>timestamp</th>
                <th>kind</th>
                <th>vial</th>
                <th>level</th>
                <th>message</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
