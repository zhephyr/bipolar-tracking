using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BipolarTracking.Api.Data;
using BipolarTracking.Api.Models;

namespace BipolarTracking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CheckInsController : ControllerBase
{
    private readonly AppDbContext _context;

    public CheckInsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/checkins?days=30
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CheckIn>>> GetCheckIns([FromQuery] int days = 30)
    {
        var startDate = DateTime.UtcNow.AddDays(-days);
        var checkIns = await _context.CheckIns
            .Where(c => c.Date >= startDate)
            .OrderByDescending(c => c.Date)
            .ThenBy(c => c.QuestionId)
            .ToListAsync();
        return Ok(checkIns);
    }

    // POST: api/checkins
    [HttpPost]
    public async Task<ActionResult<CheckIn>> PostCheckIn(CheckIn checkIn)
    {
        if (checkIn.Answer < -3 || checkIn.Answer > 3)
        {
            return BadRequest("Answer must be between -3 and 3");
        }

        if (string.IsNullOrWhiteSpace(checkIn.QuestionId))
        {
            return BadRequest("QuestionId is required");
        }

        _context.CheckIns.Add(checkIn);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCheckIns), new { id = checkIn.Id }, checkIn);
    }
}
