using System.Collections.Generic;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Helper;

namespace API.Interfaces
{
    public interface IMessageRepository
    {
        void AddMessage(Message message);

        void DeleteMessage(Message message);

        Task<Message> GetMessage(int id);

        Task<PagedList<MessageDto>> GetMessagesForUser(MessageParams messageParams);

        // Task<PagedList<MessageDto>> GetMessageThread(string senderUserName, string recipientUserName, MessageParams messageParams);
        Task<IEnumerable<MessageDto>> GetMessageThread(string senderUserName, string recipientUserName);

        Task<bool> SaveAllAsync();

    }
}