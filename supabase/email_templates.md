# UHASMART - Production Email Templates & Setup Guide

This guide contains the official, mobile-responsive HTML email templates for all authentication flows in **UHASMART** (Supabase Auth).

Each template is designed with:
- Professional UHASMART campus branding (Ho, Ghana)
- High-visibility Call-To-Action (CTA) buttons
- Mobile & desktop compatibility across Gmail, iOS Mail, and Outlook
- **Dedicated Spam/Junk notification callout** prompting users to mark emails as "Not Spam" so they never miss student orders, chat alerts, or seller notifications.

---

## How to Set Up in Supabase

1. Open your **[Supabase Dashboard](https://supabase.com/dashboard/project/fjhlczvwmlvtxdxcnhxi)**.
2. In the left sidebar, navigate to **Authentication** $\rightarrow$ **Email Templates**.
3. Select the template tab, paste the **Subject** and **HTML Body** from below, and click **Save**.

---

## 1. Confirm Sign Up (Signup Verification)

- **Supabase Tab:** `Confirm signup`
- **Subject:** `Verify your student account on UHASMART`
- **HTML Body:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your UHASMART Account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #2563eb; padding: 28px 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">UHASMART</h1>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #bfdbfe; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                Campus &amp; Town Marketplace &bull; Ho, Ghana
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #0f172a;">Welcome to UHASMART! 🎓</h2>
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Thank you for creating an account on <strong>UHASMART</strong> — the verified student marketplace for the University of Health and Allied Sciences (UHAS) and Ho.
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Please click the button below to verify your email address and activate your account.
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 10px 0 25px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 32px; border-radius: 14px; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8;">
                If the button above does not work, copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 24px 0; font-size: 11px; color: #2563eb; word-break: break-all;">
                {{ .ConfirmationURL }}
              </p>

              <!-- SPAM NOTIFICATION BOX -->
              <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 14px; padding: 16px; margin: 20px 0 10px 0;">
                <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 800; color: #92400e;">
                  ⚠️ Can't find future orders or chat notifications?
                </p>
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #78350f;">
                  If this email arrived in your <strong>Spam</strong> or <strong>Junk</strong> folder, please tap <strong>&quot;Report not spam&quot;</strong> or move it to your <strong>Primary inbox</strong>. This ensures you receive instant WhatsApp buyer leads, message alerts, and seller updates.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; color: #64748b;">
                UHASMART &bull; Sokode &bull; Trafalgar &bull; Dave &bull; Ho, Volta Region
              </p>
              <p style="margin: 0; font-size: 10px; color: #94a3b8;">
                You received this email because an account was registered with this email on UHASMART.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 2. Reset Password

- **Supabase Tab:** `Reset Password`
- **Subject:** `Reset your UHASMART account password`
- **HTML Body:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #2563eb; padding: 28px 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">UHASMART</h1>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #bfdbfe; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                Account Security Notification
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #0f172a;">Password Reset Request 🔐</h2>
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                We received a request to reset the password for your UHASMART student account.
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Click the button below to choose a secure new password:
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 10px 0 25px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 32px; border-radius: 14px; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8;">
                If the button above does not work, copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 20px 0; font-size: 11px; color: #2563eb; word-break: break-all;">
                {{ .ConfirmationURL }}
              </p>

              <div style="background-color: #f1f5f9; border-radius: 12px; padding: 14px 16px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                  🔒 <strong>Didn't request this?</strong> If you did not make this request, your account is still secure. You can safely ignore this email.
                </p>
              </div>

              <!-- SPAM NOTIFICATION BOX -->
              <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 14px; padding: 16px; margin: 10px 0;">
                <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 800; color: #92400e;">
                  ⚠️ Found this in your Spam / Junk folder?
                </p>
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #78350f;">
                  Please mark this message as <strong>&quot;Not Spam&quot;</strong>. This ensures critical security notifications and student buyer chats reach your main inbox.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; color: #64748b;">
                UHASMART &bull; Ho, Volta Region, Ghana
              </p>
              <p style="margin: 0; font-size: 10px; color: #94a3b8;">
                Protecting student commerce across all UHAS campuses.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 3. Magic Link (One-Click Sign In)

- **Supabase Tab:** `Magic Link`
- **Subject:** `Your login link for UHASMART`
- **HTML Body:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Magic Link</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <tr>
            <td style="background-color: #2563eb; padding: 28px 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">UHASMART</h1>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #bfdbfe; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                One-Click Instant Login
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #0f172a;">Sign in with one tap ⚡</h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Click the button below to sign into your UHASMART account without entering a password:
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 10px 0 25px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 32px; border-radius: 14px; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);">
                      Sign In to UHASMART
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8;">Fallback link:</p>
              <p style="margin: 0 0 20px 0; font-size: 11px; color: #2563eb; word-break: break-all;">
                {{ .ConfirmationURL }}
              </p>

              <!-- SPAM NOTIFICATION BOX -->
              <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 14px; padding: 16px; margin: 10px 0;">
                <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 800; color: #92400e;">
                  ⚠️ Check your Spam / Junk folder
                </p>
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #78350f;">
                  If this email arrived in your Spam folder, please mark it as <strong>&quot;Not Spam&quot;</strong> so your login links and chat alerts always arrive in your primary inbox.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0; font-size: 10px; color: #94a3b8;">
                &copy; UHASMART &bull; Ho, Ghana. This link will expire shortly for your security.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 4. Change Email Address

- **Supabase Tab:** `Change Email Address`
- **Subject:** `Confirm change of email on UHASMART`
- **HTML Body:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Email Change</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <tr>
            <td style="background-color: #2563eb; padding: 28px 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">UHASMART</h1>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #bfdbfe; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                Email Change Request
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #0f172a;">Confirm Your New Email Address ✉️</h2>
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                A request was made to update your email address on UHASMART. Click the button below to confirm this change:
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 10px 0 25px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 32px; border-radius: 14px; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);">
                      Confirm Email Address
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8;">Fallback link:</p>
              <p style="margin: 0 0 20px 0; font-size: 11px; color: #2563eb; word-break: break-all;">
                {{ .ConfirmationURL }}
              </p>

              <!-- SPAM NOTIFICATION BOX -->
              <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 14px; padding: 16px; margin: 10px 0;">
                <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 800; color: #92400e;">
                  ⚠️ Check your Spam / Junk folder
                </p>
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #78350f;">
                  Please mark this email as <strong>&quot;Not Spam&quot;</strong> so you never miss student orders, chat alerts, or security updates.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0; font-size: 10px; color: #94a3b8;">
                &copy; UHASMART &bull; Ho, Volta Region, Ghana.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 5. Seller Subscription Renewal Reminder

- **Type:** Transactional Business Email (Automated via `/api/email/subscription`)
- **Default Subject:** `⚠️ Action Required: Your UHASMART Seller Subscription is Expiring Soon`
- **Triggered When:** 5 days before seller trial/plan expires, 1 day before expiration, or when subscription expires.
- **HTML Template:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subscription Renewal Notice</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #2563eb; padding: 28px 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">UHASMART</h1>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #bfdbfe; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                Seller Subscription Notice
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <div style="display: inline-block; background-color: #fffbeb; color: #b45309; font-size: 11px; font-weight: 800; padding: 5px 14px; border-radius: 999px; border: 1px solid #fde68a; margin-bottom: 14px;">
                ⏳ EXPIRING SOON
              </div>

              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #0f172a;">
                Keep Your Campus Shop Open! 🛒
              </h2>

              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Your seller privileges on <strong>UHASMART</strong> are expiring soon. Renew today with Mobile Money so your product listings and promotional flyers stay live and visible to thousands of UHAS students without interruption.
              </p>

              <!-- Benefits List -->
              <div style="background-color: #f1f5f9; border-radius: 14px; padding: 18px 20px; margin: 0 0 20px 0;">
                <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: 800; color: #0f172a;">
                  Why Stay Active on UHASMART?
                </p>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.7; color: #334155;">
                  <li><strong>Instant WhatsApp Leads:</strong> Students message you directly with 1 tap.</li>
                  <li><strong>Multiple Pictures &amp; Flyers:</strong> Post up to 20 photos or promotional posters.</li>
                  <li><strong>Ho-Wide Reach:</strong> Sokode, Trafalgar, Dave, and all UHAS campuses.</li>
                  <li><strong>Verified Seller Trust:</strong> Build your reputation with student ratings.</li>
                </ul>
              </div>

              <!-- Available Plans -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; margin-bottom: 24px; overflow: hidden;">
                <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                  <th style="padding: 10px 16px; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b;">Plan</th>
                  <th style="padding: 10px 16px; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b;">Duration</th>
                  <th style="padding: 10px 16px; text-align: right; font-size: 11px; text-transform: uppercase; color: #64748b;">Price</th>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 16px; font-size: 13px; font-weight: 700; color: #0f172a;">1 Month Standard</td>
                  <td style="padding: 12px 16px; font-size: 12px; color: #64748b;">30 Days</td>
                  <td style="padding: 12px 16px; font-size: 13px; font-weight: 800; color: #2563eb; text-align: right;">GHS 30</td>
                </tr>
                <tr style="background-color: #eff6ff; border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 16px; font-size: 13px; font-weight: 800; color: #1e40af;">
                    1 Semester (4 Mos) <span style="font-size: 10px; background-color: #2563eb; color: #fff; padding: 2px 6px; border-radius: 6px;">POPULAR</span>
                  </td>
                  <td style="padding: 12px 16px; font-size: 12px; color: #1e40af; font-weight: 600;">120 Days</td>
                  <td style="padding: 12px 16px; font-size: 14px; font-weight: 900; color: #1e40af; text-align: right;">GHS 80</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; font-weight: 700; color: #0f172a;">1 Full Year Pro</td>
                  <td style="padding: 12px 16px; font-size: 12px; color: #64748b;">365 Days</td>
                  <td style="padding: 12px 16px; font-size: 13px; font-weight: 800; color: #2563eb; text-align: right;">GHS 180</td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 5px 0 20px 0;">
                    <a href="https://uhasmart.com/seller" style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 34px; border-radius: 14px; box-shadow: 0 4px 10px rgba(22, 163, 74, 0.25);">
                      Renew Subscription with Mobile Money &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- SPAM NOTIFICATION CALLOUT -->
              <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 14px; padding: 16px; margin: 15px 0 5px 0;">
                <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 800; color: #92400e;">
                  ⚠️ Found this in Spam or Junk?
                </p>
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #78350f;">
                  Please mark this email as <strong>&quot;Not Spam&quot;</strong> or move it to your <strong>Primary inbox</strong>. This ensures critical seller renewal alerts and student buyer messages arrive reliably.
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; color: #64748b;">
                UHASMART &bull; Sokode &bull; Dave &bull; Trafalgar &bull; Ho, Volta Region, Ghana
              </p>
              <p style="margin: 0; font-size: 10px; color: #94a3b8;">
                You are receiving this because you registered as a student business owner on UHASMART.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 6. Subscription Payment Confirmation & Official Receipt

- **Type:** Transactional Business Email (Automated via `/api/email/subscription`)
- **Default Subject:** `Payment Confirmed: Your UHASMART Seller Subscription is Active! 🎉`
- **Triggered When:** Immediately upon Mobile Money payment approval (MTN MoMo, Telecel Cash, AT Money).
- **HTML Template:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt - UHASMART</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #2563eb; padding: 28px 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">UHASMART</h1>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #bfdbfe; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                Official Payment Receipt &bull; Seller Subscription
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <div style="display: inline-block; background-color: #ecfdf5; color: #059669; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 999px; border: 1px solid #a7f3d0; margin-bottom: 12px;">
                ✅ Payment Verified &bull; Active
              </div>

              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #0f172a;">
                Thank You for Your Payment! 🎉
              </h2>

              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Your Mobile Money payment has been successfully confirmed. Your seller account is now fully active, and all your product listings and promotional flyers are live for students across UHAS and Ho!
              </p>

              <!-- Payment Receipt Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; margin: 0 0 24px 0; overflow: hidden;">
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Receipt Summary</span>
                  </td>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; text-align: right;">
                    <span style="font-size: 11px; font-weight: 800; color: #059669;">CONFIRMED</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; font-size: 13px; color: #64748b;">Subscription Plan:</td>
                  <td style="padding: 12px 20px; font-size: 13px; font-weight: 800; color: #0f172a; text-align: right;">1 Semester (4 Months)</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; font-size: 13px; color: #64748b;">Amount Paid:</td>
                  <td style="padding: 12px 20px; font-size: 16px; font-weight: 900; color: #2563eb; text-align: right;">GHS 80.00</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; font-size: 13px; color: #64748b;">Payment Method:</td>
                  <td style="padding: 12px 20px; font-size: 13px; font-weight: 700; color: #0f172a; text-align: right;">MTN Mobile Money</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; font-size: 13px; color: #64748b;">Reference ID:</td>
                  <td style="padding: 12px 20px; font-size: 12px; font-family: monospace; font-weight: 700; color: #0f172a; text-align: right;">MOMO-1729130000-XYZ</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; font-size: 13px; color: #64748b;">Subscription Valid Until:</td>
                  <td style="padding: 12px 20px; font-size: 13px; font-weight: 800; color: #059669; text-align: right;">17 Feb 2027</td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 5px 0 20px 0;">
                    <a href="https://uhasmart.com/seller" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 32px; border-radius: 14px; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);">
                      Manage My Store &amp; Listings &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- SPAM NOTIFICATION CALLOUT -->
              <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 14px; padding: 16px; margin: 15px 0 5px 0;">
                <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 800; color: #92400e;">
                  ⚠️ Can't find customer order alerts or messages?
                </p>
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #78350f;">
                  If this email arrived in your <strong>Spam</strong> or <strong>Junk</strong> folder, please tap <strong>&quot;Report not spam&quot;</strong> or move it to your <strong>Primary inbox</strong>. This ensures you never miss student buyers messaging you about your products.
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; color: #64748b;">
                UHASMART &bull; Sokode &bull; Dave &bull; Trafalgar &bull; Ho, Volta Region, Ghana
              </p>
              <p style="margin: 0; font-size: 10px; color: #94a3b8;">
                This is an automated payment receipt. Keep this email for your records.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 7. Client Vercel Environment Variables for Automated Emails

To enable automated transactional emails (payment receipts and renewal reminders), add the following environment variables to your **Vercel Project Settings** $\rightarrow$ **Environment Variables**:

| Variable | Recommended Value | Notes |
| :--- | :--- | :--- |
| `SMTP_USER` | `uhasmartofficial@gmail.com` | Client's official Gmail account |
| `SMTP_PASS` | `xxxx xxxx xxxx xxxx` | 16-character Google App Password (spaces will be automatically stripped) |
| `SMTP_HOST` | `smtp.gmail.com` | Google SMTP server |
| `SMTP_PORT` | `465` | SSL Port |
| `NEXT_PUBLIC_SITE_URL` | `https://uhasmart.com` | Your live custom domain or Vercel URL |

