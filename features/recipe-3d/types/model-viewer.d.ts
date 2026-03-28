declare namespace React.JSX {
  interface IntrinsicElements {
    "model-viewer": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        src?: string;
        alt?: string;
        "auto-rotate"?: boolean;
        "camera-controls"?: boolean;
        "shadow-intensity"?: string;
        poster?: string;
        loading?: "auto" | "lazy" | "eager";
        ar?: boolean;
      },
      HTMLElement
    >;
  }
}
