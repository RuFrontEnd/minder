using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStatusesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "statuses",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_statuses", x => x.id);
                });

            migrationBuilder.AddColumn<Guid>(
                name: "status_id",
                table: "steps",
                type: "uuid",
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE steps
                SET status_id = CASE status
                    WHEN 'inProgress' THEN 'a4f6c6d2-8d0d-4c8f-9f7b-8cf9b9f1f002'::uuid
                    WHEN 'done' THEN 'a4f6c6d2-8d0d-4c8f-9f7b-8cf9b9f1f003'::uuid
                    ELSE 'a4f6c6d2-8d0d-4c8f-9f7b-8cf9b9f1f001'::uuid
                END;
                """);

            migrationBuilder.DropCheckConstraint(
                name: "ck_steps_status",
                table: "steps");

            migrationBuilder.DropColumn(
                name: "status",
                table: "steps");

            migrationBuilder.AlterColumn<Guid>(
                name: "status_id",
                table: "steps",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.InsertData(
                table: "statuses",
                columns: new[] { "id", "name" },
                values: new object[,]
                {
                    { new Guid("a4f6c6d2-8d0d-4c8f-9f7b-8cf9b9f1f001"), "todo" },
                    { new Guid("a4f6c6d2-8d0d-4c8f-9f7b-8cf9b9f1f002"), "inProgress" },
                    { new Guid("a4f6c6d2-8d0d-4c8f-9f7b-8cf9b9f1f003"), "Done" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_steps_status_id",
                table: "steps",
                column: "status_id");

            migrationBuilder.CreateIndex(
                name: "IX_statuses_name",
                table: "statuses",
                column: "name",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_steps_statuses_status_id",
                table: "steps",
                column: "status_id",
                principalTable: "statuses",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "status",
                table: "steps",
                type: "text",
                nullable: false,
                defaultValue: "todo");

            migrationBuilder.Sql("""
                UPDATE steps
                SET status = CASE statuses.name
                    WHEN 'Done' THEN 'done'
                    ELSE statuses.name
                END
                FROM statuses
                WHERE steps.status_id = statuses.id;
                """);

            migrationBuilder.DropForeignKey(
                name: "FK_steps_statuses_status_id",
                table: "steps");

            migrationBuilder.DropTable(
                name: "statuses");

            migrationBuilder.DropIndex(
                name: "IX_steps_status_id",
                table: "steps");

            migrationBuilder.DropColumn(
                name: "status_id",
                table: "steps");

            migrationBuilder.AddCheckConstraint(
                name: "ck_steps_status",
                table: "steps",
                sql: "\"status\" IN ('todo', 'inProgress', 'done')");
        }
    }
}
