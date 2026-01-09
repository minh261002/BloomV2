/**
 * Generate OTP email template with modern design
 * @param otp - The OTP code to display
 * @param logoUrl - Optional absolute URL to the logo image (e.g., https://yourdomain.com/images/logo.svg)
 */
export function generateOTPEmailTemplate(
  otp: string,
  logoUrl?: string
): string {
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mã xác thực OTP</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07); overflow: hidden;">
                    
                    <!-- Header with gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            ${
                              logoUrl
                                ? `<img src="${logoUrl}" alt="Bloom Logo" style="height: 50px; width: auto; margin-bottom: 10px;" />`
                                : `<div style="margin: 0 auto 10px; display: inline-block;">
                                    <svg width="150" height="60" viewBox="0 0 230 92" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M160.331 46.6445C160.331 49.0508 159.904 51.3529 159.061 53.5612C158.227 55.7695 157.029 57.7174 155.477 59.3945C153.92 61.0612 152.04 62.3841 149.831 63.3529C147.633 64.3216 145.17 64.8112 142.436 64.8112C139.644 64.8112 137.123 64.3112 134.873 63.3112C132.623 62.3112 130.717 60.9779 129.165 59.3112C127.607 57.6445 126.399 55.707 125.54 53.4987C124.675 51.2904 124.248 49.0091 124.248 46.6445C124.248 44.2279 124.675 41.9154 125.54 39.707C126.399 37.4987 127.607 35.5612 129.165 33.8945C130.717 32.2174 132.623 30.8841 134.873 29.8945C137.123 28.8945 139.644 28.3945 142.436 28.3945C145.17 28.3945 147.633 28.8945 149.831 29.8945C152.04 30.8841 153.92 32.2174 155.477 33.8945C157.029 35.5612 158.227 37.4987 159.061 39.707C159.904 41.9154 160.331 44.2279 160.331 46.6445Z" fill="white"/>
                                        <path d="M177.114 63.9779V44.1237C177.114 43.2904 177.182 42.1966 177.323 40.832C177.458 39.457 177.812 38.1133 178.385 36.7904C178.968 35.457 179.864 34.3216 181.073 33.3737C182.281 32.4154 183.974 31.9362 186.156 31.9362C187.739 31.9362 188.958 32.2904 189.823 32.9987C190.682 33.6966 191.323 34.556 191.739 35.582C192.156 36.5977 192.396 37.6602 192.468 38.7695C192.536 39.8841 192.573 40.8529 192.573 41.6862V63.9779H198.489V44.1237C198.489 43.1133 198.578 41.8945 198.76 40.4779C198.953 39.0612 199.349 37.7279 199.948 36.4779C200.557 35.2174 201.427 34.1445 202.552 33.2695C203.687 32.3841 205.239 31.9362 207.198 31.9362C208.625 31.9362 209.781 32.1445 210.656 32.5612C211.541 32.9779 212.229 33.6133 212.718 34.457C213.218 35.2904 213.541 36.3112 213.698 37.5195C213.864 38.7279 213.948 40.1185 213.948 41.6862V63.9779H219.864V39.6654C219.864 38.5977 219.744 37.4049 219.51 36.082C219.286 34.7643 218.786 33.5352 218.01 32.3945C217.244 31.2591 216.135 30.306 214.677 29.5404C213.218 28.7799 211.281 28.3945 208.864 28.3945C208.166 28.3945 207.354 28.4674 206.427 28.6029C205.494 28.7435 204.515 29.0508 203.489 29.5195C202.474 29.9779 201.489 30.6549 200.531 31.5404C199.583 32.4154 198.765 33.5716 198.073 34.9987H197.573C197.291 34.2643 196.896 33.5143 196.385 32.7487C195.885 31.9883 195.239 31.2799 194.448 30.6237C193.656 29.9727 192.708 29.4362 191.614 29.0195C190.531 28.6029 189.224 28.3945 187.698 28.3945C187 28.3945 186.161 28.4779 185.177 28.6445C184.203 28.8008 183.229 29.1133 182.26 29.582C181.286 30.0404 180.369 30.6862 179.51 31.5195C178.646 32.3529 177.937 33.4466 177.385 34.7904H177.114V29.1445H171.177V63.9779H177.114Z" fill="white"/>
                                        <path d="M8.14746 15.2266H14.085V34.8724H14.3558C14.8141 33.6641 15.4235 32.6589 16.1891 31.8516C16.9652 31.0339 17.8402 30.3672 18.8141 29.8516C19.7829 29.3411 20.8141 28.9714 21.8975 28.7474C22.9912 28.513 24.0954 28.3932 25.21 28.3932C27.5433 28.3932 29.6787 28.8255 31.6266 29.6849C33.5693 30.5339 35.2516 31.7474 36.6683 33.3307C38.085 34.9141 39.1891 36.8255 39.9808 39.0599C40.7725 41.2839 41.1683 43.763 41.1683 46.4974C41.1683 49.2786 40.7725 51.7995 39.9808 54.0599C39.1891 56.3099 38.085 58.237 36.6683 59.8307C35.2516 61.4297 33.5693 62.6589 31.6266 63.5182C29.6787 64.3776 27.5433 64.8099 25.21 64.8099C19.6943 64.8099 16.0745 62.6536 14.3558 58.3307H14.085V63.9766H8.14746V15.2266Z" fill="white"/>
                                        <path d="M59.3298 15.2266H53.4131V63.9766H59.3298V15.2266Z" fill="white"/>
                                        <path d="M108.26 50.2617C114.255 50.2617 119.119 45.3971 119.119 39.4023C119.119 33.4023 114.255 28.543 108.26 28.543C102.26 28.543 97.4004 33.4023 97.4004 39.4023C97.4004 45.3971 102.26 50.2617 108.26 50.2617Z" fill="#ED0040"/>
                                        <path d="M93.1973 39.4023C99.1973 39.4023 104.057 34.5378 104.057 28.543C104.057 22.5482 99.1973 17.6836 93.1973 17.6836C87.2025 17.6836 82.3379 22.5482 82.3379 28.543C82.3379 34.5378 87.2025 39.4023 93.1973 39.4023Z" fill="#ED0040"/>
                                        <path d="M78.0674 50.2617C84.0622 50.2617 88.9268 45.3971 88.9268 39.4023C88.9268 33.4023 84.0622 28.543 78.0674 28.543C72.0674 28.543 67.208 33.4023 67.208 39.4023C67.208 45.3971 72.0674 50.2617 78.0674 50.2617Z" fill="#ED0040"/>
                                        <path d="M83.3125 66.5859C89.3073 66.5859 94.1719 61.7266 94.1719 55.7266C94.1719 49.7318 89.3073 44.8672 83.3125 44.8672C77.3125 44.8672 72.4531 49.7318 72.4531 55.7266C72.4531 61.7266 77.3125 66.5859 83.3125 66.5859Z" fill="#ED0040"/>
                                        <path d="M102.979 66.5859C108.974 66.5859 113.839 61.7266 113.839 55.7266C113.839 49.7318 108.974 44.8672 102.979 44.8672C96.9795 44.8672 92.1201 49.7318 92.1201 55.7266C92.1201 61.7266 96.9795 66.5859 102.979 66.5859Z" fill="#ED0040"/>
                                        <path d="M93.167 55.1797C99.318 55.1797 104.302 50.1901 104.302 44.0391C104.302 37.8828 99.318 32.8984 93.167 32.8984C87.0107 32.8984 82.0264 37.8828 82.0264 44.0391C82.0264 50.1901 87.0107 55.1797 93.167 55.1797Z" fill="white"/>
                                    </svg>
                                </div>`
                            }
                            <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                                Xác thực tài khoản của bạn
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">
                                Xin chào! 👋
                            </h2>
                            
                            <p style="margin: 0 0 24px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                Chúng tôi đã nhận được yêu cầu đăng nhập vào tài khoản của bạn. 
                                Sử dụng mã OTP bên dưới để hoàn tất quá trình đăng nhập.
                            </p>
                            
                            <!-- OTP Box -->
                            <table role="presentation" style="width: 100%; margin: 30px 0;">
                                <tr>
                                    <td align="center" style="background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border-radius: 12px; padding: 30px; border: 2px dashed #667eea;">
                                        <p style="margin: 0 0 10px; color: #64748b; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
                                            Mã xác thực của bạn
                                        </p>
                                        <div style="font-size: 40px; font-weight: 700; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                            ${otp}
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Important Notice -->
                            <div style="background-color: #fff7ed; border-left: 4px solid #f59e0b; padding: 16px 20px; margin: 24px 0; border-radius: 8px;">
                                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                                    <strong>⚠️ Lưu ý quan trọng:</strong><br/>
                                    Mã OTP này sẽ hết hạn sau <strong>10 phút</strong>. 
                                    Vui lòng không chia sẻ mã này với bất kỳ ai.
                                </p>
                            </div>
                            
                            <p style="margin: 24px 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                                Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này. 
                                Tài khoản của bạn vẫn an toàn.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 8px; color: #64748b; font-size: 14px;">
                                Cảm ơn bạn đã sử dụng dịch vụ! 🌸
                            </p>
                            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                                Email này được gửi tự động, vui lòng không trả lời.
                            </p>
                            
                            <!-- Social Links (optional) -->
                            <div style="margin-top: 20px;">
                                <p style="margin: 0 0 10px; color: #94a3b8; font-size: 12px;">
                                    © ${new Date().getFullYear()} Bloom. All rights reserved.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                </table>
                
                <!-- Mobile responsive text -->
                <table role="presentation" style="width: 600px; max-width: 100%; margin-top: 20px;">
                    <tr>
                        <td style="text-align: center; padding: 0 20px;">
                            <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.5;">
                                Nếu bạn gặp vấn đề khi xem email này, vui lòng kiểm tra lại trình duyệt email của bạn.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text version of OTP email for email clients that don't support HTML
 */
export function generateOTPEmailPlainText(otp: string): string {
  return `
Xin chào!

Chúng tôi đã nhận được yêu cầu đăng nhập vào tài khoản của bạn.
Sử dụng mã OTP bên dưới để hoàn tất quá trình đăng nhập.

Mã xác thực của bạn: ${otp}

⚠️ Lưu ý quan trọng:
- Mã OTP này sẽ hết hạn sau 10 phút
- Vui lòng không chia sẻ mã này với bất kỳ ai

Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
Tài khoản của bạn vẫn an toàn.

Cảm ơn bạn đã sử dụng dịch vụ! 🌸

---
© ${new Date().getFullYear()} Bloom. All rights reserved.
Email này được gửi tự động, vui lòng không trả lời.
  `.trim();
}
