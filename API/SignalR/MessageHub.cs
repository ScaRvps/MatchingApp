using System;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR
{
    public class MessageHub : Hub
    {
        private readonly IMapper _mapper;
        private readonly IMessageRepository _messageRepository;
        private readonly IUserRepository _userRepository;
        private readonly IHubContext<PresenceHub> _presenceHub;
        private readonly PresenceTracker _presenceTracker;
        public MessageHub(IMessageRepository messageRepository, IUserRepository userRepository, IHubContext<PresenceHub> presenceHub, PresenceTracker presenceTracker, IMapper mapper)
        {
            _presenceTracker = presenceTracker;
            _presenceHub = presenceHub;
            _userRepository = userRepository;
            _messageRepository = messageRepository;
            _mapper = mapper;
        }

        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var otherUser = httpContext.Request.Query["user"].ToString();
            var callerUser = Context.User.GetUserName();
            var groupName = GetGroupName(callerUser, otherUser);

            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            var group = await AddToGroup(groupName);

            await Clients.Group(groupName).SendAsync("UpdatedGroup", group);

            var messages = _messageRepository.GetMessageThread(callerUser, otherUser);

            await Clients.Caller.SendAsync("ReceiveMessageThread", messages);
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var group = await RemoveFromGroup();
            await Clients.Group(group.Name).SendAsync("UpdatedGroup", group);
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(CreateMessageDto createMessageDto)
        {
            var userName = Context.User.GetUserName();

            if (userName == createMessageDto.RecipientUserName.ToLower()) throw new Exception("You can't send message to yourself");

            var recipient = await _userRepository.GetUserByNameAsync(createMessageDto.RecipientUserName);
            var sender = await _userRepository.GetUserByNameAsync(userName);

            if (recipient == null) throw new Exception("User not found");

            var message = new Message
            {
                SenderId = sender.Id,
                SenderUserName = sender.UserName,
                RecipientId = recipient.Id,
                RecipientUserName = recipient.UserName,
                Content = createMessageDto.Content
            };

            var groupName = GetGroupName(message.SenderUserName, message.RecipientUserName);

            var group = await _messageRepository.GetMessageGroup(groupName);

            if (group.Connections.Any(x => x.userName == recipient.UserName))
            {
                message.DateRead = DateTime.UtcNow;
            }
            else
            {
                var connectionIds = await _presenceTracker.GetConnectionIds(recipient.UserName);
                if (connectionIds != null)
                {
                    await _presenceHub.Clients.Clients(connectionIds).SendAsync("NewMessageReceived", new
                    {
                        userName = sender.UserName,
                        nickName = sender.NickName
                    });
                }
            }

            _messageRepository.AddMessage(message);

            if (await _messageRepository.SaveAllAsync())
            {
                await Clients.Group(groupName).SendAsync("NewMessage", _mapper.Map<MessageDto>(message));
            }

        }

        private async Task<Group> AddToGroup(string groupName)
        {
            var connection = new Connection(Context.ConnectionId, Context.User.GetUserName());
            var group = await _messageRepository.GetMessageGroup(groupName);

            if (group == null)
            {
                group = new Group(groupName);
                _messageRepository.AddGroup(group);
            }

            group.Connections.Add(connection);

            if (await _messageRepository.SaveAllAsync()) return group;

            throw new HubException("Failed to join the group");
        }

        public async Task<Group> RemoveFromGroup()
        {
            var group = await _messageRepository.GetGroupForConnection(Context.ConnectionId);
            var connection = group.Connections.FirstOrDefault(x => x.ConnectionId == Context.ConnectionId);
            _messageRepository.RemoveConnection(connection);

            if (await _messageRepository.SaveAllAsync()) return group;

            throw new HubException("Failed to remove from group");
        }

        private string GetGroupName(string callerUser, string otherUser)
        {
            var stringCompare = string.CompareOrdinal(callerUser, otherUser);
            return stringCompare < 0 ? $"{callerUser}-{otherUser}" : $"{otherUser}-{callerUser}";
        }


    }
}