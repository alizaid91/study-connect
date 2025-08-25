const AI_URL = import.meta.env.VITE_AI_SERVICE_URL;
import { auth } from "../config/firebase";

/**
 * Utility to get Firebase Auth Bearer Token
 */
async function getAuthHeader(): Promise<{ Authorization: string }> {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export const apiService = {
  /**
   * Ask question to AI with streaming response
   */
  async askAI(content: string): Promise<{
    reader: ReadableStreamDefaultReader<Uint8Array>;
    decoder: TextDecoder;
  }> {
    const headers = await getAuthHeader();

    const response = await fetch(`${AI_URL}/ask`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: content }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch AI response");
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error("No stream reader available.");

    return { reader, decoder };
  },

  /**
   * Create a Razorpay subscription for a user (auth required)
   */
  async getSubscriptionDetails(userId: string): Promise<{
    subscriptionId: string;
    razorpayKey: string;
  }> {
    const headers = await getAuthHeader();

    const response = await fetch(
      `https://ad543adf137c.ngrok-free.app/api/razorpay/create-subscription`,
      {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create subscription");
    }

    return await response.json();
  },

  /**
   * Verify coupon code (auth required)
   */
  async verifyCoupon(coupon: string): Promise<{
    code: string;
    discountPercent?: number;
    message?: string;
  }> {
    const headers = await getAuthHeader();

    const response = await fetch(`${AI_URL}/verify-coupon`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ coupon }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to verify coupon");
    }

    return await data;
  },
};
