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

// RJSF template to swallow form error list
function ErrorListTemplate() {
  return;
}
function ObjectFieldTemplate(props: ObjectFieldTemplateProps) {
  const { action_index } = props.schema;
  return (
    <div className="flex flex-col gap-4 flex-1">
      <div className="flex flex-col gap-4">
        <div className="card-title">{action_index + 1}.</div>
        <p>{props.title}</p>
      </div>
      {props.properties.map((element) => {
        return <div className="property-wrapper">{element.content}</div>;
      })}
    </div>
  );
}

function CustomFieldTemplate(props: FieldTemplateProps) {
  const {
    classNames,
    style,
    help,
    description,
    errors,
    children,
    label,
    required,
    id,
  } = props;
  return (
    <div className={`${classNames} flex flex-col gap-2`} style={style}>
      {children}
      {description}
      {errors}
      {help}
    </div>
  );
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
    required,
    disabled,
    readonly,
    autofocus,
    onChange,
    onChangeOverride,
    onBlur,
    onFocus,
    rawErrors,
    hideError,
    uiSchema,
    registry,
    formContext,
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
  const hasError = rawErrors && rawErrors.length > 0 && !hideError;

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

function CurriedCustomSubmitButton(buttonCopy: string) {
  return function CustomSubmitButton(props: SubmitButtonProps) {
    const { uiSchema } = props;
    const { norender } = getSubmitButtonOptions(uiSchema);
    if (norender) {
      return null;
    }

    return (
      <div className="card-actions justify-end align-bottom">
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
      <div className="card-body flex-1">
        <Form
          className="flex flex-col gap-4 flex-1 justify-between"
          validator={validator}
          schema={schemaToUse}
          templates={{
            ButtonTemplates: {
              SubmitButton: CurriedCustomSubmitButton("Done"),
            },
            BaseInputTemplate,
            ErrorListTemplate,
            ObjectFieldTemplate,
            FieldTemplate: CustomFieldTemplate,
          }}
        />
      </div>
    </div>
  );
}
