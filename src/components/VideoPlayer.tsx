import React, { useEffect, useRef, useState } from 'react';
import { VolumeX, Volume2 } from 'lucide-react';

interface VideoPlayerProps {
    stream: MediaStream | null;
    muted?: boolean;
    className?: string;
    poster?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ stream, muted = false, className, poster }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(muted);
    const [showUnmuteBtn, setShowUnmuteBtn] = useState(false);

    useEffect(() => {
        setIsMuted(muted);
    }, [muted]);

    useEffect(() => {
        const video = videoRef.current;
        if (video && stream) {
            video.srcObject = stream;

            // Try playing the video
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    // Autoplay was prevented.
                    if (error.name === 'NotAllowedError') {
                        setIsMuted(true);
                        setShowUnmuteBtn(true);
                        // Play muted instead
                        video.play().catch(e => console.error("Muted playback failed:", e));
                    } else {
                        console.error('Playback error:', error);
                    }
                });
            }
        }
    }, [stream]);

    const handleUnmute = () => {
        setIsMuted(false);
        setShowUnmuteBtn(false);
    };

    return (
        <div className={`relative ${className}`}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isMuted}
                poster={poster}
                className="w-full h-full object-cover"
            />
            {showUnmuteBtn && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-50">
                    <button
                        onClick={handleUnmute}
                        className="flex items-center gap-2 bg-black/70 hover:bg-black/90 text-white px-6 py-3 rounded-full font-bold transition-all transform hover:scale-105"
                    >
                        <VolumeX size={20} />
                        Tap to Unmute
                    </button>
                </div>
            )}
        </div>
    );
};
