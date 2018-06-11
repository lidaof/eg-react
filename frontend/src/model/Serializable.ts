/**
 * An object that can be converted to and from a plain object so it can be JSON.stringify'ed and JSON.parse'd without
 * losing information.
 * 
 * @author Silas Hsu
 */
interface Serializable<T> {
    /**
     * Serializes this instance into a plain object, ready for JSON.
     * 
     * @return {any} plain object version of this instance
     */
    serialize(): {};

    /**
     * Deserializes a previously serialized object, restoring its methods.  Deserializing an object that didn't come
     * from the serialize() method causes undefined behavior.
     * 
     * @param {any} object - plain object
     * @return {T} instance of this type
     */
    /*static*/deserialize(object: {}): T;
}
