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
