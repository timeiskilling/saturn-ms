import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function PhantomButton({
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        w-full cursor-pointer text-white bg-gray-800
        py-3 px-4 font-semibold rounded-md select-none
        transition-colors duration-200 outline-none border-none
        hover:bg-gray-700 focus-visible:bg-gray-700 active:bg-gray-600
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
