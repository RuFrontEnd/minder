using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RenameTasksTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_tasks_Step_stepId",
                table: "tasks");

            migrationBuilder.DropForeignKey(
                name: "FK_tasks_User_owner",
                table: "tasks");

            migrationBuilder.DropPrimaryKey(
                name: "PK_tasks",
                table: "tasks");

            migrationBuilder.RenameTable(
                name: "tasks",
                newName: "Task");

            migrationBuilder.RenameIndex(
                name: "IX_tasks_stepId",
                table: "Task",
                newName: "IX_Task_stepId");

            migrationBuilder.RenameIndex(
                name: "IX_tasks_owner",
                table: "Task",
                newName: "IX_Task_owner");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Task",
                table: "Task",
                column: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_Task_Step_stepId",
                table: "Task",
                column: "stepId",
                principalTable: "Step",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Task_User_owner",
                table: "Task",
                column: "owner",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Task_Step_stepId",
                table: "Task");

            migrationBuilder.DropForeignKey(
                name: "FK_Task_User_owner",
                table: "Task");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Task",
                table: "Task");

            migrationBuilder.RenameTable(
                name: "Task",
                newName: "tasks");

            migrationBuilder.RenameIndex(
                name: "IX_Task_stepId",
                table: "tasks",
                newName: "IX_tasks_stepId");

            migrationBuilder.RenameIndex(
                name: "IX_Task_owner",
                table: "tasks",
                newName: "IX_tasks_owner");

            migrationBuilder.AddPrimaryKey(
                name: "PK_tasks",
                table: "tasks",
                column: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_tasks_Step_stepId",
                table: "tasks",
                column: "stepId",
                principalTable: "Step",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_tasks_User_owner",
                table: "tasks",
                column: "owner",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
