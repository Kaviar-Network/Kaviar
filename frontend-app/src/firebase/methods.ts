import { ref, set, get } from "firebase/database";
import { db } from "./config";

export function writeTreeValues(zeroValues: string[]) {
  set(ref(db, "tree/"), zeroValues);
}

export function getMerkleTreePromise() {
  return get(ref(db, "tree/"));
}
