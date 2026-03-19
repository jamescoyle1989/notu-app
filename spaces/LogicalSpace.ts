import { Space } from "notu";

/**
 * Represents a wrapper for a space that has some custom logic attached to it
 */
export interface LogicalSpace {
    get space(): Space;
}