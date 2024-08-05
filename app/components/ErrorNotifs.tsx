import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

export function ErrorNotifs(messages: string[]) {
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  useEffect(() => {
    setErrorMessages(messages);
  }, [messages]);

  const dismissAlert = (msg: string) => {
    const filteredErrorMessages = errorMessages.filter((errorMessage) => {
      return errorMessage !== msg;
    });

    setErrorMessages(filteredErrorMessages);
  };

  const errorAlerts = errorMessages.map((errorMessage) => {
    return (
      <div key={errorMessage} role="alert" className="alert alert-error mb-4 ">
        <ExclamationCircleIcon className="h-6 w-6 shrink-0 stroke-current" />
        <div>{errorMessage}</div>
        <div>
          <button className="link" onClick={() => dismissAlert(errorMessage)}>
            dismiss
          </button>
        </div>
      </div>
    );
  });
  return (
    <div className="absolute z-50 flex flex-col items-center">
      {errorAlerts}
    </div>
  );
}
