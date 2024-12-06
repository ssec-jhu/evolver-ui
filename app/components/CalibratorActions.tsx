interface ActionField {
  description: string;
  name: string;
  type: "number" | "string";
}

type ActionFormFields = Record<string, ActionField>;

interface  ActionForm {
  properties: ActionFormFields;
  required?: string[];
}

interface Action {
  name: string;
  description: string;
  requires_input: boolean;
  form_model: ActionForm;
}

export function CalibrationProcedureAction(action: Action) {
  const formComponents = [];

  // Handle actions that do not require input
  if (!action.requires_input) {
    const comp = (
      <div>This action does not require a form.</div>
    );
    formComponents.push(comp);
    return formComponents
  }

  
  for (const key in action.form_model.properties) {
    const property = action.form_model.properties[key];

    const comp = (
      <form>
        <label htmlFor="${property.name}">${property.description}</label>
        <input
          type="${property.type}"
          id="${property.name}"
          name="${property.name}"
        ></input>
        <button type="submit">Submit</button>
      </form>
    );
    formComponents.push(comp);
  }

  return formComponents;
}

export function BasicAction() {
  return (
  );
}
