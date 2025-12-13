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

        // Check for existing entry for the same date and questionId
        // Normalize the incoming date to just the date part for comparison
        var dateOnly = checkIn.Date.Date;
        var nextDay = dateOnly.AddDays(1);
        
        var existingCheckIn = (await _context.CheckIns
            .Where(c => c.QuestionId == checkIn.QuestionId && c.Date >= dateOnly && c.Date < nextDay)
            .ToListAsync())
            .FirstOrDefault(c => c.Date.Date == dateOnly);

        if (existingCheckIn != null)
        {
            // Update existing entry
            existingCheckIn.Answer = checkIn.Answer;
            existingCheckIn.Date = checkIn.Date;
            await _context.SaveChangesAsync();
            return Ok(existingCheckIn);
        }

        // Create new entry
        _context.CheckIns.Add(checkIn);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCheckIns), new { id = checkIn.Id }, checkIn);
    }

    // POST: api/checkins/seed
    [HttpPost("seed")]
    public async Task<ActionResult> SeedData([FromQuery] int days = 30)
    {
        var random = new Random();
        var questionIds = new[] { "sleep_quality", "energy_level", "mental_clarity", "sensitivity", "impulsivity", "self_perception", "sleep_readiness" };
        
        for (int i = 0; i < days; i++)
        {
            var date = DateTime.UtcNow.Date.AddDays(-i);
            
            foreach (var questionId in questionIds)
            {
                // Check if data already exists for this date/question
                var exists = await _context.CheckIns
                    .AnyAsync(c => c.QuestionId == questionId && c.Date.Date == date);
                
                if (!exists)
                {
                    var checkIn = new CheckIn
                    {
                        Date = date,
                        QuestionId = questionId,
                        Answer = random.Next(-3, 4) // Random value between -3 and 3
                    };
                    _context.CheckIns.Add(checkIn);
                }
            }
        }
        
        await _context.SaveChangesAsync();
        return Ok(new { message = $"Seeded data for {days} days" });
    }
}
