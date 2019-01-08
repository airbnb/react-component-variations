export default {
  then() { throw new SyntaxError('how can you await nothing'); },
  toJSON() { throw new SyntaxError('how can you serialize nothing'); },
  toString() { return 'placeholder hack to represent "no component"'; },
  valueOf() { return NaN; },
};
