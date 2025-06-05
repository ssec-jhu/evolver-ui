import { useEffect } from "react";
import { toast as notify } from "react-toastify";

type ActionData = {
  success?: boolean;
  error?: string | Record<string, any>;
  formErrors?: string[];
  fieldErrors?: Record<string, string[]>;
};

/**
 * Custom hook to handle form error notifications from action data
 * @param actionData - The data returned from a React Router action
 */
export function useFormErrorNotifications(actionData: ActionData | undefined) {
  useEffect(() => {
    if (actionData && !actionData.success) {
      // Handle general errors
      if (actionData.error) {
        if (typeof actionData.error === "string") {
          notify.error(actionData.error);
        } else if (typeof actionData.error === "object") {
          const errorMessages: string[] = [];
          Object.entries(actionData.error).forEach(([key, value]) => {
            errorMessages.push(`${key ? key + ": " : ""} ${value}`);
          });
          errorMessages.forEach((message) => {
            notify.error(message);
          });
        }
      }

      // Handle form-level errors
      if (actionData.formErrors) {
        actionData.formErrors.forEach((error) => {
          notify.error(error);
        });
      }

      // Handle field-level errors
      if (actionData.fieldErrors) {
        Object.entries(actionData.fieldErrors).forEach(([field, errors]) => {
          errors.forEach((error) => {
            notify.error(`${field}: ${error}`);
          });
        });
      }
    }
  }, [actionData]);
}
