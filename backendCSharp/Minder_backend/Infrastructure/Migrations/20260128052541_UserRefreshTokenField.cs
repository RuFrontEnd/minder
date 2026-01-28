using System;
using System.Collections.Generic;
using Domain.Entities;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UserRefreshTokenField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RefreshToken",
                table: "User",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RefreshTokenExpriaryTime",
                table: "User",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AlterColumn<List<ShapeEntity.Info>>(
                name: "Infos",
                table: "Shape",
                type: "jsonb",
                nullable: false,
                defaultValueSql: "'[]'::jsonb",
                oldClrType: typeof(List<ShapeEntity.Info>),
                oldType: "jsonb");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RefreshToken",
                table: "User");

            migrationBuilder.DropColumn(
                name: "RefreshTokenExpriaryTime",
                table: "User");

            migrationBuilder.AlterColumn<List<ShapeEntity.Info>>(
                name: "Infos",
                table: "Shape",
                type: "jsonb",
                nullable: false,
                oldClrType: typeof(List<ShapeEntity.Info>),
                oldType: "jsonb",
                oldDefaultValueSql: "'[]'::jsonb");
        }
    }
}
