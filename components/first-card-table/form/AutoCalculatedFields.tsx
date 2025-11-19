"use client";

import FormField from "./FormField";

export interface AutoCalculatedFieldConfig {
  name: string;
  label: string;
  highlightClass?: string;
}

interface AutoCalculatedFieldsProps {
  fields: AutoCalculatedFieldConfig[];
}

const AutoCalculatedFields = ({ fields }: AutoCalculatedFieldsProps) => {
  return (
    <>
      {fields.map((field) => (
        <FormField
          key={field.name}
          name={field.name}
          label={field.label}
          readOnly
          highlightClass={field.highlightClass ?? "bg-indigo-50"}
        />
      ))}
    </>
  );
};

export default AutoCalculatedFields;

