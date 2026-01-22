import React from 'react';

/** Иконка личного кабинета (форма человека) по макету Figma (node 58-2688). */
const PersonAccountIcon = ({ className, ...props }) => (
  <svg
      width="26"
      height="22"
      viewBox="0 0 26 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
  >
    <path
        d="M1.00012 21C2.76734 18.0523 6.6405 16.0349 12.6832 16.0349C18.7258 16.0349 22.599 18.0523 24.3662 21M17.4832 5.8C17.4832 8.45097 15.3341 10.6 12.6832 10.6C10.0322 10.6 7.88316 8.45097 7.88316 5.8C7.88316 3.14903 10.0322 1 12.6832 1C15.3341 1 17.4832 3.14903 17.4832 5.8Z"
        stroke="#1B7E79"
        strokeWidth="2"
        strokeLinecap="round"/>
  </svg>
);

export default PersonAccountIcon;
