using System;
using System.Collections.Generic;
using Domain.Entities;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveShapeInfosCurves : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Curves",
                table: "Shape");

            migrationBuilder.DropColumn(
                name: "Infos",
                table: "Shape");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Shape");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<List<ShapeEntity.Curve>>(
                name: "Curves",
                table: "Shape",
                type: "jsonb",
                nullable: false,
                defaultValueSql: "'[]'::jsonb");

            migrationBuilder.AddColumn<List<ShapeEntity.Info>>(
                name: "Infos",
                table: "Shape",
                type: "jsonb",
                nullable: false,
                defaultValueSql: "'[]'::jsonb");

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "Shape",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));
        }
    }
}
