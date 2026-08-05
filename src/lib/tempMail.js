const BASE_URL = "https://api.mail.tm";

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`mail.tm ${response.status}: ${text.slice(0, 200)}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

function parseAddress(address) {
  const [login, domain] = address.split("@");
  return { login, domain };
}

export async function createTempMailbox() {
  const domains = await request("/domains");
  const domainList = Array.isArray(domains)
    ? domains
    : domains?.["hydra:member"] ?? [];
  const domain = domainList?.[0]?.domain;
  if (!domain) throw new Error("No temporary mail domain available.");

  const stamp = Math.random().toString(36).slice(2, 10);
  const address = `ishop_${stamp}@${domain}`;
  const password = `Mail${stamp}A${Date.now().toString().slice(-4)}!`;

  await request("/accounts", {
    method: "POST",
    body: { address, password },
  });
  const { token } = await request("/token", {
    method: "POST",
    body: { address, password },
  });

  return {
    address,
    password,
    token,
    ...parseAddress(address),
  };
}

export async function getMessages({ token }) {
  const data = await request(
    `/messages?page=1`,
    { token },
  );
  return Array.isArray(data) ? data : data?.["hydra:member"] ?? [];
}

export async function readMessage(id, token) {
  return request(`/messages/${id}`, { token });
}

const TOKEN_PATTERN = /(?:token|verificationToken|verifyToken)=([A-Za-z0-9._-]+)/i;

export function extractVerifyToken(html) {
  if (!html) return "";
  const match = String(html).match(TOKEN_PATTERN);
  if (match?.[1]) return match[1];

  const jwtMatch = String(html).match(
    /[A-Za-z0-9-_]{20,}\.[A-Za-z0-9-_]{20,}\.[A-Za-z0-9-_]{10,}/,
  );
  return jwtMatch?.[0] ?? "";
}

export async function waitForVerificationEmail(mailbox, { timeoutMs = 90000 } = {}) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const messages = await getMessages(mailbox);
      if (messages.length > 0) {
        for (const message of messages) {
          const full = await readMessage(message.id, mailbox.token);
          const html = full?.html?.length
            ? full.html
            : full?.text || "";
          const token = extractVerifyToken(html);
          if (token) {
            return { token, subject: full?.subject, from: full?.from };
          }
        }
      }
    } catch {
      // transient mail.tm error — keep polling until timeout
    }
    await new Promise((resolve) => setTimeout(resolve, 4000));
  }
  throw new Error(
    "The verification email did not arrive in time. Click “Open temp-mail inbox” to check manually, or press “Resend verification email”.",
  );
}
