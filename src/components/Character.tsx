import { useMemo } from "preact/hooks";

interface Props {
    images: string[];
}

export default function Character({ images }: Props) {
    const randomImage = useMemo(() => {
        if (images.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * images.length);
        return images[randomIndex];
    }, [images]);

    if (!randomImage) return null;

    return (
        <div class="fixed bottom-0 right-0 z-10">
            <img
                src={randomImage}
                alt=""
                class="h-48 md:h-64 lg:h-80 object-contain opacity-80"
            />
        </div>
    );
}
