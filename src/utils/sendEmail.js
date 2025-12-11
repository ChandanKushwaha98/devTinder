const { sesClient } = require("./sesClient.js");
const { SendEmailCommand } = require("@aws-sdk/client-ses");


const createSendEmailCommand = (toAddress, fromAddress, subject, body) => {
    return new SendEmailCommand({
        Destination: {
            CcAddresses: [
            ],
            ToAddresses: [
                toAddress,
            ],
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: body,
                },
                Text: {
                    Charset: "UTF-8",
                    Data: "This is the text format",
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: subject,
            },
        },
        Source: fromAddress,
        ReplyToAddresses: [
            /* more items */
        ],
    });
};

const sendConnectionEmail = async (toUser, fromUser, status) => {
    let subject, body;

    if (status === 'interested') {
        subject = `${fromUser.firstName} is interested in connecting with you on DevTinder!`;
        body = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .profile { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>💝 New Connection Request!</h1>
                    </div>
                    <div class="content">
                        <p>Hi ${toUser.firstName},</p>

                        <p>Great news! Someone wants to connect with you on DevTinder.</p>

                        <div class="profile">
                            <h3>👤 ${fromUser.firstName} ${fromUser.lastName}</h3>
                            ${fromUser.about ? `<p><strong>About:</strong> ${fromUser.about}</p>` : ''}
                            ${fromUser.skills && fromUser.skills.length > 0 ? `<p><strong>Skills:</strong> ${fromUser.skills.join(', ')}</p>` : ''}
                            ${fromUser.age ? `<p><strong>Age:</strong> ${fromUser.age}</p>` : ''}
                            ${fromUser.gender ? `<p><strong>Gender:</strong> ${fromUser.gender}</p>` : ''}
                        </div>

                        <p>They're interested in connecting with you! Check out their profile and decide if you'd like to accept their request.</p>

                        <p style="text-align: center;">
                            <a href="https://devtinderonline.in/requests" class="button">View Request</a>
                        </p>

                        <p>Happy networking!</p>
                        <p>The DevTinder Team</p>
                    </div>
                    <div class="footer">
                        <p>This email was sent because someone showed interest in connecting with you on DevTinder.</p>
                        <p>© 2025 DevTinder. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    } else if (status === 'ignored') {
        subject = `${fromUser.firstName} viewed your profile on DevTinder`;
        body = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .profile { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5576c; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>👀 Profile View</h1>
                    </div>
                    <div class="content">
                        <p>Hi ${toUser.firstName},</p>

                        <p>Someone checked out your profile on DevTinder!</p>

                        <div class="profile">
                            <h3>👤 ${fromUser.firstName} ${fromUser.lastName}</h3>
                            ${fromUser.about ? `<p><strong>About:</strong> ${fromUser.about}</p>` : ''}
                            ${fromUser.skills && fromUser.skills.length > 0 ? `<p><strong>Skills:</strong> ${fromUser.skills.join(', ')}</p>` : ''}
                        </div>

                        <p>While they didn't send a connection request this time, they took the time to view your profile. Keep your profile updated and engaging to attract more connections!</p>

                        <p style="text-align: center;">
                            <a href="https://devtinderonline.in/profile" class="button">Update Your Profile</a>
                        </p>

                        <p>Keep building your network!</p>
                        <p>The DevTinder Team</p>
                    </div>
                    <div class="footer">
                        <p>This is a notification email from DevTinder.</p>
                        <p>© 2025 DevTinder. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    const sendEmailCommand = createSendEmailCommand(
        "ckushwaha981@gmail.com",
        "services@devtinderonline.in",
        subject,
        body
    );

    try {
        return await sesClient.send(sendEmailCommand);
    } catch (caught) {
        if (caught instanceof Error && caught.name === "MessageRejected") {
            const messageRejectedError = caught;
            return messageRejectedError;
        }
        throw caught;
    }
};

// snippet-end:[ses.JavaScript.email.sendEmailV3]
module.exports = { sendConnectionEmail }