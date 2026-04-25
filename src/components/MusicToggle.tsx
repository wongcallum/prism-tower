import { useEffect, useRef, useState } from "preact/hooks";

import { FluentSpeaker224Regular } from "./icons/FluentSpeaker224Regular";
import { FluentSpeakerMute24Regular } from "./icons/FluentSpeakerMute24Regular";

export default function MusicToggle() {
    const audioRef = useRef<HTMLAudioElement>(null);

    const [muted, setMuted] = useState(() => {
        const saved = localStorage.getItem("muted");
        return saved ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        localStorage.setItem("muted", muted);
        if (audioRef.current) audioRef.current.muted = muted;
    }, [muted]);

    return (
        <div class="fixed bottom-12 left-1/2 transform -translate-x-1/2 z-10">
            <button
                type="button"
                class="frosted-glass rounded-full p-3 hover:cursor-pointer"
                onClick={() => setMuted(!muted)}
            >
                {muted ? (
                    <FluentSpeakerMute24Regular />
                ) : (
                    <FluentSpeaker224Regular />
                )}
            </button>
            <audio ref={audioRef} loop muted autoplay volume={0.1}>
                <source src="/bgm.ogg" type="audio/ogg" />
            </audio>
        </div>
    );
}
