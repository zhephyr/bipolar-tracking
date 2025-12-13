using Microsoft.EntityFrameworkCore;
using BipolarTracking.Api.Models;

namespace BipolarTracking.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<CheckIn> CheckIns { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<CheckIn>()
            .HasIndex(c => c.Date);
    }
}
