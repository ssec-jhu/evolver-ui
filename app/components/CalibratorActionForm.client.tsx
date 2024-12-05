import Form from "@rjsf/core";
import {
  BaseInputTemplateProps,
  ErrorListProps,
  getInputProps,
  getSubmitButtonOptions,
  RJSFSchema,
  RJSFValidationError,
  SubmitButtonProps,
  TitleFieldProps,
} from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { ChangeEvent, FocusEvent } from "react";

// RJSF template to swallow form error list
function ErrorListTemplate() {
  return;
}

function BaseInputTemplate(props: BaseInputTemplateProps) {
  const {
    schema,
    id,
    options,
    label,
    value,
    type,
    placeholder,
    disabled,
    readonly,
    autofocus,
    onChange,
    onChangeOverride,
    onBlur,
    onFocus,
    rawErrors,
    hideError,
    ...rest
  } = props;
  const onTextChange = ({
    target: { value: val },
  }: ChangeEvent<HTMLInputElement>) => {
    // Use the options.emptyValue if it is specified and newVal is also an empty string
    onChange(val === "" ? options.emptyValue || "" : val);
  };
  const onTextBlur = ({
    target: { value: val },
  }: FocusEvent<HTMLInputElement>) => onBlur(id, val);
  const onTextFocus = ({
    target: { value: val },
  }: FocusEvent<HTMLInputElement>) => onFocus(id, val);

  const inputProps = { ...rest, ...getInputProps(schema, type, options) };
  const hasError = rawErrors?.length && rawErrors.length > 0 && !hideError;

  return (
    <input
      className="input input-bordered max-w-xs"
      id={id}
      label={label}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readonly}
      autoFocus={autofocus}
      error={hasError}
      errors={hasError ? rawErrors : undefined}
      onChange={onChangeOverride || onTextChange}
      onBlur={onTextBlur}
      onFocus={onTextFocus}
      {...inputProps}
    />
  );
}

function TitleFieldTemplate(props: TitleFieldProps & {}) {
  const { title, schema } = props;
  const { action_index } = schema;
  return (
    <div className="flex flex-col gap-4">
      <div className="card-title">{action_index + 1}.</div>
      <p>{title}</p>
    </div>
  );
}

function CurriedCustomSubmitButton(buttonCopy: string) {
  return function CustomSubmitButton(props: SubmitButtonProps) {
    const { uiSchema } = props;
    const { norender } = getSubmitButtonOptions(uiSchema);
    if (norender) {
      return null;
    }

    return (
      <div className="card-actions justify-end">
        <button className={`btn btn-primary`} type="submit">
          {buttonCopy}
        </button>
      </div>
    );
  };
}

export default function CalibratorActionForm({
  action,
  index,
}: {
  action: { form_model: { properties: object } | RJSFSchema };
  index: number;
}) {
  // replace the schema title which is a generic "FormModel" with a more specific title
  const schemaToUse = {
    ...action.form_model,
    title: action.description,
    action_index: index,
  };
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <Form
          validator={validator}
          schema={schemaToUse}
          templates={{
            ButtonTemplates: {
              SubmitButton: CurriedCustomSubmitButton("Done"),
            },
            TitleFieldTemplate,
            BaseInputTemplate,
            ErrorListTemplate,
          }}
        />
      </div>
    </div>
  );
}
