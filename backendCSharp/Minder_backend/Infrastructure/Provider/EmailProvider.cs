using Domain.Provider;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;

namespace Infrastructure.Provider;

public class EmailProvider(IConfiguration configuration) : IEmailProvider
{
    public async Task SendVerificationEmailAsync(string toEmail, string verificationLink)
    {
        var host = configuration["Smtp:Host"];
        var port = int.TryParse(configuration["Smtp:Port"], out var smtpPort) ? smtpPort : 587;
        var username = configuration["Smtp:Username"];
        var password = configuration["Smtp:Password"];
        var fromEmail = configuration["Smtp:FromEmail"] ?? username;
        var fromName = configuration["Smtp:FromName"] ?? "Minder";

        if (string.IsNullOrWhiteSpace(host) ||
            string.IsNullOrWhiteSpace(username) ||
            string.IsNullOrWhiteSpace(password) ||
            string.IsNullOrWhiteSpace(fromEmail))
        {
            throw new InvalidOperationException("SMTP settings are not configured.");
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(fromName, fromEmail));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = "Verify your email";
        message.Body = new TextPart("plain")
        {
            Text = $"Please verify your email by clicking this link: {verificationLink}"
        };

        using var client = new SmtpClient();
        await client.ConnectAsync(host, port, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(username, password);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}
