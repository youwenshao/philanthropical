import { useState, useEffect } from "react";
import { useWalletConnect } from "@walletconnect/react-native-dapp";

export function useWallet() {
  const connector = useWalletConnect();
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (connector.connected && connector.accounts?.[0]) {
      setAddress(connector.accounts[0]);
      setIsConnected(true);
    } else {
      setAddress(null);
      setIsConnected(false);
    }
  }, [connector.connected, connector.accounts]);

  const connect = async () => {
    try {
      await connector.connect();
    } catch (error) {
      console.error("Wallet connection error:", error);
    }
  };

  const disconnect = async () => {
    try {
      await connector.killSession();
    } catch (error) {
      console.error("Wallet disconnection error:", error);
    }
  };

  return {
    address,
    isConnected,
    connect,
    disconnect,
  };
}

