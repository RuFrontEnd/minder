using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CapitalizeStatusNames : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "statuses",
                keyColumn: "id",
                keyValue: new Guid("a4f6c6d2-8d0d-4c8f-9f7b-8cf9b9f1f001"),
                column: "name",
                value: "Todo");

            migrationBuilder.UpdateData(
                table: "statuses",
                keyColumn: "id",
                keyValue: new Guid("a4f6c6d2-8d0d-4c8f-9f7b-8cf9b9f1f002"),
                column: "name",
                value: "In Progress");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "statuses",
                keyColumn: "id",
                keyValue: new Guid("a4f6c6d2-8d0d-4c8f-9f7b-8cf9b9f1f001"),
                column: "name",
                value: "todo");

            migrationBuilder.UpdateData(
                table: "statuses",
                keyColumn: "id",
                keyValue: new Guid("a4f6c6d2-8d0d-4c8f-9f7b-8cf9b9f1f002"),
                column: "name",
                value: "in progress");
        }
    }
}
