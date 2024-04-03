export default function verifyEmail(username, key) {
  const email = {
    subject: "Verify Your Email",
    html: `
    <!DOCTYPE html>
    <html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>TrackTask &raquo; Verify Your Email</title>
    </head>
    <body>
        <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f4f4f4">
            <tr>
                <td align="center">
                    <table cellpadding="0" cellspacing="0" border="0" width="600" bgcolor="#ffffff" style="border: 1px solid #dddddd; box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);">
                        <tr>
                            <td style="padding: 20px;">
                            <img alt="TrackTask" src="https://tracktask.eu.org/tracktask.png" width="100%"/>
                                <h1>Verify Your Email</h1>
                                <p>Hello ${username},</p>

                                <p>We&apos;ve received a request to verify this email for your account with TrackTask. To keep your account secure, we need to confirm that you have access to this email address. If you didn&apos;t request this email, someone may be trying to compromise your account. Please delete this email if you didn&apos;t request it.</p>

                                <p>To verify your email, please follow the steps below:</p>

                                &bull; Click on the following link to open the email verification page: <a href="https://tracktask.eu.org/dashboard/account/verify/${key}">Verify Your Email</a><br><br>
                                &bull; Once the page loads, you will be prompted to click a "Verify Email" button.

                                <p>If you did not initiate this email verification request, please disregard this email. Your verification status will remain unchanged.</p>

                                <p>Please note that the email verification link is valid for 1 hour from the time of this email. If you don&apos;t complete the verification within this time frame, you may need to request another one.</p>

                                <p>If you encounter any issues or have questions, please don&apos;t hesitate to contact our support team at <a href="mailto:tracktask@tracktask.eu.org">tracktask@tracktask.eu.org</a>.</p>

                                <p>Best,</p>
                                <p>The TrackTask Team<br>
                                <a href="https://tracktask.eu.org">Visit the website</a></p>
                                
                                <p><em>Thanks for using TrackTask!</em></p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `,
  };
  return email;
}