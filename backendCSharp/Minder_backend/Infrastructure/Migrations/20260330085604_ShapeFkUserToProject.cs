using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ShapeFkUserToProject_Rerun2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Shape_User_UserId",
                table: "Shape");

            migrationBuilder.DropIndex(
                name: "IX_Shape_UserId",
                table: "Shape");

            migrationBuilder.AddColumn<Guid>(
                name: "ProjectId",
                table: "Shape",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "Project",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Project", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Project_User_UserId",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Shape_ProjectId",
                table: "Shape",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Project_UserId",
                table: "Project",
                column: "UserId");

            migrationBuilder.Sql(@"
                INSERT INTO ""Project"" (""Id"", ""UserId"")
                SELECT gen_random_uuid(), s.""UserId""
                FROM (SELECT DISTINCT ""UserId"" FROM ""Shape"") s
                LEFT JOIN ""Project"" p ON p.""UserId"" = s.""UserId""
                WHERE p.""Id"" IS NULL;
            ");

            migrationBuilder.Sql(@"
                UPDATE ""Shape"" s
                SET ""ProjectId"" = p.""Id""
                FROM ""Project"" p
                WHERE p.""UserId"" = s.""UserId""
                  AND s.""ProjectId"" = '00000000-0000-0000-0000-000000000000'::uuid;
            ");

            migrationBuilder.AddForeignKey(
                name: "FK_Shape_Project_ProjectId",
                table: "Shape",
                column: "ProjectId",
                principalTable: "Project",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Shape_Project_ProjectId",
                table: "Shape");

            migrationBuilder.DropTable(
                name: "Project");

            migrationBuilder.DropIndex(
                name: "IX_Shape_ProjectId",
                table: "Shape");

            migrationBuilder.DropColumn(
                name: "ProjectId",
                table: "Shape");

            migrationBuilder.CreateIndex(
                name: "IX_Shape_UserId",
                table: "Shape",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Shape_User_UserId",
                table: "Shape",
                column: "UserId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
