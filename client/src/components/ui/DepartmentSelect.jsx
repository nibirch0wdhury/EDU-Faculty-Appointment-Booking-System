import React from 'react';

// ✅ Updated Department List - Alphabetical Order
export const DEPARTMENTS = [
  'Business Administration',
  'Computer Science & Engineering',
  'Digitalization, Innovation and Entrepreneurship',
  'Economics',
  'Electrical & Electronic Engineering',
  'Electronics & Telecommunication Engineering',
  'English',
  'Public Leadership, Management and Governance'
];

const DepartmentSelect = ({ 
  value, 
  onChange, 
  className = '', 
  placeholder = 'Select Department...', 
  required = false,
  label = 'Department',
  showLabel = true,
  icon: Icon = null
}) => {
  return (
    <div className="space-y-2">
      {showLabel && (
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          {Icon && <Icon className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />}
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        className={`input-field bg-white dark:bg-slate-900 ${className}`}
        required={required}
      >
        <option value="" className="bg-white dark:bg-slate-900">{placeholder}</option>
        {DEPARTMENTS.map((dept) => (
          <option key={dept} value={dept} className="bg-white dark:bg-slate-900">
            {dept}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DepartmentSelect;