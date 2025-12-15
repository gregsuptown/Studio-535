# Setup Guide: Cloudflare DNS + Google Cloud Run

This guide details how to point your domain **studio-535.com** (managed on Cloudflare) to your application running on **Google Cloud Run**.

## Overview
- **Frontend/Backend Host**: Google Cloud Run
- **DNS/Security**: Cloudflare
- **Target URL**: `https://studio-535-com-101215157510.us-east4.run.app`

---

## Step 1: Map Domain in Google Cloud Run

Google Cloud Run needs to know that `studio-535.com` is sending traffic to it.

1.  Log in to the **[Google Cloud Console](https://console.cloud.google.com/run)**.
2.  Go to **Cloud Run**.
3.  Select your service: `studio-535-com` (or the service connected to the URL provided).
4.  Click **Manage Custom Domains** (top bar).
5.  Click **Add Mapping**.
6.  Select **"Cloud Run Domain Mapping"**.
7.  Select the service to map to.
8.  Select a verified domain.
    *   *If `studio-535.com` is not verified:*
        *   Google will ask you to verify ownership via **Google Search Console**.
        *   Select **DNS TXT record** verification.
        *   Copy the generated `TXT` record (looks like `google-site-verification=...`).
        *   **Action**: Go to Cloudflare Dashboard > DNS > Add Record > Type: `TXT` > Name: `@` > Content: (Paste the code).
        *   Wait 1-2 minutes and click "Verify" in Google Console.
9.  Once verified, add the mapping for:
    *   `studio-535.com`
    *   `www.studio-535.com`
10. Google will generate a set of DNS records for you (A, AAAA, or CNAME). **Keep this window open.**

---

## Step 2: Configure Cloudflare DNS

Now we point Cloudflare to Google.

1.  Log in to the **[Cloudflare Dashboard](https://dash.cloudflare.com)**.
2.  Select your site: **studio-535.com**.
3.  Go to **DNS** > **Records**.
4.  **Delete** any existing A, AAAA, or CNAME records for `@` (root) and `www` to avoid conflicts.
5.  **Add the following records EXACTLY as shown:**

| Type | Name | Content / Target | Proxy Status |
|------|------|------------------|--------------|
| **A** | `@` | `216.239.32.21` | ✅ Proxied |
| **A** | `@` | `216.239.34.21` | ✅ Proxied |
| **A** | `@` | `216.239.36.21` | ✅ Proxied |
| **A** | `@` | `216.239.38.21` | ✅ Proxied |
| **AAAA** | `@` | `2001:4860:4802:32::15` | ✅ Proxied |
| **AAAA** | `@` | `2001:4860:4802:34::15` | ✅ Proxied |
| **AAAA** | `@` | `2001:4860:4802:36::15` | ✅ Proxied |
| **AAAA** | `@` | `2001:4860:4802:38::15` | ✅ Proxied |
| **CNAME** | `www` | `ghs.googlehosted.com` | ✅ Proxied |

6.  Save all records.

---

## Step 3: Configure Cloudflare SSL/TLS

Since Google Cloud Run provides its own HTTPS certificate, we must ensure Cloudflare encrypts the traffic all the way to Google.

1.  In Cloudflare, go to **SSL/TLS** > **Overview**.
2.  Set the encryption mode to **Full (Strict)**.
    *   *Why?* Your Cloud Run URL (`.run.app`) supports HTTPS. "Flexible" mode is dangerous here and can cause redirect loops.
3.  Go to **SSL/TLS** > **Edge Certificates**.
4.  Enable **Always Use HTTPS**.

---

## Step 4: Verification

1.  Wait about 5-10 minutes for DNS propagation.
2.  Visit `https://studio-535.com`.
3.  It should load your Cloud Run application securely.

---

## Troubleshooting

-   **"Too many redirects" error**: Ensure SSL mode is **Full (Strict)**, not "Flexible".
-   **404 Not Found**: Ensure you completed **Step 1** (Domain Mapping in Google Cloud). You cannot just point DNS to the `.run.app` domain without telling Google to expect the custom domain.
