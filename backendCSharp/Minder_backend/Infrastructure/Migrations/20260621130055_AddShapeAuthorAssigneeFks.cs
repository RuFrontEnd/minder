using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddShapeAuthorAssigneeFks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "Asignee",
                table: "Shape",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "Author",
                table: "Shape",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Shape",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "H",
                table: "Shape",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "Shape",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "W",
                table: "Shape",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "X",
                table: "Shape",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Y",
                table: "Shape",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            // Ensure a fallback system user exists and fix existing Shape rows to reference it
            // so adding FK constraints won't fail when there are existing Shape rows.
            var systemUserId = new Guid("11111111-1111-1111-1111-111111111111");
            migrationBuilder.Sql($@"
                INSERT INTO ""User"" (""Id"", ""Email"", ""Password"")
                SELECT '{systemUserId}'::uuid, 'system@local', ''
                WHERE NOT EXISTS (SELECT 1 FROM ""User"" WHERE ""Id"" = '{systemUserId}'::uuid);
            ");

            migrationBuilder.Sql($@"
                UPDATE ""Shape"" SET ""Author"" = '{systemUserId}'::uuid
                WHERE ""Author"" = '00000000-0000-0000-0000-000000000000'::uuid;
                UPDATE ""Shape"" SET ""Asignee"" = '{systemUserId}'::uuid
                WHERE ""Asignee"" = '00000000-0000-0000-0000-000000000000'::uuid;
            ");

            migrationBuilder.CreateIndex(
                name: "IX_Shape_Asignee",
                table: "Shape",
                column: "Asignee");

            migrationBuilder.CreateIndex(
                name: "IX_Shape_Author",
                table: "Shape",
                column: "Author");

            migrationBuilder.AddForeignKey(
                name: "FK_Shape_User_Asignee",
                table: "Shape",
                column: "Asignee",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Shape_User_Author",
                table: "Shape",
                column: "Author",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Shape_User_Asignee",
                table: "Shape");

            migrationBuilder.DropForeignKey(
                name: "FK_Shape_User_Author",
                table: "Shape");

            migrationBuilder.DropIndex(
                name: "IX_Shape_Asignee",
                table: "Shape");

            migrationBuilder.DropIndex(
                name: "IX_Shape_Author",
                table: "Shape");

            migrationBuilder.DropColumn(
                name: "Asignee",
                table: "Shape");

            migrationBuilder.DropColumn(
                name: "Author",
                table: "Shape");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Shape");

            migrationBuilder.DropColumn(
                name: "H",
                table: "Shape");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "Shape");

            migrationBuilder.DropColumn(
                name: "W",
                table: "Shape");

            migrationBuilder.DropColumn(
                name: "X",
                table: "Shape");

            migrationBuilder.DropColumn(
                name: "Y",
                table: "Shape");

            // Note: we do not remove the system user here to avoid deleting a potentially
            // reused identity. Manual cleanup can be done if needed.
        }
    }
}
