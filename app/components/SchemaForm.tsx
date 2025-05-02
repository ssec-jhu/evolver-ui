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

// Custom templates for form styling
function ObjectFieldTemplate(props: ObjectFieldTemplateProps) {
  return (
    <div>
      {props.title && (
        <div className="">
          <div className="card-title">{props.title}</div>
          {props.description && <p>{props.description}</p>}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {props.properties.map((element, index) => (
          <div key={index} className="property-wrapper">
            {element.content}
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomFieldTemplate(props: FieldTemplateProps) {
  const { classNames, style, help, description, errors, children, label } =
    props;
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
    description,
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
  const { submitText, norender, ...submitButtonOptions } =
    getSubmitButtonOptions(uiSchema);

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
  formData?: any;
  onSubmit: (data: any) => void;
  title?: string;
  submitText?: string;
}

export default function SchemaForm({
  schema,
  uiSchema = {},
  formData,
  onSubmit,
  title,
  submitText,
}: SchemaFormProps) {
  // Merge custom UI schema with provided one
  const mergedUiSchema = {
    ...uiSchema,
    "ui:submitButtonOptions": {
      ...((uiSchema as any)?.["ui:submitButtonOptions"] || {}),
      submitText,
    },
  };

  // Add title to schema if provided and not already present
  const mergedSchema = {
    ...schema,
    title: schema.title || title,
  };

  const formComponent = (
    <Form
      className="bg-base-200 border-base-300 rounded-box w-xs border p-4 "
      validator={validator}
      schema={mergedSchema}
      uiSchema={mergedUiSchema}
      formData={formData}
      onSubmit={({ formData }) => onSubmit(formData)}
      templates={{
        ButtonTemplates: {
          SubmitButton: CustomSubmitButton,
        },
        BaseInputTemplate,
        ObjectFieldTemplate,
        FieldTemplate: CustomFieldTemplate,
      }}
    />
  );

  return formComponent;
}
