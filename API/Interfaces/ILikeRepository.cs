using System.Threading.Tasks;
using System.Collections.Generic;
using API.DTOs;
using API.Entities;
using API.Helper;

namespace API.Interfaces
{
    public interface ILikeRepository
    {
        Task<UserLike> GetUserLike(int sourceUserId, int likeUserId);

        Task<AppUser> GetUserWithLikes(int userId);

        Task<PagedList<LikeDto>> GetUserLikes(LikesParams likesParams);
    }
}