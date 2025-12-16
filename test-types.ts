
import { users } from "./src/db/schema";
import { InferSelectModel } from "drizzle-orm";

type User = InferSelectModel<typeof users>;

const u: User = {} as any;
const at = u.accountType;

// This should be 'personal' | 'business' | null
if (at === 'business') {
    console.log("Business");
}
