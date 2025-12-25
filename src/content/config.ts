import { defineCollection, z } from 'astro:content';

const componentsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    description: z.string(),
    usage: z.string().optional(),
    id: z.string(),
    // 参数列表
    props: z.array(z.object({
      name: z.string(),
      type: z.string(),
      default: z.string().optional(),
      description: z.string()
    })).optional(),
  }),
});

export const collections = {
  'components': componentsCollection,
};
