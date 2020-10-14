using System.Collections.Generic;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helper;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    public class LikesController : BaseApiController
    {
        private readonly ILikeRepository _likeRepository;
        private readonly IUserRepository _userRepository;
        public LikesController(IUserRepository userRepository, ILikeRepository likeRepository)
        {
            _userRepository = userRepository;
            _likeRepository = likeRepository;
        }

        [HttpPost("{username}")]
        public async Task<ActionResult> AddLike(string username)
        {
            var sourceUserId = User.GetUserId();
            var likedUser = await _userRepository.GetUserByNameAsync(username);
            var sourceUser = await _likeRepository.GetUserWithLikes(sourceUserId);

            if (likedUser == null) return NotFound();
            if (username == sourceUser.UserName) return BadRequest("You can't like yourself");

            var userLike = await _likeRepository.GetUserLike(sourceUserId, likedUser.Id);
            if (userLike != null) return BadRequest("You have already liked the user");

            userLike = new UserLike()
            {
                SourceUserId = sourceUserId,
                LikedUserId = likedUser.Id
            };

            sourceUser.LikedUsers.Add(userLike);

            if (await _userRepository.SaveChangesAsync()) return Ok();

            return BadRequest("User like failed.");
        }

        [HttpGet]
        public async Task<ActionResult<PagedList<LikeDto>>> GetLikedUser([FromQuery] LikesParams likesParams)
        {
            likesParams.UserId = User.GetUserId();
            var users = await _likeRepository.GetUserLikes(likesParams);

            Response.AddPaginationHeader(users.CurrentPage, users.PageSize, users.TotalCount, users.TotalPages);

            return Ok(users);
        }

    }
}