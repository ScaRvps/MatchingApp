namespace API.Entities
{
    public class Connection
    {
        public Connection()
        {
        }

        public Connection(string connectionId, string userName)
        {
            ConnectionId = connectionId;
            this.userName = userName;
        }

        public string ConnectionId { get; set; }
        public string userName { get; set; }

    }
}