import Form from "@rjsf/core";
import {
  BaseInputTemplateProps,
  FieldTemplateProps,
  getInputProps,
  getSubmitButtonOptions,
  RJSFSchema,
  SubmitButtonProps,
} from "@rjsf/utils";
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
    <div className="card-actions justify-end align-bottom">
      <button className="btn btn-primary" type="submit">
        {submitText || "Submit"}
      </button>
    </div>
  );
}

interface SchemaFormProps {
  schema: RJSFSchema;
  uiSchema?: object;
  formData?: object;
  onSubmit: (arg: object) => void;
  title?: string;
  submitText?: string;
}

export default function SchemaForm({
  schema,
  formData,
  onSubmit,
}: SchemaFormProps) {
  // replace the schema.name with a schema that
  // Replace schema title with description
  const schemaToUse = {
    ...schema,
    properties: {
      ...schema.properties,
      name: { type: "string", title: "Name" },
    },
  };
  const formComponent = (
    <Form
      className="flex flex-col gap-4"
      validator={validator}
      schema={schemaToUse}
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
  );

  return formComponent;
}
