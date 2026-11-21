/** Org tree (`GET /org/tree`, docs/api/users.openapi.yaml, DEC-070). */
import type { components } from "@/types/api/users";

type Schemas = components["schemas"];

export type OrgTree = Schemas["OrgTree"];
export type OrgZone = OrgTree["zones"][number];
export type OrgPerson = Schemas["OrgPerson"];
export type OrgAsm = Schemas["OrgAsm"];
export type OrgSalesExecutive = Schemas["OrgSalesExecutive"];
