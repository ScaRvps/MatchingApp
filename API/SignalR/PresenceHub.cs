using System;
using System.Threading.Tasks;
using API.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR
{
    [Authorize]
    public class PresenceHub : Hub
    {
        private readonly PresenceTracker _tracker;
        public PresenceHub(PresenceTracker tracker)
        {
            _tracker = tracker;
        }

        public override async Task OnConnectedAsync()
        {
            var userName = Context.User.GetUserName();
            var isOnline = await _tracker.UserConnected(userName, Context.ConnectionId);
            if (isOnline)
                await Clients.Others.SendAsync("UserIsOnline", userName);

            var connectedUsers = await _tracker.GetUsersOnline();
            await Clients.Caller.SendAsync("GetUsersOnline", connectedUsers);
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var userName = Context.User.GetUserName();
            var isOffline = await _tracker.UserDisconnected(userName, Context.ConnectionId);
            if (isOffline)
                await Clients.Others.SendAsync("UserIsOffline", userName);

            await base.OnDisconnectedAsync(exception);
        }
    }
}