using System.Collections.Generic;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Helper;

namespace API.Interfaces
{
    public interface IUserRepository
    {
        void Update(AppUser user);

        Task<IEnumerable<AppUser>> GetAllUsersAsync();

        Task<AppUser> GetUserByIdAsync(int id);

        Task<AppUser> GetUserByNameAsync(string username);

        Task<bool> SaveChangesAsync();

        Task<MemberDto> GetMember(string username);

        Task<PagedList<MemberDto>> GetMembers(UserParams userParams);
    }
}