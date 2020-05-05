'use strict';

module.exports = ({ db }) => async function ipn(params) {
  return { ...params, ok: 1 };
};
