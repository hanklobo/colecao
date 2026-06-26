export interface UserRecord {
  id: string;
  name: string;
  tokenHash: string;
  code: string | null;
  createdAt: number;
  updatedAt: number;
}

export function publicUser(u: UserRecord) {
  return {
    id: u.id,
    name: u.name,
    code: u.code,
    updatedAt: u.updatedAt,
  };
}

export function userKey(id: string): string {
  return `user:${id}`;
}
