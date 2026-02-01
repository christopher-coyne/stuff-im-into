import { z } from "zod";

export const mediaTypes = ["VIDEO", "SPOTIFY", "IMAGE", "TEXT", "EXTERNAL_LINK"] as const;
export type MediaType = (typeof mediaTypes)[number];

export const reviewFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less"),
  tabId: z.string().min(1, "Please select a tab"),
  description: z
    .string()
    .max(50000, "Description must be 50,000 characters or less"),
  author: z
    .string()
    .max(300, "Author must be 300 characters or less"),
  mediaType: z.enum(mediaTypes),
  mediaUrl: z
    .string()
    .max(2000, "URL must be 2,000 characters or less"),
  textContent: z
    .string()
    .max(50000, "Text content must be 50,000 characters or less"),
  categoryIds: z.array(z.string()),
  metaFields: z.array(
    z.object({
      label: z.string().max(50, "Label must be 50 characters or less"),
      value: z.string().max(500, "Value must be 500 characters or less"),
    })
  ),
  publish: z.boolean(),
});

export type ReviewFormData = z.infer<typeof reviewFormSchema>;
