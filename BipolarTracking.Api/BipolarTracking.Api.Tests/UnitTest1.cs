using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BipolarTracking.Api.Controllers;
using BipolarTracking.Api.Data;
using BipolarTracking.Api.Models;

namespace BipolarTracking.Api.Tests;

public class CheckInsControllerTests
{
    private AppDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Test]
    public async Task GetCheckIns_ReturnsEmptyList_WhenNoData()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var controller = new CheckInsController(context);

        // Act
        var result = await controller.GetCheckIns(30);

        // Assert
        Assert.That(result.Result, Is.InstanceOf<OkObjectResult>());
        var okResult = result.Result as OkObjectResult;
        var checkIns = okResult!.Value as IEnumerable<CheckIn>;
        Assert.That(checkIns, Is.Empty);
    }

    [Test]
    public async Task GetCheckIns_ReturnsCheckInsWithinDateRange()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var now = DateTime.UtcNow;
        context.CheckIns.AddRange(
            new CheckIn { Date = now.AddDays(-5), QuestionId = "sleep_quality", Answer = 2 },
            new CheckIn { Date = now.AddDays(-10), QuestionId = "energy_level", Answer = 1 },
            new CheckIn { Date = now.AddDays(-35), QuestionId = "mood", Answer = -1 }
        );
        await context.SaveChangesAsync();
        var controller = new CheckInsController(context);

        // Act
        var result = await controller.GetCheckIns(30);

        // Assert
        var okResult = result.Result as OkObjectResult;
        var checkIns = (okResult!.Value as IEnumerable<CheckIn>)!.ToList();
        Assert.That(checkIns, Has.Count.EqualTo(2));
        Assert.That(checkIns.All(c => c.Date >= now.AddDays(-30)));
    }

    [Test]
    public async Task GetCheckIns_OrdersByDateDescThenQuestionId()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var now = DateTime.UtcNow;
        context.CheckIns.AddRange(
            new CheckIn { Date = now.AddDays(-10), QuestionId = "zzz", Answer = 1 },
            new CheckIn { Date = now.AddDays(-5), QuestionId = "aaa", Answer = 2 },
            new CheckIn { Date = now.AddDays(-5), QuestionId = "zzz", Answer = 3 }
        );
        await context.SaveChangesAsync();
        var controller = new CheckInsController(context);

        // Act
        var result = await controller.GetCheckIns(30);

        // Assert
        var okResult = result.Result as OkObjectResult;
        var checkIns = (okResult!.Value as IEnumerable<CheckIn>)!.ToList();
        Assert.That(checkIns[0].QuestionId, Is.EqualTo("aaa"));
        Assert.That(checkIns[1].QuestionId, Is.EqualTo("zzz"));
        Assert.That(checkIns[2].Date.Date, Is.EqualTo(now.AddDays(-10).Date));
    }

    [Test]
    public async Task PostCheckIn_AddsCheckInToDatabase()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var controller = new CheckInsController(context);
        var checkIn = new CheckIn
        {
            Date = DateTime.UtcNow,
            QuestionId = "sleep_quality",
            Answer = 2
        };

        // Act
        var result = await controller.PostCheckIn(checkIn);

        // Assert
        Assert.That(result.Result, Is.InstanceOf<CreatedAtActionResult>());
        var createdResult = result.Result as CreatedAtActionResult;
        var returnedCheckIn = createdResult!.Value as CheckIn;
        Assert.That(returnedCheckIn!.Id, Is.GreaterThan(0));
        Assert.That(context.CheckIns.Count(), Is.EqualTo(1));
    }

    [Test]
    public async Task PostCheckIn_ReturnsBadRequest_WhenAnswerTooLow()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var controller = new CheckInsController(context);
        var checkIn = new CheckIn
        {
            Date = DateTime.UtcNow,
            QuestionId = "sleep_quality",
            Answer = -4
        };

        // Act
        var result = await controller.PostCheckIn(checkIn);

        // Assert
        Assert.That(result.Result, Is.InstanceOf<BadRequestObjectResult>());
        var badRequest = result.Result as BadRequestObjectResult;
        Assert.That(badRequest!.Value, Is.EqualTo("Answer must be between -3 and 3"));
    }

    [Test]
    public async Task PostCheckIn_ReturnsBadRequest_WhenAnswerTooHigh()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var controller = new CheckInsController(context);
        var checkIn = new CheckIn
        {
            Date = DateTime.UtcNow,
            QuestionId = "sleep_quality",
            Answer = 4
        };

        // Act
        var result = await controller.PostCheckIn(checkIn);

        // Assert
        Assert.That(result.Result, Is.InstanceOf<BadRequestObjectResult>());
    }

    [Test]
    public async Task PostCheckIn_ReturnsBadRequest_WhenQuestionIdIsEmpty()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var controller = new CheckInsController(context);
        var checkIn = new CheckIn
        {
            Date = DateTime.UtcNow,
            QuestionId = "",
            Answer = 2
        };

        // Act
        var result = await controller.PostCheckIn(checkIn);

        // Assert
        Assert.That(result.Result, Is.InstanceOf<BadRequestObjectResult>());
        var badRequest = result.Result as BadRequestObjectResult;
        Assert.That(badRequest!.Value, Is.EqualTo("QuestionId is required"));
    }

    [Test]
    public async Task PostCheckIn_AcceptsValidAnswerRange()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var controller = new CheckInsController(context);

        // Act & Assert for each valid answer
        for (int answer = -3; answer <= 3; answer++)
        {
            var checkIn = new CheckIn
            {
                Date = DateTime.UtcNow,
                QuestionId = $"question_{answer}",
                Answer = answer
            };

            var result = await controller.PostCheckIn(checkIn);
            Assert.That(result.Result, Is.InstanceOf<CreatedAtActionResult>());
        }

        Assert.That(context.CheckIns.Count(), Is.EqualTo(7));
    }

    [Test]
    public async Task GetCheckIns_WithCustomDays_ReturnsCorrectRange()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var now = DateTime.UtcNow;
        context.CheckIns.AddRange(
            new CheckIn { Date = now.AddDays(-3), QuestionId = "q1", Answer = 1 },
            new CheckIn { Date = now.AddDays(-5), QuestionId = "q2", Answer = 2 },
            new CheckIn { Date = now.AddDays(-8), QuestionId = "q3", Answer = 3 }
        );
        await context.SaveChangesAsync();
        var controller = new CheckInsController(context);

        // Act
        var result = await controller.GetCheckIns(7);

        // Assert
        var okResult = result.Result as OkObjectResult;
        var checkIns = (okResult!.Value as IEnumerable<CheckIn>)!.ToList();
        Assert.That(checkIns, Has.Count.EqualTo(2));
        Assert.That(checkIns.All(c => c.Date >= now.AddDays(-7)));
    }
}