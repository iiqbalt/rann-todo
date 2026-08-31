import { useParams } from '@tanstack/react-router'

/**
 * The URL sentinel for the virtual "default" workspace, which corresponds to
 * `workspace_id IS NULL` in the database.
 */
export const DEFAULT_WORKSPACE_SLUG = 'default' as const

export type CurrentWorkspace = {
  /** The raw segment from the URL (either "default" or a uuid). */
  rawId: string
  /**
   * The resolved workspace id used for DB queries.
   * `null` represents the virtual default workspace.
   */
  workspaceId: string | null
  /** True when viewing the default workspace. */
  isDefault: boolean
}

/**
 * Hook that resolves the current workspace from the `/w/$workspaceId` route.
 *
 * Returns the default workspace if the URL doesn't match the expected shape
 * (this should never happen if the router is configured correctly, but it
 * keeps reads safe).
 */
export function useCurrentWorkspace(): CurrentWorkspace {
  const params: { workspaceId?: string } = useParams({ strict: false })
  const raw = params.workspaceId ?? DEFAULT_WORKSPACE_SLUG
  const isDefault = raw === DEFAULT_WORKSPACE_SLUG
  return {
    rawId: raw,
    workspaceId: isDefault ? null : raw,
    isDefault,
  }
}
