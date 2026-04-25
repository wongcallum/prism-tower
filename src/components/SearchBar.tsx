import Fuse from "fuse.js";
import type { TargetedEvent, TargetedKeyboardEvent } from "preact";
import { useMemo, useState } from "preact/hooks";

import { FluentSearch24Regular } from "./icons/FluentSearch24Regular";

interface Link {
    name: string;
    url: string;
}

interface Props {
    searchUrl?: string;
    links: Link[];
}

export default function SearchBar({ searchUrl, links }: Props) {
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const fuse = useMemo(() => {
        return new Fuse(links, {
            keys: ["name", "url"],
            threshold: 0.4,
            ignoreLocation: true,
            minMatchCharLength: 2
        });
    }, [links]);

    const options = useMemo(() => {
        return fuse
            .search(query.trim(), {
                limit: 5,
            })
            .map(({ item }) => item);
    }, [query]);

    const handleInput = (e: TargetedEvent<HTMLInputElement>) => {
        setQuery(e.currentTarget.value);
        setSelectedIndex(-1);
    };

    const handleKeyDown = (e: TargetedKeyboardEvent<HTMLInputElement>) => {
        if (!options.length) return;

        if ((e.key === "Tab" && !e.shiftKey) || e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) =>
                prev >= options.length - 1 ? 0 : prev + 1,
            );
            return;
        }

        if ((e.key === "Tab" && e.shiftKey) || e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) =>
                prev <= 0 ? options.length - 1 : prev - 1,
            );
            return;
        }

        if (
            e.key === "Enter" &&
            selectedIndex >= 0 &&
            selectedIndex < options.length
        ) {
            e.preventDefault();
            window.location.href = options[selectedIndex].url;
        }
    };

    const handleSubmit = (e: TargetedEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!query.trim()) return;

        if (selectedIndex >= 0 && selectedIndex < options.length) {
            window.location.href = options[selectedIndex].url;
            return;
        }

        const url = new URL(searchUrl ?? "https://google.com/search");
        url.searchParams.set("q", query.trim());
        window.location.href = url.toString();
    };

    return (
        <div class="w-full max-w-2xl">
            <div class="relative">
                <form class="relative" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="query"
                        placeholder="Search..."
                        autofocus
                        autoComplete="off"
                        value={query}
                        onInput={handleInput}
                        onKeyDown={handleKeyDown}
                        class="w-full px-4 py-3 rounded-2xl focus:outline-none frosted-glass"
                    />
                    <button
                        type="submit"
                        aria-label="Search"
                        class="absolute top-1/2 transform -translate-y-1/2 right-4 focus:outline-none hover:cursor-pointer"
                    >
                        <FluentSearch24Regular />
                    </button>
                </form>

                {options.length > 0 && query && (
                    <ul
                        id="search-options"
                        class="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl frosted-glass"
                    >
                        {options.map((option, index) => (
                            <li key={`${option.name}-${option.url}`}>
                                <button
                                    type="button"
                                    class={`flex w-full items-center justify-between gap-6 px-4 py-2 text-left ${index === selectedIndex ? "bg-white/20" : "hover:bg-white/10"}`}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() =>
                                        (window.location.href = option.url)
                                    }
                                >
                                    <span class="truncate font-medium">
                                        {option.name}
                                    </span>
                                    <span class="truncate text-right text-sm text-white/60">
                                        {option.url}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
