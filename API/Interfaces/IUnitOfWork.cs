using System.Threading.Tasks;

namespace API.Interfaces
{
    public interface IUnitOfWork
    {
        IUserRepository UserRepository { get; }

        IMessageRepository MessageRepository { get; }

        ILikeRepository LikeRepository { get; }

        Task<bool> SaveChanges();

        bool HasChanges();
    }
}