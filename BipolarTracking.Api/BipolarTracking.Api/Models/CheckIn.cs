namespace BipolarTracking.Api.Models;

public class CheckIn
{
    public int Id { get; set; }
    public DateTime Date { get; set; }
    public string QuestionId { get; set; } = string.Empty;
    public int Answer { get; set; } // -3 to +3
}
