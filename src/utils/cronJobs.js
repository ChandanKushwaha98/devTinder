const cron = require("node-cron");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const ConnectionRequest = require("../models/connectRequest");
const { sesClient } = require("./sesClient");
const { SendEmailCommand } = require("@aws-sdk/client-ses");

// Cron job to send daily reminder emails for pending connection requests
// Runs every day at 8:00 AM
cron.schedule("0 8 * * *", async () => {
    console.log("Running daily pending requests email job:", new Date());

    try {
        const yesterday = subDays(new Date(), 1);
        const yesterdayStart = startOfDay(yesterday);
        const yesterdayEnd = endOfDay(yesterday);

        // Find all pending connection requests from yesterday
        const pendingRequests = await ConnectionRequest.find({
            status: 'interested',
            createdAt: {
                $gte: yesterdayStart,
                $lt: yesterdayEnd
            }
        }).populate("fromUserId toUserId");

        // Get unique list of users who have pending requests
        const userEmailMap = new Map();

        pendingRequests.forEach(req => {
            if (req.toUserId && req.toUserId.emailId) {
                if (!userEmailMap.has(req.toUserId.emailId)) {
                    userEmailMap.set(req.toUserId.emailId, {
                        user: req.toUserId,
                        requestCount: 0,
                        fromUsers: []
                    });
                }
                const userData = userEmailMap.get(req.toUserId.emailId);
                userData.requestCount++;
                if (req.fromUserId) {
                    userData.fromUsers.push(req.fromUserId);
                }
            }
        });

        // Send reminder emails to each user with pending requests
        for (const [emailId, data] of userEmailMap) {
            try {
                const subject = `You have ${data.requestCount} pending connection ${data.requestCount === 1 ? 'request' : 'requests'} on DevTinder!`;

                const fromUsersList = data.fromUsers.slice(0, 3).map(user => `
                    <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #667eea;">
                        <h4 style="margin: 0 0 8px 0;">👤 ${user.firstName} ${user.lastName}</h4>
                        ${user.about ? `<p style="margin: 5px 0;"><strong>About:</strong> ${user.about}</p>` : ''}
                        ${user.skills && user.skills.length > 0 ? `<p style="margin: 5px 0;"><strong>Skills:</strong> ${user.skills.join(', ')}</p>` : ''}
                    </div>
                `).join('');

                const moreText = data.requestCount > 3 ? `<p style="text-align: center; color: #667eea; font-weight: bold;">And ${data.requestCount - 3} more ${data.requestCount - 3 === 1 ? 'person' : 'people'} waiting to connect!</p>` : '';

                const body = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                            .highlight { background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>⏰ Pending Connection Requests!</h1>
                            </div>
                            <div class="content">
                                <p>Hi ${data.user.firstName},</p>

                                <div class="highlight">
                                    <p style="margin: 0; font-size: 18px;"><strong>You have ${data.requestCount} pending connection ${data.requestCount === 1 ? 'request' : 'requests'} waiting for your response!</strong></p>
                                </div>

                                <p>Don't keep them waiting! Here's who wants to connect with you:</p>

                                ${fromUsersList}
                                ${moreText}

                                <p>Take a moment to review your connection requests and grow your network on DevTinder!</p>

                                <p style="text-align: center;">
                                    <a href="https://devtinderonline.in/requests" class="button">View All Requests</a>
                                </p>

                                <p>Happy networking!</p>
                                <p>The DevTinder Team</p>
                            </div>
                            <div class="footer">
                                <p>This is a reminder email for pending connection requests on DevTinder.</p>
                                <p>© 2025 DevTinder. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `;

                const sendEmailCommand = new SendEmailCommand({
                    Destination: {
                        ToAddresses: ["ckushwaha981@gmail.com"] // Using verified email for now
                    },
                    Message: {
                        Body: {
                            Html: {
                                Charset: "UTF-8",
                                Data: body,
                            },
                            Text: {
                                Charset: "UTF-8",
                                Data: `You have ${data.requestCount} pending connection requests on DevTinder. Visit https://devtinderonline.in/requests to review them.`,
                            },
                        },
                        Subject: {
                            Charset: "UTF-8",
                            Data: subject,
                        },
                    },
                    Source: "services@devtinderonline.in",
                });

                await sesClient.send(sendEmailCommand);
                console.log(`Reminder email sent to ${emailId}`);
            } catch (emailError) {
                console.error(`Error sending email to ${emailId}:`, emailError);
            }
        }

        console.log(`Sent ${userEmailMap.size} reminder emails for pending requests`);
    } catch (error) {
        console.error("Error in cron job:", error);
    }
});