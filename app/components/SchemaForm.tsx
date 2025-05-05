import { Form } from "@rjsf/core/packages/daisyui";
import { RJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";

interface SchemaFormProps {
  schema: RJSFSchema;
}

export default function SchemaForm({ schema }: SchemaFormProps) {
  return <Form validator={validator} schema={schema} />;
}
