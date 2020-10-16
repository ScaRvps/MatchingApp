using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helper;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    public class MessagesController : BaseApiController
    {
        private readonly IMessageRepository _messageRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        public MessagesController(IUserRepository userRepository, IMessageRepository messageRepository, IMapper mapper)
        {
            _mapper = mapper;
            _userRepository = userRepository;
            _messageRepository = messageRepository;
        }

        [HttpPost]
        public async Task<ActionResult<MessageDto>> CreateMessage(CreateMessageDto createMessageDto)
        {
            var userName = User.GetUserName();

            if (userName == createMessageDto.RecipientUserName.ToLower()) return BadRequest("You can't send message to yourself");

            var recipient = await _userRepository.GetUserByNameAsync(createMessageDto.RecipientUserName);
            var sender = await _userRepository.GetUserByNameAsync(userName);

            if (recipient == null) return NotFound();

            var message = new Message
            {
                SenderId = sender.Id,
                SenderUserName = sender.UserName,
                RecipientId = recipient.Id,
                RecipientUserName = recipient.UserName,
                Content = createMessageDto.Content
            };

            _messageRepository.AddMessage(message);

            if (await _messageRepository.SaveAllAsync()) return Ok(_mapper.Map<MessageDto>(message)); //Should be CreateAtRoute

            return BadRequest("Message sending failed");
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessages([FromQuery] MessageParams messageParams)
        {
            messageParams.UserName = User.GetUserName();
            var messages = await _messageRepository.GetMessagesForUser(messageParams);

            Response.AddPaginationHeader(messages.CurrentPage, messages.PageSize, messages.TotalCount, messages.TotalPages);

            return messages;
        }

        [HttpGet("thread/{username}")]
        public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessageThread(string username/*, [FromQuery] MessageParams messageParams*/)
        {
            var senderUserName = User.GetUserName();

            return Ok(await _messageRepository.GetMessageThread(senderUserName, username));

            //Paginated Response

            // var messages = await _messageRepository.GetMessageThread(senderUserName, username, messageParams);

            // var unreadMessages = messages.Where(m => m.RecipientUserName == senderUserName && m.DateRead == null);

            // if (unreadMessages.Any())
            // {
            //     foreach (var message in unreadMessages)
            //     {
            //         message.DateRead = DateTime.Now;
            //     }
            // }

            // Response.AddPaginationHeader(messages.CurrentPage, messages.PageSize, messages.TotalCount, messages.TotalPages);

            // await _messageRepository.SaveAllAsync();

            // return messages;

        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteMessage(int id)
        {
            var userName = User.GetUserName();

            var message = await _messageRepository.GetMessage(id);

            if (message.Sender.UserName != userName && message.Recipient.UserName != userName) return Unauthorized();

            if (message.Sender.UserName == userName) message.SenderDeleted = true;

            if (message.Recipient.UserName == userName) message.RecipientDeleted = true;

            if (message.SenderDeleted && message.RecipientDeleted) _messageRepository.DeleteMessage(message);

            if (await _messageRepository.SaveAllAsync()) return Ok();

            return BadRequest("Failed to delete message");
        }

    }
}