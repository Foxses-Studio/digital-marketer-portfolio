import Image from "@tiptap/extension-image";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import { isSafeUrl } from "@/lib/security/url";

/**
 * The editor's feature set. Must stay in sync with the allow-list in
 * src/validation/rich-text.ts and the cases in rich-text-renderer.tsx.
 */
export function createExtensions(placeholder: string) {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      code: false,
      codeBlock: false,
      strike: false,
      horizontalRule: false,
      link: {
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        isAllowedUri: (url) => isSafeUrl(url),
        HTMLAttributes: { rel: "noopener noreferrer", target: null },
      },
    }),
    Image.configure({ inline: false, allowBase64: false }),
    Placeholder.configure({ placeholder }),
  ];
}
