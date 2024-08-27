import { useRouteLoaderData } from "@remix-run/react";
import clsx from "clsx";
import {
  FilterFunction,
  JsonData,
  JsonEditor,
  NodeData,
  TypeFilterFunction,
} from "json-edit-react";
import { loader as rootLoader } from "~/root";
import { checkType } from "~/utils/checkType";
import { EvolverConfigWithoutDefaults } from "client";

export function EditJson({
  data,
  mode,
  setData,
}: {
  data: EvolverConfigWithoutDefaults;
  mode: "edit" | "view";
  setData: (arg0: EvolverConfigWithoutDefaults) => void;
}) {
  const { theme } = useRouteLoaderData<typeof rootLoader>("root") ?? {
    theme: "dark",
  };

  const editorTheme = theme === "dark" ? "githubDark" : "githubLight";

  const customizeText = ({ key, value }: NodeData) => {
    switch (key) {
      case "vials":
        {
          const vialCount = Array.isArray(value) ? value.length : 0;
          if (vialCount === 0) {
            return `Enter the slots that have vials connected to them`;
          }
          if (vialCount === 1) {
            return `${vialCount} vial at position`;
          } else if (vialCount > 1) {
            return `${vialCount} vials at positions`;
          }
        }
        return null;
      case "Config":
        return "";
      case "hardware": {
        let hardwareCount = 0;
        if (value && typeof value === "object") {
          hardwareCount = Object.entries(value).length;
        }
        if (hardwareCount === 0) {
          return "No hardware classes";
        }
        return hardwareCount && hardwareCount > 1
          ? `${hardwareCount} hardware classes`
          : `${hardwareCount} hardware class`;
      }
      default:
        return null;
    }
  };

  const collapseDefault: FilterFunction = ({ key }: NodeData) => {
    switch (key) {
      case "hardware":
      case "serial":
      case "history":
      case "controllers":
      case "vials":
      case "Config":
        return false;
      default:
        return false;
    }
  };

  const restrictTypeSelection: TypeFilterFunction = ({ value }) => {
    return checkType(value);
  };

  const defaultValues = ({ key }: NodeData) => {
    switch (key) {
      case "vials":
        return 0;
      case "Config":
        return false;
      default:
        return null;
    }
  };

  const restrictDelete: FilterFunction = ({ key, path }: NodeData) => {
    if (mode !== "edit") {
      return true;
    }
    if (mode === "edit" && path.length >= 1) {
      // never allowed to delete these keys
      switch (key) {
        case "Config":
        case "vials":
        case "name":
        case "hardware":
        case "serial":
        case "history":
        case "controllers":
        case "classinfo":
        case "config":
        case "enable_control":
        case "enable_commit":
        case "interval":
          return true;
      }

      // allowed to delete vials at any path
      switch (path[path.length - 2]) {
        case "vials":
          return false;
      }

      // never allowed to delete children of these keys
      switch (path[0]) {
        case "Config":
        case "name":
        case "hardware":
        case "serial":
        case "history":
        case "controllers":
        case "classinfo":
        case "config":
          return true;
        case "vials":
          return false;
      }
    }
    return mode !== "edit";
  };

  const restrictEdit = ({ key, level }: NodeData) => {
    if (mode !== "edit") {
      return true;
    }
    if (mode === "edit") {
      if (level === 0) {
        return false;
      }
      switch (key) {
        case "vials":
        case "Config":
        case "hardware":
        case "serial":
        case "history":
        case "controllers":
          return true;
        default:
          return false;
      }
    }
    return mode !== "edit";
  };

  const restrictAdd = ({ key, level }: NodeData) => {
    if (mode !== "edit") {
      return true;
    }
    if (mode === "edit") {
      if (level === 0) {
        return true;
      }
      switch (key) {
        case "vials":
        case "Config":
        case "name":
        case "hardware":
        case "serial":
        case "history":
        case "controllers":
          return false;
        default:
          return true;
      }
    }
    return mode !== "edit";
  };

  return (
    <div
      className={clsx(
        "max-w-6xl [&>*]:!max-w-6xl w-full text-inherit  rounded-lg",
        theme === "light" && "[&_textarea]:!text-black [&_input]:!text-black ",
        theme === "dark" && "[&_textarea]:!text-white [&_input]:!text-white",
      )}
    >
      <JsonEditor
        key={mode}
        data={data}
        showArrayIndices={false}
        collapse={collapseDefault}
        restrictTypeSelection={restrictTypeSelection}
        enableClipboard={false}
        theme={editorTheme}
        rootName="config"
        customText={{
          ITEM_SINGLE: customizeText,
          ITEMS_MULTIPLE: customizeText,
        }}
        restrictEdit={restrictEdit}
        restrictAdd={restrictAdd}
        restrictDelete={restrictDelete}
        setData={(data: JsonData) =>
          setData(data as EvolverConfigWithoutDefaults)
        }
        defaultValue={defaultValues}
      />
    </div>
  );
}
