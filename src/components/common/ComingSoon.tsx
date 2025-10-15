
"use client";

import { Construction, Rocket } from 'lucide-react';

interface ComingSoonProps {
    title?: string;
    message?: string;
    compact?: boolean;
}

const ComingSoon = ({ 
    title = "Bientôt disponible", 
    message = "Cette fonctionnalité arrive bientôt",
    compact = false 
}: ComingSoonProps) => {
    if (compact) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <Construction className="w-12 h-12 text-blue-500 mx-auto mb-3 animate-bounce" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {message}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-700 p-12">
            <div className="text-center max-w-md mx-auto">
                <div className="relative inline-block mb-6">
                    <Construction className="w-20 h-20 text-blue-500 animate-bounce" />
                    <Rocket className="w-8 h-8 text-purple-500 absolute -top-2 -right-2 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {message}
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    En cours de développement
                </div>
            </div>
        </div>
    );
};

export default ComingSoon;
