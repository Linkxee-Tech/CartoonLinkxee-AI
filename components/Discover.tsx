
import React from 'react';
import { SparklesIcon } from './Icons';

const Discover: React.FC = () => {
  return (
    <div className="text-center">
      <SparklesIcon className="mx-auto h-16 w-16 text-purple-400 mb-4" />
      <h1 className="text-3xl font-bold">Discover</h1>
      <p className="text-gray-400 mt-2">Coming soon: Explore creations from the community, participate in challenges, and find new styles!</p>
       <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-800 rounded-lg animate-pulse">
            <img src={`https://picsum.photos/400/400?random=${i}`} className="w-full h-full object-cover rounded-lg" alt="placeholder"/>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Discover;
