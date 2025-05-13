import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

export const Input = forwardRef(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor={props.id}
          >
            {label} {props.required && <span className="text-red-500">*</span>}
          </label>
        )}
        <input
          className={clsx(
            "w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition-colors duration-200 placeholder-gray-400",
            error ? "border-red-500" : "focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm font-medium text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input; 