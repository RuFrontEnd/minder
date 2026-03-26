using System.Collections.Generic;
using Domain.Entities;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCurvesToShape : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<List<ShapeEntity.Curve>>(
                name: "Curves",
                table: "Shape",
                type: "jsonb",
                nullable: false,
                defaultValueSql: "'[]'::jsonb"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Curves",
                table: "Shape");
        }
    }
}
