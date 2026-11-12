using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStepDependencies : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "step_dependencies",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    step_id = table.Column<Guid>(type: "uuid", nullable: false),
                    depends_on_step_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_step_dependencies", x => x.id);
                    table.CheckConstraint("ck_step_dependencies_not_self", "step_id <> depends_on_step_id");
                    table.ForeignKey(
                        name: "fk_dependency_parent_step",
                        column: x => x.depends_on_step_id,
                        principalTable: "steps",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_dependency_step",
                        column: x => x.step_id,
                        principalTable: "steps",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_step_dependencies_depends_on_step_id",
                table: "step_dependencies",
                column: "depends_on_step_id");

            migrationBuilder.CreateIndex(
                name: "uq_step_dependency",
                table: "step_dependencies",
                columns: new[] { "step_id", "depends_on_step_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "step_dependencies");
        }
    }
}
