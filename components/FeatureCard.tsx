
import React from 'react';

interface FeatureCardProps {
  feature: {
    name: string;
    description: string;
    icon: React.ElementType;
    color: string;
  };
  onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, onClick }) => {
  const Icon = feature.icon;
  return (
    <div
      onClick={onClick}
      className="bg-gray-800 p-6 rounded-lg shadow-lg cursor-pointer transform hover:scale-105 transition-transform duration-300 ease-in-out border border-transparent hover:border-purple-500"
    >
      <div className="flex items-center mb-4">
        <Icon className={`h-8 w-8 mr-4 ${feature.color}`} />
        <h3 className="text-xl font-bold text-white">{feature.name}</h3>
      </div>
      <p className="text-gray-400">{feature.description}</p>
    </div>
  );
};

export default FeatureCard;
