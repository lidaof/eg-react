import { TrackGroupOptionBuilder } from "./TrackGroupOptionBuilder";

export interface TrackGroupingBehavior<T> {
    /**
     * A function that returns a TrackGroupOptionBuilder.  Behaviors that have a **reference** to the same function
     * shall be considered compatible.
     */
    getGroupOptionBuilder: () => TrackGroupOptionBuilder<T>;
    /**
     * Function that can adapt data of different types to be compatible with the above TrackGroupOptionBuilder.
     */
    adaptData: (data: unknown[]) => T[];
}
