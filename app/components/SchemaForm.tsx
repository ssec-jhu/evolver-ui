import Form from "@rjsf/core";
import * as pkg from "@rjsf/utils";
const {
  getInputProps,
  getSubmitButtonOptions,
  canExpand,
  descriptionId,
  getTemplate,
  getUiOptions,
  titleId,
  buttonId,
} = pkg;

type BaseInputTemplateProps = pkg.BaseInputTemplateProps;
type FieldTemplateProps = pkg.FieldTemplateProps;
type RJSFSchema = pkg.RJSFSchema;
type SubmitButtonProps = pkg.SubmitButtonProps;
type ObjectFieldTemplateProps = pkg.ObjectFieldTemplateProps;
type FormContextType = pkg.FormContextType;
type StrictRJSFSchema = pkg.StrictRJSFSchema;

import validator from "@rjsf/validator-ajv8";
import { ChangeEvent, FocusEvent } from "react";

function ObjectFieldTemplate<
  T = unknown,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = Record<string, unknown>,
>(props: ObjectFieldTemplateProps<T, S, F>) {
  const {
    description,
    title,
    properties,
    required,
    disabled,
    readonly,
    uiSchema,
    idSchema,
    schema,
    formData,
    onAddClick,
    registry,
  } = props;
  const uiOptions = getUiOptions<T, S, F>(uiSchema);
  const TitleFieldTemplate = getTemplate<"TitleFieldTemplate", T, S, F>(
    "TitleFieldTemplate",
    registry,
    uiOptions,
  );
  const DescriptionFieldTemplate = getTemplate<
    "DescriptionFieldTemplate",
    T,
    S,
    F
  >("DescriptionFieldTemplate", registry, uiOptions);
  // Button templates are not overridden in the uiSchema
  const {
    ButtonTemplates: { AddButton },
  } = registry.templates;

  // Check if this is the root object
  const isRoot = idSchema.$id === "root";

  return (
    <div className={`form-control ${isRoot ? "" : ""}`}>
      {title && (
        <div className="card-title font-mono">
          <TitleFieldTemplate
            id={titleId<T>(idSchema)}
            title={title}
            required={required}
            schema={schema}
            uiSchema={uiSchema}
            registry={registry}
          />
        </div>
      )}
      {description && (
        <DescriptionFieldTemplate
          id={descriptionId<T>(idSchema)}
          description={description}
          schema={schema}
          uiSchema={uiSchema}
          registry={registry}
        />
      )}
      <div
        className={`grid grid-cols-3 gap-${description ? 3 : 4} ${isRoot ? "" : "mb-4"}`}
      >
        {properties.map((element, index) =>
          element.hidden ? (
            element.content
          ) : (
            <div
              key={`${idSchema.$id}-${element.name}-${index}`}
              className={
                idSchema.$id === "root" && element.name === "tasks"
                  ? "mt-2"
                  : ""
              }
            >
              {element.content}
            </div>
          ),
        )}
        {canExpand<T, S, F>(schema, uiSchema, formData) && (
          <div className="flex justify-end">
            <AddButton
              id={buttonId<T>(idSchema, "add")}
              className="rjsf-object-property-expand btn btn-primary btn-sm"
              onClick={onAddClick(schema)}
              disabled={disabled || readonly}
              uiSchema={uiSchema}
              registry={registry}
            />
          </div>
        )}
      </div>
    </div>
  );
}

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
