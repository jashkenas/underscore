// Internal pick helper function to determine if `obj` has key `key`.
export default function keyInObj(value, key, obj) {
  return key in obj;
}
