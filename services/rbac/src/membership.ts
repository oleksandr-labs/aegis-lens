/**
 * Membership resolution — finds the effective role for a user in a given org/team/project context.
 *
 * Resolution order (highest wins):
 *   1. Org-level role (base)
 *   2. Team role overrides (if user is in a team with elevated role for a resource)
 *   3. Project/Case member roles (explicit per-resource grant)
 */

import type { OrgRole, PermissionContext, OrgTier } from "./permissions";

export interface OrgMembership {
  userId: string;
  orgId: string;
  role: OrgRole;
}

export interface TeamMembership {
  userId: string;
  teamId: string;
  orgId: string;
  /** Optional role override for this team's resources */
  roleOverride?: OrgRole;
}

export interface ResourceMemberRole {
  userId: string;
  resourceId: string;
  resourceType: "project" | "case" | "aoi";
  role: OrgRole;
}

export interface MembershipStore {
  getOrgMembership(userId: string, orgId: string): Promise<OrgMembership | null>;
  getTeamMemberships(userId: string, orgId: string): Promise<TeamMembership[]>;
  getResourceRole(userId: string, resourceId: string, resourceType: ResourceMemberRole["resourceType"]): Promise<ResourceMemberRole | null>;
  getOrgTier(orgId: string): Promise<OrgTier>;
}

export class MembershipResolver {
  constructor(private readonly store: MembershipStore) {}

  async resolve(
    userId: string,
    orgId: string,
    opts?: { resourceId?: string; resourceType?: ResourceMemberRole["resourceType"] },
  ): Promise<PermissionContext | null> {
    const orgMembership = await this.store.getOrgMembership(userId, orgId);
    if (!orgMembership) return null;

    const tier = await this.store.getOrgTier(orgId);

    let projectRole: OrgRole | undefined;

    if (opts?.resourceId && opts.resourceType) {
      const resourceRole = await this.store.getResourceRole(
        userId,
        opts.resourceId,
        opts.resourceType,
      );
      if (resourceRole) {
        projectRole = resourceRole.role;
      }
    }

    return {
      role: orgMembership.role,
      tier,
      projectRole,
    };
  }
}

// ── In-memory implementation (for dev/test) ───────────────────────────────────

import { ROLE_RANK } from "./permissions";

export class InMemoryMembershipStore implements MembershipStore {
  private orgMembers = new Map<string, OrgMembership>();
  private teamMembers = new Map<string, TeamMembership[]>();
  private resourceRoles = new Map<string, ResourceMemberRole>();
  private orgTiers = new Map<string, OrgTier>();

  addOrgMember(membership: OrgMembership): void {
    this.orgMembers.set(`${membership.userId}:${membership.orgId}`, membership);
  }

  addTeamMember(membership: TeamMembership): void {
    const key = `${membership.userId}:${membership.orgId}`;
    const existing = this.teamMembers.get(key) ?? [];
    this.teamMembers.set(key, [...existing, membership]);
  }

  addResourceRole(role: ResourceMemberRole): void {
    this.resourceRoles.set(`${role.userId}:${role.resourceId}:${role.resourceType}`, role);
  }

  setOrgTier(orgId: string, tier: OrgTier): void {
    this.orgTiers.set(orgId, tier);
  }

  async getOrgMembership(userId: string, orgId: string): Promise<OrgMembership | null> {
    return this.orgMembers.get(`${userId}:${orgId}`) ?? null;
  }

  async getTeamMemberships(userId: string, orgId: string): Promise<TeamMembership[]> {
    return this.teamMembers.get(`${userId}:${orgId}`) ?? [];
  }

  async getResourceRole(
    userId: string,
    resourceId: string,
    resourceType: ResourceMemberRole["resourceType"],
  ): Promise<ResourceMemberRole | null> {
    return this.resourceRoles.get(`${userId}:${resourceId}:${resourceType}`) ?? null;
  }

  async getOrgTier(orgId: string): Promise<OrgTier> {
    return this.orgTiers.get(orgId) ?? "free";
  }
}

// Re-export for convenience
export { ROLE_RANK } from "./permissions";
