import React from "react";

interface StatIconProps {
  iconUrl: string;
  value: string | undefined;
  alt: string;
  size?: "small" | "medium" | "large";
  tinted?: boolean;
}

const StatIcon: React.FC<StatIconProps> = ({ 
  iconUrl, 
  value, 
  alt, 
  size = "medium", 
  tinted = true 
}) => {
  const sizeMap = {
    small: {
      container: "h-5 gap-1",
      icon: "h-4 w-4",
      text: "text-xs"
    },
    medium: {
      container: "h-6 gap-1.5",
      icon: "h-5 w-5",
      text: "text-sm"
    },
    large: {
      container: "h-7 gap-2",
      icon: "h-6 w-6",
      text: "text-base"
    }
  };

  const sizeClass = sizeMap[size];

  return (
    <div className={`flex items-center ${sizeClass.container}`} title={`${alt}: ${value}`}>
      <img 
        src={iconUrl} 
        alt={alt} 
        className={`${sizeClass.icon} ${tinted ? 'filter-yellow-tint' : ''}`}
      />
      <span className={`${sizeClass.text} text-text-secondary`}>{value || ""}</span>
    </div>
  );
};

export default StatIcon;
