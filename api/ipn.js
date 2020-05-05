'use strict';

module.exports = ({ db }) => async function ipn(params) {
  console.log(params);
  return { ...params, ok: 1 };
};
