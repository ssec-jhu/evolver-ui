import Form from "@rjsf/core";
import pkg from "@rjsf/utils";
const {
  getInputProps,
  getSubmitButtonOptions,
} = pkg;

type BaseInputTemplateProps = pkg.BaseInputTemplateProps;
type FieldTemplateProps = pkg.FieldTemplateProps;
type RJSFSchema = pkg.RJSFSchema;
type SubmitButtonProps = pkg.SubmitButtonProps;
import ObjectFieldTemplate from "./daisyui/ObjectFieldTemplate";
import validator from "@rjsf/validator-ajv8";
import { ChangeEvent, FocusEvent } from "react";

function CustomFieldTemplate(props: FieldTemplateProps) {
  const { classNames, style, help, errors, children } = props;
  return (
    <div className={`${classNames}`} style={style}>
      {children}
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
    value,
    type,
    placeholder,
    disabled,
    readonly,
    label,
    onChange,
    onChangeOverride,
    onBlur,
    onFocus,
    ...rest
  } = props;

  const onTextChange = ({
    target: { value: val },
  }: ChangeEvent<HTMLInputElement>) => {
    onChange(val === "" ? options.emptyValue || "" : val);
  };

  const onTextBlur = ({
    target: { value: val },
  }: FocusEvent<HTMLInputElement>) => onBlur(id, val);

  const onTextFocus = ({
    target: { value: val },
  }: FocusEvent<HTMLInputElement>) => onFocus(id, val);

  const inputProps = { ...rest, ...getInputProps(schema, type, options) };

  return (
    <fieldset className="fieldset ">
      <legend className="fieldset-legend">{label}</legend>
      <input
        className="input input-bordered max-w-xs"
        id={id}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readonly}
        onChange={onChangeOverride || onTextChange}
        onBlur={onTextBlur}
        onFocus={onTextFocus}
        {...inputProps}
      />
      <p className="label">{schema.description}</p>
    </fieldset>
  );
}

function CustomSubmitButton(props: SubmitButtonProps) {
  const { uiSchema } = props;
  const { submitText, norender } = getSubmitButtonOptions(uiSchema);

  if (norender) {
    return null;
  }

  return (
    <div className="card-actions justify-end">
      <button className="btn btn-primary" type="submit">
        {submitText || "save"}
      </button>
    </div>
  );
}

interface SchemaFormProps {
  schema: RJSFSchema;
  formData?: object;
  onSubmit: (arg: object) => void;
}

export default function SchemaForm({
  schema,
  formData,
  onSubmit,
}: SchemaFormProps) {
  return (
    <div className="card bg-base-100 shadow-sm">
      <Form
        className="card-body"
        validator={validator}
        schema={schema}
        formData={formData}
        onSubmit={({ formData }) => onSubmit(formData)}
        templates={{
          ButtonTemplates: {
            SubmitButton: CustomSubmitButton,
          },
          ObjectFieldTemplate,
          BaseInputTemplate,
          FieldTemplate: CustomFieldTemplate,
        }}
      />
    </div>
  );
}
