import { useState, useEffect } from "preact/hooks";

interface Props {
    images: string[];
}

export default function Character({ images }: Props) {
    const [randomImage, setRandomImage] = useState<string | null>(null);

    useEffect(() => {
        if (!images || images.length === 0) {
            setRandomImage(null);
            return;
        }

        setRandomImage(images[(Math.floor(Math.random() * images.length))]);
    }, [images]);

    if (!randomImage) return null;

    return (
        <div class="fixed bottom-0 right-0 z-10">
            <img
                src={randomImage}
                class="h-48 md:h-64 lg:h-80 object-contain opacity-80"
            />
        </div>
    );
}
