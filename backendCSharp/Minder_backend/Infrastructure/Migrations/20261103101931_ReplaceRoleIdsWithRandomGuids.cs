using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceRoleIdsWithRandomGuids : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE "Member"
                SET "RoleId" = CASE "RoleId"
                    WHEN '00000000-0000-0000-0000-000000000001' THEN '0672531e-3f25-48fe-829a-e6b9293af804'::uuid
                    WHEN '00000000-0000-0000-0000-000000000002' THEN '68529180-f79c-485f-88c2-a2f06c6ec7b3'::uuid
                    WHEN '00000000-0000-0000-0000-000000000003' THEN '360374d3-ede2-478d-af10-f8894e0137f7'::uuid
                    ELSE "RoleId"
                END
                WHERE "RoleId" IN (
                    '00000000-0000-0000-0000-000000000001'::uuid,
                    '00000000-0000-0000-0000-000000000002'::uuid,
                    '00000000-0000-0000-0000-000000000003'::uuid
                );
                """);

            migrationBuilder.DeleteData(
                table: "Role",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "Role",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                table: "Role",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000003"));

            migrationBuilder.AlterColumn<Guid>(
                name: "RoleId",
                table: "Member",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("0672531e-3f25-48fe-829a-e6b9293af804"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.InsertData(
                table: "Role",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("0672531e-3f25-48fe-829a-e6b9293af804"), "owner" },
                    { new Guid("360374d3-ede2-478d-af10-f8894e0137f7"), "guest" },
                    { new Guid("68529180-f79c-485f-88c2-a2f06c6ec7b3"), "member" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE "Member"
                SET "RoleId" = CASE "RoleId"
                    WHEN '0672531e-3f25-48fe-829a-e6b9293af804' THEN '00000000-0000-0000-0000-000000000001'::uuid
                    WHEN '68529180-f79c-485f-88c2-a2f06c6ec7b3' THEN '00000000-0000-0000-0000-000000000002'::uuid
                    WHEN '360374d3-ede2-478d-af10-f8894e0137f7' THEN '00000000-0000-0000-0000-000000000003'::uuid
                    ELSE "RoleId"
                END
                WHERE "RoleId" IN (
                    '0672531e-3f25-48fe-829a-e6b9293af804'::uuid,
                    '68529180-f79c-485f-88c2-a2f06c6ec7b3'::uuid,
                    '360374d3-ede2-478d-af10-f8894e0137f7'::uuid
                );
                """);

            migrationBuilder.DeleteData(
                table: "Role",
                keyColumn: "Id",
                keyValue: new Guid("0672531e-3f25-48fe-829a-e6b9293af804"));

            migrationBuilder.DeleteData(
                table: "Role",
                keyColumn: "Id",
                keyValue: new Guid("360374d3-ede2-478d-af10-f8894e0137f7"));

            migrationBuilder.DeleteData(
                table: "Role",
                keyColumn: "Id",
                keyValue: new Guid("68529180-f79c-485f-88c2-a2f06c6ec7b3"));

            migrationBuilder.AlterColumn<Guid>(
                name: "RoleId",
                table: "Member",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValue: new Guid("0672531e-3f25-48fe-829a-e6b9293af804"));

            migrationBuilder.InsertData(
                table: "Role",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("00000000-0000-0000-0000-000000000001"), "owner" },
                    { new Guid("00000000-0000-0000-0000-000000000002"), "member" },
                    { new Guid("00000000-0000-0000-0000-000000000003"), "guest" }
                });
        }
    }
}
