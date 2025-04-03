/// <reference types="vite/client" />

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.heic' {
  const src: string;
  export default src;
}

declare module '*.HEIC' {
  const src: string;
  export default src;
}

declare module 'heic2any' {
  interface Options {
    blob: Blob;
    toType?: string;
    quality?: number;
  }
  
  function heic2any(options: Options): Promise<Blob | Blob[]>;
  export default heic2any;
} 