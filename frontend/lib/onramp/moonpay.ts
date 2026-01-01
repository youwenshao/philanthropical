/**
 * MoonPay Integration
 * Fallback fiat on-ramp provider
 */

export interface MoonPayConfig {
  apiKey: string;
  walletAddress: string;
  currencyCode?: string;
  baseCurrencyCode?: string;
  baseCurrencyAmount?: number;
  quoteCurrencyAmount?: number;
  paymentMethod?: string;
  colorCode?: string;
  lockAmount?: boolean;
  redirectURL?: string;
}

export interface MoonPayTransaction {
  id: string;
  status: "waitingPayment" | "pending" | "waitingAuthorization" | "failed" | "completed";
  createdAt: string;
  baseCurrencyAmount: number;
  baseCurrencyCode: string;
  quoteCurrencyAmount: number;
  quoteCurrencyCode: string;
  networkFeeAmount: number;
  networkFeeCurrency: string;
  extraFeeAmount: number;
  extraFeeCurrency: string;
  walletAddress: string;
  walletAddressTag?: string;
  failureReason?: string;
  redirectUrl?: string;
}

export class MoonPay {
  private config: MoonPayConfig;
  private baseUrl = "https://api.moonpay.com";

  constructor(config: MoonPayConfig) {
    this.config = config;
  }

  /**
   * Generate MoonPay widget URL
   */
  getWidgetUrl(): string {
    const params = new URLSearchParams({
      apiKey: this.config.apiKey,
      walletAddress: this.config.walletAddress,
      currencyCode: this.config.currencyCode || "usdc_polygon",
      baseCurrencyCode: this.config.baseCurrencyCode || "usd",
      ...(this.config.baseCurrencyAmount && {
        baseCurrencyAmount: this.config.baseCurrencyAmount.toString(),
      }),
      ...(this.config.quoteCurrencyAmount && {
        quoteCurrencyAmount: this.config.quoteCurrencyAmount.toString(),
      }),
      ...(this.config.paymentMethod && { paymentMethod: this.config.paymentMethod }),
      ...(this.config.colorCode && { colorCode: this.config.colorCode }),
      ...(this.config.lockAmount !== undefined && {
        lockAmount: this.config.lockAmount.toString(),
      }),
      ...(this.config.redirectURL && { redirectURL: this.config.redirectURL }),
    });

    return `https://buy.moonpay.com?${params.toString()}`;
  }

  /**
   * Open MoonPay widget in new window
   */
  open(): Window | null {
    const url = this.getWidgetUrl();
    return window.open(url, "MoonPay", "width=500,height=700");
  }

  /**
   * Get transaction status from MoonPay API
   */
  async getTransactionStatus(transactionId: string): Promise<MoonPayTransaction> {
    const response = await fetch(
      `${this.baseUrl}/v1/transactions/${transactionId}?apiKey=${this.config.apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch transaction status: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get supported currencies
   */
  async getSupportedCurrencies(): Promise<any[]> {
    const response = await fetch(
      `${this.baseUrl}/v3/currencies?apiKey=${this.config.apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch currencies: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get quote for currency conversion
   */
  async getQuote(
    baseCurrencyAmount: number,
    baseCurrencyCode: string,
    quoteCurrencyCode: string
  ): Promise<{
    quoteCurrencyAmount: number;
    quoteCurrencyCode: string;
    totalAmount: number;
    totalFee: number;
    networkFeeAmount: number;
    extraFeeAmount: number;
  }> {
    const response = await fetch(
      `${this.baseUrl}/v3/currencies/${quoteCurrencyCode}/quote?` +
        `apiKey=${this.config.apiKey}&` +
        `baseCurrencyAmount=${baseCurrencyAmount}&` +
        `baseCurrencyCode=${baseCurrencyCode}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch quote: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    // MoonPay uses HMAC SHA256 for webhook verification
    // This should be implemented server-side for security
    // This is a placeholder for client-side reference
    return true; // Actual implementation should verify HMAC
  }
}



