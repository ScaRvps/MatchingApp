using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Helper;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class MessageRepository : IMessageRepository
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        public MessageRepository(DataContext context, IMapper mapper)
        {
            _mapper = mapper;
            _context = context;
        }

        public void AddMessage(Message message)
        {
            _context.Messages.Add(message);
        }

        public void DeleteMessage(Message message)
        {
            _context.Messages.Remove(message);
        }

        public async Task<Message> GetMessage(int id)
        {
            return await _context.Messages
                .Include(u => u.Sender)
                .Include(u => u.Recipient)
                .SingleOrDefaultAsync(x => x.Id == id);
        }

        public async Task<PagedList<MessageDto>> GetMessagesForUser(MessageParams messageParams)
        {
            var query = _context.Messages
                .OrderByDescending(m => m.DateSent)
                .AsQueryable();

            var messages = AddMessageParams(query, messageParams);

            return await PagedList<MessageDto>.CreateAysnc(messages, messageParams.PageNumber, messageParams.PageSize);
        }

        //Paginated
        // public async Task<PagedList<MessageDto>> GetMessageThread(string senderUserName, string recipientUserName, MessageParams messageParams)
        // {
        //     var query = _context.Messages
        //         .Include(u => u.Sender).ThenInclude(p => p.Photos)
        //         .Include(u => u.Recipient).ThenInclude(p => p.Photos)
        //         .Where(m => m.Recipient.UserName == recipientUserName
        //            && m.Sender.UserName == senderUserName
        //            || m.Recipient.UserName == senderUserName
        //            && m.Sender.UserName == recipientUserName
        //         )
        //         .OrderBy(x => x.DateSent)
        //         .AsQueryable();

        //     var messages = query.ProjectTo<MessageDto>(_mapper.ConfigurationProvider);

        //     return await PagedList<MessageDto>.CreateAysnc(messages, messageParams.PageNumber, messageParams.PageSize);
        // }
        public async Task<IEnumerable<MessageDto>> GetMessageThread(string senderUserName, string recipientUserName)
        {
            var messages = await _context.Messages
                .Include(u => u.Sender).ThenInclude(p => p.Photos)
                .Include(u => u.Recipient).ThenInclude(p => p.Photos)
                .Where(m => m.Recipient.UserName == recipientUserName && m.SenderDeleted == false
                   && m.Sender.UserName == senderUserName
                   || m.Recipient.UserName == senderUserName
                   && m.Sender.UserName == recipientUserName && m.RecipientDeleted == false
                )
                .OrderBy(x => x.DateSent)
                .ToListAsync();

            var unreadMessages = messages.Where(m => m.RecipientUserName == senderUserName && m.DateRead == null && m.RecipientDeleted == false).ToList();

            if (unreadMessages.Any())
            {
                foreach (var message in unreadMessages)
                {
                    message.DateRead = DateTime.Now;
                }
                await _context.SaveChangesAsync();
            }

            return _mapper.Map<IEnumerable<MessageDto>>(messages);
        }

        public async Task<bool> SaveAllAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        private IQueryable<MessageDto> AddMessageParams(IQueryable<Message> query, MessageParams messageParams)
        {
            query = messageParams.Container switch
            {
                "Inbox" => query.Where(x => x.RecipientUserName == messageParams.UserName && x.RecipientDeleted == false),
                "Outbox" => query.Where(x => x.SenderUserName == messageParams.UserName && x.SenderDeleted == false),
                _ => query.Where(x => x.RecipientUserName == messageParams.UserName && x.RecipientDeleted == false && x.DateRead == null)
            };

            return query.ProjectTo<MessageDto>(_mapper.ConfigurationProvider);
        }
    }
}