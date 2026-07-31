import React from 'react'
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, id, ...props }) => (
    <div className="flex flex-col gap-1 w-full text-left">
        <label htmlFor={id} className="text-sm font-semibold text-gray-700">{label}</label>
        <input id={id} {...props} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
    </div>
)