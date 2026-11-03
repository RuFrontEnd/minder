using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAvatarColors : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "avatar_color_id",
                table: "users",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "avatar_colors",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    color = table.Column<string>(type: "text", nullable: false),
                    background_color = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_avatar_colors", x => x.id);
                });

            migrationBuilder.InsertData(
                table: "avatar_colors",
                columns: new[] { "id", "background_color", "color", "name" },
                values: new object[,]
                {
                    { new Guid("6f5f2d1c-1d7d-4c8f-9f2d-2f2c80f6a101"), "#dbeafe", "#1d4ed8", "blue" },
                    { new Guid("6f5f2d1c-1d7d-4c8f-9f2d-2f2c80f6a102"), "#d1fae5", "#047857", "green" },
                    { new Guid("6f5f2d1c-1d7d-4c8f-9f2d-2f2c80f6a103"), "#f3e8ff", "#7e22ce", "purple" },
                    { new Guid("6f5f2d1c-1d7d-4c8f-9f2d-2f2c80f6a104"), "#ffedd5", "#c2410c", "orange" },
                    { new Guid("6f5f2d1c-1d7d-4c8f-9f2d-2f2c80f6a105"), "#ffe4e6", "#be123c", "rose" },
                    { new Guid("6f5f2d1c-1d7d-4c8f-9f2d-2f2c80f6a106"), "#ccfbf1", "#0f766e", "teal" },
                    { new Guid("6f5f2d1c-1d7d-4c8f-9f2d-2f2c80f6a107"), "#fef3c7", "#a16207", "amber" },
                    { new Guid("6f5f2d1c-1d7d-4c8f-9f2d-2f2c80f6a108"), "#e0e7ff", "#4338ca", "indigo" }
                });

            migrationBuilder.Sql("""
                UPDATE users
                SET avatar_color_id = (
                    SELECT id
                    FROM avatar_colors
                    ORDER BY random()
                    LIMIT 1
                )
                WHERE avatar_color_id IS NULL;
                """);

            migrationBuilder.CreateIndex(
                name: "IX_users_avatar_color_id",
                table: "users",
                column: "avatar_color_id");

            migrationBuilder.CreateIndex(
                name: "IX_avatar_colors_name",
                table: "avatar_colors",
                column: "name",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_users_avatar_colors_avatar_color_id",
                table: "users",
                column: "avatar_color_id",
                principalTable: "avatar_colors",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_users_avatar_colors_avatar_color_id",
                table: "users");

            migrationBuilder.DropTable(
                name: "avatar_colors");

            migrationBuilder.DropIndex(
                name: "IX_users_avatar_color_id",
                table: "users");

            migrationBuilder.DropColumn(
                name: "avatar_color_id",
                table: "users");
        }
    }
}
