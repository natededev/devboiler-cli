import { z } from 'zod';

/**
 * Schema for validating project names
 * Allows alphanumeric characters, hyphens, and underscores
 */
export const projectNameSchema = z
  .string()
  .min(1, 'Project name is required')
  .max(214, 'Project name is too long')
  .regex(
    /^[a-zA-Z0-9-_]+$/,
    'Project name can only contain letters, numbers, hyphens, and underscores'
  );

/**
 * Schema for validating package manager selection
 */
export const packageManagerSchema = z.enum(['npm', 'pnpm', 'yarn']);

/**
 * Schema for validating the create command options
 */
export const createOptionsSchema = z.object({
  name: projectNameSchema,
  packageManager: packageManagerSchema.default('npm'),
  template: z.string().default('react-ts'),
  skipInstall: z.boolean().default(false),
  addTailwind: z.boolean().default(false),
  addZustand: z.boolean().default(false),
  addReactRouter: z.boolean().default(false),
  addEslintPrettier: z.boolean().default(false),
});

/**
 * Inferred type from the create options schema
 */
export type CreateOptions = z.infer<typeof createOptionsSchema>;

/**
 * Validates a project name and returns the result
 */
export function validateProjectName(name: string): { valid: boolean; error?: string } {
  const result = projectNameSchema.safeParse(name);
  if (!result.success) {
    return { valid: false, error: result.error.errors[0]?.message };
  }
  return { valid: true };
}