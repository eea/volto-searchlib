import React from 'react';

const ToggleSort = ({ icon, label, on, onToggle, children }) => {
  return (
    <div className="toggleSort">
      <div
        tabIndex={0}
        role="button"
        className={on ? 'toggle-label active' : 'toggle-label'}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onToggle();
          }
        }}
        title={'Sort by ' + label}
      >
        {/* {label} */}
        {/* {on && icon} */}
        {icon}
      </div>
      {children}
    </div>
  );
};

export default ToggleSort;
