declare const sizes: {
    "cq:sm": number;
    "cq:md": number;
    "cq:lg": number;
    "cq:xl": number;
    "cq:2xl": number;
};
declare const marker: unique symbol;
declare const callback: (entries: ResizeObserverEntry[]) => void;
declare const resize: ResizeObserver;
declare const mutation: MutationObserver;
