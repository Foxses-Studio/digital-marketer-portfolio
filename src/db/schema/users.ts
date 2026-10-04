import type { ObjectId } from "mongodb";
import type { CollectionIndexes } from "./types";

/** Admin accounts that can sign in to the CMS. */
export type UserDocument = {
  _id: ObjectId;
  email: string;
  name: string;
  passwordHash: string;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export const usersIndexes: CollectionIndexes = [
  { key: { email: 1 }, unique: true },
];
