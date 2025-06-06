import React from "react";

interface StatIconProps {
  iconUrl: string;
  value: string | number;
  alt: string;
  size?: "small" | "medium" | "large" | "tiny"; // Added "tiny" option
}

const StatIcon: React.FC<StatIconProps> = ({ 
  iconUrl, 
  value, 
  alt, 
  size = "medium" 
}) => {
  // Determine dimensions based on size prop
  const dimensions = {
    tiny: { width: "1.5rem", height: "1.5rem", fontSize: "0.6rem" },
    small: { width: "2rem", height: "2rem", fontSize: "0.75rem" },
    medium: { width: "2.5rem", height: "2.5rem", fontSize: "0.875rem" },
    large: { width: "3rem", height: "3rem", fontSize: "1rem" },
  };

  const { width, height, fontSize } = dimensions[size];

  return (
    <div
      className={`stat-icon ${size} relative inline-block`}
      style={{
        width,
        height,
      }}
    >
      <img
        src={iconUrl}
        alt={alt}
        className="w-full h-full object-contain filter-yellow-tint"
      />
      {value && (
        <div
          className="absolute bottom-0 right-0 bg-black bg-opacity-70 rounded-full px-1"
          style={{
            fontSize,
            minWidth: "1rem",
            transform: "translate(25%, 25%)",
            zIndex: 2,
          }}
        >
          {value}
        </div>
      )}
    </div>
  );
};

export default StatIcon;
