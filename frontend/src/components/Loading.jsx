const Loading = () => {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="relative mb-2">
                {/* Loading spinner */}
                <div className="w-12 h-12 rounded-full border-4 border-gray-200 animate-spin border-t-blue-600"></div>
                {/* Center dot */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>
            <span className="mt-3 text-lg text-black">Loading tasks...</span>
        </div>
    );
};

export default Loading;