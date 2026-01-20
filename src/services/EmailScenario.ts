import moment from "moment";

interface OTPData {
    name: string,
    email: string,
    otp_code: string,
    expiry_time?: string,
    purpose?: string
}

function sendOTP(payload: OTPData) {
    const fullName = payload.name || 'Pengguna';
    const otpCode = payload.otp_code;
    const purpose = payload.purpose || 'verifikasi akun';
    const expiryTime = payload.expiry_time || '10 menit';

    const subject = `Kode OTP Anda - ${otpCode}`;
    const body = `
       <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Kode OTP</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                    color: #333333;
                }
                .email-container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    color: #333333;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .email-header {
                    background-color: #0a0a0a;
                    padding: 20px;
                    text-align: center;
                    color: #ffffff;
                }
                .email-header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .email-body {
                    padding: 30px;
                    color: #333333;
                }
                .email-body h2 {
                    margin-bottom: 20px;
                }
                .email-body p {
                    font-size: 16px;
                    line-height: 1.6;
                    margin: 0 0 15px;
                    color: #333333;
                }
                .otp-container {
                    text-align: center;
                    margin: 30px 0;
                    padding: 20px;
                    background-color: #f8fafc;
                    border-radius: 8px;
                    border: 2px dashed #0a0a0a;
                }
                .otp-code {
                    font-size: 32px;
                    font-weight: bold;
                    color: #0a0a0a;
                    letter-spacing: 8px;
                    margin: 10px 0;
                }
                .warning-box {
                    background-color: #fef3cd;
                    border-left: 4px solid #f59e0b;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 4px;
                }
                .warning-box p {
                    margin: 0;
                    color: #92400e;
                    font-size: 14px;
                }
                .email-footer {
                    text-align: center;
                    padding: 20px;
                    background-color: #f8fafc;
                    color: #666666;
                    font-size: 12px;
                }
                .steps {
                    margin: 20px 0;
                }
                .step {
                    display: flex;
                    align-items: flex-start;
                    margin-bottom: 15px;
                }
                .step-number {
                    background-color: #0a0a0a;
                    color: white;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    margin-right: 10px;
                    font-size: 14px;
                }

            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">
                    <h1>Kode Verifikasi OTP</h1>
                </div>
                <div class="email-body">
                    <h2>Halo ${fullName},</h2>
                    
                    <p>Kami menerima permintaan untuk ${purpose} yang terkait dengan akun Anda. Gunakan kode OTP berikut untuk melanjutkan:</p>
                    
                    <div class="otp-container">
                        <div class="otp-code">${otpCode}</div>
                        <p>Kode ini berlaku selama <strong>${expiryTime}</strong></p>
                    </div>

                    <div class="warning-box">
                        <p><strong>Penting:</strong> Jangan bagikan kode OTP ini kepada siapapun, termasuk pihak yang mengaku dari tim kami. Kode ini bersifat rahasia dan hanya untuk Anda gunakan.</p>
                    </div>

                    <p>Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini atau hubungi tim dukungan kami.</p>
                    
                    <p>Terima kasih,<br><strong>Tim Support</strong></p>
                </div>
                <div class="email-footer">
                    <p>Email ini dikirim secara otomatis. Mohon tidak membalas email ini.</p>
                    <p>&copy; ${new Date().getFullYear()} Aplikasi Kami. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return {
        subject,
        body,
    };
}

function sendWelcomeEmail(payload: { name: string; email: string }) {
    const fullName = payload.name || 'Pengguna';

    const subject = `Selamat Datang di Aplikasi Kami!`;
    const body = `
       <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Selamat Datang</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                    color: #333333;
                }
                .email-container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    color: #333333;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .email-header {
                    background-color: #0A0A0A;
                    padding: 30px 20px;
                    text-align: center;
                    color: #ffffff;
                }
                .email-header h1 {
                    margin: 0;
                    font-size: 28px;
                }
                .email-body {
                    padding: 30px;
                    color: #333333;
                }
                .email-body h2 {
                    margin-bottom: 20px;
                }
                .email-body p {
                    font-size: 16px;
                    line-height: 1.6;
                    margin: 0 0 15px;
                    color: #333333;
                }
                .features {
                    margin: 25px 0;
                }
                .feature {
                    display: flex;
                    align-items: center;
                    margin-bottom: 15px;
                }
                .feature-icon {
                    background-color: #0A0A0A;
                    color: white;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 15px;
                    flex-shrink: 0;
                }
                .email-footer {
                    text-align: center;
                    padding: 20px;
                    background-color: #f8fafc;
                    color: #666666;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">
                    <h1>Selamat Datang</h1>
                </div>
                <div class="email-body">
                    <h2>Halo ${fullName},</h2>
                    
                    <p>Selamat! Akun Anda telah berhasil dibuat. Sekarang Anda dapat menikmati berbagai fitur eksklusif kami:</p>
                    
                    <div class="features">
                        <div class="feature">
                            <div class="feature-icon">✓</div>
                            <div>Akses ke semua fitur aplikasi</div>
                        </div>
                        <div class="feature">
                            <div class="feature-icon">✓</div>
                            <div>Kemudahan dalam bertransaksi</div>
                        </div>
                        <div class="feature">
                            <div class="feature-icon">✓</div>
                            <div>Notifikasi real-time</div>
                        </div>
                        <div class="feature">
                            <div class="feature-icon">✓</div>
                            <div>Dukungan customer service 24/7</div>
                        </div>
                    </div>

                    <p>Kami sangat senang memiliki Anda sebagai bagian dari komunitas kami. Jika Anda memiliki pertanyaan atau membutuhkan bantuan, jangan ragu untuk menghubungi tim support kami.</p>
                    
                    <p>Selamat menikmati pengalaman menggunakan aplikasi kami!</p>
                    
                    <p>Salam hangat,<br><strong>Tim Support</strong></p>
                </div>
                <div class="email-footer">
                    <p>Email ini dikirim secara otomatis. Mohon tidak membalas email ini.</p>
                    <p>&copy; ${new Date().getFullYear()} Aplikasi Kami. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return {
        subject,
        body,
    };
}

function sendPasswordReset(payload: { name: string; email: string; reset_link: string; expiry_time: string }) {
    const fullName = payload.name || 'Pengguna';

    const subject = `Permintaan Reset Password`;
    const body = `
       <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Password</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                    color: #333333;
                }
                .email-container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    color: #333333;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .email-header {
                    background-color: #0A0A0A;
                    padding: 20px;
                    text-align: center;
                    color: #ffffff;
                }
                .email-header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .email-body {
                    padding: 30px;
                    color: #333333;
                }
                .email-body h2 {
                    color: #0A0A0A;
                    margin-bottom: 20px;
                }
                .email-body p {
                    font-size: 16px;
                    line-height: 1.6;
                    margin: 0 0 15px;
                    color: #333333;
                }
                .reset-button {
                    display: inline-block;
                    margin: 20px 0;
                    padding: 12px 30px;
                    background-color: #0A0A0A;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                }
                .reset-button:link, .reset-button:visited, .reset-button:hover, .reset-button:active {
                    color: white !important;
                }
                .warning-box {
                    background-color: #fef3cd;
                    border-left: 4px solid #f59e0b;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 4px;
                }
                .warning-box p {
                    margin: 0;
                    color: #92400e;
                    font-size: 14px;
                }
                .email-footer {
                    text-align: center;
                    padding: 20px;
                    background-color: #f8fafc;
                    color: #666666;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">
                    <h1>Reset Password</h1>
                </div>
                <div class="email-body">
                    <h2>Halo ${fullName},</h2>
                    
                    <p>Kami menerima permintaan untuk mereset password akun Anda. Jika Anda yang melakukan permintaan ini, silakan klik tombol di bawah untuk membuat password baru:</p>
                    
                    <div style="text-align: center;">
                        <a href="${payload.reset_link}" class="reset-button">Reset Password</a>
                    </div>

                    <p>Link reset password akan kedaluwarsa dalam <strong>${payload.expiry_time}</strong>.</p>

                    <div class="warning-box">
                        <p><strong>Penting:</strong> Jika Anda tidak merasa melakukan permintaan reset password, segera abaikan email ini dan periksa keamanan akun Anda.</p>
                    </div>

                    <p>Terima kasih,<br><strong>Tim Support</strong></p>
                </div>
                <div class="email-footer">
                    <p>Email ini dikirim secara otomatis. Mohon tidak membalas email ini.</p>
                    <p>&copy; ${new Date().getFullYear()} Aplikasi Kami. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return {
        subject,
        body,
    };
}

function sendApproveGrant(payload: { first_name: string; last_name: string; grant_id: number; book_title: string; target_language: string;}) {
    const fullName = ((payload.first_name[0].toUpperCase() + payload.first_name.slice(1)) + " " + (payload.last_name[0].toUpperCase() + payload.last_name.slice(1))) || 'User';

    const subject = `Application Grant Response`;
    const body = `
        <!DOCTYPE html>
        <html lang="id">

        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Grant Application Response</title>
        <style>
            body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333333;
            }

            .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            color: #333333;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }

            .email-header {
            background-color: #0A0A0A;
            padding: 20px;
            text-align: center;
            color: #ffffff;
            }

            .email-header h1 {
            margin: 0;
            font-size: 24px;
            }

            .email-body {
            padding: 30px;
            color: #333333;
            }

            .email-body h2 {
            color: #0A0A0A;
            margin-bottom: 20px;
            }

            .email-body p {
            font-size: 16px;
            line-height: 1.6;
            margin: 0 0 15px;
            color: #333333;
            }

            .reset-button {
            display: inline-block;
            margin: 20px 0;
            padding: 12px 30px;
            background-color: #0A0A0A;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            }

            .warning-box {
            background-color: #fef3cd;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            }

            .warning-box p {
            margin: 0;
            color: #92400e;
            font-size: 14px;
            }

            .message-box {
            background-color: #f1f1f1;
            padding: 15px;
            margin: 4px 0 24px 0;
            border-radius: 4px;
            }

            .message-box p {
            margin: 0;
            font-size: 14px;
            }

            .message-title {
            margin: 0 !important;
            }

            .email-footer {
            text-align: center;
            padding: 20px;
            background-color: #f8fafc;
            color: #666666;
            font-size: 12px;
            }

            table, tr, td, th {
            padding: 0;
            }

            td {
            font-size: 14px;
            }
            
            .table-header {
            text-align: start;
            font-size: 14px;
            margin-right: 8px;
            padding-right: 8px;
            }
        </style>
        </head>

        <body>
        <div class="email-container">
            <div class="email-header">
            <h1>Grant Application Response</h1>
            </div>
            <div class="email-body">
            <h2>Hello ${fullName},</h2>

            <p>
                With this email, we would like to inform you for the <strong>approval</strong> of your application, with the following details:
            </p>

            <div class="message-box">
                <table>
                <tr>
                    <th class="table-header">Book Title</th>
                    <td>${payload.book_title}</td>
                </tr>
                <tr>
                    <th class="table-header">Target Language</th>
                    <td>${payload.target_language}</td>
                </tr>
                </table>
            </div>

            <p>
                We will reach out to you as soon as possible. Thank you for your application, and we wish you continued success.
            </p>

            <p>
                Best Regards,<br>
                <strong>Read Indonesia Support Team</strong>
            </p>
            </div>
            <div class="email-footer">
            <p>This email is sent automatically. Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Read Indonesia. All rights reserved.</p>
            </div>
        </div>
        </body>

        </html>
    `;

    return {
        subject,
        body,
    };
}

function sendRejectGrant(payload: { first_name: string; last_name: string; reject_reason: string | null; grant_id: number; book_title: string; target_language: string; }) {
    const fullName = ((payload.first_name[0].toUpperCase() + payload.first_name.slice(1)) + " " + (payload.last_name[0].toUpperCase() + payload.last_name.slice(1))) || 'User';

    const subject = `Application Grant Response`;
    const body = `
        <!DOCTYPE html>
        <html lang="id">

        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Grant Application Response</title>
        <style>
            body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333333;
            }

            .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            color: #333333;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }

            .email-header {
            background-color: #0A0A0A;
            padding: 20px;
            text-align: center;
            color: #ffffff;
            }

            .email-header h1 {
            margin: 0;
            font-size: 24px;
            }

            .email-body {
            padding: 30px;
            color: #333333;
            }

            .email-body h2 {
            color: #0A0A0A;
            margin-bottom: 20px;
            }

            .email-body p {
            font-size: 16px;
            line-height: 1.6;
            margin: 0 0 15px;
            color: #333333;
            }

            .reset-button {
            display: inline-block;
            margin: 20px 0;
            padding: 12px 30px;
            background-color: #0A0A0A;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            }

            .warning-box {
            background-color: #fef3cd;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            }

            .warning-box p {
            margin: 0;
            color: #92400e;
            font-size: 14px;
            }

            .message-box {
            background-color: #f1f1f1;
            padding: 15px;
            margin: 4px 0 24px 0;
            border-radius: 4px;
            }

            .message-box p {
            margin: 0;
            font-size: 14px;
            }

            .message-title {
            margin: 0 !important;
            }

            .email-footer {
            text-align: center;
            padding: 20px;
            background-color: #f8fafc;
            color: #666666;
            font-size: 12px;
            }

            table, tr, td, th {
            padding: 0;
            }

            td {
            font-size: 14px;
            }
            
            .table-header {
            text-align: start;
            font-size: 14px;
            margin-right: 8px;
            padding-right: 8px;
            }
        </style>
        </head>

        <body>
        <div class="email-container">
            <div class="email-header">
            <h1>Grant Application Response</h1>
            </div>
            <div class="email-body">
            <h2>Hello ${fullName},</h2>

            <p>
                We thank you for your grant application. Our team have read through your document, and we would like to
                apologize for the <strong>rejection</strong> of your application, with the following details:
            </p>

            <div class="message-box">
                <table>
                <tr>
                    <th class="table-header">Book Title</th>
                    <td>${payload.book_title}</td>
                </tr>
                <tr>
                    <th class="table-header">Target Language</th>
                    <td>${payload.target_language}</td>
                </tr>
                </table>
            </div>

            ${payload?.reject_reason ?
            `<p class="message-title">Reject Reason</p>
            <div class="message-box">
                <p>
                ${payload?.reject_reason}
                </p>
            </div>`
            : ""}
            
            <p>
                For further information, you can contact our support team at example@gmail.com. Thank you for your application and we wish you continued success. 
            </p>

            <p>
                Best Regards,<br>
                <strong>Read Indonesia Support Team</strong>
            </p>
            </div>
            <div class="email-footer">
            <p>This email is sent automatically. Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Read Indonesia. All rights reserved.</p>
            </div>
        </div>
        </body>

        </html>
    `;

    return {
        subject,
        body,
    };
}

export default {
    sendOTP,
    sendWelcomeEmail,
    sendPasswordReset,
    sendApproveGrant,
    sendRejectGrant,
};
