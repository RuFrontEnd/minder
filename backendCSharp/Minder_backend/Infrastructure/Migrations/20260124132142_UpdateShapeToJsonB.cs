using System.Collections.Generic;
using Domain.Entities;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateShapeToJsonB : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Px",
                table: "Shape");

            migrationBuilder.DropColumn(
                name: "Py",
                table: "Shape");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Shape");

            migrationBuilder.AddColumn<List<ShapeEntity.Info>>(
                name: "Infos",
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
                name: "Infos",
                table: "Shape");

            migrationBuilder.AddColumn<int>(
                name: "Px",
                table: "Shape",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Py",
                table: "Shape",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Shape",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
