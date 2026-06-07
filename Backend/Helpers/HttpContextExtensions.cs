namespace StudentSavingsSystem.Helpers
{
    public static class HttpContextExtensions
    {
        public static string GetClientIp(this HttpContext context)
        {
            return context.Connection.RemoteIpAddress?.MapToIPv4().ToString() ?? "127.0.0.1";
        }
    }
}
