
import React from 'react';
import { Squares2X2Icon } from './Icons';

const MyProjects: React.FC = () => {
  return (
    <div className="text-center">
      <Squares2X2Icon className="mx-auto h-16 w-16 text-purple-400 mb-4" />
      <h1 className="text-3xl font-bold">My Projects</h1>
      <p className="text-gray-400 mt-2">Coming soon: All your creations will be saved here in the cloud, free during your trial!</p>
       <div className="mt-8 flex flex-col items-center space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-full max-w-md h-24 bg-gray-800 rounded-lg animate-pulse flex items-center p-4">
            <div className="w-16 h-16 bg-gray-700 rounded-md"></div>
            <div className="ml-4 flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyProjects;
