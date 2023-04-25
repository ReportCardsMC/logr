import { prop, Ref } from "@typegoose/typegoose";

export enum UserRoles {
    DEFAULT,
    MOD,
    ADMIN,
}

export class User {
    @prop()
    public username?: string;

    @prop()
    public email?: string;

    @prop({enum: UserRoles, default: UserRoles.DEFAULT})
    public role?: UserRoles;

    @prop({default: 0})
    public extraProjects?: number; // This is the number of extra projects a user can have, by default all users have 2, so this should be 0 for most users

    @prop({default: []})
    public apiKeys?: {createdAt: number, key: string, lastUsed: number}[];

    @prop({default: []})
    public strategiesUsed?: {lastUsed: number, name: string}[];

}
