// Stub for @react-native-async-storage/async-storage
// This is only used by MetaMask SDK in browser environments
// We provide empty implementations since we don't need React Native storage

const AsyncStorage = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
  clear: async () => {},
  getAllKeys: async () => [],
  multiGet: async () => [],
  multiSet: async () => {},
  multiRemove: async () => {},
};

// Support both CommonJS and ES modules
module.exports = AsyncStorage;
module.exports.default = AsyncStorage;

