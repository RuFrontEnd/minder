using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class NormalizeDatabaseNaming : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Member_Project_ProjectId",
                table: "Member");

            migrationBuilder.DropForeignKey(
                name: "FK_Member_Role_RoleId",
                table: "Member");

            migrationBuilder.DropForeignKey(
                name: "FK_Member_User_UserId",
                table: "Member");

            migrationBuilder.DropForeignKey(
                name: "FK_Message_Member_member_id",
                table: "Message");

            migrationBuilder.DropForeignKey(
                name: "FK_Message_Step_step_id",
                table: "Message");

            migrationBuilder.DropForeignKey(
                name: "FK_Project_User_UserId",
                table: "Project");

            migrationBuilder.DropForeignKey(
                name: "FK_Step_Project_ProjectId",
                table: "Step");

            migrationBuilder.DropForeignKey(
                name: "FK_Step_User_Creator",
                table: "Step");

            migrationBuilder.DropForeignKey(
                name: "FK_Step_User_Owner",
                table: "Step");

            migrationBuilder.DropForeignKey(
                name: "FK_Task_Step_stepId",
                table: "Task");

            migrationBuilder.DropForeignKey(
                name: "FK_Task_User_owner",
                table: "Task");

            migrationBuilder.DropPrimaryKey(
                name: "PK_User",
                table: "User");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Task",
                table: "Task");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Step",
                table: "Step");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Step_Status",
                table: "Step");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Role",
                table: "Role");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Project",
                table: "Project");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Message",
                table: "Message");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Member",
                table: "Member");

            migrationBuilder.RenameTable(
                name: "User",
                newName: "users");

            migrationBuilder.RenameTable(
                name: "Task",
                newName: "tasks");

            migrationBuilder.RenameTable(
                name: "Step",
                newName: "steps");

            migrationBuilder.RenameTable(
                name: "Role",
                newName: "roles");

            migrationBuilder.RenameTable(
                name: "Project",
                newName: "projects");

            migrationBuilder.RenameTable(
                name: "Message",
                newName: "messages");

            migrationBuilder.RenameTable(
                name: "Member",
                newName: "members");

            migrationBuilder.RenameColumn(
                name: "Password",
                table: "users",
                newName: "password");

            migrationBuilder.RenameColumn(
                name: "Email",
                table: "users",
                newName: "email");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "users",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "RefreshTokenExpiryTime",
                table: "users",
                newName: "refresh_token_expiry_time");

            migrationBuilder.RenameColumn(
                name: "RefreshToken",
                table: "users",
                newName: "refresh_token");

            migrationBuilder.RenameColumn(
                name: "LastName",
                table: "users",
                newName: "last_name");

            migrationBuilder.RenameColumn(
                name: "IsEmailVerified",
                table: "users",
                newName: "is_email_verified");

            migrationBuilder.RenameColumn(
                name: "FirstName",
                table: "users",
                newName: "first_name");

            migrationBuilder.RenameColumn(
                name: "EmailVerificationTokenExpiry",
                table: "users",
                newName: "email_verification_token_expiry");

            migrationBuilder.RenameColumn(
                name: "EmailVerificationToken",
                table: "users",
                newName: "email_verification_token");

            migrationBuilder.RenameColumn(
                name: "stepId",
                table: "tasks",
                newName: "step_id");

            migrationBuilder.RenameColumn(
                name: "owner",
                table: "tasks",
                newName: "owner_id");

            migrationBuilder.RenameIndex(
                name: "IX_Task_stepId",
                table: "tasks",
                newName: "IX_tasks_step_id");

            migrationBuilder.RenameIndex(
                name: "IX_Task_owner",
                table: "tasks",
                newName: "IX_tasks_owner_id");

            migrationBuilder.RenameColumn(
                name: "Title",
                table: "steps",
                newName: "title");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "steps",
                newName: "status");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "steps",
                newName: "description");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "steps",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "Y",
                table: "steps",
                newName: "position_y");

            migrationBuilder.RenameColumn(
                name: "X",
                table: "steps",
                newName: "position_x");

            migrationBuilder.RenameColumn(
                name: "W",
                table: "steps",
                newName: "width");

            migrationBuilder.RenameColumn(
                name: "ProjectId",
                table: "steps",
                newName: "project_id");

            migrationBuilder.RenameColumn(
                name: "Owner",
                table: "steps",
                newName: "owner_id");

            migrationBuilder.RenameColumn(
                name: "H",
                table: "steps",
                newName: "height");

            migrationBuilder.RenameColumn(
                name: "Creator",
                table: "steps",
                newName: "creator_id");

            migrationBuilder.RenameIndex(
                name: "IX_Step_ProjectId",
                table: "steps",
                newName: "IX_steps_project_id");

            migrationBuilder.RenameIndex(
                name: "IX_Step_Owner",
                table: "steps",
                newName: "IX_steps_owner_id");

            migrationBuilder.RenameIndex(
                name: "IX_Step_Creator",
                table: "steps",
                newName: "IX_steps_creator_id");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "roles",
                newName: "name");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "roles",
                newName: "id");

            migrationBuilder.RenameIndex(
                name: "IX_Role_Name",
                table: "roles",
                newName: "IX_roles_name");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "projects",
                newName: "name");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "projects",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "projects",
                newName: "user_id");

            migrationBuilder.RenameIndex(
                name: "IX_Project_UserId",
                table: "projects",
                newName: "IX_projects_user_id");

            migrationBuilder.RenameColumn(
                name: "update_at",
                table: "messages",
                newName: "updated_at");

            migrationBuilder.RenameColumn(
                name: "create_at",
                table: "messages",
                newName: "created_at");

            migrationBuilder.RenameIndex(
                name: "IX_Message_step_id",
                table: "messages",
                newName: "IX_messages_step_id");

            migrationBuilder.RenameIndex(
                name: "IX_Message_member_id",
                table: "messages",
                newName: "IX_messages_member_id");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "members",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "members",
                newName: "user_id");

            migrationBuilder.RenameColumn(
                name: "RoleId",
                table: "members",
                newName: "role_id");

            migrationBuilder.RenameColumn(
                name: "ProjectId",
                table: "members",
                newName: "project_id");

            migrationBuilder.RenameIndex(
                name: "IX_Member_UserId_ProjectId",
                table: "members",
                newName: "IX_members_user_id_project_id");

            migrationBuilder.RenameIndex(
                name: "IX_Member_RoleId",
                table: "members",
                newName: "IX_members_role_id");

            migrationBuilder.RenameIndex(
                name: "IX_Member_ProjectId",
                table: "members",
                newName: "IX_members_project_id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_users",
                table: "users",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_tasks",
                table: "tasks",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_steps",
                table: "steps",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_roles",
                table: "roles",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_projects",
                table: "projects",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_messages",
                table: "messages",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_members",
                table: "members",
                column: "id");

            migrationBuilder.AddCheckConstraint(
                name: "ck_steps_status",
                table: "steps",
                sql: "\"status\" IN ('todo', 'inProgress', 'done')");

            migrationBuilder.AddForeignKey(
                name: "FK_members_projects_project_id",
                table: "members",
                column: "project_id",
                principalTable: "projects",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_members_roles_role_id",
                table: "members",
                column: "role_id",
                principalTable: "roles",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_members_users_user_id",
                table: "members",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_messages_members_member_id",
                table: "messages",
                column: "member_id",
                principalTable: "members",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_messages_steps_step_id",
                table: "messages",
                column: "step_id",
                principalTable: "steps",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_projects_users_user_id",
                table: "projects",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_steps_projects_project_id",
                table: "steps",
                column: "project_id",
                principalTable: "projects",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_steps_users_creator_id",
                table: "steps",
                column: "creator_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_steps_users_owner_id",
                table: "steps",
                column: "owner_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_tasks_steps_step_id",
                table: "tasks",
                column: "step_id",
                principalTable: "steps",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_tasks_users_owner_id",
                table: "tasks",
                column: "owner_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_members_projects_project_id",
                table: "members");

            migrationBuilder.DropForeignKey(
                name: "FK_members_roles_role_id",
                table: "members");

            migrationBuilder.DropForeignKey(
                name: "FK_members_users_user_id",
                table: "members");

            migrationBuilder.DropForeignKey(
                name: "FK_messages_members_member_id",
                table: "messages");

            migrationBuilder.DropForeignKey(
                name: "FK_messages_steps_step_id",
                table: "messages");

            migrationBuilder.DropForeignKey(
                name: "FK_projects_users_user_id",
                table: "projects");

            migrationBuilder.DropForeignKey(
                name: "FK_steps_projects_project_id",
                table: "steps");

            migrationBuilder.DropForeignKey(
                name: "FK_steps_users_creator_id",
                table: "steps");

            migrationBuilder.DropForeignKey(
                name: "FK_steps_users_owner_id",
                table: "steps");

            migrationBuilder.DropForeignKey(
                name: "FK_tasks_steps_step_id",
                table: "tasks");

            migrationBuilder.DropForeignKey(
                name: "FK_tasks_users_owner_id",
                table: "tasks");

            migrationBuilder.DropPrimaryKey(
                name: "PK_users",
                table: "users");

            migrationBuilder.DropPrimaryKey(
                name: "PK_tasks",
                table: "tasks");

            migrationBuilder.DropPrimaryKey(
                name: "PK_steps",
                table: "steps");

            migrationBuilder.DropCheckConstraint(
                name: "ck_steps_status",
                table: "steps");

            migrationBuilder.DropPrimaryKey(
                name: "PK_roles",
                table: "roles");

            migrationBuilder.DropPrimaryKey(
                name: "PK_projects",
                table: "projects");

            migrationBuilder.DropPrimaryKey(
                name: "PK_messages",
                table: "messages");

            migrationBuilder.DropPrimaryKey(
                name: "PK_members",
                table: "members");

            migrationBuilder.RenameTable(
                name: "users",
                newName: "User");

            migrationBuilder.RenameTable(
                name: "tasks",
                newName: "Task");

            migrationBuilder.RenameTable(
                name: "steps",
                newName: "Step");

            migrationBuilder.RenameTable(
                name: "roles",
                newName: "Role");

            migrationBuilder.RenameTable(
                name: "projects",
                newName: "Project");

            migrationBuilder.RenameTable(
                name: "messages",
                newName: "Message");

            migrationBuilder.RenameTable(
                name: "members",
                newName: "Member");

            migrationBuilder.RenameColumn(
                name: "password",
                table: "User",
                newName: "Password");

            migrationBuilder.RenameColumn(
                name: "email",
                table: "User",
                newName: "Email");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "User",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "refresh_token_expiry_time",
                table: "User",
                newName: "RefreshTokenExpiryTime");

            migrationBuilder.RenameColumn(
                name: "refresh_token",
                table: "User",
                newName: "RefreshToken");

            migrationBuilder.RenameColumn(
                name: "last_name",
                table: "User",
                newName: "LastName");

            migrationBuilder.RenameColumn(
                name: "is_email_verified",
                table: "User",
                newName: "IsEmailVerified");

            migrationBuilder.RenameColumn(
                name: "first_name",
                table: "User",
                newName: "FirstName");

            migrationBuilder.RenameColumn(
                name: "email_verification_token_expiry",
                table: "User",
                newName: "EmailVerificationTokenExpiry");

            migrationBuilder.RenameColumn(
                name: "email_verification_token",
                table: "User",
                newName: "EmailVerificationToken");

            migrationBuilder.RenameColumn(
                name: "step_id",
                table: "Task",
                newName: "stepId");

            migrationBuilder.RenameColumn(
                name: "owner_id",
                table: "Task",
                newName: "owner");

            migrationBuilder.RenameIndex(
                name: "IX_tasks_step_id",
                table: "Task",
                newName: "IX_Task_stepId");

            migrationBuilder.RenameIndex(
                name: "IX_tasks_owner_id",
                table: "Task",
                newName: "IX_Task_owner");

            migrationBuilder.RenameColumn(
                name: "title",
                table: "Step",
                newName: "Title");

            migrationBuilder.RenameColumn(
                name: "status",
                table: "Step",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "description",
                table: "Step",
                newName: "Description");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Step",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "width",
                table: "Step",
                newName: "W");

            migrationBuilder.RenameColumn(
                name: "project_id",
                table: "Step",
                newName: "ProjectId");

            migrationBuilder.RenameColumn(
                name: "position_y",
                table: "Step",
                newName: "Y");

            migrationBuilder.RenameColumn(
                name: "position_x",
                table: "Step",
                newName: "X");

            migrationBuilder.RenameColumn(
                name: "owner_id",
                table: "Step",
                newName: "Owner");

            migrationBuilder.RenameColumn(
                name: "height",
                table: "Step",
                newName: "H");

            migrationBuilder.RenameColumn(
                name: "creator_id",
                table: "Step",
                newName: "Creator");

            migrationBuilder.RenameIndex(
                name: "IX_steps_project_id",
                table: "Step",
                newName: "IX_Step_ProjectId");

            migrationBuilder.RenameIndex(
                name: "IX_steps_owner_id",
                table: "Step",
                newName: "IX_Step_Owner");

            migrationBuilder.RenameIndex(
                name: "IX_steps_creator_id",
                table: "Step",
                newName: "IX_Step_Creator");

            migrationBuilder.RenameColumn(
                name: "name",
                table: "Role",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Role",
                newName: "Id");

            migrationBuilder.RenameIndex(
                name: "IX_roles_name",
                table: "Role",
                newName: "IX_Role_Name");

            migrationBuilder.RenameColumn(
                name: "name",
                table: "Project",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Project",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "user_id",
                table: "Project",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_projects_user_id",
                table: "Project",
                newName: "IX_Project_UserId");

            migrationBuilder.RenameColumn(
                name: "updated_at",
                table: "Message",
                newName: "update_at");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "Message",
                newName: "create_at");

            migrationBuilder.RenameIndex(
                name: "IX_messages_step_id",
                table: "Message",
                newName: "IX_Message_step_id");

            migrationBuilder.RenameIndex(
                name: "IX_messages_member_id",
                table: "Message",
                newName: "IX_Message_member_id");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Member",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "user_id",
                table: "Member",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "role_id",
                table: "Member",
                newName: "RoleId");

            migrationBuilder.RenameColumn(
                name: "project_id",
                table: "Member",
                newName: "ProjectId");

            migrationBuilder.RenameIndex(
                name: "IX_members_user_id_project_id",
                table: "Member",
                newName: "IX_Member_UserId_ProjectId");

            migrationBuilder.RenameIndex(
                name: "IX_members_role_id",
                table: "Member",
                newName: "IX_Member_RoleId");

            migrationBuilder.RenameIndex(
                name: "IX_members_project_id",
                table: "Member",
                newName: "IX_Member_ProjectId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_User",
                table: "User",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Task",
                table: "Task",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Step",
                table: "Step",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Role",
                table: "Role",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Project",
                table: "Project",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Message",
                table: "Message",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Member",
                table: "Member",
                column: "Id");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Step_Status",
                table: "Step",
                sql: "\"Status\" IN ('todo', 'inProgress', 'done')");

            migrationBuilder.AddForeignKey(
                name: "FK_Member_Project_ProjectId",
                table: "Member",
                column: "ProjectId",
                principalTable: "Project",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Member_Role_RoleId",
                table: "Member",
                column: "RoleId",
                principalTable: "Role",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Member_User_UserId",
                table: "Member",
                column: "UserId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Message_Member_member_id",
                table: "Message",
                column: "member_id",
                principalTable: "Member",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Message_Step_step_id",
                table: "Message",
                column: "step_id",
                principalTable: "Step",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Project_User_UserId",
                table: "Project",
                column: "UserId",
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

            migrationBuilder.AddForeignKey(
                name: "FK_Step_User_Creator",
                table: "Step",
                column: "Creator",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Step_User_Owner",
                table: "Step",
                column: "Owner",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

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
    }
}
