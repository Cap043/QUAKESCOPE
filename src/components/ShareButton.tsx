import React, { useState } from 'react';

interface ShareButtonProps {
    onGenerateUrl: () => string;
    isDarkMode: boolean;
    className?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
    onGenerateUrl,
    isDarkMode,
    className = ''
}) => {
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const url = onGenerateUrl();
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'QuakeScope - Earthquake Monitor',
                    text: 'Check out this earthquake monitoring view!',
                    url: url
                });
            } catch (error) {
                console.log('Share cancelled or failed:', error);
            }
        } else {
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (error) {
                console.error('Failed to copy to clipboard:', error);
            }
        }
    };

    const handleCopyUrl = async () => {
        const url = onGenerateUrl();
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    };

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                    isDarkMode
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        : 'bg-white hover:bg-slate-50 text-slate-600'
                } shadow-sm border border-slate-200 dark:border-slate-700`}
                title="Share current view"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
            </button>

            {showShareMenu && (
                <div className={`absolute bottom-full right-0 mb-2 p-3 rounded-lg shadow-lg border ${
                    isDarkMode
                        ? 'bg-slate-800 border-slate-700'
                        : 'bg-white border-slate-200'
                } min-w-[200px]`}>
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Share View
                    </div>
                    
                    <div className="space-y-2">
                        <button
                            onClick={handleShare}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-md transition-colors ${
                                isDarkMode
                                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                            </svg>
                            Share
                        </button>
                        
                        <button
                            onClick={handleCopyUrl}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-md transition-colors ${
                                copied
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                    : isDarkMode
                                        ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                        >
                            {copied ? (
                                <>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Copy URL
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Click outside to close */}
            {showShareMenu && (
                <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowShareMenu(false)}
                />
            )}
        </div>
    );
};

export default ShareButton;
