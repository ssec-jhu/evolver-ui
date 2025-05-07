import Form from "@rjsf/core";
import pkg from "@rjsf/utils";
const {
  getInputProps,
  getSubmitButtonOptions,
} = pkg;

type BaseInputTemplateProps = pkg.BaseInputTemplateProps;
type FieldTemplateProps = pkg.FieldTemplateProps;
type ObjectFieldTemplateProps = pkg.ObjectFieldTemplateProps;
type RJSFSchema = pkg.RJSFSchema;
type SubmitButtonProps = pkg.SubmitButtonProps;
import validator from "@rjsf/validator-ajv8";
import { ChangeEvent, FocusEvent } from "react";

function ObjectFieldTemplate(props: ObjectFieldTemplateProps) {
  const { action_index } = props.schema;
  return (
    <div className="flex flex-col gap-4 flex-1">
      <div className="flex flex-col gap-4">
        <div className="card-title">{action_index + 1}.</div>
        <p>{props.title}</p>
      </div>
      {props.properties.map((element) => {
        return (
          <div key={action_index} className="property-wrapper">
            {element.content}
          </div>
        );
      })}
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
  const { norender } = getSubmitButtonOptions(uiSchema);
  if (norender) {
    return (
      <div className="card-actions justify-end align-bottom">
        <div className={`btn btn-disabled`}>done</div>
      </div>
    );
  }

  return (
    <div className="card-actions justify-end align-bottom">
      <button className={`btn btn-primary`} type="submit">
        done
      </button>
    </div>
  );
}

export default function CalibratorActionForm({
  action,
  index,
  dispatchAction,
}: {
  action: {
    input_schema: { properties: object } | RJSFSchema;
    description: string;
    is_complete: boolean;
  };
  index: number;
  dispatchAction: (action: FormData) => void;
}) {
  // Replace schema title with description
  const schemaToUse = {
    ...action.input_schema,
    title: action.description,
    action_index: index,
    description: "",
  };

  const uiSchema = {
    "ui:submitButtonOptions": {
      norender: action.is_complete,
    },
  };

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
