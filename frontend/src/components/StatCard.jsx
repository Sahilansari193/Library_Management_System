import React from 'react';

const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  colorScheme = 'blue',
  onClick,
}) => {
  return (
    <div
      className="stat-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="stat-card-info">
        <h3>{title}</h3>
        <div className="stat-card-value">{value}</div>
        {subtext && <div className="stat-card-subtext">{subtext}</div>}
      </div>
      {Icon && (
        <div className={`stat-icon-wrapper stat-icon-${colorScheme}`}>
          <Icon size={24} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
