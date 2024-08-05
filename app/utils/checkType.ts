type SingleType = "string" | "number" | "boolean" | "array" | "object";
type CheckTypeReturn = [SingleType] | SingleType[];

export function checkType(x: unknown): CheckTypeReturn {
  if (typeof x === "string") {
    return ["string"];
  } else if (typeof x === "number") {
    return ["number"];
  } else if (typeof x === "boolean") {
    return ["boolean"];
  } else if (Array.isArray(x)) {
    return ["array"];
  } else if (typeof x === "object" && x !== null) {
    return ["object"];
  } else {
    return ["string", "number", "boolean", "array", "object"];
  }
}
