using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    public partial class RenameShapeToStep : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(name: "FK_Shape_User_Asignee", table: "Shape");
            migrationBuilder.DropForeignKey(name: "FK_Shape_User_Author", table: "Shape");
            migrationBuilder.DropForeignKey(name: "FK_Shape_Project_ProjectId", table: "Shape");

            migrationBuilder.RenameTable(name: "Shape", newName: "Step");
            migrationBuilder.RenameColumn(name: "Asignee", table: "Step", newName: "Owner");
            migrationBuilder.RenameColumn(name: "Author", table: "Step", newName: "Creator");
            migrationBuilder.RenameIndex(name: "IX_Shape_Asignee", table: "Step", newName: "IX_Step_Owner");
            migrationBuilder.RenameIndex(name: "IX_Shape_Author", table: "Step", newName: "IX_Step_Creator");
            migrationBuilder.RenameIndex(name: "IX_Shape_ProjectId", table: "Step", newName: "IX_Step_ProjectId");
            migrationBuilder.Sql(@"ALTER TABLE ""Step"" RENAME CONSTRAINT ""PK_Shapes"" TO ""PK_Step"";");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Step",
                type: "text",
                nullable: false,
                defaultValue: "todo");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Step_Status",
                table: "Step",
                sql: "\"Status\" IN ('todo', 'inProgress', 'done')");

            migrationBuilder.AddForeignKey(
                name: "FK_Step_User_Owner",
                table: "Step",
                column: "Owner",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
            migrationBuilder.AddForeignKey(
                name: "FK_Step_User_Creator",
                table: "Step",
                column: "Creator",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
            migrationBuilder.AddForeignKey(
                name: "FK_Step_Project_ProjectId",
                table: "Step",
                column: "ProjectId",
                principalTable: "Project",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(name: "FK_Step_User_Owner", table: "Step");
            migrationBuilder.DropForeignKey(name: "FK_Step_User_Creator", table: "Step");
            migrationBuilder.DropForeignKey(name: "FK_Step_Project_ProjectId", table: "Step");
            migrationBuilder.DropCheckConstraint(name: "CK_Step_Status", table: "Step");
            migrationBuilder.DropColumn(name: "Status", table: "Step");

            migrationBuilder.RenameIndex(name: "IX_Step_Owner", table: "Step", newName: "IX_Shape_Asignee");
            migrationBuilder.RenameIndex(name: "IX_Step_Creator", table: "Step", newName: "IX_Shape_Author");
            migrationBuilder.RenameIndex(name: "IX_Step_ProjectId", table: "Step", newName: "IX_Shape_ProjectId");
            migrationBuilder.RenameColumn(name: "Owner", table: "Step", newName: "Asignee");
            migrationBuilder.RenameColumn(name: "Creator", table: "Step", newName: "Author");
            migrationBuilder.RenameTable(name: "Step", newName: "Shape");
            migrationBuilder.Sql(@"ALTER TABLE ""Shape"" RENAME CONSTRAINT ""PK_Step"" TO ""PK_Shapes"";");

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
            migrationBuilder.AddForeignKey(
                name: "FK_Shape_Project_ProjectId",
                table: "Shape",
                column: "ProjectId",
                principalTable: "Project",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
