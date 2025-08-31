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
  //health check
  async healthCheck(): Promise<{ status: string }> {
    const headers = await getAuthHeader();
    const response = await fetch(`${AI_URL}/`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error("Failed to check API health");
    }

    return await response.text().then((text) => ({ status: text }));
  },

  /**
   * Ask question to AI with streaming response
   */
  async askAI(content: string): Promise<{
    reader: ReadableStreamDefaultReader<Uint8Array>;
    decoder: TextDecoder;
  }> {
    const headers = await getAuthHeader();

    const response = await fetch(`${AI_URL}/rag/ask`, {
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
   * @param coupon - The coupon code to verify
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

  /**
   * Verify Educator Invite Code (no auth required)
   * @param inviteCode - The invite code to verify
   */

  async verifyEducatorInvite(inviteCode: string): Promise<{
    valid: boolean;
    message?: string;
  }> {
    const response = await fetch(`${AI_URL}/verify-educator-invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inviteCode }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to verify educator invite");
    }

    return await data;
  },

  /**
   * Validate username (no auth required)
   * @param username - The username to validate
   */
  async validateUsername(username: string): Promise<{
    success: boolean;
    data?: { username: string; available: boolean };
    errors?: Array<{ field: string; code: string; message: string }>;
  }> {
    const response = await fetch(`${AI_URL}/validate-username`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });

    const data = await response.json();
    return data;
  },

  async getUploadUrl(fileName: string, fileType: string) {
    const headers = await getAuthHeader();
    const res = await fetch(`${AI_URL}/get-resource-upload-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ fileName, fileType }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to get upload URL");
    return data; // { uploadUrl, resourceKey }
  },

  async saveResource(metadata: any) {
    const headers = await getAuthHeader();
    const res = await fetch(`${AI_URL}/save-resource`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(metadata),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to save resource");
    return data;
  },

  /**
   * Get uploader details by username (no auth required)
   * @param username - The username to fetch details for
   */
  async getUploaderDetails(username: string): Promise<{
    success: boolean;
    data?: {
      username: string;
      fullName: string | null;
      avatarUrl: string | null;
    };
    error?: { field: string; code: string; message: string };
    errors?: Array<{ field: string; code: string; message: string }>;
  }> {
    const headers = await getAuthHeader();
    const response = await fetch(
      `${AI_URL}/uploader-details?username=${encodeURIComponent(username)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      }
    );

    const data = await response.json();
    return data;
  },
};
