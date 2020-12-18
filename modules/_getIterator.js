import isObject from "./isObject"

// return obj's iterator if it exists
export default function getIterator(obj) {
    try {
        isObject(Symbol)? obj[Symbol.iterator]: null
    } catch (e) {
        return null
    }
}