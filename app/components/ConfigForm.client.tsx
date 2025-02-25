import Form from "@rjsf/core";
import {
  BaseInputTemplateProps,
  FieldTemplateProps,
  getInputProps,
  getSubmitButtonOptions,
  ObjectFieldTemplateProps,
  RJSFSchema,
  SubmitButtonProps,
} from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { ChangeEvent, FocusEvent } from "react";

export default function CalibratorActionForm({
  schema,
}: {
  schema: RJSFSchema;
}) {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body flex-1">
        <Form
          className="flex flex-col gap-4 flex-1 justify-between"
          validator={validator}
          schema={schemaToUse}
          uiSchema={uiSchema}
          onSubmit={({ formData }) => {
            dispatchAction(formData);
          }}
          templates={{
            ButtonTemplates: {
              SubmitButton: CustomSubmitButton,
            },
            BaseInputTemplate,
            ObjectFieldTemplate,
            FieldTemplate: CustomFieldTemplate,
          }}
        />
      </div>
    </div>
  );
}
