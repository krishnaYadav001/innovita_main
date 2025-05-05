import React from 'react';
import { PiKnifeLight } from 'react-icons/pi';

const EditVideoSection = () => {
    return (
        <div className="flex bg-[#F8F8F8] dark:bg-gray-800 py-4 px-6 rounded-lg shadow-sm mb-6 dark:border dark:border-gray-700">
            <div>
                <PiKnifeLight className="mr-4 text-black dark:text-white" size={20}/>
            </div>
            <div>
                <div className="text-semibold text-[15px] mb-1.5 text-black dark:text-white">Divide videos and edit</div>
                <div className="text-semibold text-[13px] text-gray-400 dark:text-gray-300">
                    You can quickly divide videos into multiple parts, remove redundant parts and turn landscape videos into portrait videos
                </div>
            </div>
            <div className="flex justify-end max-w-[130px] w-full h-full text-center my-auto">
                {/* TODO: Implement actual edit functionality or link */}
                <button className="px-8 py-1.5 text-white text-[15px] bg-[#F02C56] dark:bg-[#d9254a] hover:bg-[#d9254a] dark:hover:bg-[#b01e3c] rounded-sm transition-colors duration-200">
                    Edit
                </button>
            </div>
        </div>
    );
};

export default EditVideoSection;