import React from "react";

export function Checkbox({ name, value, label, onChange }) {
  return (
    <label className="text-base font-medium text-gray-600">
      <input
        className="mr-2 shadow-sm sm:text-sm"
        type="checkbox"
        name={name}
        value={value}
        onChange={onChange}
      />
      {label}
    </label>
  );
}
