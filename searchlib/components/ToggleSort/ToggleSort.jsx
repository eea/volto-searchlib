import React from 'react';

const ToggleSort = ({ icon, label, on, onToggle, children }) => {
  return (
    <div className="toggleSort">
      <div
        className={on ? 'toggle-label active' : 'toggle-label'}
        onClick={onToggle}
        onKeyDown={onToggle}
        role="button"
        tabIndex="-1"
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
