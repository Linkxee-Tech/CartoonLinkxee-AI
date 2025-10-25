import React from 'react';
import { TRIAL_DAYS } from '../constants';
import { UserIcon } from './Icons';

const Profile: React.FC = () => {
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + TRIAL_DAYS);

  return (
    <div className="text-center max-w-md mx-auto">
      <UserIcon className="mx-auto h-16 w-16 text-purple-400 mb-4" />
      <h1 className="text-3xl font-bold">Your Profile</h1>
      <p className="text-gray-400 mt-2">Manage your account and settings.</p>

      <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg border border-purple-500/30">
        <h2 className="text-xl font-bold text-purple-300">Trial Period Status</h2>
        <p className="mt-2 text-gray-300">
          You're enjoying the full CartoonLinkxee AI experience!
        </p>
        <div className="mt-4 text-4xl font-extrabold text-white">
          {TRIAL_DAYS} Days Remaining
        </div>
        <p className="mt-2 text-gray-400 text-sm">
          Your unlimited access to all features is active until {trialEndDate.toLocaleDateString()}.
        </p>
         <p className="mt-4 text-gray-500 text-xs">When the trial ends, you can choose a plan that fits your needs. Explore everything and discover your favorite tools!</p>
      </div>
    </div>
  );
};

export default Profile;