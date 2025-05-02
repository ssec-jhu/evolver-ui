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
    <div className="flex flex-col gap-4 flex-1">
      {props.title && (
        <div className="flex flex-col gap-4">
          <div className="card-title">{props.title}</div>
          {props.description && <p>{props.description}</p>}
        </div>
      )}
      {props.properties.map((element, index) => (
        <div key={index} className="property-wrapper">
          {element.content}
        </div>
      ))}
    </div>
  );
}

function CustomFieldTemplate(props: FieldTemplateProps) {
  const { classNames, style, help, description, errors, children } = props;
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
    value,
    type,
    placeholder,
    disabled,
    readonly,
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
  cardLayout?: boolean;
}

export default function SchemaForm({
  schema,
  uiSchema = {},
  formData,
  onSubmit,
  title,
  submitText,
  cardLayout = true,
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
      className="flex flex-col gap-4 flex-1 justify-between"
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

  if (cardLayout) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body flex-1">{formComponent}</div>
      </div>
    );
  }

  return formComponent;
}
