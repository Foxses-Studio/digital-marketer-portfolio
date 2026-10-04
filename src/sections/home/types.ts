/** Props every homepage section component receives from RenderSections. */
export type SectionProps<T> = {
  content: T;
  /** Running chapter number for sections with an intro (01, 02...). */
  index?: number;
  id: string;
};
