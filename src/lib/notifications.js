import nodemailer from "nodemailer";

export async function sendBlogNotification(blog, subscribers) {
  // If no subscribers, return
  if (!subscribers || subscribers.length === 0) {
    console.log("No subscribers to notify.");
    return;
  }

  // Load SMTP credentials
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  // If credentials are not set, run in MOCK mode
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.warn("=================================================");
    console.warn("WARNING: SMTP credentials not fully configured.");
    console.warn("Email notifications will run in MOCK MODE.");
    console.warn("To send real emails, set the following environment variables in .env.local:");
    console.warn("SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS");
    console.warn("-------------------------------------------------");
    console.warn(`Mocking email notifications for new blog post: "${blog.title}"`);
    console.warn(`Total subscribers to notify: ${subscribers.length}`);
    for (const sub of subscribers) {
      console.warn(`- Mock Email sent to: ${sub.name} <${sub.email}>`);
    }
    console.warn("=================================================");
    return;
  }

  try {
    // Configure transporter
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT),
      secure: parseInt(SMTP_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    // Send emails in a loop
    const emailPromises = subscribers.map(async (subscriber) => {
      const mailOptions = {
        from: `"Jahnvi's Portfolio" <${SMTP_USER}>`,
        to: subscriber.email,
        subject: `New Blog Published: ${blog.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ede6d6; background-color: #FBF5E8; color: #1b1c1c;">
            <h2 style="color: #435c3c; font-family: Georgia, serif;">Hello ${subscriber.name},</h2>
            <p style="font-size: 16px; line-height: 1.6;">
              A new blog article has been published on Jahnvi's Portfolio:
            </p>
            <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #89502e; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin: 0 0 10px 0; color: #1b1c1c;">${blog.title}</h3>
              <p style="margin: 0; font-size: 14px; color: #6b6c6c;">Published on ${blog.date} • ${blog.readTime || "5 min read"}</p>
            </div>
            <p style="font-size: 16px; line-height: 1.6;">
              You can read the full narrative on the website by visiting the blog section.
            </p>
            <div style="margin-top: 30px; border-top: 1px solid #ede6d6; padding-top: 15px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}#blogs" style="background-color: #435c3c; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 20px; font-weight: bold; font-size: 14px; display: inline-block;">Read Blog Post</a>
            </div>
            <p style="font-size: 12px; color: #6b6c6c; margin-top: 40px; text-align: center; border-top: 1px solid #ede6d6; padding-top: 15px;">
              You received this email because you subscribed to blog updates on Jahnvi's Portfolio.<br>
              &copy; 2026 Jahnvi. All rights reserved.
            </p>
          </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Notification email successfully sent to: ${subscriber.email}`);
      } catch (err) {
        console.error(`Failed to send notification email to: ${subscriber.email}`, err);
      }
    });

    await Promise.all(emailPromises);
  } catch (err) {
    console.error("Failed to initialize or send blog notification emails:", err);
  }
}

export async function sendSubscriptionConfirmation(subscriber) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.warn("=================================================");
    console.warn("WARNING: SMTP credentials not fully configured.");
    console.warn("Subscription confirmation will run in MOCK MODE.");
    console.warn(`Mocking subscription email to: ${subscriber.name} <${subscriber.email}>`);
    console.warn("=================================================");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT),
      secure: parseInt(SMTP_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Jahnvi's Portfolio" <${SMTP_USER}>`,
      to: subscriber.email,
      subject: "Subscription Confirmed - Jahnvi's Portfolio",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ede6d6; background-color: #FBF5E8; color: #1b1c1c;">
          <h2 style="color: #435c3c; font-family: Georgia, serif;">Hello ${subscriber.name},</h2>
          <p style="font-size: 16px; line-height: 1.6;">
            Thank you for subscribing to my portfolio updates! You will now receive notifications whenever I publish a new blog post.
          </p>
          <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #89502e; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 15px; color: #1b1c1c; font-weight: bold;">Subscription Details:</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b6c6c;">Name: ${subscriber.name}</p>
            <p style="margin: 2px 0 0 0; font-size: 14px; color: #6b6c6c;">Email: ${subscriber.email}</p>
          </div>
          <p style="font-size: 16px; line-height: 1.6;">
            To explore my research, academic background, and publications, visit the portfolio home page.
          </p>
          <div style="margin-top: 30px; border-top: 1px solid #ede6d6; padding-top: 15px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}" style="background-color: #435c3c; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 20px; font-weight: bold; font-size: 14px; display: inline-block;">Go to Portfolio</a>
          </div>
          <p style="font-size: 12px; color: #6b6c6c; margin-top: 40px; text-align: center; border-top: 1px solid #ede6d6; padding-top: 15px;">
            You received this email because you subscribed to updates on Jahnvi's Portfolio.<br>
            &copy; 2026 Jahnvi. All rights reserved.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Subscription confirmation email sent to: ${subscriber.email}`);
  } catch (err) {
    console.error("Failed to send subscription confirmation email:", err);
  }
}

