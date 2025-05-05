"use client"

import React from 'react';
import { BiLoaderCircle, BiSolidCloudUpload } from 'react-icons/bi';
import { AiOutlineCheckCircle } from 'react-icons/ai';

interface VideoUploadPreviewProps {
    fileDisplay: string;
    isUploading: boolean;
    file: File | null;
    onVideoFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    clearVideo: () => void;
}

const VideoUploadPreview: React.FC<VideoUploadPreviewProps> = ({
    fileDisplay,
    isUploading,
    file,
    onVideoFileChange,
    clearVideo,
}) => {
    return (
        <>
            {!fileDisplay ? (
                <label
                    htmlFor="fileInput"
                    className="
                        md:mx-0
                        mx-auto
                        mt-4
                        mb-6
                        flex
                        flex-col
                        items-center
                        justify-center
                        w-full
                        max-w-[260px]
                        h-[470px]
                        text-center
                        p-3
                        border-2
                        border-dashed
                        border-gray-300
                        dark:border-gray-600
                        rounded-lg
                        hover:bg-gray-100
                        dark:hover:bg-gray-800
                        cursor-pointer
                        bg-white
                        dark:bg-gray-800
                    "
                >
                    <BiSolidCloudUpload size="40" className="text-gray-400 dark:text-gray-500"/>
                    <p className="mt-4 text-[17px] text-black dark:text-white">Select video to upload</p>
                    <p className="mt-1.5 text-gray-500 dark:text-gray-400 text-[13px]">Or drag and drop a file</p>
                    <p className="mt-12 text-gray-400 dark:text-gray-500 text-sm">MP4</p>
                    <p className="mt-2 text-gray-400 dark:text-gray-500 text-[13px]">Up to 30 minutes</p>
                    <p className="mt-2 text-gray-400 dark:text-gray-500 text-[13px]">Less than 2 GB</p>
                    <label
                        htmlFor="fileInput"
                        className="px-2 py-1.5 mt-8 text-white text-[15px] w-[80%] bg-[#F02C56] dark:bg-[#d9254a] hover:bg-[#d9254a] dark:hover:bg-[#b01e3c] rounded-sm cursor-pointer transition-colors duration-200"
                    >
                        Select file
                    </label>
                    <input
                        type="file"
                        id="fileInput"
                        onChange={onVideoFileChange}
                        hidden
                        accept=".mp4"
                    />
                </label>
            ) : (
                <div
                    className="
                        md:mx-0
                        mx-auto
                        mt-4
                        md:mb-12
                        mb-16
                        flex
                        items-center
                        justify-center
                        w-full
                        max-w-[260px]
                        h-[540px]
                        p-3
                        rounded-2xl
                        cursor-pointer
                        relative
                    "
                >
                    {isUploading ? (
                        <div className="absolute flex items-center justify-center z-20 bg-black h-full w-full rounded-[50px] bg-opacity-50">
                            <div className="mx-auto flex items-center justify-center gap-1">
                                <BiLoaderCircle className="animate-spin" color="#F12B56" size={30} />
                                <div className="text-white font-bold">Uploading...</div>
                            </div>
                        </div>
                    ) : null}

                    <img
                        className="absolute z-20 pointer-events-none"
                        src="/images/mobile-case.png"
                        alt="Mobile case overlay"
                    />
                    <img
                        className="absolute right-4 bottom-6 z-20"
                        width="90"
                        src="/images/ii.png"
                        alt="Innovita logo overlay"
                    />
                    <video
                        autoPlay
                        loop
                        muted
                        className="absolute rounded-xl object-cover z-10 p-[13px] w-full h-full"
                        src={fileDisplay}
                    />

                    <div className="absolute -bottom-12 flex items-center justify-between z-50 rounded-xl border w-full p-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <div className="flex items-center truncate">
                            <AiOutlineCheckCircle size="16" className="min-w-[16px] text-green-500"/>
                            <p className="text-[11px] pl-1 truncate text-ellipsis text-black dark:text-white">{file?.name}</p>
                        </div>
                        <button onClick={clearVideo} className="text-[11px] ml-2 font-semibold text-[#F02C56] hover:text-[#d9254a]">
                            Change
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default VideoUploadPreview;