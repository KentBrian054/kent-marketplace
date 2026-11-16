export default {
  agentRules: false,
  poweredByHeader: false,
  ...(process.env.MARKETPLACE_TEST_BUILD_DIR ? {distDir: process.env.MARKETPLACE_TEST_BUILD_DIR} : {})
};
