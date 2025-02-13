import React from "react";

export function Radio({ selected, name, value, label, onChange }) {
  return (
    <label className="text-base font-medium text-gray-600">
      <input
        className="mr-2 shadow-sm sm:text-sm"
        type="radio"
        name={name}
        value={value}
        checked={selected === value}
        onChange={onChange}
        required
      />
      {label}
    </label>
  );
}
