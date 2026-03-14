import React, { useState, useEffect } from 'react';
const ModelManager = () => {
    const [cacheSize, setCacheSize] = useState('Calculated...');
    const [files, setFiles] = useState([]);
    const checkCache = async () => {
        if ('caches' in window) {
            try {
                const keys = await caches.keys();
                const fileList = [];
                for (const key of keys) {
                    const cache = await caches.open(key);
                    const requests = await cache.keys();
                    for (const request of requests) {
                        fileList.push(request.url);
                    }
                }
                setFiles(fileList);
                setCacheSize(`${fileList.length} files cached`);
            } catch (e) {
                setCacheSize('Error accessing cache');
            }
        } else {
            setCacheSize('Cache API not supported');
        }
    };
    useEffect(() => {
        checkCache();
    }, []);
    const clearCache = async () => {
        if (window.confirm("Are you sure you want to delete all downloaded models? You will need to re-download them to use offline features.")) {
            if ('caches' in window) {
                const keys = await caches.keys();
                for (const key of keys) {
                    await caches.delete(key);
                }
                checkCache();
                alert("Cache cleared.");
            }
        }
    };
    return (
        <div className="p-4 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Storage Management</h1>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Downloaded Models</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Models are stored in your browser's cache for offline use.
                    </p>
                    <p className="font-bold text-lg">{cacheSize}</p>
                </div>
                <button
                    onClick={clearCache}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                    Delete All Models
                </button>
                <div className="mt-6">
                    <h3 className="font-semibold mb-2">Cached Files Details:</h3>
                    <div className="max-h-64 overflow-y-auto bg-gray-100 dark:bg-gray-900 p-2 rounded text-xs break-all">
                        {files.map((f, i) => (
                            <div key={i} className="mb-1 border-b border-gray-200 dark:border-gray-700 pb-1">{f}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ModelManager;

