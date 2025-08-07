export function formDataToObject(formData: FormData) {
  const computeObject = (data: any, parts: string[], value: any): any => {
    const field = parts.shift() as string;
    if (parts.length === 0) {
      return { [field]: value };
    }
    const currentData = data[field] || {};
    const newValue = computeObject(currentData, parts, value);
    return {
      [field]: { ...newValue, ...currentData },
    };
  };
  return Object.entries(Object.fromEntries(formData.entries())).reduce(
    (acc, [key]) => {
      const value = key.endsWith("[]")
        ? formData.getAll(key)
        : formData.get(key);
      key = key.replace("[]", "");
      return {
        ...acc,
        ...computeObject(acc, key.split("."), value),
      };
    },
    {},
  );
}
