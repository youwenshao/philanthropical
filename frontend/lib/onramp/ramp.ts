/**
 * Ramp Network Integration
 * Primary fiat on-ramp provider
 */

export interface RampConfig {
  hostApiKey: string;
  hostAppName: string;
  hostLogoUrl?: string;
  defaultAsset?: string;
  userAddress: string;
  userEmailAddress?: string;
  selectedCountryCode?: string;
  defaultFlow?: "ONRAMP" | "OFFRAMP";
  swapAsset?: string;
  swapAmount?: string;
  enabledFlows?: string[];
  url?: string;
}

export interface RampTransaction {
  id: string;
  status: "INITIALIZED" | "PAYMENT_STARTED" | "PAYMENT_IN_PROGRESS" | "PAYMENT_EXECUTING" | "PAYMENT_FAILED" | "FINISHED" | "RELEASED" | "EXPIRED";
  createdAt: string;
  cryptoAmount: string;
  cryptoAsset: string;
  fiatAmount: string;
  fiatCurrency: string;
  assetExchangeRate: string;
  networkFee: string;
  endTime?: string;
}

export class RampNetwork {
  private config: RampConfig;
  private widget: any = null;

  constructor(config: RampConfig) {
    this.config = config;
  }

  /**
   * Initialize Ramp Network widget
   */
  async initialize(): Promise<void> {
    if (typeof window === "undefined") return;

    try {
      // Dynamically load Ramp Network SDK
      const script = document.createElement("script");
      script.src = "https://cdn.ramp.network/v2/bundle.js";
      script.async = true;
      document.head.appendChild(script);

      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });

      // Ramp SDK is loaded dynamically
      const RampSDK = (window as any).RampInstantSDK;
      if (RampSDK) {
        this.widget = new RampSDK({
          hostAppName: this.config.hostAppName,
          hostLogoUrl: this.config.hostLogoUrl,
          hostApiKey: this.config.hostApiKey,
          variant: "auto",
          defaultAsset: this.config.defaultAsset || "MATIC_POLYGON",
          userAddress: this.config.userAddress,
          userEmailAddress: this.config.userEmailAddress,
          selectedCountryCode: this.config.selectedCountryCode,
          defaultFlow: this.config.defaultFlow || "ONRAMP",
          swapAsset: this.config.swapAsset,
          swapAmount: this.config.swapAmount,
          enabledFlows: this.config.enabledFlows || ["ONRAMP"],
          url: this.config.url || "https://buy.ramp.network",
        });
      }
    } catch (error) {
      console.error("Failed to initialize Ramp Network:", error);
      throw error;
    }
  }

  /**
   * Show Ramp widget
   */
  show(): void {
    if (!this.widget) {
      throw new Error("Ramp widget not initialized. Call initialize() first.");
    }
    this.widget.show();
  }

  /**
   * Hide Ramp widget
   */
  hide(): void {
    if (this.widget) {
      this.widget.hide();
    }
  }

  /**
   * Subscribe to transaction events
   */
  on(event: string, callback: (data: any) => void): void {
    if (!this.widget) {
      throw new Error("Ramp widget not initialized.");
    }
    this.widget.on(event, callback);
  }

  /**
   * Get transaction status from Ramp API
   */
  async getTransactionStatus(transactionId: string): Promise<RampTransaction> {
    const response = await fetch(
      `https://api.ramp.network/api/host/transactions/${transactionId}`,
      {
        headers: {
          "Authorization": `Bearer ${this.config.hostApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch transaction status: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Determine KYC tier based on transaction amount
   */
  getKYCTier(amountUSD: number): "tier1" | "tier2" | "tier3" {
    if (amountUSD < 1000) {
      return "tier1"; // Email verification only
    } else if (amountUSD < 10000) {
      return "tier2"; // ID verification required
    } else {
      return "tier3"; // Enhanced due diligence
    }
  }
}

